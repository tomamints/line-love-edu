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
}

// 生年月日フォームに値を設定する補助関数
function fillBirthdateForm(year, month, day) {
    console.log('fillBirthdateForm called with:', { year, month, day });
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    if (yearSelect) {
        yearSelect.value = year;
        console.log('Year set to:', yearSelect.value);
    }
    if (monthSelect) {
        monthSelect.value = month;
        console.log('Month set to:', monthSelect.value);
    }
    if (daySelect) {
        daySelect.value = day;
        console.log('Day set to:', daySelect.value);
    }
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
    
    moonForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // フォームバリデーション
        let isValid = true;
        const formGroups = moonForm.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
        
        const name = document.getElementById('name').value;
        const year = parseInt(document.getElementById('year').value);
        const month = parseInt(document.getElementById('month').value);
        const day = parseInt(document.getElementById('day').value);
        
        // 名前のバリデーション
        const nameGroup = document.getElementById('name').closest('.form-group');
        if (!name || name.trim().length < 1) {
            nameGroup.classList.add('error');
            showErrorMessage(nameGroup, 'お名前を入力してください');
            isValid = false;
        } else {
            nameGroup.classList.add('success');
        }
        
        // 生年月日のバリデーション
        const dateGroup = document.getElementById('year').closest('.form-group');
        if (!year || !month || !day) {
            dateGroup.classList.add('error');
            showErrorMessage(dateGroup, '生年月日を選択してください');
            isValid = false;
        } else if (!isValidDate(year, month, day)) {
            dateGroup.classList.add('error');
            showErrorMessage(dateGroup, '有効な日付を選択してください');
            isValid = false;
        } else {
            dateGroup.classList.add('success');
        }
        
        if (!isValid) {
            return;
        }
        
        // ローディング状態を表示
        const submitButton = moonForm.querySelector('button[type="submit"]');
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        // ローディングオーバーレイを表示（存在する場合）
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
        
        try {
            // 月相と裏月相を計算
            const moonPhase = calculateMoonPhaseType(year, month, day);
            const hiddenMoonPhase = getHiddenMoonPhaseName(year, month, day);
            const patternId = generatePatternId(year, month, day);
            currentPatternId = patternId; // グローバル変数を更新
            
            // ユーザーデータを作成
            const userData = {
                name: name,
                birthdate: { year, month, day },
                moonPhase: moonPhase,
                hiddenMoonPhase: hiddenMoonPhase,
                patternId: patternId
            };
            
            // 少し待機（ローディング表示のため）
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // 結果セクションに名前を表示
            document.getElementById('resultName').textContent = name;
            
            // フォームを非表示にして結果を表示
            document.getElementById('formSection').style.display = 'none';
            document.getElementById('resultSection').style.display = 'block';
            
            // ユーザープロフィールを読み込む（非同期）
            loadUserProfile().then((profile) => {
                // 動的コンテンツを更新（プロフィールを渡す）
                updateUserDisplayContent(userData, profile);
            });
            
            // スムーズにスクロール
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } finally {
            // ローディング状態を解除
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            if (loadingOverlay) {
                loadingOverlay.classList.remove('active');
            }
        }
    });
    
    // エラーメッセージを表示する関数
    function showErrorMessage(formGroup, message) {
        let errorElement = formGroup.querySelector('.form-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    // 有効な日付かチェックする関数
    function isValidDate(year, month, day) {
        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               date.getDate() === day &&
               date <= new Date(); // 未来の日付は無効
    }
    
    // リアルタイムバリデーション
    document.getElementById('name').addEventListener('input', function() {
        const formGroup = this.closest('.form-group');
        if (this.value.trim().length >= 1) {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
        } else {
            formGroup.classList.remove('success');
        }
    });
    
    const dateSelects = document.querySelectorAll('#year, #month, #day');
    dateSelects.forEach(select => {
        select.addEventListener('change', function() {
            const year = parseInt(document.getElementById('year').value);
            const month = parseInt(document.getElementById('month').value);
            const day = parseInt(document.getElementById('day').value);
            const formGroup = this.closest('.form-group');
            
            if (year && month && day && isValidDate(year, month, day)) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
            } else if (year && month && day) {
                formGroup.classList.add('error');
                showErrorMessage(formGroup, '有効な日付を選択してください');
            }
        });
    });
    
    // 生年月日セレクトボックスを初期化
    initDateSelects();
    
    // データベースから生年月日を自動入力
    if (typeof loadUserBirthdate === 'function') {
        loadUserBirthdate();
    }
}