const fetch = require('node-fetch');

async function verifyDisplayData() {
    const diagnosisId = 'diag_1756713443275_czhq87yzn';
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('診断データ表示確認');
    console.log('='.repeat(50));
    console.log('診断ID:', diagnosisId);
    console.log('ユーザーID:', userId);
    console.log('');
    
    // APIから診断データを取得
    const response = await fetch(`http://localhost:3000/api/profile-form-v2?action=get-diagnosis&id=${diagnosisId}&userId=${userId}`);
    const data = await response.json();
    
    if (!data.success) {
        console.error('診断取得失敗:', data);
        return;
    }
    
    console.log('✅ 診断データ取得成功');
    console.log('');
    console.log('表示されるべきデータ:');
    console.log('-'.repeat(30));
    console.log('1. ユーザー名:', data.diagnosis.user_name);
    console.log('');
    console.log('2. 月相データ:');
    console.log('   - 表の月相:', data.diagnosis.moon_phase);
    console.log('   - 裏の月相:', data.diagnosis.hidden_moon_phase);
    console.log('   - パターンID:', data.diagnosis.moon_pattern_id);
    console.log('');
    console.log('3. 4つの軸:');
    console.log('   - 感情表現 (Q3):', data.diagnosis.emotional_expression);
    console.log('   - 距離感 (Q4):', data.diagnosis.distance_style);
    console.log('   - 価値観 (Q5):', data.diagnosis.love_values);
    console.log('   - エネルギー (Q6):', data.diagnosis.love_energy);
    console.log('');
    console.log('4. 月の3つの力:');
    console.log('   - 力1:', data.diagnosis.moon_power_1);
    console.log('   - 力2:', data.diagnosis.moon_power_2);
    console.log('   - 力3:', data.diagnosis.moon_power_3);
    console.log('');
    console.log('5. アクセスレベル:', data.accessLevel);
    console.log('');
    
    // 日本語の表示名をマッピング
    const emotionalMap = {
        'straight': 'ストレート告白型',
        'physical': 'スキンシップ型',
        'subtle': 'さりげない気遣い型',
        'shy': '奥手シャイ型'
    };
    
    const distanceMap = {
        'close': 'ベッタリ依存型',
        'moderate': '安心セーフ型',
        'independent': '自由マイペース型',
        'cautious': '壁あり慎重型'
    };
    
    const valuesMap = {
        'romantic': 'ロマンチスト型',
        'realistic': 'リアリスト型',
        'excitement': '刺激ハンター型',
        'growth': '成長パートナー型'
    };
    
    const energyMap = {
        'intense': '燃え上がり型',
        'stable': '安定持続型',
        'fluctuating': '波あり型',
        'cool': 'クール型'
    };
    
    console.log('日本語表示:');
    console.log('-'.repeat(30));
    console.log('4つの軸（日本語）:');
    console.log('   - 感情表現:', emotionalMap[data.diagnosis.emotional_expression]);
    console.log('   - 距離感:', distanceMap[data.diagnosis.distance_style]);
    console.log('   - 価値観:', valuesMap[data.diagnosis.love_values]);
    console.log('   - エネルギー:', energyMap[data.diagnosis.love_energy]);
    console.log('');
    console.log('🌐 プレビューページURL:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId}`);
}

verifyDisplayData().catch(console.error);