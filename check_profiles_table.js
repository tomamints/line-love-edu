const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxqxuebvhdpqyktxvofe.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
  
  // diagnoses テーブルから全診断を取得
  const { data: diagnoses, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Total diagnoses:', diagnoses.length);
  diagnoses.forEach(d => {
    console.log(`\nDiagnosis ID: ${d.id}`);
    console.log('Created at:', d.created_at);
    console.log('Birth date:', d.birth_date);
    console.log('Result data:', JSON.stringify(d.result_data, null, 2));
  });
}

checkProfile();