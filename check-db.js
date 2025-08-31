require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('=== Supabaseデータベース現状確認 ===\n');
  console.log('接続先:', process.env.SUPABASE_URL);
  console.log('');
  
  // profilesテーブルの確認
  console.log('1. profilesテーブルの確認:');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (profilesError) {
    console.log('❌ profilesテーブル: エラー', profilesError.message);
  } else {
    console.log('✅ profilesテーブル: 存在します');
    
    // 最初のレコードでカラムを確認
    if (profiles && profiles.length > 0) {
      console.log('\n   現在のカラム:');
      Object.keys(profiles[0]).forEach(key => {
        console.log(`     - ${key}: ${typeof profiles[0][key]}`);
      });
    }
    
    // レコード数確認
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    console.log(`\n   総レコード数: ${count}`);
  }
  
  // ordersテーブルの確認
  console.log('\n2. ordersテーブルの確認:');
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
    
  if (ordersError) {
    console.log('❌ ordersテーブル: エラー', ordersError.message);
  } else {
    console.log('✅ ordersテーブル: 存在します');
    
    if (orders && orders.length > 0) {
      console.log('\n   現在のカラム:');
      Object.keys(orders[0]).forEach(key => {
        console.log(`     - ${key}: ${typeof orders[0][key]}`);
      });
    }
    
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    console.log(`\n   総レコード数: ${count}`);
  }
  
  // diagnosesテーブルの確認（もし存在すれば）
  console.log('\n3. diagnosesテーブルの確認:');
  const { data: diagnoses, error: diagnosesError } = await supabase
    .from('diagnoses')
    .select('*')
    .limit(1);
    
  if (diagnosesError) {
    console.log('❌ diagnosesテーブル: 存在しない、またはアクセス権限なし');
    console.log('   エラー:', diagnosesError.message);
  } else {
    console.log('✅ diagnosesテーブル: 存在します');
    
    if (diagnoses && diagnoses.length > 0) {
      console.log('\n   現在のカラム:');
      Object.keys(diagnoses[0]).forEach(key => {
        console.log(`     - ${key}: ${typeof diagnoses[0][key]}`);
      });
    }
    
    const { count } = await supabase
      .from('diagnoses')
      .select('*', { count: 'exact', head: true });
    console.log(`\n   総レコード数: ${count}`);
  }
  
  // 必要なカラムの確認
  console.log('\n=== 必要なカラムの確認 ===');
  console.log('\nprofilesテーブルに必要なカラム（おつきさま診断用）:');
  const requiredColumns = [
    'moon_pattern_id',
    'diagnosis_type', 
    'diagnosis_id',
    'diagnosis_date',
    'is_paid'
  ];
  
  if (profiles && profiles.length > 0) {
    const existingColumns = Object.keys(profiles[0]);
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`  ✅ ${col}: 存在`);
      } else {
        console.log(`  ❌ ${col}: 不足`);
      }
    });
  }
  
  // 最近のレコードを確認
  console.log('\n=== 最近のおつきさま診断データ ===');
  const { data: recentDiagnoses } = await supabase
    .from('profiles')
    .select('user_id, user_name, diagnosis_type, diagnosis_id, created_at')
    .eq('diagnosis_type', 'otsukisama')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (recentDiagnoses && recentDiagnoses.length > 0) {
    console.log('最近の診断:');
    recentDiagnoses.forEach(d => {
      console.log(`  - ${d.user_name || 'N/A'} (${d.user_id}): ${d.diagnosis_id} - ${d.created_at}`);
    });
  } else {
    console.log('おつきさま診断のレコードはまだありません');
  }
}

checkTables().catch(console.error);