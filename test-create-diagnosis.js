// テスト診断データ作成スクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createTestDiagnosis() {
  const diagnosisId = `test_${Date.now()}`;
  const testData = {
    diagnosis_id: diagnosisId,
    user_id: 'test_user_' + Date.now(),
    user_name: 'テスト太郎',
    birth_date: '1990-05-15',
    moon_pattern_id: 25, // パターンID 25をテストに使用
    diagnosis_type: 'otsukisama',
    emotional_expression: 'straight',
    distance_style: 'moderate',
    love_values: 'romantic',
    love_energy: 'stable',
    is_paid: false,
    created_at: new Date().toISOString(),
    diagnosis_date: new Date().toISOString()
  };
  
  try {
    console.log('テスト診断データを作成中...');
    console.log('診断ID:', diagnosisId);
    console.log('データ:', testData);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('エラー:', error);
      return;
    }
    
    console.log('✅ テスト診断データ作成成功!');
    console.log('作成されたデータ:', data);
    console.log('\n以下のURLでプレビューページを確認できます:');
    console.log(`http://localhost:3000/lp-otsukisama-preview-v2.html?id=${diagnosisId}&userId=${testData.user_id}`);
  } catch (error) {
    console.error('作成エラー:', error);
  }
}

createTestDiagnosis();