const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDiagnosisDetail() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const birthDate = '1998-04-30';
    
    console.log('診断データの詳細確認');
    console.log('='.repeat(50));
    console.log('ユーザーID:', userId);
    console.log('生年月日:', birthDate);
    console.log('');
    
    // この条件で診断を検索
    const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', userId)
        .eq('birth_date', birthDate)
        .eq('diagnosis_type_id', 'otsukisama');
    
    if (error) {
        console.error('エラー:', error);
        return;
    }
    
    if (!diagnoses || diagnoses.length === 0) {
        console.log('診断が見つかりません');
        return;
    }
    
    console.log(`${diagnoses.length}件の診断が見つかりました`);
    console.log('');
    
    for (const diag of diagnoses) {
        console.log('-'.repeat(50));
        console.log('診断ID:', diag.id);
        console.log('作成日時:', new Date(diag.created_at).toLocaleString('ja-JP'));
        console.log('更新日時:', new Date(diag.updated_at).toLocaleString('ja-JP'));
        console.log('ユーザー名:', diag.user_name);
        console.log('');
        
        if (diag.result_data) {
            console.log('4つの軸:');
            console.log('  感情表現:', diag.result_data.emotional_expression || '❌ なし');
            console.log('  距離感:', diag.result_data.distance_style || '❌ なし');
            console.log('  価値観:', diag.result_data.love_values || '❌ なし');
            console.log('  エネルギー:', diag.result_data.love_energy || '❌ なし');
            
            // 空文字チェック
            const hasEmptyStrings = 
                diag.result_data.emotional_expression === '' ||
                diag.result_data.distance_style === '' ||
                diag.result_data.love_values === '' ||
                diag.result_data.love_energy === '';
            
            if (hasEmptyStrings) {
                console.log('  ⚠️ 空文字のデータがあります！');
            }
        }
        console.log('');
    }
    
    // 最新の診断を特定
    const latest = diagnoses.sort((a, b) => 
        new Date(b.updated_at) - new Date(a.updated_at)
    )[0];
    
    console.log('='.repeat(50));
    console.log('最新の診断:');
    console.log('診断ID:', latest.id);
    console.log('🌐 プレビューURL:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${latest.id}&userId=${userId}`);
}

checkDiagnosisDetail();