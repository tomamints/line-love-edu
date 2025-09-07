require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaymentData() {
  const diagnosisId = 'diag_1757215463198_v7r4ypcvr';
  console.log(`\n🔍 診断ID: ${diagnosisId} の決済関連データを確認中...\n`);
  
  // 1. Check access_rights table
  console.log('📊 access_rightsテーブル:');
  const { data: accessRights, error: accessError } = await supabase
    .from('access_rights')
    .select('*')
    .eq('diagnosis_id', diagnosisId);
  
  if (accessError) {
    console.error('❌ access_rights取得エラー:', accessError);
  } else if (accessRights && accessRights.length > 0) {
    console.log(`✅ ${accessRights.length}件のアクセス権限データ:`);
    accessRights.forEach(record => {
      console.log('  - ID:', record.id);
      console.log('  - ユーザーID:', record.user_id);
      console.log('  - アクセスレベル:', record.access_level);
      console.log('  - 有効期限:', record.expires_at);
      console.log('  - 作成日時:', record.created_at);
    });
  } else {
    console.log('⚠️ アクセス権限データなし');
  }
  
  // 2. Check purchases table
  console.log('\n📊 purchasesテーブル:');
  const { data: purchases, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('diagnosis_id', diagnosisId);
  
  if (purchaseError) {
    console.error('❌ purchases取得エラー:', purchaseError);
  } else if (purchases && purchases.length > 0) {
    console.log(`✅ ${purchases.length}件の購入データ:`);
    purchases.forEach(record => {
      console.log('  - ID:', record.id);
      console.log('  - ユーザーID:', record.user_id);
      console.log('  - 金額:', record.amount);
      console.log('  - 決済方法:', record.payment_method);
      console.log('  - ステータス:', record.status);
      console.log('  - PayPay Order ID:', record.paypay_order_id);
      console.log('  - 作成日時:', record.created_at);
    });
  } else {
    console.log('⚠️ 購入データなし（まだ決済が完了していない）');
  }
  
  // 3. Check diagnoses table for payment status
  console.log('\n📊 diagnosesテーブルの支払いステータス:');
  const { data: diagnosis, error: diagError } = await supabase
    .from('diagnoses')
    .select('id, user_id, is_paid, stripe_session_id, checkout_created_at, paid_at')
    .eq('id', diagnosisId)
    .single();
  
  if (diagError) {
    console.error('❌ diagnosis取得エラー:', diagError);
  } else if (diagnosis) {
    console.log('  - 診断ID:', diagnosis.id);
    console.log('  - 支払い済み:', diagnosis.is_paid ? '✅ はい' : '❌ いいえ');
    console.log('  - Stripe Session ID:', diagnosis.stripe_session_id || 'なし');
    console.log('  - チェックアウト作成:', diagnosis.checkout_created_at || 'なし');
    console.log('  - 支払い完了日時:', diagnosis.paid_at || 'なし');
  }
}

checkPaymentData();
