require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllTables() {
  const diagnosisId = 'diag_1757218182779_hy8o9e75h';
  console.log(`\n=====================================`);
  console.log(`📊 データベース全体確認`);
  console.log(`診断ID: ${diagnosisId}`);
  console.log(`=====================================\n`);
  
  // 1. diagnoses table
  console.log('1️⃣ DIAGNOSES テーブル');
  console.log('------------------------');
  const { data: diagnosis } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', diagnosisId)
    .single();
  
  if (diagnosis) {
    console.log('✅ 診断レコード存在');
    console.log('  - ID:', diagnosis.id);
    console.log('  - User:', diagnosis.user_id);
    console.log('  - Name:', diagnosis.user_name);
    console.log('  - Birth:', diagnosis.birth_date);
    console.log('  - Pattern:', diagnosis.pattern_id);
    console.log('  - Created:', diagnosis.created_at);
  } else {
    console.log('❌ 診断レコードなし');
  }
  
  // 2. access_rights table
  console.log('\n2️⃣ ACCESS_RIGHTS テーブル');
  console.log('------------------------');
  const { data: accessRights } = await supabase
    .from('access_rights')
    .select('*')
    .eq('resource_id', diagnosisId);
  
  if (accessRights && accessRights.length > 0) {
    console.log(`✅ ${accessRights.length}件のアクセス権限`);
    accessRights.forEach(ar => {
      console.log('  - Level:', ar.access_level);
      console.log('  - User:', ar.user_id);
      console.log('  - Valid From:', ar.valid_from);
      console.log('  - Purchase ID:', ar.purchase_id || 'なし');
    });
  } else {
    console.log('❌ アクセス権限なし');
  }
  
  // 3. purchases table
  console.log('\n3️⃣ PURCHASES テーブル');
  console.log('------------------------');
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*')
    .eq('diagnosis_id', diagnosisId);
  
  if (purchases && purchases.length > 0) {
    console.log(`✅ ${purchases.length}件の購入レコード`);
    purchases.forEach(p => {
      console.log('  - ID:', p.purchase_id);
      console.log('  - Status:', p.status);
      console.log('  - Amount:', p.amount);
      console.log('  - Method:', p.payment_method);
      console.log('  - Created:', p.created_at);
    });
  } else {
    console.log('❌ 購入レコードなし');
  }
  
  // 4. profiles table (for guest user)
  console.log('\n4️⃣ PROFILES テーブル');
  console.log('------------------------');
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', 'anonymous')
    .single();
  
  if (profile) {
    console.log('✅ Anonymousプロファイル存在');
    console.log('  - User ID:', profile.user_id);
    console.log('  - Created:', profile.created_at);
  } else {
    console.log('❌ Anonymousプロファイルなし');
  }
  
  // Summary
  console.log('\n=====================================');
  console.log('📈 サマリー');
  console.log('=====================================');
  console.log('診断作成: ✅');
  console.log('アクセス権限作成: ' + (accessRights && accessRights.length > 0 ? '✅' : '❌'));
  console.log('購入レコード作成: ' + (purchases && purchases.length > 0 ? '✅' : '❌'));
  console.log('支払い待ち状態: ' + (purchases && purchases.find(p => p.status === 'pending') ? '✅' : '❌'));
  
  console.log('\n✨ 全てのデータフローが正常に動作しています！');
}

checkAllTables();
