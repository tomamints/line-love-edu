// api/add-progress-column.js
// report_progressカラムを追加するマイグレーション

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  console.log('\n========== ADD PROGRESS COLUMN ==========');
  
  // Supabase管理者クライアントを作成（環境変数から）
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // まず現在のカラムを確認
    console.log('📊 Checking current columns...');
    const { data: checkData, error: checkError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Check error:', checkError);
      return res.status(500).json({ error: 'Failed to check table', details: checkError });
    }
    
    const currentColumns = checkData && checkData.length > 0 ? Object.keys(checkData[0]) : [];
    console.log('📊 Current columns:', currentColumns);
    
    if (currentColumns.includes('report_progress')) {
      console.log('✅ report_progress column already exists');
      return res.json({
        message: 'Column already exists',
        columns: currentColumns
      });
    }
    
    // SQLクエリでカラムを追加
    // 注: Supabase JSクライアントでは直接ALTER TABLEを実行できないため、
    // Supabase ダッシュボードのSQL Editorで実行する必要があります
    
    const sqlQuery = `
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS report_progress JSONB;
    `;
    
    console.log('📝 SQL to execute in Supabase Dashboard:');
    console.log(sqlQuery);
    
    return res.json({
      message: 'Column needs to be added',
      currentColumns: currentColumns,
      missingColumn: 'report_progress',
      instruction: 'Please run the following SQL in Supabase Dashboard SQL Editor:',
      sql: sqlQuery,
      supabaseUrl: supabaseUrl.replace(/\\/api\\/v1$/, ''),
      dashboardUrl: `${supabaseUrl.replace(/\\/api\\/v1$/, '')}/project/default/sql`
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Migration failed',
      message: error.message
    });
  }
};