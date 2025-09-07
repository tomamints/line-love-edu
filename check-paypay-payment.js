require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPayment() {
  const diagnosisId = 'diag_1757215463198_v7r4ypcvr';
  const orderId = 'diag_diag_1757215463198_v7r4ypcvr_1757215895332';
  
  console.log(`\n🔍 診断ID: ${diagnosisId} の決済データ確認\n`);
  console.log(`📦 PayPay Order ID: ${orderId}\n`);
  
  // Check purchases table for PayPay order
  console.log('📊 purchasesテーブル（最新10件）:');
  const { data: purchases, error: purchError } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (purchases && purchases.length > 0) {
    purchases.forEach((p, i) => {
      if (p.diagnosis_id === diagnosisId || p.metadata?.paypay_order_id === orderId) {
        console.log(`\n🎯 関連する購入データ発見 (${i+1}):`);
        console.log('  - Purchase ID:', p.purchase_id);
        console.log('  - Diagnosis ID:', p.diagnosis_id); 
        console.log('  - Amount:', p.amount);
        console.log('  - Status:', p.status);
        console.log('  - Payment Method:', p.payment_method);
        console.log('  - Created:', p.created_at);
        console.log('  - Metadata:', JSON.stringify(p.metadata));
      }
    });
  } else {
    console.log('購入データなし');
  }
  
  // Check access_rights for this diagnosis
  console.log('\n📊 access_rightsテーブル:');
  const { data: accessRights, error: accessError } = await supabase
    .from('access_rights')
    .select('*')
    .eq('resource_id', diagnosisId);
  
  if (accessRights && accessRights.length > 0) {
    console.log(`✅ ${accessRights.length}件のアクセス権限:`);
    accessRights.forEach(ar => {
      console.log('  - User ID:', ar.user_id);
      console.log('  - Resource ID:', ar.resource_id);
      console.log('  - Access Level:', ar.access_level);
      console.log('  - Valid From:', ar.valid_from);
      console.log('  - Valid Until:', ar.valid_until);
      console.log('  - Created:', ar.created_at);
    });
  } else {
    console.log('⚠️ アクセス権限データなし');
  }
}

checkPayment();
