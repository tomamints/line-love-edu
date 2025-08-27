/**
 * API通信関連の関数
 */

// URLからユーザーIDを取得
function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
}

// URLからパターンIDを取得（デバッグ用）
function getPatternIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const patternId = params.get('patternId');
    return patternId ? parseInt(patternId) : null;
}

// ユーザーのプロフィールを取得して表示
async function loadUserProfile() {
    // デバッグ用: URLからパターンIDを取得
    const urlPatternId = getPatternIdFromUrl();
    if (urlPatternId !== null) {
        currentPatternId = urlPatternId;
        console.log('Using pattern ID from URL:', currentPatternId);
        updateMoonPhaseContent(currentPatternId);
        
        // パターンIDから月相を計算
        const moonPhaseIndex = Math.floor(currentPatternId / 8);
        const hiddenPhaseIndex = currentPatternId % 8;
        const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
        const moonPhase = moonPhaseNames[moonPhaseIndex];
        const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
        
        // プロフィールを取得
        const savedProfile = localStorage.getItem('lineUserProfile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;
        
        // 6つの要素を更新（月相とプロフィールを渡す）
        if (typeof updateSixElements === 'function') {
            updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, profile);
        }
        // グラフデータも更新（もし実装されていれば）
        if (typeof updateFortuneGraph === 'function') {
            updateFortuneGraph(currentPatternId);
        }
    } else {
        // まずローカルストレージから保存されたデータを確認
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            if (userData.birthdate) {
                // 保存された生年月日から計算
                currentPatternId = generatePatternId(
                    userData.birthdate.year,
                    userData.birthdate.month,
                    userData.birthdate.day
                );
                console.log('Using pattern ID from saved birthdate:', currentPatternId);
            }
        }
        
        // パターンIDがまだ設定されていない場合はデフォルト値を使用
        if (currentPatternId === null) {
            // デモ用のデフォルトパターン（新月×新月 = 0）
            currentPatternId = 0;
            console.log('Using default pattern ID:', currentPatternId);
        }
        
        updateMoonPhaseContent(currentPatternId);
        
        // パターンIDから月相を計算
        const moonPhaseIndex = Math.floor(currentPatternId / 8);
        const hiddenPhaseIndex = currentPatternId % 8;
        const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
        const moonPhase = moonPhaseNames[moonPhaseIndex];
        const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
        
        // プロフィールを取得
        const savedProfile = localStorage.getItem('lineUserProfile');
        const profile = savedProfile ? JSON.parse(savedProfile) : null;
        
        // 6つの要素を更新（月相とプロフィールを渡す）
        if (typeof updateSixElements === 'function') {
            updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, profile);
        }
        if (typeof updateFortuneGraph === 'function') {
            updateFortuneGraph(currentPatternId);
        }
    }
    
    const userId = getUserIdFromUrl();
    if (!userId) {
        console.log('No userId in URL, checking alternatives');
        // localStorageから取得を試みる
        const savedData = localStorage.getItem('userPersonalityData');
        if (savedData) {
            const profile = JSON.parse(savedData);
            updatePersonalityDisplay(profile);
            displayCombinedPersonality(profile);
        } else {
            // デフォルトメッセージを表示
            displayNoProfileMessage();
        }
        return;
    }
    
    try {
        const response = await fetch(`/api/get-love-profile?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
            // localStorageに保存（次回アクセス時用）
            localStorage.setItem('userPersonalityData', JSON.stringify(data.profile));
            
            // 4つの軸の結果を更新
            updatePersonalityDisplay(data.profile);
            
            // 組み合わせ診断文を生成して表示
            displayCombinedPersonality(data.profile);
            
            console.log('User profile loaded:', data.profile);
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

// ユーザーデータから生年月日を自動入力する関数
async function loadUserBirthdate() {
    const userId = getUserIdFromUrl();
    if (!userId) {
        // URLにuserIdがない場合もローカルストレージを確認
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            if (userData.birthdate) {
                fillBirthdateForm(userData.birthdate.year, userData.birthdate.month, userData.birthdate.day);
                
                // 保存されたデータからパターンも更新
                if (typeof currentPatternId !== 'undefined') {
                    currentPatternId = generatePatternId(userData.birthdate.year, userData.birthdate.month, userData.birthdate.day);
                    updateMoonPhaseContent(currentPatternId);
                    
                    // パターンIDから月相を計算
                    const moonPhaseIndex = Math.floor(currentPatternId / 8);
                    const hiddenPhaseIndex = currentPatternId % 8;
                    const moonPhaseNames = ['新月', '三日月', '上弧の月', '十三夜', '満月', '十六夜', '下弧の月', '暁'];
                    const moonPhase = moonPhaseNames[moonPhaseIndex];
                    const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
                    
                    // プロフィールを取得
                    const savedProfile = localStorage.getItem('lineUserProfile');
                    const profile = savedProfile ? JSON.parse(savedProfile) : null;
                    
                    updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, profile);
                }
            }
        }
        return;
    }
    
    try {
        // プロフィール情報を取得
        const response = await fetch(`/api/get-love-profile?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.profile && data.profile.birthdate) {
            // 生年月日をパース (YYYY-MM-DD形式を想定)
            const birthdate = new Date(data.profile.birthdate);
            const year = birthdate.getFullYear();
            const month = birthdate.getMonth() + 1;
            const day = birthdate.getDate();
            
            fillBirthdateForm(year, month, day);
            
            // 名前も自動入力
            const nameInput = document.getElementById('name');
            if (nameInput && data.profile.name) {
                nameInput.value = data.profile.name;
            }
            
            // 生年月日からパターンを計算して更新
            if (typeof currentPatternId !== 'undefined') {
                currentPatternId = generatePatternId(year, month, day);
                updateMoonPhaseContent(currentPatternId);
                
                // パターンIDから月相を計算
                const moonPhaseIndex = Math.floor(currentPatternId / 8);
                const hiddenPhaseIndex = currentPatternId % 8;
                const moonPhaseNames = ['新月', '三日月', '上弧の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
                const moonPhase = moonPhaseNames[moonPhaseIndex];
                const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
                
                // プロフィールを取得
                const savedProfile = localStorage.getItem('lineUserProfile');
                const profile = savedProfile ? JSON.parse(savedProfile) : null;
                
                updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, profile);
                if (typeof updateFortuneGraph === 'function') {
                    updateFortuneGraph(currentPatternId);
                }
            }
            
            console.log('User birthdate loaded and pattern updated:', year, month, day);
        }
    } catch (error) {
        console.log('Could not load user birthdate:', error);
    }
}