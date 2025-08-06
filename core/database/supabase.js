// Supabaseクライアントの設定
const { createClient } = require('@supabase/supabase-js');

// 環境変数から接続情報を取得
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Supabaseクライアントを作成
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// データベースが設定されているかチェック
const isDatabaseConfigured = () => {
  return supabase !== null;
};

module.exports = {
  supabase,
  isDatabaseConfigured
};