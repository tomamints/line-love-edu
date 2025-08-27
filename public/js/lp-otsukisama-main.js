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

// ページロード時の初期化
window.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM Content Loaded - Initializing...');
    
    // データファイルを読み込み
    await loadDataFiles();
    
    // フォームを初期化
    initializeForm();
    
    // キラキラエフェクトを生成
    createTwinkleStars();
    
    // スクロール進捗バーの設定
    window.addEventListener('scroll', updateScrollProgress);
    
    // 結果セクションが表示されている場合は初期化
    const resultSection = document.getElementById('resultSection');
    if (resultSection && resultSection.style.display !== 'none') {
        // 保存されたデータから復元
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const userData = JSON.parse(savedData);
            
            // ユーザープロフィールを先に読み込み
            await loadUserProfile();
            
            // プロフィールを取得
            const savedProfile = localStorage.getItem('lineUserProfile');
            const profile = savedProfile ? JSON.parse(savedProfile) : null;
            
            // 動的コンテンツを更新（プロフィールを渡す）
            await updateDynamicContent(userData, profile);
            
            // カレンダー生成
            if (typeof generatePersonalizedCalendar === 'function') {
                generatePersonalizedCalendar();
            }
        } else {
            // ユーザープロフィールを読み込み
            loadUserProfile();
        }
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