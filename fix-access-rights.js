const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function fixAccessRights() {
    console.log('🔧 アクセス権限を修正中...\n');
    
    // 1. 完了した購入をすべて取得
    const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed');
    
    if (purchaseError) {
        console.error('購入データ取得エラー:', purchaseError);
        return;
    }
    
    console.log(`${purchases.length}件の購入データを処理します\n`);
    
    let fixed = 0;
    let alreadyCorrect = 0;
    
    for (const purchase of purchases) {
        // 対応するアクセス権限を確認
        const { data: existingAccess } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', purchase.user_id)
            .eq('resource_type', 'diagnosis')
            .eq('resource_id', purchase.diagnosis_id)
            .single();
        
        if (existingAccess && existingAccess.access_level === 'full') {
            alreadyCorrect++;
            console.log(`✅ ${purchase.purchase_id}: すでに正しい`);
        } else {
            // アクセス権限を更新または作成
            const { error: upsertError } = await supabase
                .from('access_rights')
                .upsert({
                    user_id: purchase.user_id,
                    resource_type: 'diagnosis',
                    resource_id: purchase.diagnosis_id,
                    access_level: 'full',
                    purchase_id: purchase.purchase_id,
                    valid_from: purchase.created_at,
                    valid_until: null // 永久アクセス
                }, {
                    onConflict: 'user_id,resource_type,resource_id'
                });
            
            if (upsertError) {
                console.error(`❌ ${purchase.purchase_id}: 更新失敗`, upsertError.message);
            } else {
                fixed++;
                console.log(`🔧 ${purchase.purchase_id}: preview → full に更新`);
                console.log(`   ユーザー: ${purchase.user_id}`);
                console.log(`   診断ID: ${purchase.diagnosis_id}`);
            }
        }
    }
    
    console.log('\n📊 修正結果:');
    console.log(`  ✅ すでに正しい: ${alreadyCorrect}件`);
    console.log(`  🔧 修正した: ${fixed}件`);
    console.log(`  合計: ${purchases.length}件`);
    
    if (fixed > 0) {
        console.log('\n✨ 修正完了！購入済みの診断が正しく表示されるようになりました。');
        
        // 修正されたデータのテストURLを表示
        const { data: fixedPurchases } = await supabase
            .from('purchases')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(3);
        
        console.log('\n🔗 テスト用URL:');
        fixedPurchases.forEach(p => {
            console.log(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${p.diagnosis_id}&userId=${p.user_id}`);
        });
    }
}

fixAccessRights().catch(console.error);