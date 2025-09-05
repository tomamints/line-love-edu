/**
 * タロット占い権限管理API
 * 1日1回の使用制限をチェック・記録
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabaseクライアントの作成
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// 日本時間での今日の日付を取得
function getTodayJST() {
    const now = new Date();
    const jstOffset = 9 * 60; // JST is UTC+9
    const jstTime = new Date(now.getTime() + (jstOffset - now.getTimezoneOffset()) * 60000);
    return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD形式
}

module.exports = async function handler(req, res) {
    // CORSヘッダー設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!supabase) {
        console.error('Supabase is not configured:', {
            url: !!supabaseUrl,
            key: !!supabaseServiceKey
        });
        return res.status(500).json({ 
            error: 'Server configuration error',
            details: 'Supabase connection not available',
            available: true // エラー時は制限なしで使えるように
        });
    }

    const { action, userId, tarotType, cardData } = req.body || {};

    if (!userId || !tarotType) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['userId', 'tarotType']
        });
    }

    const today = getTodayJST();

    try {
        switch (action) {
            case 'check':
                // 使用可能かチェック
                console.log('[Tarot Check] Checking permission for:', { userId, tarotType, today });
                
                const { data: permission, error: checkError } = await supabase
                    .from('tarot_permissions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('tarot_type', tarotType)
                    .eq('granted_date', today)
                    .single();

                if (checkError && checkError.code !== 'PGRST116') {
                    // PGRST116 = no rows returned (正常)
                    console.error('[Tarot Check] Database error:', checkError);
                    // エラー時は使用可能として返す
                    return res.json({ 
                        available: true,
                        message: '本日分のタロット占いが利用可能です',
                        debug: 'Database check error, allowing access'
                    });
                }

                if (!permission) {
                    // 今日の権限がまだない = 使用可能
                    return res.json({ 
                        available: true,
                        message: '本日分のタロット占いが利用可能です'
                    });
                }

                // 権限はあるが、使用済みかチェック
                return res.json({ 
                    available: !permission.used,
                    message: permission.used 
                        ? '本日分のタロット占いは既に使用済みです。明日また挑戦してください！' 
                        : '本日分のタロット占いが利用可能です',
                    nextAvailable: permission.used ? new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString() : null
                });

            case 'use':
                // タロットを使用（権限を消費）
                
                // 1. 権限レコードを作成または更新
                const { data: upsertResult, error: upsertError } = await supabase
                    .from('tarot_permissions')
                    .upsert({
                        user_id: userId,
                        tarot_type: tarotType,
                        granted_date: today,
                        used: true,
                        used_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id,tarot_type,granted_date'
                    });

                if (upsertError) {
                    console.error('Permission upsert error:', upsertError);
                    return res.status(500).json({ 
                        error: 'Failed to update permission',
                        details: upsertError.message 
                    });
                }

                // 2. 使用履歴を記録
                if (cardData) {
                    const { error: usageError } = await supabase
                        .from('tarot_usage')
                        .insert({
                            user_id: userId,
                            tarot_type: tarotType,
                            card_drawn: cardData.name,
                            card_position: cardData.position,
                            result_data: cardData.result || {}
                        });

                    if (usageError) {
                        console.error('Usage logging error:', usageError);
                        // 履歴記録は失敗してもエラーにはしない
                    }
                }

                return res.json({ 
                    success: true,
                    message: 'タロット占いを実行しました'
                });

            case 'history':
                // 使用履歴を取得
                const { data: history, error: historyError } = await supabase
                    .from('tarot_usage')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('tarot_type', tarotType)
                    .order('used_at', { ascending: false })
                    .limit(30);

                if (historyError) {
                    return res.status(500).json({ 
                        error: 'Failed to fetch history',
                        details: historyError.message 
                    });
                }

                return res.json({ 
                    success: true,
                    history: history || []
                });

            default:
                return res.status(400).json({ 
                    error: 'Invalid action',
                    validActions: ['check', 'use', 'history']
                });
        }

    } catch (error) {
        console.error('[Tarot Permission API] Error:', error);
        // エラーでも占いは使えるようにする
        return res.json({ 
            available: true,
            message: 'タロット占いが利用可能です',
            debug: 'System error, allowing access',
            error: error.message 
        });
    }
}