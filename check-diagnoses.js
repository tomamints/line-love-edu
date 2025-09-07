// diagnosesテーブルのデータを確認するスクリプト
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDiagnoses() {
  console.log('📊 diagnosesテーブルの最新データを確認中...\n');
  
  try {
    // 最新10件を取得
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ エラー:', error);
      return;
    }
    
    console.log(`✅ 取得件数: ${data.length}件\n`);
    
    if (data.length === 0) {
      console.log('⚠️ データがありません');
      return;
    }
    
    // 各レコードを表示
    data.forEach((record, index) => {
      console.log(`📝 レコード ${index + 1}:`);
      console.log('  ID:', record.id);
      console.log('  ユーザーID:', record.user_id);
      console.log('  ユーザー名:', record.user_name);
      console.log('  誕生日:', record.birth_date);
      console.log('  診断タイプ:', record.diagnosis_type_id);
      console.log('  月タイプ:', record.result_data?.moon_pattern_id || record.result_data?.moon_phase);
      console.log('  作成日時:', record.created_at);
      console.log('---');
    });
    
    // 特定のIDを検索
    const searchId = 'diag_1757213257832';
    console.log(`\n🔍 "${searchId}"で始まるIDを検索中...`);
    
    const { data: searchData, error: searchError } = await supabase
      .from('diagnoses')
      .select('*')
      .like('id', `${searchId}%`);
    
    if (searchError) {
      console.error('❌ 検索エラー:', searchError);
      return;
    }
    
    if (searchData && searchData.length > 0) {
      console.log(`✅ 見つかりました: ${searchData.length}件`);
      searchData.forEach(record => {
        console.log('  ID:', record.id);
        console.log('  作成日時:', record.created_at);
      });
    } else {
      console.log('⚠️ 該当するレコードが見つかりません');
    }
    
  } catch (err) {
    console.error('❌ 予期しないエラー:', err);
  }
}

checkDiagnoses();