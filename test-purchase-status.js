const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkPurchaseStatus() {
    console.log('🔍 購入済みデータを確認中...\n');
    
    // 1. 最新の購入履歴を確認
    console.log('1. 最新の購入履歴:');
    const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (purchaseError) {
        console.log('  ❌ エラー:', purchaseError.message);
    } else if (!purchases || purchases.length === 0) {
        console.log('  ❌ 購入履歴なし');
    } else {
        console.log(`  ✅ ${purchases.length}件の購入履歴found:`);
        
        for (const p of purchases) {
            console.log(`\n  購入ID: ${p.purchase_id}`);
            console.log(`    ユーザーID: ${p.user_id}`);
            console.log(`    診断ID: ${p.diagnosis_id}`);
            console.log(`    金額: ${p.amount}円`);
            console.log(`    作成日時: ${p.created_at}`);
            
            // この購入に対応するアクセス権限を確認
            const { data: access } = await supabase
                .from('access_rights')
                .select('*')
                .eq('user_id', p.user_id)
                .eq('resource_id', p.diagnosis_id)
                .eq('resource_type', 'diagnosis')
                .single();
            
            if (access) {
                console.log(`    📝 アクセス権限:`);
                console.log(`      - access_level: ${access.access_level}`);
                console.log(`      - valid_until: ${access.valid_until || '無期限'}`);
                console.log(`      - purchase_id: ${access.purchase_id}`);
                
                if (access.access_level === 'full') {
                    console.log(`    ✅ 正常: fullアクセス権限あり`);
                    console.log(`    🔗 テストURL:`);
                    console.log(`       https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${p.diagnosis_id}&userId=${p.user_id}`);
                } else {
                    console.log(`    ⚠️ 問題: access_levelが${access.access_level}（fullではない）`);
                }
            } else {
                console.log(`    ❌ 問題: アクセス権限が見つからない`);
                console.log(`    修正SQL:`);
                console.log(`    INSERT INTO access_rights (user_id, resource_type, resource_id, access_level, purchase_id)`);
                console.log(`    VALUES ('${p.user_id}', 'diagnosis', '${p.diagnosis_id}', 'full', '${p.purchase_id}');`);
            }
        }
    }
    
    // 2. アクセス権限テーブルの確認
    console.log('\n\n2. アクセス権限テーブルの確認:');
    const { data: accessRights } = await supabase
        .from('access_rights')
        .select('*')
        .eq('resource_type', 'diagnosis')
        .eq('access_level', 'full')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (accessRights && accessRights.length > 0) {
        console.log(`  ✅ ${accessRights.length}件のfullアクセス権限found:`);
        accessRights.forEach(a => {
            console.log(`    - ユーザー: ${a.user_id.substring(0, 10)}...`);
            console.log(`      診断ID: ${a.resource_id}`);
            console.log(`      purchase_id: ${a.purchase_id || 'なし'}`);
        });
    } else {
        console.log('  ❌ fullアクセス権限なし');
    }
    
    // 3. 修正が必要なケースを探す
    console.log('\n\n3. 修正が必要なケース:');
    const { data: incompletePurchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
    
    let fixNeeded = 0;
    for (const p of incompletePurchases || []) {
        const { data: access } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', p.user_id)
            .eq('resource_id', p.diagnosis_id)
            .eq('resource_type', 'diagnosis')
            .single();
        
        if (!access || access.access_level !== 'full') {
            fixNeeded++;
            console.log(`  ⚠️ 購入ID ${p.purchase_id}:`);
            console.log(`     ユーザー: ${p.user_id}`);
            console.log(`     診断: ${p.diagnosis_id}`);
            console.log(`     現在のアクセス: ${access ? access.access_level : 'なし'}`);
        }
    }
    
    if (fixNeeded === 0) {
        console.log('  ✅ すべての購入にfullアクセス権限あり');
    } else {
        console.log(`\n  ❌ ${fixNeeded}件の購入でアクセス権限の修正が必要`);
    }
}

checkPurchaseStatus().catch(console.error);