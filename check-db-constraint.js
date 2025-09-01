const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const birthDate = '1998-04-30';
    const diagnosisType = 'otsukisama';
    
    console.log('既存の診断を確認...');
    console.log('条件: user_id =', userId);
    console.log('     birth_date =', birthDate);
    console.log('     diagnosis_type_id =', diagnosisType);
    
    const { data: existing, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', userId)
        .eq('birth_date', birthDate)
        .eq('diagnosis_type_id', diagnosisType);
    
    if (error) {
        console.error('エラー:', error);
        return;
    }
    
    console.log('\n既存の診断数:', existing.length);
    if (existing.length > 0) {
        console.log('既存の診断:');
        existing.forEach(diag => {
            console.log(`- ${diag.id} (作成: ${diag.created_at})`);
        });
        
        console.log('\n最新の診断を削除して新しく作成できるようにします...');
        const latestDiag = existing[existing.length - 1];
        
        const { error: deleteError } = await supabase
            .from('diagnoses')
            .delete()
            .eq('id', latestDiag.id);
        
        if (deleteError) {
            console.error('削除エラー:', deleteError);
        } else {
            console.log('✅ 診断を削除しました:', latestDiag.id);
        }
    } else {
        console.log('既存の診断はありません');
    }
}

checkConstraint();