const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestPurchases() {
    console.log('最新の購入履歴を確認');
    console.log('='.repeat(60));
    
    // 最新10件の購入履歴を取得
    const { data: purchases, error } = await supabase
        .from('purchases')
        .select(`
            *,
            diagnoses:diagnosis_id (
                user_name,
                birth_date,
                diagnosis_type_id
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log(`最新${purchases.length}件の購入履歴:\n`);
    
    purchases.forEach((p, index) => {
        console.log(`${index + 1}. ${p.purchase_id}`);
        console.log(`   ユーザー: ${p.diagnoses?.user_name || 'Unknown'}`);
        console.log(`   商品: ${p.product_name}`);
        console.log(`   金額: ${p.amount}円`);
        console.log(`   状態: ${p.status}`);
        console.log(`   決済方法: ${p.payment_method}`);
        console.log(`   購入日時: ${new Date(p.created_at).toLocaleString('ja-JP')}`);
        console.log(`   Stripe Session: ${p.stripe_session_id}`);
        console.log('');
    });
    
    // アクセス権限も確認
    console.log('対応するアクセス権限:');
    console.log('-'.repeat(40));
    
    for (const p of purchases) {
        const { data: access } = await supabase
            .from('access_rights')
            .select('*')
            .eq('purchase_id', p.purchase_id)
            .single();
        
        if (access) {
            console.log(`${p.purchase_id} → ${access.access_level} (${access.resource_id})`);
        }
    }
}

checkLatestPurchases();