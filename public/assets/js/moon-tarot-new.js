// 新しいタロットカードシステム
let tarotCardsData = null;
let currentCard = null;
let isUpright = true;

// JSONデータを読み込む
async function loadTarotData() {
    try {
        const response = await fetch('/assets/data/tarot-cards-0924.json');
        const data = await response.json();
        tarotCardsData = data.cards;
        console.log('タロットデータを読み込みました:', tarotCardsData.length + '枚');
        return true;
    } catch (error) {
        console.error('タロットデータの読み込みに失敗:', error);
        return false;
    }
}

// ランダムにカードを選ぶ
function selectRandomCard() {
    if (!tarotCardsData || tarotCardsData.length === 0) {
        console.error('タロットデータがありません');
        return null;
    }

    // ランダムにカードを選択
    const randomIndex = Math.floor(Math.random() * tarotCardsData.length);
    currentCard = tarotCardsData[randomIndex];

    // 正位置/逆位置をランダムに決定
    isUpright = Math.random() > 0.5;

    console.log('選ばれたカード:', currentCard.name, isUpright ? '正位置' : '逆位置');
    return currentCard;
}

// カード結果を表示
function displayCardResult() {
    if (!currentCard) return;

    const position = isUpright ? 'upright' : 'reversed';
    const cardData = currentCard[position];
    const positionText = isUpright ? '正位置' : '逆位置';

    // 結果表示エリアの作成
    const resultHTML = `
        <div class="tarot-result-container">
            <!-- 背景画像 -->
            <div class="tarot-background">
                <img src="/assets/images/tarot-cards0924/tarot-back.png" alt="背景">
            </div>

            <!-- 縁装飾 -->
            <div class="tarot-corners">
                <img class="corner top-left" src="/assets/images/tarot-cards0924/縁_左上.png" alt="">
                <img class="corner top-right" src="/assets/images/tarot-cards0924/縁_右上.png" alt="">
                <img class="corner bottom-left" src="/assets/images/tarot-cards0924/縁_左下.png" alt="">
                <img class="corner bottom-right" src="/assets/images/tarot-cards0924/縁_右下.png" alt="">
            </div>

            <!-- 上下装飾 -->
            <div class="tarot-borders">
                <img class="border-top" src="/assets/images/tarot-cards0924/縁上下.png" alt="">
                <img class="border-bottom" src="/assets/images/tarot-cards0924/縁上下.png" alt="">
            </div>

            <!-- メインコンテンツ -->
            <div class="tarot-content">
                <!-- カードタイトル -->
                <div class="card-title">
                    <h2>${currentCard.number} ${currentCard.name}</h2>
                    <span class="position-text">${positionText}</span>
                </div>

                <!-- カード画像 -->
                <div class="card-image-container">
                    <img src="${currentCard.image}" alt="${currentCard.name}" class="${!isUpright ? 'reversed-card' : ''}">
                </div>

                <!-- 意味 -->
                <div class="card-section">
                    <h3>【${cardData.meaning}】</h3>
                    <p>${cardData.description}</p>
                </div>

                <!-- 今日のあなたの恋愛 -->
                <div class="card-section">
                    <h3>【今日のあなたの恋愛】</h3>
                    <p>${cardData.loveExample}</p>
                </div>

                <!-- 今日の行動 -->
                <div class="card-section">
                    <h3>【今日の行動】</h3>
                    <p>${cardData.todayAction}</p>
                </div>

                <!-- ラッキーアイテム -->
                <div class="card-section">
                    <h3>【ラッキーアイテム】</h3>
                    <p>${cardData.luckyItem}</p>
                </div>

                <!-- 気をつけること -->
                <div class="card-section">
                    <h3>【気をつけること】</h3>
                    <p>${cardData.caution}</p>
                </div>

                <!-- もう一度占うボタン -->
                <button class="retry-button" onclick="drawNewCard()">もう一度占う</button>
            </div>
        </div>
    `;

    // 結果を表示
    const resultContainer = document.getElementById('tarot-result');
    if (resultContainer) {
        resultContainer.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
    }

    // 占いフォームを非表示
    const formContainer = document.querySelector('.fortune-form');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

// 新しいカードを引く
async function drawNewCard() {
    // 結果エリアをクリア
    const resultContainer = document.getElementById('tarot-result');
    if (resultContainer) {
        resultContainer.style.display = 'none';
    }

    // フォームを表示
    const formContainer = document.querySelector('.fortune-form');
    if (formContainer) {
        formContainer.style.display = 'block';
    }
}

// 占いを開始
async function startFortune() {
    // ローディング表示
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.textContent = '占い中...';
        submitButton.disabled = true;
    }

    // データが読み込まれていない場合は読み込む
    if (!tarotCardsData) {
        const loaded = await loadTarotData();
        if (!loaded) {
            alert('タロットデータの読み込みに失敗しました。ページを再読み込みしてください。');
            if (submitButton) {
                submitButton.textContent = '占いをはじめる';
                submitButton.disabled = false;
            }
            return;
        }
    }

    // カードを選択
    selectRandomCard();

    // アニメーション演出（少し待つ）
    setTimeout(() => {
        displayCardResult();
        if (submitButton) {
            submitButton.textContent = '占いをはじめる';
            submitButton.disabled = false;
        }
    }, 1500);
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('タロット占いシステム初期化中...');

    // データを事前読み込み
    await loadTarotData();

    // 占いボタンのイベント設定
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            startFortune();
        });
    }

    // Enterキーでも占いを開始
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.getElementById('tarot-result').style.display) {
            e.preventDefault();
            startFortune();
        }
    });
});