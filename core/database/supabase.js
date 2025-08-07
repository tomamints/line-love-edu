// Supabaseクライアントの設定
// ローカル環境では.env.localから環境変数を読み込む
if (!process.env.VERCEL && !process.env.SUPABASE_URL) {
  require('dotenv').config({ path: '.env.local' });
}

const { createClient } = require('@supabase/supabase-js');

// 環境変数から接続情報を取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// デバッグログ
console.log('🔍 SUPABASE_URL exists:', !!supabaseUrl);
console.log('🔍 SUPABASE_ANON_KEY exists:', !!supabaseKey);
if (supabaseUrl) {
  console.log('🔍 SUPABASE_URL format:', supabaseUrl.substring(0, 30) + '...');
}

// Supabaseクライアントを作成
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

// データベースが設定されているかチェック
const isDatabaseConfigured = () => {
  return supabase !== null;
};

module.exports = {
  supabase,
  isDatabaseConfigured
};