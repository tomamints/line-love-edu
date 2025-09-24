// 新しいタロットカードシステム
let tarotCardsData = null;
let currentCard = null;
let isUpright = true;

// JSONデータを読み込む
async function loadTarotData() {
    try {
        const response = await fetch('../data/tarot-cards-0924.json');
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
        <div class="tarot-result-container" style="text-align: center;">
            <!-- メインコンテンツ -->
            <div class="tarot-content" style="text-align: center;">
                <!-- カードタイトル -->
                <div class="card-title" style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #FFFFFF; text-shadow: 0 0 20px #ceb27c, 0 0 40px #ceb27c; margin-bottom: 10px;">
                        ${currentCard.number} ${currentCard.name}（${positionText}）
                    </h2>
                </div>

                <!-- カード画像 -->
                <div class="card-image-container" style="text-align: center; margin: 30px auto;">
                    <img src="../assets/images/tarot-cards0924/${currentCard.id}.png"
                         alt="${currentCard.name}"
                         style="max-width: 200px; width: 100%; height: auto; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5); ${!isUpright ? 'transform: rotate(180deg);' : ''}">
                </div>

                <!-- 意味 -->
                <div class="card-section" style="text-align: center;">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c;">【${cardData.meaning}】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6);">${cardData.description}</p>
                </div>

                <!-- 今日のあなたの恋愛 -->
                <div class="card-section" style="text-align: center;">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c;">【今日のあなたの恋愛】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6);">${cardData.loveExample}</p>
                </div>

                <!-- 今日の行動 -->
                <div class="card-section" style="text-align: center;">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c;">【今日の行動】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6);">${cardData.todayAction}</p>
                </div>

                <!-- ラッキーアイテム -->
                <div class="card-section" style="text-align: center;">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c;">【ラッキーアイテム】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6);">${cardData.luckyItem}</p>
                </div>

                <!-- 気をつけること -->
                <div class="card-section" style="text-align: center;">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c;">【気をつけること】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6);">${cardData.caution}</p>
                </div>
            </div>
        </div>
    `;

    // 結果を表示
    const resultContainer = document.getElementById('tarot-result');
    if (resultContainer) {
        resultContainer.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
    }

    // カード選択エリアを非表示
    const cardSelection = document.querySelector('.card-selection');
    if (cardSelection) {
        cardSelection.style.display = 'none';
    }

    // タイトルとサブタイトルを非表示
    const mainTitle = document.querySelector('.main-title');
    if (mainTitle) {
        mainTitle.style.display = 'none';
    }

    // drawボタンを「もう一度占う」に変更
    const drawButton = document.getElementById('drawButton');
    if (drawButton) {
        drawButton.textContent = 'もう一度占う';
    }
}

// 新しいカードを引く
async function drawNewCard() {
    // ページをリロード
    location.reload();
}

// drawNewCardをグローバルに
window.drawNewCard = drawNewCard;

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

// drawCards関数をグローバルに定義（既存のボタンとの互換性のため）
window.drawCards = async function() {
    await startFortune();
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

    // drawButtonのイベント設定
    const drawButton = document.getElementById('drawButton');
    if (drawButton) {
        drawButton.onclick = function() {
            startFortune();
        };
    }

    // Enterキーでも占いを開始
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !document.getElementById('tarot-result')?.style.display) {
            e.preventDefault();
            startFortune();
        }
    });
});