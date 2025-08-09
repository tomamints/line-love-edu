// api/check-db-structure.js
// データベース構造を確認

const { supabase } = require('../core/database/supabase');

module.exports = async (req, res) => {
  console.log('\n========== CHECK DB STRUCTURE ==========');
  
  if (!supabase) {
    return res.json({ error: 'Supabase not configured' });
  }
  
  try {
    // ordersテーブルから1件取得してカラムを確認
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📊 Table columns:', columns);
      
      // report_progressカラムの存在確認
      const hasReportProgress = columns.includes('report_progress');
      console.log('✅ report_progress column exists:', hasReportProgress);
      
      return res.json({
        tableName: 'orders',
        columns: columns,
        hasReportProgress: hasReportProgress,
        sampleData: {
          ...data[0],
          // センシティブなデータは省略
          user_id: data[0].user_id ? '***' : null,
          stripe_session_id: data[0].stripe_session_id ? '***' : null
        }
      });
    } else {
      return res.json({
        message: 'No data in orders table',
        columns: []
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to check database structure',
      message: error.message
    });
  }
};