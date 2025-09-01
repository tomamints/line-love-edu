/**
 * プロファイル管理API - V2（新テーブル構造対応）
 * 診断の作成、取得、アクセス権限管理
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定 - 環境変数の確認とエラーハンドリング
// Vercel環境変数に合わせて修正
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxqxuebvhdpqyktxvofe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合のエラーメッセージ
if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_ANON_KEY environment variable');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

// Supabaseクライアントの作成（環境変数がある場合のみ）
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

module.exports = async function handler(req, res) {
    // Supabaseクライアントが初期化されていない場合はエラー
    if (!supabase) {
        return res.status(500).json({ 
            error: 'Database configuration error',
            details: 'Supabase environment variables are not properly configured'
        });
    }
    
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const action = req.query.action || req.body?.action;
    console.log(`[Profile Form V2] Action: ${action}`, req.method);

    try {
        switch (action) {
            case 'save-diagnosis':
                return await saveDiagnosis(req, res);
            case 'get-diagnosis':
                return await getDiagnosis(req, res);
            case 'check-access':
                return await checkAccess(req, res);
            case 'get-user-diagnoses':
                return await getUserDiagnoses(req, res);
            default:
                return res.status(400).json({ 
                    error: 'Invalid action',
                    validActions: ['save-diagnosis', 'get-diagnosis', 'check-access', 'get-user-diagnoses']
                });
        }
    } catch (error) {
        console.error('[Profile Form V2] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 診断を保存
 */
async function saveDiagnosis(req, res) {
    const { 
        userId, 
        userName, 
        birthDate, 
        diagnosisType = 'otsukisama',
        resultData 
    } = req.body;

    if (!userId || !birthDate || !resultData) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['userId', 'birthDate', 'resultData']
        });
    }

    // 診断IDを生成（常に新規）
    const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // 1. 常に新しい診断を作成
        const { data: diagnosis, error: diagnosisError } = await supabase
            .from('diagnoses')
            .insert({
                id: diagnosisId,
                user_id: userId,
                diagnosis_type_id: diagnosisType,
                user_name: userName,
                birth_date: birthDate,
                result_data: resultData,
                metadata: {
                    source: 'line',
                    version: '2.0'
                }
            })
            .select()
            .single();

        if (diagnosisError) {
            throw diagnosisError;
        }

        // 2. プレビュー用のアクセス権限を付与（無料）
        await supabase
            .from('access_rights')
            .upsert({
                user_id: userId,
                resource_type: 'diagnosis',
                resource_id: diagnosis.id,
                access_level: 'preview'
            }, {
                onConflict: 'user_id,resource_type,resource_id'
            });

        console.log('[Save Diagnosis] Success:', diagnosis.id);

        return res.json({
            success: true,
            diagnosisId: diagnosis.id,
            isNew: true,
            diagnosis: diagnosis
        });

    } catch (error) {
        console.error('[Save Diagnosis] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to save diagnosis',
            details: error.message 
        });
    }
}

/**
 * 診断を取得
 */
async function getDiagnosis(req, res) {
    const diagnosisId = req.query.id;
    const userId = req.query.userId;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Diagnosis ID is required' });
    }

    try {
        // 1. 診断データを取得
        const { data: diagnosis, error: diagnosisError } = await supabase
            .from('diagnoses')
            .select(`
                *,
                diagnosis_types (
                    name,
                    description,
                    price
                )
            `)
            .eq('id', diagnosisId)
            .single();

        if (diagnosisError || !diagnosis) {
            return res.status(404).json({ 
                success: false,
                error: '診断データが見つかりません' 
            });
        }

        // 2. アクセス権限を確認
        let accessLevel = 'none';
        if (userId) {
            const { data: accessRight } = await supabase
                .from('access_rights')
                .select('access_level, valid_until')
                .eq('user_id', userId)
                .eq('resource_type', 'diagnosis')
                .eq('resource_id', diagnosisId)
                .single();

            if (accessRight) {
                // 有効期限チェック
                if (!accessRight.valid_until || new Date(accessRight.valid_until) > new Date()) {
                    accessLevel = accessRight.access_level;
                }
            } else if (diagnosis.user_id === userId) {
                // 本人の診断の場合は最低限プレビューは見れる
                accessLevel = 'preview';
            }
        }

        // 3. アクセスレベルに応じてデータを返す（一旦全データを返す）
        const response = {
            success: true,
            accessLevel: 'full', // 一旦常にfullとして返す
            diagnosis: {
                id: diagnosis.id,
                user_id: diagnosis.user_id,
                user_name: diagnosis.user_name,
                birth_date: diagnosis.birth_date,
                diagnosis_type: diagnosis.diagnosis_type_id,
                diagnosis_name: diagnosis.diagnosis_types?.name,
                created_at: diagnosis.created_at
            }
        };

        // 一旦全データを常に返す（アクセス制限を後で実装）
        const resultData = diagnosis.result_data || {};
        response.diagnosis.moon_pattern_id = resultData.moon_pattern_id;
        response.diagnosis.moon_phase = resultData.moon_phase;
        response.diagnosis.hidden_moon_phase = resultData.hidden_moon_phase;
        response.diagnosis.emotional_expression = resultData.emotional_expression;
        response.diagnosis.distance_style = resultData.distance_style;
        response.diagnosis.love_values = resultData.love_values;
        response.diagnosis.love_energy = resultData.love_energy;
        response.diagnosis.moon_power_1 = resultData.moon_power_1;
        response.diagnosis.moon_power_2 = resultData.moon_power_2;
        response.diagnosis.moon_power_3 = resultData.moon_power_3;
        response.diagnosis.metadata = diagnosis.metadata;

        // 価格情報を追加（未購入の場合）
        if (accessLevel !== 'full') {
            response.price = diagnosis.diagnosis_types?.price || 980;
        }

        console.log('[Get Diagnosis] Success:', diagnosisId, 'Access:', accessLevel);
        return res.json(response);

    } catch (error) {
        console.error('[Get Diagnosis] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to get diagnosis',
            details: error.message 
        });
    }
}

/**
 * アクセス権限をチェック
 */
async function checkAccess(req, res) {
    const { userId, resourceType, resourceId } = req.query;

    if (!userId || !resourceType || !resourceId) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            required: ['userId', 'resourceType', 'resourceId']
        });
    }

    try {
        const { data: accessRight } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', userId)
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId)
            .single();

        if (!accessRight) {
            return res.json({
                hasAccess: false,
                accessLevel: 'none'
            });
        }

        // 有効期限チェック
        const isValid = !accessRight.valid_until || 
                       new Date(accessRight.valid_until) > new Date();

        return res.json({
            hasAccess: isValid && accessRight.access_level !== 'none',
            accessLevel: isValid ? accessRight.access_level : 'none',
            validUntil: accessRight.valid_until,
            purchaseId: accessRight.purchase_id
        });

    } catch (error) {
        console.error('[Check Access] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to check access',
            details: error.message 
        });
    }
}

/**
 * ユーザーの診断一覧を取得
 */
async function getUserDiagnoses(req, res) {
    const userId = req.query.userId;
    const diagnosisType = req.query.type;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        let query = supabase
            .from('diagnoses')
            .select(`
                id,
                diagnosis_type_id,
                user_name,
                birth_date,
                created_at,
                result_data,
                diagnosis_types (
                    name,
                    description
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (diagnosisType) {
            query = query.eq('diagnosis_type_id', diagnosisType);
        }

        const { data: diagnoses, error } = await query;

        if (error) throw error;

        // アクセスレベルを取得
        const diagnosisIds = diagnoses.map(d => d.id);
        const { data: accessRights } = await supabase
            .from('access_rights')
            .select('resource_id, access_level')
            .eq('user_id', userId)
            .eq('resource_type', 'diagnosis')
            .in('resource_id', diagnosisIds);
        
        const accessMap = {};
        if (accessRights) {
            accessRights.forEach(ar => {
                accessMap[ar.resource_id] = ar.access_level;
            });
        }
        
        // 診断データを整理
        const formattedDiagnoses = diagnoses.map(d => ({
            id: d.id,
            type: d.diagnosis_type_id,
            typeName: d.diagnosis_types?.name,
            userName: d.user_name,
            birthDate: d.birth_date,
            createdAt: d.created_at,
            resultData: d.result_data,
            accessLevel: accessMap[d.id] || 'none',
            isPaid: accessMap[d.id] === 'full'
        }));

        return res.json({
            success: true,
            diagnoses: formattedDiagnoses,
            count: formattedDiagnoses.length
        });

    } catch (error) {
        console.error('[Get User Diagnoses] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to get user diagnoses',
            details: error.message 
        });
    }
}