const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sxqxuebvhdpqyktxvofe.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Profile data from profiles table:');
  console.log('user_id:', data.user_id);
  console.log('user_name:', data.user_name);
  console.log('birth_date:', data.birth_date);
  console.log('emotional_expression:', data.emotional_expression);
  console.log('distance_style:', data.distance_style);
  console.log('love_values:', data.love_values);
  console.log('love_energy:', data.love_energy);
  console.log('moon_pattern_id:', data.moon_pattern_id);
  console.log('diagnosis_type:', data.diagnosis_type);
}

checkProfile();