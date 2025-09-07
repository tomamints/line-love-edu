require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccessRights() {
  const diagnosisId = 'diag_1757217255964_sqi5a3yy4';
  console.log(`\n🔍 診断ID ${diagnosisId} のアクセス権限確認\n`);
  
  // Check access_rights for this diagnosis
  const { data: accessRights, error } = await supabase
    .from('access_rights')
    .select('*')
    .eq('resource_id', diagnosisId);
  
  if (error) {
    console.error('❌ エラー:', error);
    return;
  }
  
  if (accessRights && accessRights.length > 0) {
    console.log(`✅ ${accessRights.length}件のアクセス権限:`);
    accessRights.forEach(ar => {
      console.log('  - ID:', ar.id);
      console.log('  - User ID:', ar.user_id);
      console.log('  - Resource ID:', ar.resource_id);
      console.log('  - Resource Type:', ar.resource_type);
      console.log('  - Access Level:', ar.access_level);
      console.log('  - Purchase ID:', ar.purchase_id);
      console.log('  - Valid From:', ar.valid_from);
      console.log('  - Valid Until:', ar.valid_until);
      console.log('  - Created:', ar.created_at);
    });
  } else {
    console.log('⚠️ アクセス権限レコードが作成されていません！');
    
    // Check if there are ANY access_rights records
    console.log('\n全体のaccess_rightsテーブル確認（最新5件）:');
    const { data: allRights } = await supabase
      .from('access_rights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (allRights && allRights.length > 0) {
      console.log(`見つかった件数: ${allRights.length}`);
      allRights.forEach((ar, i) => {
        console.log(`\n[${i+1}] Resource: ${ar.resource_id}`);
        console.log('  - User:', ar.user_id);
        console.log('  - Access Level:', ar.access_level);
        console.log('  - Created:', ar.created_at);
      });
    } else {
      console.log('access_rightsテーブルは空です');
    }
  }
}

checkAccessRights();
