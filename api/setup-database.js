// Supabaseテーブルセットアップエンドポイント
const { createClient } = require('@supabase/supabase-js');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: '環境変数が設定されていません' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const results = {
    envCheck: {
      url: !!supabaseUrl,
      key: !!supabaseKey
    },
    tables: {},
    testData: {}
  };
  
  // ordersテーブルの確認
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      results.tables.orders = {
        exists: false,
        error: error.message,
        code: error.code,
        createSQL: `
-- Supabaseダッシュボードで以下のSQLを実行してください:
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  paid_at TIMESTAMP,
  report_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
      };
    } else {
      results.tables.orders = {
        exists: true,
        count: count
      };
      
      // テストデータの作成
      const testOrderId = `TEST_${Date.now()}`;
      const { data: testData, error: testError } = await supabase
        .from('orders')
        .insert({
          id: testOrderId,
          user_id: 'TEST_USER',
          amount: 100,
          status: 'test'
        })
        .select()
        .single();
      
      if (testError) {
        results.testData.createOrder = {
          success: false,
          error: testError.message
        };
      } else {
        results.testData.createOrder = {
          success: true,
          id: testData.id
        };
        
        // テストデータの削除
        await supabase
          .from('orders')
          .delete()
          .eq('id', testOrderId);
      }
    }
  } catch (err) {
    results.tables.orders = {
      exists: false,
      error: err.message
    };
  }
  
  // profilesテーブルの確認
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      results.tables.profiles = {
        exists: false,
        error: error.message,
        code: error.code,
        createSQL: `
-- Supabaseダッシュボードで以下のSQLを実行してください:
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  user_name TEXT,
  birth_date DATE,
  gender TEXT,
  partner_name TEXT,
  partner_birth_date DATE,
  partner_gender TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);`
      };
    } else {
      results.tables.profiles = {
        exists: true,
        count: count
      };
    }
  } catch (err) {
    results.tables.profiles = {
      exists: false,
      error: err.message
    };
  }
  
  // 最近の注文を取得
  if (results.tables.orders?.exists) {
    try {
      const { data: recentOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && recentOrders) {
        results.recentOrders = recentOrders.map(order => ({
          id: order.id,
          userId: order.user_id,
          status: order.status,
          createdAt: order.created_at
        }));
      }
    } catch (err) {
      console.error('最近の注文取得エラー:', err);
    }
  }
  
  res.status(200).json(results);
}

module.exports = handler;