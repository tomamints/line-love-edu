/**
 * ユーザーのリッチメニューを切り替えるAPI
 * 購入者には専用のリッチメニューを表示
 */

const line = require('@line/bot-sdk');
const { createClient } = require('@supabase/supabase-js');

// LINE Bot設定
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};
const client = new line.Client(config);

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// リッチメニューID（環境変数から取得）
const DEFAULT_RICH_MENU_ID = process.env.DEFAULT_RICH_MENU_ID;
const PREMIUM_RICH_MENU_ID = process.env.PREMIUM_RICH_MENU_ID;

/**
 * ユーザーが購入済みかチェック
 */
async function checkUserPurchased(userId) {
    if (!supabase) return false;
    
    try {
        // purchasesテーブルから購入履歴を確認
        const { data: purchases, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', userId)
            .eq('payment_status', 'completed')
            .limit(1);
        
        if (error) {
            console.error('Purchase check error:', error);
            return false;
        }
        
        return purchases && purchases.length > 0;
    } catch (error) {
        console.error('Error checking user purchases:', error);
        return false;
    }
}

/**
 * ユーザーのリッチメニューを更新
 */
async function updateUserRichMenu(userId, isPremium) {
    try {
        const richMenuId = isPremium ? PREMIUM_RICH_MENU_ID : DEFAULT_RICH_MENU_ID;
        
        if (!richMenuId) {
            console.error('Rich menu ID not configured');
            return false;
        }
        
        // 現在のリッチメニューを取得
        try {
            const currentMenu = await client.getRichMenuIdOfUser(userId);
            if (currentMenu === richMenuId) {
                console.log(`User ${userId} already has the correct rich menu`);
                return true;
            }
        } catch (error) {
            // リッチメニューが設定されていない場合はエラーになるが続行
            console.log('No current rich menu for user');
        }
        
        // リッチメニューをユーザーにリンク
        await client.linkRichMenuToUser(userId, richMenuId);
        console.log(`Rich menu updated for user ${userId}: ${isPremium ? 'Premium' : 'Default'}`);
        
        return true;
    } catch (error) {
        console.error('Error updating rich menu:', error);
        return false;
    }
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userId, checkPurchase = true } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
        let isPremium = false;
        
        if (checkPurchase) {
            // 購入履歴をチェック
            isPremium = await checkUserPurchased(userId);
            console.log(`User ${userId} purchase status: ${isPremium}`);
        } else {
            // 強制的にプレミアムまたは通常メニューを設定
            isPremium = req.body.isPremium || false;
        }
        
        // リッチメニューを更新
        const success = await updateUserRichMenu(userId, isPremium);
        
        if (success) {
            return res.json({
                success: true,
                isPremium: isPremium,
                message: `Rich menu updated to ${isPremium ? 'premium' : 'default'}`
            });
        } else {
            throw new Error('Failed to update rich menu');
        }
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Failed to update rich menu',
            details: error.message
        });
    }
}

// エクスポート（決済完了時などから呼び出し可能）
module.exports.updateUserRichMenu = updateUserRichMenu;
module.exports.checkUserPurchased = checkUserPurchased;