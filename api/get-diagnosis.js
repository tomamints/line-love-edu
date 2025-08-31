// api/get-diagnosis.js
// 診断データを取得するAPI

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: '診断IDが必要です' });
    }
    
    // 診断データを取得
    const { data: diagnosis, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !diagnosis) {
      console.error('診断データ取得エラー:', error);
      return res.status(404).json({ 
        success: false,
        error: '診断データが見つかりません' 
      });
    }
    
    // 支払い済みでない場合はエラー
    if (!diagnosis.is_paid && req.query.requirePaid === 'true') {
      return res.status(403).json({ 
        success: false,
        error: '支払いが完了していません' 
      });
    }
    
    return res.json({
      success: true,
      diagnosis: diagnosis
    });
    
  } catch (error) {
    console.error('診断データ取得エラー:', error);
    return res.status(500).json({ 
      success: false,
      error: 'サーバーエラーが発生しました' 
    });
  }
};