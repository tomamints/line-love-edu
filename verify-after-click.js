const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAfterClick() {
    // ボタンクリック後に作成された診断を確認
    const diagnosisId = 'diag_1756714581269_y9w0gerey';
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('診断入力ページで「診断する」をクリック後のデータ確認');
    console.log('='.repeat(60));
    
    // 診断データを直接取得
    const { data: diagnosis, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();
    
    if (error || !diagnosis) {
        console.error('診断が見つかりません');
        return;
    }
    
    console.log('【診断データ】');
    console.log('診断ID:', diagnosis.id);
    console.log('ユーザー名:', diagnosis.user_name);
    console.log('生年月日:', diagnosis.birth_date);
    console.log('');
    
    console.log('【4つの軸データ（result_data内）】');
    if (diagnosis.result_data) {
        const axes = diagnosis.result_data;
        console.log('感情表現:', axes.emotional_expression ? `✅ ${axes.emotional_expression}` : '❌ なし');
        console.log('距離感:', axes.distance_style ? `✅ ${axes.distance_style}` : '❌ なし');
        console.log('価値観:', axes.love_values ? `✅ ${axes.love_values}` : '❌ なし');
        console.log('エネルギー:', axes.love_energy ? `✅ ${axes.love_energy}` : '❌ なし');
        
        const allPresent = axes.emotional_expression && axes.distance_style && 
                          axes.love_values && axes.love_energy;
        
        console.log('');
        if (allPresent) {
            console.log('✅ すべての4軸データが保存されています！');
        } else {
            console.log('❌ 4軸データが不完全です');
        }
    } else {
        console.log('❌ result_dataが存在しません');
    }
    
    console.log('');
    console.log('【月相データ】');
    if (diagnosis.result_data) {
        console.log('表の月相:', diagnosis.result_data.moon_phase);
        console.log('裏の月相:', diagnosis.result_data.hidden_moon_phase);
        console.log('パターンID:', diagnosis.result_data.moon_pattern_id);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('診断作成後、自動的に遷移するプレビューページ:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId}`);
    console.log('');
    console.log('このページで上記のデータが正しく表示されているか確認してください');
}

verifyAfterClick();
