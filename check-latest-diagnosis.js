const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestDiagnosis() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('最新の診断データを確認中...');
    console.log('='.repeat(50));
    
    // 最新の診断を取得
    const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (error || !diagnoses || diagnoses.length === 0) {
        console.error('診断が見つかりません');
        return;
    }
    
    const latest = diagnoses[0];
    console.log('診断ID:', latest.id);
    console.log('作成日時:', new Date(latest.created_at).toLocaleString('ja-JP'));
    console.log('');
    
    console.log('【保存されているデータ】');
    console.log('-'.repeat(30));
    console.log('ユーザー名:', latest.user_name);
    console.log('生年月日:', latest.birth_date);
    console.log('');
    
    console.log('【result_data内の4つの軸】');
    console.log('-'.repeat(30));
    if (latest.result_data) {
        console.log('感情表現 (Q3):', latest.result_data.emotional_expression || '❌ データなし');
        console.log('距離感 (Q4):', latest.result_data.distance_style || '❌ データなし');
        console.log('価値観 (Q5):', latest.result_data.love_values || '❌ データなし');
        console.log('エネルギー (Q6):', latest.result_data.love_energy || '❌ データなし');
        
        // 空文字チェック
        if (latest.result_data.emotional_expression === '') {
            console.log('⚠️ 感情表現が空文字です！');
        }
        if (latest.result_data.distance_style === '') {
            console.log('⚠️ 距離感が空文字です！');
        }
        if (latest.result_data.love_values === '') {
            console.log('⚠️ 価値観が空文字です！');
        }
        if (latest.result_data.love_energy === '') {
            console.log('⚠️ エネルギーが空文字です！');
        }
    } else {
        console.log('❌ result_dataが存在しません');
    }
    
    console.log('');
    console.log('【月相データ】');
    console.log('-'.repeat(30));
    if (latest.result_data) {
        console.log('月相パターンID:', latest.result_data.moon_pattern_id);
        console.log('表の月相:', latest.result_data.moon_phase);
        console.log('裏の月相:', latest.result_data.hidden_moon_phase);
    }
    
    // アクセス権限を確認
    const { data: access } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', latest.id)
        .single();
    
    console.log('');
    console.log('【アクセス権限】');
    console.log('-'.repeat(30));
    if (access) {
        console.log('アクセスレベル:', access.access_level);
        if (access.access_level === 'preview') {
            console.log('→ モザイク表示（無料プレビュー）');
        } else if (access.access_level === 'full') {
            console.log('→ 全表示（購入済み）');
        }
    } else {
        console.log('アクセス権限なし');
    }
    
    console.log('');
    console.log('🌐 プレビューページURL:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${latest.id}&userId=${userId}`);
}

checkLatestDiagnosis();