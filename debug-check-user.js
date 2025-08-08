// ユーザーID確認スクリプト
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkUserData() {
  console.log('\n=== ユーザーIDの状況を確認 ===\n');
  
  // profiles テーブル
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (profiles && profiles.length > 0) {
    console.log('📋 Profilesテーブルのユーザー:');
    profiles.forEach(p => {
      console.log(`  - ${p.user_id} (作成: ${new Date(p.created_at).toLocaleDateString()})`);
    });
  } else {
    console.log('📋 Profilesテーブル: データなし');
  }
  
  // orders テーブル
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('user_id, created_at, status')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (orders && orders.length > 0) {
    console.log('\n📦 Ordersテーブルのユーザー:');
    orders.forEach(o => {
      console.log(`  - ${o.user_id} (${o.status}) - ${new Date(o.created_at).toLocaleDateString()}`);
    });
  } else {
    console.log('\n📦 Ordersテーブル: データなし');
  }
  
  // ユーザーIDの形式を分析
  console.log('\n=== ユーザーID形式の分析 ===');
  console.log('正しいLINE UserID形式: U で始まる33文字の文字列');
  console.log('例: U1234567890abcdef1234567890abcdef');
  
  // 重複や問題のあるIDをチェック
  if (profiles && profiles.length > 0) {
    const testIds = profiles.filter(p => p.user_id.includes('test'));
    const lineIds = profiles.filter(p => p.user_id.startsWith('U'));
    
    if (testIds.length > 0) {
      console.log(`\n⚠️  テスト用ID発見: ${testIds.length}件`);
    }
    if (lineIds.length > 0) {
      console.log(`✅ LINE形式のID: ${lineIds.length}件`);
    }
  }
}

checkUserData().catch(console.error);