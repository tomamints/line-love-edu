// Supabaseクライアントの設定
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

// Supabaseクライアントを作成（タイムアウト設定付き）
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      },
      global: {
        fetch: (url, options = {}) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10秒のタイムアウト
          
          return fetch(url, {
            ...options,
            signal: controller.signal
          }).finally(() => clearTimeout(timeout));
        }
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