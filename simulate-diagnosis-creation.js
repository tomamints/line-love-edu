const fetch = require('node-fetch');

async function simulateDiagnosisCreation() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('診断入力ページの動作をシミュレート');
    console.log('='.repeat(60));
    
    // Step 1: プロフィールデータを取得（診断入力ページがやること）
    console.log('Step 1: プロフィールから4つの軸データを取得...');
    const profileResponse = await fetch(`http://localhost:3000/api/get-love-profile?userId=${userId}`);
    const profileData = await profileResponse.json();
    
    if (!profileData.success) {
        console.error('プロフィール取得失敗');
        return;
    }
    
    console.log('✅ プロフィールデータ取得成功');
    console.log('  - 感情表現:', profileData.profile.emotionalExpression);
    console.log('  - 距離感:', profileData.profile.distanceStyle);
    console.log('  - 価値観:', profileData.profile.loveValues);
    console.log('  - エネルギー:', profileData.profile.loveEnergy);
    console.log('');
    
    // Step 2: フォーム入力データを設定
    console.log('Step 2: フォーム入力データを準備...');
    const formData = {
        name: 'テスト太郎',
        year: 2000,
        month: 1,
        day: 15
    };
    console.log('  名前:', formData.name);
    console.log('  生年月日:', `${formData.year}/${formData.month}/${formData.day}`);
    
    // 月相パターンIDを計算（実際のページと同じロジック）
    const birthDate = new Date(formData.year, formData.month - 1, formData.day);
    const patternId = Math.floor(Math.random() * 64); // 0-63のランダム値
    const moonPhaseIndex = Math.floor(patternId / 8);
    const hiddenPhaseIndex = patternId % 8;
    const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
    
    console.log('  月相パターンID:', patternId);
    console.log('  表の月相:', moonPhaseNames[moonPhaseIndex]);
    console.log('  裏の月相:', moonPhaseNames[hiddenPhaseIndex]);
    console.log('');
    
    // Step 3: 診断データを作成
    console.log('Step 3: 診断を作成...');
    const diagnosisData = {
        action: 'save-diagnosis',
        userId: userId,
        userName: formData.name,
        birthDate: `${formData.year}-${String(formData.month).padStart(2, '0')}-${String(formData.day).padStart(2, '0')}`,
        diagnosisType: 'otsukisama',
        resultData: {
            moon_pattern_id: patternId,
            moon_phase: moonPhaseNames[moonPhaseIndex],
            hidden_moon_phase: moonPhaseNames[hiddenPhaseIndex],
            emotional_expression: profileData.profile.emotionalExpression,
            distance_style: profileData.profile.distanceStyle,
            love_values: profileData.profile.loveValues,
            love_energy: profileData.profile.loveEnergy,
            moon_power_1: '直感力',
            moon_power_2: '創造力',
            moon_power_3: '浄化力'
        }
    };
    
    console.log('送信データ:');
    console.log(JSON.stringify(diagnosisData.resultData, null, 2));
    console.log('');
    
    const saveResponse = await fetch('http://localhost:3000/api/profile-form-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosisData)
    });
    
    const saveResult = await saveResponse.json();
    
    if (!saveResult.success) {
        console.error('❌ 診断作成失敗:', saveResult);
        return;
    }
    
    console.log('✅ 診断作成成功!');
    console.log('  診断ID:', saveResult.diagnosisId);
    console.log('');
    
    // Step 4: 作成された診断を確認
    console.log('Step 4: 作成された診断データを確認...');
    const checkResponse = await fetch(`http://localhost:3000/api/profile-form-v2?action=get-diagnosis&id=${saveResult.diagnosisId}&userId=${userId}`);
    const checkData = await checkResponse.json();
    
    if (!checkData.success) {
        console.error('診断データ取得失敗');
        return;
    }
    
    console.log('✅ 診断データ確認成功');
    console.log('');
    console.log('プレビューページに表示されるデータ:');
    console.log('-'.repeat(40));
    console.log('ユーザー名:', checkData.diagnosis.user_name);
    console.log('月相:', checkData.diagnosis.moon_phase, '/', checkData.diagnosis.hidden_moon_phase);
    console.log('4つの軸:');
    console.log('  - 感情表現:', checkData.diagnosis.emotional_expression || '❌ データなし');
    console.log('  - 距離感:', checkData.diagnosis.distance_style || '❌ データなし');
    console.log('  - 価値観:', checkData.diagnosis.love_values || '❌ データなし');
    console.log('  - エネルギー:', checkData.diagnosis.love_energy || '❌ データなし');
    console.log('アクセスレベル:', checkData.accessLevel);
    console.log('');
    
    // データチェック
    const hasAllData = 
        checkData.diagnosis.emotional_expression &&
        checkData.diagnosis.distance_style &&
        checkData.diagnosis.love_values &&
        checkData.diagnosis.love_energy;
    
    if (hasAllData) {
        console.log('✅ すべての4軸データが正常に保存されています！');
    } else {
        console.log('❌ 4軸データの一部が欠落しています');
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('🌐 プレビューページを開きます:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${saveResult.diagnosisId}&userId=${userId}`);
    
    return {
        diagnosisId: saveResult.diagnosisId,
        userId: userId,
        success: hasAllData
    };
}

simulateDiagnosisCreation()
    .then(result => {
        if (result && result.success) {
            console.log('\n✅ 診断フロー完全成功！');
            process.exit(0);
        } else {
            console.log('\n❌ 診断フローに問題があります');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('エラー:', error);
        process.exit(1);
    });