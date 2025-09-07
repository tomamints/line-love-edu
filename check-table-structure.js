require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n📊 テーブル構造を確認中...\n');
  
  // Sample query to check actual columns
  console.log('1. diagnosesテーブルのサンプル:');
  const { data: diagnoses, error: diagError } = await supabase
    .from('diagnoses')
    .select('*')
    .limit(1);
  
  if (!diagError && diagnoses && diagnoses.length > 0) {
    console.log('カラム:', Object.keys(diagnoses[0]));
  }
  
  console.log('\n2. purchasesテーブルのサンプル:');
  const { data: purchases, error: purchError } = await supabase
    .from('purchases')
    .select('*')
    .limit(1);
  
  if (!purchError && purchases && purchases.length > 0) {
    console.log('カラム:', Object.keys(purchases[0]));
  } else if (purchError) {
    console.log('purchasesテーブルエラー:', purchError.message);
  } else {
    console.log('purchasesテーブルは空です');
  }
  
  console.log('\n3. access_rightsテーブルのサンプル:');
  const { data: accessRights, error: accessError } = await supabase
    .from('access_rights')
    .select('*')
    .limit(1);
  
  if (!accessError && accessRights && accessRights.length > 0) {
    console.log('カラム:', Object.keys(accessRights[0]));
  } else if (accessError) {
    console.log('access_rightsテーブルエラー:', accessError.message);
  } else {
    console.log('access_rightsテーブルは空です');
  }
}

checkTables();
