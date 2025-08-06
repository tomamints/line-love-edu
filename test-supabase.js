// Supabase接続テストスクリプト
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  console.log('🔍 環境変数チェック:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '設定済み' : '未設定');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '設定済み' : '未設定');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ 環境変数が設定されていません');
    return;
  }
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
  
  console.log('\n📊 ordersテーブル接続テスト:');
  try {
    const { data, error, count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ ordersテーブルエラー:', error);
      
      // テーブルが存在しない場合の作成SQL
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n💡 ordersテーブルを作成してください:');
        console.log(`
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
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        `);
      }
    } else {
      console.log('✅ ordersテーブル接続成功');
      console.log('📊 現在の注文数:', count);
    }
  } catch (err) {
    console.error('❌ 接続エラー:', err.message);
  }
  
  console.log('\n👤 profilesテーブル接続テスト:');
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ profilesテーブルエラー:', error);
      
      // テーブルが存在しない場合の作成SQL
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n💡 profilesテーブルを作成してください:');
        console.log(`
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
);
        `);
      }
    } else {
      console.log('✅ profilesテーブル接続成功');
      console.log('👤 現在のプロファイル数:', count);
    }
  } catch (err) {
    console.error('❌ 接続エラー:', err.message);
  }
  
  // テスト注文の作成と取得
  console.log('\n🧪 注文の作成・取得テスト:');
  const testOrderId = `TEST_${Date.now()}`;
  
  try {
    // 作成
    const { data: createData, error: createError } = await supabase
      .from('orders')
      .insert({
        id: testOrderId,
        user_id: 'TEST_USER',
        amount: 100,
        status: 'test'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ 注文作成エラー:', createError);
    } else {
      console.log('✅ テスト注文作成成功:', createData.id);
      
      // 取得
      const { data: getData, error: getError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', testOrderId)
        .single();
      
      if (getError) {
        console.error('❌ 注文取得エラー:', getError);
      } else {
        console.log('✅ テスト注文取得成功:', getData.id);
      }
      
      // 削除
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', testOrderId);
      
      if (deleteError) {
        console.error('❌ 注文削除エラー:', deleteError);
      } else {
        console.log('✅ テスト注文削除成功');
      }
    }
  } catch (err) {
    console.error('❌ テストエラー:', err.message);
  }
}

testSupabase();