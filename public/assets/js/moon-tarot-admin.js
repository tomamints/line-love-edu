// 新しいタロットカードシステム (管理者版 - 無制限)
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

// 画像をプリロード
async function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            // WebPが失敗したらPNGを試す
            if (src.endsWith('.webp')) {
                const pngSrc = src.replace('.webp', '.png');
                const pngImg = new Image();
                pngImg.onload = () => resolve(pngImg);
                pngImg.onerror = reject;
                pngImg.src = pngSrc;
            } else {
                reject();
            }
        };
        img.src = src;
    });
}

// カード結果を表示
function displayCardResult() {
    if (!currentCard) return;

    const position = isUpright ? 'upright' : 'reversed';
    const cardData = currentCard[position];
    const positionText = isUpright ? '正位置' : '逆位置';

    // ビューポートの高さを取得
    const vh = window.innerHeight;
    const isMobile = window.innerWidth <= 768;

    // 結果表示エリアの作成（背景画像をそのまま使用、暗くしない）
    const resultHTML = `
        <div class="tarot-result-container" style="text-align: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow-y: auto; z-index: 2000; display: flex; flex-direction: column; justify-content: center; opacity: 0; animation: fadeIn 0.5s ease forwards;">
            <!-- メインコンテンツ -->
            <div class="tarot-content" style="text-align: center; max-width: 400px; margin: 0 auto; width: 100%; padding: 20px;">
                <!-- カードタイトル -->
                <div class="card-title" style="text-align: center; margin-bottom: ${isMobile ? '8px' : '13px'};">
                    <h2 style="color: #FFFFFF; text-shadow: 0 0 20px #ceb27c, 0 0 40px #ceb27c; margin-bottom: 0; font-size: ${isMobile ? '22px' : '26px'};">
                        ${currentCard.number} ${currentCard.name}（${positionText}）
                    </h2>
                </div>

                <!-- カード画像 -->
                <div class="card-image-container" style="text-align: center; margin: ${isMobile ? '15px auto' : '20px auto'};">
                    <img src="../assets/images/tarot-cards0924/${currentCard.id}.webp"
                         alt="${currentCard.name}"
                         style="max-width: ${isMobile ? '120px' : '160px'}; width: 100%; height: auto; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5); ${!isUpright ? 'transform: rotate(180deg);' : ''}"
                         onerror="this.src='../assets/images/tarot-cards0924/${currentCard.id}.png'">
                </div>

                <!-- 意味 -->
                <div class="card-section" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c; margin-bottom: 5px; font-size: ${isMobile ? '16px' : '18px'};">【${cardData.meaning}】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6); line-height: 1.4; font-size: ${isMobile ? '13px' : '15px'}; margin: 0;">${cardData.description}</p>
                </div>

                <!-- 今日のあなたの恋愛 -->
                <div class="card-section" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c; margin-bottom: 5px; font-size: ${isMobile ? '16px' : '18px'};">【今日のあなたの恋愛】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6); line-height: 1.4; font-size: ${isMobile ? '13px' : '15px'}; margin: 0;">${cardData.loveExample}</p>
                </div>

                <!-- 今日の行動 -->
                <div class="card-section" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c; margin-bottom: 5px; font-size: ${isMobile ? '16px' : '18px'};">【今日の行動】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6); line-height: 1.4; font-size: ${isMobile ? '13px' : '15px'}; margin: 0;">${cardData.todayAction}</p>
                </div>

                <!-- ラッキーアイテム -->
                <div class="card-section" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c; margin-bottom: 5px; font-size: ${isMobile ? '16px' : '18px'};">【ラッキーアイテム】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6); line-height: 1.4; font-size: ${isMobile ? '13px' : '15px'}; margin: 0;">${cardData.luckyItem}</p>
                </div>

                <!-- 気をつけること -->
                <div class="card-section" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h3 style="color: #FFFFFF; text-shadow: 0 0 15px #ceb27c; margin-bottom: 5px; font-size: ${isMobile ? '16px' : '18px'};">【気をつけること】</h3>
                    <p style="color: #FFFFFF; text-shadow: 0 0 10px rgba(206, 178, 124, 0.6); line-height: 1.4; font-size: ${isMobile ? '13px' : '15px'}; margin: 0;">${cardData.caution}</p>
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

    // bodyのスクロールを無効化
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

// 新しいカードを引く
async function drawNewCard() {
    // ページをリロード
    location.reload();
}

// drawNewCardをグローバルに
window.drawNewCard = drawNewCard;

// 占いを開始 (管理者版は制限なし)
async function startFortune() {
    // ローディング表示を追加
    const container = document.querySelector('.container');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-animation';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="color: #FFFFFF; font-size: 20px; text-shadow: 0 0 20px #ceb27c; animation: pulse 1.5s ease-in-out infinite;">
                カードを読み取っています...
            </div>
        </div>
    `;
    loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 3000;';
    container.appendChild(loadingDiv);

    // データが読み込まれていない場合は読み込む
    if (!tarotCardsData) {
        const loaded = await loadTarotData();
        if (!loaded) {
            alert('タロットデータの読み込みに失敗しました。ページを再読み込みしてください。');
            loadingDiv.remove();
            return;
        }
    }

    // カードを選択
    selectRandomCard();

    // 画像を確実に読み込む
    const imageSrc = `../assets/images/tarot-cards0924/${currentCard.id}.webp`;
    let imageLoaded = false;

    try {
        await preloadImage(imageSrc);
        imageLoaded = true;
    } catch (error) {
        // WebPが失敗したらPNGを試す
        const pngSrc = `../assets/images/tarot-cards0924/${currentCard.id}.png`;
        try {
            await preloadImage(pngSrc);
            imageLoaded = true;
        } catch (pngError) {
            console.log('画像の読み込みに失敗しました');
        }
    }

    // 画像が読み込まれたら結果を表示
    if (imageLoaded) {
        // 少し待ってから表示
        await new Promise(resolve => setTimeout(resolve, 1000));
        loadingDiv.remove();
        displayCardResult();
    } else {
        // 画像読み込み失敗でも表示
        loadingDiv.remove();
        displayCardResult();
    }
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
