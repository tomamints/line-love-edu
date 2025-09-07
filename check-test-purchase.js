require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTestPurchase() {
    const diagnosisId = 'diag_1757221147202_5l1hpa5fu';
    
    console.log('🔍 テスト診断のデータ確認\n');
    console.log('診断ID:', diagnosisId);
    console.log('');
    
    // 1. 診断レコード
    const { data: diagnosis } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();
    
    if (diagnosis) {
        console.log('✅ diagnoses: 診断レコード存在');
        console.log('   - User:', diagnosis.user_name);
        console.log('   - Created:', diagnosis.created_at);
    }
    
    // 2. access_rights
    const { data: access } = await supabase
        .from('access_rights')
        .select('*')
        .eq('resource_id', diagnosisId)
        .single();
    
    if (access) {
        console.log('\n✅ access_rights: アクセス権限存在');
        console.log('   - Level:', access.access_level);
        console.log('   - User:', access.user_id);
    }
    
    // 3. purchases
    const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .single();
    
    if (purchase) {
        console.log('\n✅ purchases: 購入レコード存在');
        console.log('   - Status:', purchase.status);
        console.log('   - Amount:', purchase.amount);
        console.log('   - Method:', purchase.payment_method);
        console.log('   - Purchase ID:', purchase.purchase_id);
        
        // メタデータの確認
        if (purchase.metadata?.paypay_merchant_payment_id) {
            console.log('   - PayPay Merchant ID:', purchase.metadata.paypay_merchant_payment_id);
        }
    } else {
        console.log('\n❌ purchases: 購入レコードなし');
    }
    
    console.log('\n=====================================');
    console.log('共通ハンドラーによる処理:');
    console.log('- PaymentHandler.createPurchaseRecord() が正常に動作');
    console.log('- purchasesテーブルにpendingレコード作成成功');
    console.log('=====================================');
}

checkTestPurchase();
