require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkSavedData() {
  console.log('=== 保存されたおつきさま診断データの確認 ===\n');
  
  // おつきさま診断のデータを取得
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('diagnosis_type', 'otsukisama')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error('エラー:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log(`✅ ${data.length}件のおつきさま診断データが見つかりました:\n`);
    
    data.forEach((record, index) => {
      console.log(`[${index + 1}] ${record.user_name || 'N/A'}`);
      console.log(`    User ID: ${record.user_id}`);
      console.log(`    診断ID: ${record.diagnosis_id}`);
      console.log(`    生年月日: ${record.birth_date}`);
      console.log(`    月パターンID: ${record.moon_pattern_id}`);
      console.log(`    診断日時: ${record.diagnosis_date}`);
      console.log(`    支払い済み: ${record.is_paid ? 'はい' : 'いいえ'}`);
      console.log(`    作成日時: ${record.created_at}`);
      console.log('');
    });
    
    // 新しいカラムのデータ状況を確認
    console.log('=== カラムデータの状況 ===');
    const columnStatus = {
      moon_pattern_id: data.filter(d => d.moon_pattern_id !== null).length,
      diagnosis_id: data.filter(d => d.diagnosis_id !== null).length,
      diagnosis_date: data.filter(d => d.diagnosis_date !== null).length,
      is_paid: data.filter(d => d.is_paid !== null).length,
    };
    
    Object.entries(columnStatus).forEach(([col, count]) => {
      console.log(`${col}: ${count}/${data.length} レコードにデータあり`);
    });
    
  } else {
    console.log('おつきさま診断のデータはまだありません');
  }
}

checkSavedData().catch(console.error);