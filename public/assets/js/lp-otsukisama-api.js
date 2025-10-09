/**
 * API通信関連の関数（localStorage使用を削除）
 */

// URLからユーザーIDを取得
function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('userId');
}

// URLからパターンIDを取得（デバッグ用）
function getPatternIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    // 'pattern' または 'patternId' パラメータを取得
    const patternId = params.get('pattern') || params.get('patternId');
    return patternId ? parseInt(patternId) : null;
}

// ユーザーのプロフィールを取得して表示
async function loadUserProfile() {
    let currentProfile = null; // 現在のプロフィールを保持
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
        
        // 6つの要素を更新（プロフィールも渡す）
        if (typeof updateSixElements === 'function') {
            // URLからパターンIDでデバッグモードの場合はプロフィールなし
            updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, null);
        }
        // グラフデータも更新（もし実装されていれば）
        if (typeof updateFortuneGraph === 'function') {
            updateFortuneGraph(currentPatternId);
        }
    } else {
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
        
        // 6つの要素を更新（プロフィールも渡す）
        if (typeof updateSixElements === 'function') {
            // URLからパターンIDでデバッグモードの場合はプロフィールなし
            updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, null);
        }
        if (typeof updateFortuneGraph === 'function') {
            updateFortuneGraph(currentPatternId);
        }
    }
    
    const userId = getUserIdFromUrl();
    if (!userId) {
        console.log('No userId in URL, redirecting to LINE');
        // LINEに誘導するメッセージを表示
        displayLineRedirectMessage();
        return null; // プロフィールなし
    }
    
    try {
        const response = await fetch(`/api/get-love-profile?userId=${userId}`);
        const data = await response.json();
        
        if (data.success && data.profile) {
            // 4つの軸の結果を更新
            updatePersonalityDisplay(data.profile);
            
            // 組み合わせ診断文を生成して表示
            displayCombinedPersonality(data.profile);
            
            currentProfile = data.profile; // APIから取得したプロフィールを保存
            
            // 6つの要素を更新（APIから取得したプロフィールを渡す）
            if (typeof updateSixElements === 'function' && currentPatternId !== null) {
                const moonPhaseIndex = Math.floor(currentPatternId / 8);
                const hiddenPhaseIndex = currentPatternId % 8;
                const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
                const moonPhase = moonPhaseNames[moonPhaseIndex];
                const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
                updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, data.profile);
            }
            
            console.log('User profile loaded:', data.profile);
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
    
    return currentProfile; // プロフィールを返す
}

// ユーザーデータから生年月日を自動入力する関数
async function loadUserBirthdate() {
    console.log('loadUserBirthdate called');
    const userId = getUserIdFromUrl();
    console.log('userId from URL:', userId);
    if (!userId) {
        console.log('No userId found in URL, skipping auto-fill');
        // URLにuserIDがない場合はスキップ
        return;
    }
    
    try {
        // プロフィール情報を取得
        console.log('Fetching profile from:', `/api/get-love-profile?userId=${userId}`);
        const response = await fetch(`/api/get-love-profile?userId=${userId}`);
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success && data.profile) {
            const profile = data.profile;
            const birthdateValue = profile.birthdate || profile.birthDate;
            const nameValue = profile.name || profile.userName;

            if (birthdateValue) {
                console.log('Birthdate found:', birthdateValue);
            // 生年月日をパース (YYYY-MM-DD形式を想定)
                const birthdate = new Date(birthdateValue);
                const year = birthdate.getFullYear();
                const month = birthdate.getMonth() + 1;
                const day = birthdate.getDate();
                
                fillBirthdateForm(year, month, day);

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
                    
                    // APIから取得したプロフィールを渡す
                    updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, profile);
                    if (typeof updateFortuneGraph === 'function') {
                        updateFortuneGraph(currentPatternId);
                    }
                }

                console.log('User birthdate loaded and pattern updated:', year, month, day);
            }

            // 名前も自動入力
            const nameInput = document.getElementById('name');
            if (nameInput && nameValue) {
                nameInput.value = nameValue;
            }
        }
    } catch (error) {
        console.log('Could not load user birthdate:', error);
    }
}
