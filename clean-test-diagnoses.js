const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTestDiagnoses() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const birthDate = '1998-04-30';
    
    console.log('テスト用の診断をクリーンアップ...');
    
    // 既存の診断を削除
    const { data: existing, error: fetchError } = await supabase
        .from('diagnoses')
        .select('id')
        .eq('user_id', userId)
        .eq('birth_date', birthDate)
        .eq('diagnosis_type_id', 'otsukisama');
    
    if (existing && existing.length > 0) {
        console.log(`${existing.length}件の診断を削除します...`);
        
        for (const diag of existing) {
            // アクセス権限も削除
            await supabase
                .from('access_rights')
                .delete()
                .eq('user_id', userId)
                .eq('resource_type', 'diagnosis')
                .eq('resource_id', diag.id);
            
            // 診断を削除
            const { error: deleteError } = await supabase
                .from('diagnoses')
                .delete()
                .eq('id', diag.id);
            
            if (deleteError) {
                console.error('削除エラー:', deleteError);
            } else {
                console.log(`✅ 削除: ${diag.id}`);
            }
        }
    } else {
        console.log('削除する診断はありません');
    }
    
    console.log('クリーンアップ完了');
}

cleanTestDiagnoses();