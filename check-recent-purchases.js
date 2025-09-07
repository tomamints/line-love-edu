require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPurchases() {
  console.log('\n📊 最新の購入レコードを確認中...\n');
  
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('エラー:', error);
    return;
  }
  
  if (purchases && purchases.length > 0) {
    console.log(`✅ ${purchases.length}件の購入レコード:\n`);
    purchases.forEach((p, i) => {
      console.log(`[${i+1}] Purchase ID: ${p.purchase_id}`);
      console.log(`    Diagnosis ID: ${p.diagnosis_id}`);
      console.log(`    User ID: ${p.user_id}`);
      console.log(`    Amount: ¥${p.amount}`);
      console.log(`    Status: ${p.status}`);
      console.log(`    Payment Method: ${p.payment_method}`);
      console.log(`    Created: ${p.created_at}`);
      if (p.metadata?.paypay_merchant_payment_id) {
        console.log(`    PayPay Order: ${p.metadata.paypay_merchant_payment_id}`);
      }
      console.log('---');
    });
  } else {
    console.log('購入レコードがありません');
  }
}

checkPurchases();
