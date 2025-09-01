const fetch = require('node-fetch');

async function testCompleteLineFlow() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('='.repeat(60));
    console.log('🟢 LINE経由の完全診断フローテスト');
    console.log('='.repeat(60));
    console.log('');
    
    // ステップ1: LINEユーザーのプロフィール確認
    console.log('【ステップ1】LINEユーザーのプロフィール確認');
    console.log('-'.repeat(40));
    
    const profileResponse = await fetch(`http://localhost:3000/api/get-love-profile?userId=${userId}`);
    const profileData = await profileResponse.json();
    
    if (profileData.success) {
        console.log('✅ プロフィール取得成功');
        console.log('ユーザー名:', profileData.profile.userName);
        console.log('Q3-Q6の回答:');
        console.log('  Q3 感情表現:', profileData.profile.emotionalExpression);
        console.log('  Q4 距離感:', profileData.profile.distanceStyle);
        console.log('  Q5 価値観:', profileData.profile.loveValues);
        console.log('  Q6 エネルギー:', profileData.profile.loveEnergy);
    } else {
        console.log('❌ プロフィールが見つかりません');
        console.log('LINE登録後のQ3-Q6回答が必要です');
    }
    
    console.log('');
    
    // ステップ2: 診断作成（LINEリッチメニューから診断開始した想定）
    console.log('【ステップ2】診断作成（LINE経由）');
    console.log('-'.repeat(40));
    console.log('想定: LINEリッチメニューから「おつきさま診断」をタップ');
    console.log('→ lp-otsukisama-input.htmlに遷移');
    console.log('→ 生年月日と名前を入力');
    console.log('');
    
    const diagnosisData = {
        action: 'save-diagnosis',
        userId: userId,
        userName: 'LINEテストユーザー',
        birthDate: '1998-04-30',
        diagnosisType: 'otsukisama',
        resultData: {
            moon_pattern_id: 47,
            moon_phase: '満月',
            hidden_moon_phase: '新月',
            emotional_expression: profileData.profile?.emotionalExpression || 'straight',
            distance_style: profileData.profile?.distanceStyle || 'close',
            love_values: profileData.profile?.loveValues || 'romantic',
            love_energy: profileData.profile?.loveEnergy || 'fluctuating',
            moon_power_1: '直感力',
            moon_power_2: '創造力',
            moon_power_3: '浄化力'
        }
    };
    
    console.log('診断データを作成中...');
    const saveResponse = await fetch('http://localhost:3000/api/profile-form-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosisData)
    });
    
    const saveResult = await saveResponse.json();
    
    if (saveResult.success) {
        console.log('✅ 診断作成成功');
        console.log('診断ID:', saveResult.diagnosisId);
        console.log('');
        
        // ステップ3: プレビューページでの表示確認
        console.log('【ステップ3】プレビューページ表示確認');
        console.log('-'.repeat(40));
        
        const diagResponse = await fetch(`http://localhost:3000/api/profile-form-v2?action=get-diagnosis&id=${saveResult.diagnosisId}&userId=${userId}`);
        const diagData = await diagResponse.json();
        
        if (diagData.success) {
            console.log('診断データ取得成功');
            console.log('');
            console.log('表示されるデータ:');
            console.log('  ユーザー名:', diagData.diagnosis.user_name);
            console.log('  月相:', diagData.diagnosis.moon_phase, '/', diagData.diagnosis.hidden_moon_phase);
            console.log('  4つの軸:');
            console.log('    感情表現:', diagData.diagnosis.emotional_expression);
            console.log('    距離感:', diagData.diagnosis.distance_style);
            console.log('    価値観:', diagData.diagnosis.love_values);
            console.log('    エネルギー:', diagData.diagnosis.love_energy);
            console.log('  アクセスレベル:', diagData.accessLevel);
            console.log('');
            
            if (diagData.accessLevel === 'preview') {
                console.log('📱 モザイク表示（無料プレビュー）');
                console.log('  → 購入ボタンが表示されます');
            } else if (diagData.accessLevel === 'full') {
                console.log('🔓 全表示（購入済み）');
                console.log('  → 全コンテンツが表示されます');
            }
            
            console.log('');
            console.log('🌐 プレビューページURL:');
            console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${saveResult.diagnosisId}&userId=${userId}`);
        }
    } else {
        console.log('❌ 診断作成失敗:', saveResult);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('テスト完了');
}

testCompleteLineFlow().catch(console.error);