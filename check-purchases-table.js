const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPurchasesTable() {
    console.log('purchasesテーブルの確認');
    console.log('='.repeat(50));
    
    // テスト用の購入データを作成してみる
    const testData = {
        purchase_id: `test_${Date.now()}`,
        user_id: 'test_user',
        diagnosis_id: 'test_diagnosis',
        product_type: 'diagnosis',
        product_id: 'otsukisama',
        product_name: 'テスト診断',
        amount: 980,  // 整数で試す
        currency: 'JPY',
        payment_method: 'stripe',
        stripe_session_id: 'test_session',
        status: 'test',
        completed_at: new Date().toISOString()
    };
    
    console.log('テストデータ:', testData);
    console.log('amount型:', typeof testData.amount, testData.amount);
    
    // 既存のpurchasesを確認
    const { data: existing, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .limit(1);
    
    if (fetchError) {
        console.error('取得エラー:', fetchError);
    } else {
        console.log('既存のレコード例:', existing);
    }
    
    // テストデータの挿入を試みる（本番環境では実行しない）
    // const { data, error } = await supabase
    //     .from('purchases')
    //     .insert([testData]);
    
    // if (error) {
    //     console.error('挿入エラー:', error);
    // } else {
    //     console.log('挿入成功:', data);
    // }
}

checkPurchasesTable();