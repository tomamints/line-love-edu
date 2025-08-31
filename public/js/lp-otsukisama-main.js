/**
 * メインスクリプト - 初期化と全体制御
 */

// グローバル変数
let currentPatternId = null;
window.moonPhaseData = null;
window.hiddenPhaseData = null;
window.uiTexts = null;

// データの読み込み
async function loadDataFiles() {
    try {
        const [moonPhases, hiddenPhases, texts] = await Promise.all([
            fetch('/data/moon-phase-descriptions.json').then(r => r.json()),
            fetch('/data/hidden-phase-descriptions.json').then(r => r.json()),
            fetch('/data/ui-texts.json').then(r => r.json())
        ]);
        
        window.moonPhaseData = moonPhases;
        window.hiddenPhaseData = hiddenPhases;
        window.uiTexts = texts;
        
        console.log('Data files loaded successfully');
        return true;
    } catch (error) {
        console.error('Failed to load data files:', error);
        return false;
    }
}

// スクロール進捗バーの更新
function updateScrollProgress() {
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    }
}

// 診断データを読み込む関数
async function loadDiagnosisData(diagnosisId) {
    try {
        const response = await fetch(`/api/get-diagnosis?id=${diagnosisId}`);
        const data = await response.json();
        
        if (data.success && data.diagnosis) {
            return data.diagnosis;
        }
        return null;
    } catch (error) {
        console.error('診断データの読み込みエラー:', error);
        return null;
    }
}

// ページロード時の初期化
window.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing...');
    
    // URLパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const diagnosisId = urlParams.get('id');
    const isPaid = urlParams.get('paid') === 'true';
    
    // データファイルを読み込み
    await loadDataFiles();
    
    // 診断IDがある場合（支払い後のリダイレクト）
    if (diagnosisId && isPaid) {
        console.log('Loading diagnosis data...', diagnosisId);
        
        // 診断データを読み込む
        const diagnosis = await loadDiagnosisData(diagnosisId);
        
        if (diagnosis) {
            // フォームを非表示にして結果を表示
            const formSection = document.getElementById('formSection');
            const resultSection = document.getElementById('resultSection');
            
            if (formSection) formSection.style.display = 'none';
            if (resultSection) {
                resultSection.style.display = 'block';
                
                // 名前を表示
                const resultName = document.getElementById('resultName');
                if (resultName && diagnosis.user_name) {
                    resultName.textContent = diagnosis.user_name;
                }
                
                // パターンIDをグローバル変数に設定
                currentPatternId = diagnosis.pattern_id;
                
                // 月相コンテンツを更新
                updateMoonPhaseContent(currentPatternId);
                
                // 月相を計算して表示
                const moonPhaseIndex = Math.floor(currentPatternId / 8);
                const hiddenPhaseIndex = currentPatternId % 8;
                const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
                const moonPhase = moonPhaseNames[moonPhaseIndex];
                const hiddenMoonPhase = moonPhaseNames[hiddenPhaseIndex];
                
                // 6つの要素を更新
                if (typeof updateSixElements === 'function') {
                    updateSixElements(currentPatternId, moonPhase, hiddenMoonPhase, null);
                }
                
                // グラフデータも更新
                if (typeof updateFortuneGraph === 'function') {
                    updateFortuneGraph(currentPatternId);
                }
                
                // スクロールして結果を表示
                setTimeout(() => {
                    resultSection.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    } else {
        // 通常のフォーム表示
        initializeForm();
    }
    
    // キラキラエフェクトを生成
    createTwinkleStars();
    
    // スクロール進捗バーの設定
    window.addEventListener('scroll', updateScrollProgress);
    
    // 結果セクションが表示されている場合は初期化
    const resultSection = document.getElementById('resultSection');
    if (resultSection && resultSection.style.display !== 'none') {
        // ユーザープロフィールを読み込み
        loadUserProfile();
    }
});

// ページロード時にも実行（後方互換性のため）
window.addEventListener('load', function() {
    console.log('Window loaded');
    
    // loadイベントでのみ実行する処理があればここに記述
});

// キラキラエフェクト生成
function createTwinkleStars() {
    const container = document.querySelector('.moon-types-circle');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'twinkle-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(star);
    }
}