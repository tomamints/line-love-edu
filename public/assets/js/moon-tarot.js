// 新しいタロットカードシステム
let tarotCardsData = null;
let currentCard = null;
let isUpright = true;

// JSONデータを読み込む
async function loadTarotData() {
    try {
        const response = await fetch('../assets/data/tarot-cards-0924.json');
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

    // スクロールインジケーター用のスタイルを1度だけ追加
    if (!document.getElementById('tarot-scroll-style')) {
        const style = document.createElement('style');
        style.id = 'tarot-scroll-style';
        style.textContent = `@keyframes tarotScrollBounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(6px); opacity: 1; } }
.tarot-scroll-indicator { width: 56px; height: 56px; border: 1px solid rgba(255, 210, 125, 0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffd27d; box-shadow: 0 8px 20px rgba(0,0,0,0.35); background: rgba(12,0,40,0.55); animation: tarotScrollBounce 1.8s ease-in-out infinite; }
.tarot-scroll-indicator span { font-size: 26px; }
#premiumStatusMessage { display: none; }
`; // animation for scroll hint
        document.head.appendChild(style);
    }

    // 結果表示エリアの作成（背景画像をそのまま使用、暗くしない）
    const resultHTML = `
        <div class="tarot-result-container" style="text-align: center; position: fixed; inset: 0; overflow-y: auto; z-index: 2000; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; gap: ${isMobile ? '32px' : '40px'}; padding: ${isMobile ? '24px 18px 60px' : '40px 24px 80px'}; opacity: 0; animation: fadeIn 0.5s ease forwards;">
            <!-- メインコンテンツ -->
            <div class="tarot-content" style="text-align: center; max-width: 420px; width: 100%; padding: ${isMobile ? '18px' : '24px'}; background: rgba(10, 0, 35, 0.55); border: 1px solid rgba(206, 178, 124, 0.45); border-radius: 20px; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.45);">
                <!-- カードタイトル -->
                <div class="card-title" style="text-align: center; margin-bottom: ${isMobile ? '10px' : '15px'};">
                    <h2 style="color: #FFFFFF; text-shadow: 0 0 20px #ceb27c, 0 0 40px #ceb27c; margin-bottom: 0; font-size: ${isMobile ? '22px' : '26px'};">
                        ${currentCard.number} ${currentCard.name}（${positionText}）
                    </h2>
                </div>

                <!-- カード画像 -->
                <div class="card-image-container" style="text-align: center; margin: ${isMobile ? '15px auto' : '20px auto'};">
                    <img src="../assets/images/tarot-cards0924/${currentCard.id}.webp"
                         alt="${currentCard.name}"
                         style="max-width: ${isMobile ? '170px' : '210px'}; width: 100%; height: auto; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5); ${!isUpright ? 'transform: rotate(180deg);' : ''}"
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

            <div><img src="../assets/images/web/arrow-logo.png" alt="スクロール案内" style="width:28px; height:28px;"></div>

            <!-- スクロール案内 -->
            <div style="text-align: center; color: #ffd27d; font-size: ${isMobile ? '13px' : '14px'}; letter-spacing: 0.05em; text-shadow: 0 0 12px rgba(255, 210, 125, 0.6);">
                ▼ さらに下にスクロールするとおつきさま診断のご案内があります
            </div>

            <!-- おつきさま診断への誘導セクション -->
            <div class="premium-invite" style="width: 100%; max-width: 480px; background: rgba(12, 0, 40, 0.72); border: 1px solid rgba(206, 178, 124, 0.5); border-radius: 22px; padding: ${isMobile ? '22px' : '28px'}; color: #FFFFFF; text-align: left; line-height: 1.6; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);">
                <h3 style="font-size: ${isMobile ? '20px' : '22px'}; margin-bottom: ${isMobile ? '12px' : '14px'}; color: #ffd27d; text-align: center; text-shadow: 0 0 18px rgba(255, 210, 125, 0.8);">🌙 おつきさま診断のご案内</h3>
                <p style="margin-bottom: ${isMobile ? '12px' : '14px'}; font-size: ${isMobile ? '14px' : '15px'};">
                    今日のタロットから月が教えてくれたメッセージはここまでです。
                    もっと深くあなたのこれからや恋愛の流れを知りたいときは、おつきさま診断で直近3ヶ月の運勢や開運アクションを詳しくお届けします。一部の内容は無料でご覧いただけます。
                </p>
                <p style="margin-bottom: ${isMobile ? '18px' : '24px'}; font-size: ${isMobile ? '14px' : '15px'};">
                    LINEトークで「おつきさま診断」と入力するか、リッチメニュー右側のボタンをタップすると、診断のご案内と購入方法が表示されます。
                </p>
                <button id="premiumFortuneButton" style="display: block; width: 100%; padding: ${isMobile ? '14px' : '16px'}; border: none; border-radius: 999px; background: linear-gradient(135deg, #764ba2, #667eea); color: #ffffff; font-size: ${isMobile ? '16px' : '17px'}; font-weight: 600; letter-spacing: 0.05em; box-shadow: 0 14px 35px rgba(102, 126, 234, 0.35); cursor: pointer;">🌙 LINEで案内を受け取る</button>
                <p id="premiumStatusMessage" style="margin-top: ${isMobile ? '12px' : '16px'}; font-size: ${isMobile ? '12px' : '13px'}; color: #ffd27d; text-align: center;"></p>
                <p style="margin-top: ${isMobile ? '12px' : '14px'}; font-size: ${isMobile ? '12px' : '13px'}; color: #ffecbe; text-align: center;">
                    ※LINEに戻り「おつきさま診断」と送信、またはリッチメニューボタンをタップしてください
                </p>
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

    // 診断案内への誘導ボタンの動作を設定
    const premiumButton = document.getElementById('premiumFortuneButton');
    if (premiumButton) {
        premiumButton.addEventListener('click', () => {
            const statusMessage = document.getElementById('premiumStatusMessage');
            if (statusMessage) {
                statusMessage.textContent = 'LINEトークを開いたら「おつきさま診断」と入力するか、リッチメニューの右側ボタンをタップしてください。';
                statusMessage.style.display = 'block';
            }

            window.location.href = 'https://lin.ee/yMGQgRy';
        });
    }
}

// 新しいカードを引く
async function drawNewCard() {
    // ページをリロード
    location.reload();
}

// drawNewCardをグローバルに
window.drawNewCard = drawNewCard;

// 1日1回制限をチェック
function checkDailyLimit() {
    const today = new Date().toDateString();
    const lastFortuneDate = localStorage.getItem('moonTarotLastDate');

    if (lastFortuneDate === today) {
        // 今日すでに占い済み
        const lastCardData = localStorage.getItem('moonTarotLastCard');
        if (lastCardData) {
            const cardInfo = JSON.parse(lastCardData);
            currentCard = cardInfo.card;
            isUpright = cardInfo.isUpright;
            return false; // 新しい占いはできない
        }
    }
    return true; // 新しい占いができる
}

// 占い結果を保存
function saveFortuneResult() {
    const today = new Date().toDateString();
    localStorage.setItem('moonTarotLastDate', today);
    localStorage.setItem('moonTarotLastCard', JSON.stringify({
        card: currentCard,
        isUpright: isUpright
    }));
}

// LINEアプリからのアクセスかチェック
function checkLineAccess() {
    const ua = navigator.userAgent.toLowerCase();
    // LINEアプリ内ブラウザの判定
    return ua.includes('line');
}

// LINE誘導画面を表示
function showLineRedirect() {
    const resultHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: url('../assets/images/tarot-cards0924/tarot-back.png') center/cover; z-index: 2000; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px;">
            <div style="background: rgba(0, 0, 0, 0.7); padding: 40px 30px; border-radius: 20px; max-width: 400px; text-align: center;">
                <h2 style="color: #FFD700; font-size: 24px; margin-bottom: 20px; text-shadow: 0 0 20px #ceb27c;">
                    月タロット占い
                </h2>
                <p style="color: #FFFFFF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    この占いはLINE公式アカウントから<br>
                    ご利用いただけます。<br><br>
                    下記のボタンから友だち追加して<br>
                    毎日の恋愛運を占いましょう✨
                </p>
                <a href="https://lin.ee/egmCXoG"
                   style="display: inline-block; background: linear-gradient(135deg, #00b900, #00a000); color: white; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(0,185,0,0.3);">
                    LINE友だち追加
                </a>
            </div>
        </div>
    `;

    document.body.innerHTML = resultHTML;
}

// 占いを開始
async function startFortune() {
    // LINE以外からのアクセスをチェック
    if (!checkLineAccess()) {
        showLineRedirect();
        return;
    }

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
        saveFortuneResult(); // 結果を保存
        displayCardResult();
    } else {
        // 画像読み込み失敗でも表示
        loadingDiv.remove();
        saveFortuneResult(); // 結果を保存
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

    // LINE以外からのアクセスを最初にチェック
    if (!checkLineAccess()) {
        showLineRedirect();
        return;
    }

    // データを事前読み込み
    await loadTarotData();

    // 今日すでに占い済みかチェック
    const today = new Date().toDateString();
    const lastFortuneDate = localStorage.getItem('moonTarotLastDate');

    if (lastFortuneDate === today) {
        // 今日すでに占い済みの場合、保存された結果を直接表示
        const lastCardData = localStorage.getItem('moonTarotLastCard');
        if (lastCardData) {
            const cardInfo = JSON.parse(lastCardData);
            currentCard = cardInfo.card;
            isUpright = cardInfo.isUpright;
            displayCardResult();
            return; // イベント設定をスキップ
        }
    }

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
