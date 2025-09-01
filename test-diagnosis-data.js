const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDiagnosisData() {
    const diagnosisId = 'diag_1756711221682_yeltgg0yl';
    
    console.log('診断データの詳細を確認:', diagnosisId);
    console.log('='.repeat(50));
    
    // 診断データを取得
    const { data: diagnosis, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();
    
    if (error) {
        console.error('エラー:', error);
        return;
    }
    
    console.log('\n診断の基本情報:');
    console.log('- ID:', diagnosis.id);
    console.log('- ユーザーID:', diagnosis.user_id);
    console.log('- ユーザー名:', diagnosis.user_name);
    console.log('- 生年月日:', diagnosis.birth_date);
    console.log('- 作成日時:', diagnosis.created_at);
    
    console.log('\nresult_dataの内容:');
    if (diagnosis.result_data) {
        console.log(JSON.stringify(diagnosis.result_data, null, 2));
    } else {
        console.log('result_dataが空です');
    }
    
    // ユーザーのプロフィールも確認
    if (diagnosis.user_id) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', diagnosis.user_id)
            .single();
        
        if (!profileError && profile) {
            console.log('\n対応するプロフィールデータ:');
            console.log('- ユーザー名:', profile.user_name);
            console.log('- emotional_expression:', profile.emotional_expression);
            console.log('- distance_style:', profile.distance_style);
            console.log('- love_values:', profile.love_values);
            console.log('- love_energy:', profile.love_energy);
        }
    }
}

checkDiagnosisData();