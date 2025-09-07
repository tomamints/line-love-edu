require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestPurchase() {
  const diagnosisId = 'diag_1757217255964_sqi5a3yy4';
  console.log(`\n🔍 診断ID ${diagnosisId} の購入データ確認\n`);
  
  // Check latest purchases
  const { data: purchases, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('diagnosis_id', diagnosisId);
  
  if (error) {
    console.error('エラー:', error);
    return;
  }
  
  if (purchases && purchases.length > 0) {
    console.log(`✅ ${purchases.length}件の購入レコード見つかりました:\n`);
    purchases.forEach((p, i) => {
      console.log(`[${i+1}] Purchase Details:`);
      console.log('  - Purchase ID:', p.purchase_id);
      console.log('  - User ID:', p.user_id);
      console.log('  - Amount:', p.amount);
      console.log('  - Status:', p.status);
      console.log('  - Payment Method:', p.payment_method);
      console.log('  - Created At:', p.created_at);
      if (p.metadata) {
        console.log('  - Metadata:', JSON.stringify(p.metadata, null, 2));
      }
    });
  } else {
    console.log('⚠️ この診断IDの購入レコードはまだありません');
    
    // Check recent purchases to see if it was created
    console.log('\n最新の購入レコードを確認中...');
    const { data: recentPurchases } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (recentPurchases && recentPurchases.length > 0) {
      console.log('\n最新3件の購入レコード:');
      recentPurchases.forEach((p, i) => {
        console.log(`[${i+1}] ${p.purchase_id}`);
        console.log('  - Diagnosis:', p.diagnosis_id);
        console.log('  - Created:', p.created_at);
      });
    }
  }
}

checkLatestPurchase();
