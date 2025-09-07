require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 日本標準時（JST）のISO文字列を取得する関数
function getJSTDateTime() {
    const now = new Date();
    const jstOffset = 9 * 60; // 9時間 = 540分
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    
    const year = jstTime.getUTCFullYear();
    const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstTime.getUTCDate()).padStart(2, '0');
    const hours = String(jstTime.getUTCHours()).padStart(2, '0');
    const minutes = String(jstTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(jstTime.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(jstTime.getUTCMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

async function testPaymentComplete() {
  const diagnosisId = 'diag_1757218182779_hy8o9e75h';
  const userId = 'anonymous';
  
  console.log('🧪 決済完了をシミュレート（データベース直接更新）\n');
  console.log('診断ID:', diagnosisId);
  console.log('User ID:', userId);
  console.log('');
  
  // 1. 購入レコードを取得
  console.log('1️⃣ 購入レコードを取得...');
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('*')
    .eq('diagnosis_id', diagnosisId)
    .single();
  
  if (purchaseError) {
    console.error('❌ 購入レコード取得エラー:', purchaseError);
    return;
  }
  
  console.log('✅ 購入レコード:', purchase.purchase_id);
  console.log('  - Status:', purchase.status);
  
  // 2. 購入レコードを完了状態に更新
  console.log('\n2️⃣ 購入レコードを完了状態に更新...');
  const { error: updatePurchaseError } = await supabase
    .from('purchases')
    .update({
      status: 'completed',
      completed_at: getJSTDateTime(),
      metadata: {
        ...purchase.metadata,
        payment_status: 'COMPLETED',
        transaction_id: 'test_transaction_' + Date.now(),
        completed_by: 'manual_test'
      }
    })
    .eq('purchase_id', purchase.purchase_id);
  
  if (updatePurchaseError) {
    console.error('❌ 購入レコード更新エラー:', updatePurchaseError);
    return;
  }
  
  console.log('✅ 購入レコードを完了状態に更新しました');
  
  // 3. アクセス権限をpreviewからfullに更新
  console.log('\n3️⃣ アクセス権限をpreviewからfullに更新...');
  
  // まず現在のアクセス権限を確認
  const { data: currentAccess, error: accessCheckError } = await supabase
    .from('access_rights')
    .select('*')
    .eq('resource_id', diagnosisId)
    .eq('user_id', userId)
    .single();
  
  if (accessCheckError) {
    console.error('❌ アクセス権限確認エラー:', accessCheckError);
    return;
  }
  
  console.log('  現在のアクセスレベル:', currentAccess.access_level);
  
  // アクセス権限を更新
  const { error: updateAccessError } = await supabase
    .from('access_rights')
    .update({
      access_level: 'full',
      purchase_id: purchase.purchase_id,
      valid_from: getJSTDateTime()
    })
    .eq('resource_id', diagnosisId)
    .eq('user_id', userId);
  
  if (updateAccessError) {
    console.error('❌ アクセス権限更新エラー:', updateAccessError);
    return;
  }
  
  console.log('✅ アクセス権限をfullに更新しました');
  
  // 4. 更新後の状態を確認
  console.log('\n4️⃣ 更新後の状態を確認...');
  
  const { data: updatedAccess } = await supabase
    .from('access_rights')
    .select('*')
    .eq('resource_id', diagnosisId)
    .eq('user_id', userId)
    .single();
  
  const { data: updatedPurchase } = await supabase
    .from('purchases')
    .select('*')
    .eq('purchase_id', purchase.purchase_id)
    .single();
  
  console.log('\n=====================================');
  console.log('✅ 決済完了シミュレーション成功！');
  console.log('=====================================');
  console.log('購入レコード:');
  console.log('  - Status:', updatedPurchase.status);
  console.log('  - Completed At:', updatedPurchase.completed_at);
  
  console.log('\nアクセス権限:');
  console.log('  - Access Level:', updatedAccess.access_level);
  console.log('  - Purchase ID:', updatedAccess.purchase_id);
  console.log('  - Valid From:', updatedAccess.valid_from);
  
  console.log('\n🌟 診断ページで完全版が表示されるはずです！');
  console.log(`URL: https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${diagnosisId}`);
}

testPaymentComplete();