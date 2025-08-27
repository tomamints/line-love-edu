/**
 * フォーム処理関連の関数
 */

// 生年月日セレクトボックスの初期化
function initDateSelects() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    // 年の選択肢を生成（1920年から現在年まで）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1920; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
    }
    
    // 月の選択肢を生成
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + '月';
        monthSelect.appendChild(option);
    }
    
    // 日の選択肢を生成
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + '日';
        daySelect.appendChild(option);
    }
    
    // ユーザーデータから生年月日を自動入力
    loadUserBirthdate();
}

// 生年月日フォームに値を設定する補助関数
function fillBirthdateForm(year, month, day) {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    if (yearSelect) yearSelect.value = year;
    if (monthSelect) monthSelect.value = month;
    if (daySelect) daySelect.value = day;
}

// フォームの初期化とイベントリスナーの設定
function initializeForm() {
    // DOMContentLoadedイベントで確実に要素が存在することを保証
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupForm);
    } else {
        setupForm();
    }
}

function setupForm() {
    // フォームの送信処理
    const moonForm = document.getElementById('moonForm');
    if (!moonForm) {
        console.error('moonForm element not found');
        return;
    }
    
    moonForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const year = parseInt(document.getElementById('year').value);
        const month = parseInt(document.getElementById('month').value);
        const day = parseInt(document.getElementById('day').value);
        
        if (!name || !year || !month || !day) {
            alert('すべての項目を入力してください');
            return;
        }
        
        // 月相と裏月相を計算
        const moonPhase = calculateMoonPhaseType(year, month, day);
        const hiddenMoonPhase = getHiddenMoonPhaseName(year, month, day);
        const patternId = generatePatternId(year, month, day);
        currentPatternId = patternId; // グローバル変数を更新
        
        // ユーザーデータを保存
        const userData = {
            name: name,
            birthdate: { year, month, day },
            moonPhase: moonPhase,
            hiddenMoonPhase: hiddenMoonPhase,
            patternId: patternId
        };
        
        // localStorageに保存
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // 結果セクションに名前を表示
        document.getElementById('resultName').textContent = name;
        
        // フォームを非表示にして結果を表示
        document.getElementById('formSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
        
        // ユーザープロフィールを読み込む（非同期）
        loadUserProfile().then(() => {
            // プロフィールを取得
            const savedProfile = localStorage.getItem('lineUserProfile');
            const profile = savedProfile ? JSON.parse(savedProfile) : null;
            
            // 動的コンテンツを更新（プロフィールを渡す）
            updateDynamicContent(userData, profile);
        });
        
        // スムーズにスクロール
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 生年月日セレクトボックスを初期化
    initDateSelects();
}