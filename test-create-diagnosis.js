const fetch = require('node-fetch');

async function createTestDiagnosis() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('1. プロフィールデータを取得...');
    const profileResponse = await fetch(`http://localhost:3000/api/get-love-profile?userId=${userId}`);
    const profileData = await profileResponse.json();
    console.log('取得したプロフィール:', profileData);
    
    if (!profileData.success) {
        console.error('プロフィール取得失敗');
        return;
    }
    
    console.log('\n2. 新しい診断を作成...');
    const diagnosisData = {
        action: 'save-diagnosis',
        userId: userId,
        userName: 'テストユーザー',
        birthDate: '1998-04-30',
        diagnosisType: 'otsukisama',
        resultData: {
            moon_pattern_id: 47,
            moon_phase: '満月',
            hidden_moon_phase: '新月',
            emotional_expression: profileData.profile.emotionalExpression,
            distance_style: profileData.profile.distanceStyle,
            love_values: profileData.profile.loveValues,
            love_energy: profileData.profile.loveEnergy,
            moon_power_1: '直感力',
            moon_power_2: '創造力',
            moon_power_3: '浄化力'
        }
    };
    
    console.log('送信するデータ:', JSON.stringify(diagnosisData, null, 2));
    
    const saveResponse = await fetch('http://localhost:3000/api/profile-form-v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(diagnosisData)
    });
    
    const result = await saveResponse.json();
    console.log('\n3. 診断作成結果:', result);
    
    if (result.success && result.diagnosisId) {
        console.log('\n4. 作成した診断を確認...');
        const checkResponse = await fetch(`http://localhost:3000/api/profile-form-v2?action=get-diagnosis&id=${result.diagnosisId}&userId=${userId}`);
        const checkData = await checkResponse.json();
        
        console.log('診断データ確認:');
        console.log('- ユーザー名:', checkData.diagnosis.user_name);
        console.log('- 4つの軸:');
        console.log('  - emotional_expression:', checkData.diagnosis.emotional_expression);
        console.log('  - distance_style:', checkData.diagnosis.distance_style);
        console.log('  - love_values:', checkData.diagnosis.love_values);
        console.log('  - love_energy:', checkData.diagnosis.love_energy);
        
        console.log('\n✅ 診断URL:');
        console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${result.diagnosisId}&userId=${userId}`);
    }
}

createTestDiagnosis().catch(console.error);