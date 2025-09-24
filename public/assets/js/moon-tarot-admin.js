// タロットカード管理者版システム（無制限版）
let tarotCardsData = null;
let currentSpread = 'daily';
let drawnCards = [];

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

// 占い方法を選択
function selectSpread(type) {
    currentSpread = type;
    drawnCards = [];

    // 選択画面を非表示
    document.getElementById('spreadSelection').style.display = 'none';

    // カードエリアを表示
    const cardArea = document.getElementById('cardArea');
    cardArea.style.display = 'block';

    // カードコンテナをクリア
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = '';

    // 占い方法に応じてカードを配置
    let cardCount = 1;
    if (type === 'three' || type === 'full') {
        cardCount = 3;
    }

    // クラスを設定
    if (cardCount === 1) {
        cardContainer.className = 'card-container single-card';
    } else {
        cardContainer.className = 'card-container three-cards';
    }

    // カードを生成
    for (let i = 0; i < cardCount; i++) {
        const card = document.createElement('div');
        card.className = 'tarot-card';
        card.id = `card-${i}`;

        // A.pngとB.pngを交互に使用
        const backImage = i % 2 === 0 ? '../assets/images/tarot-cards0924/A.png' : '../assets/images/tarot-cards0924/B.png';

        card.innerHTML = `
            <div class="card-face card-back" style="background-image: url('${backImage}');"></div>
            <div class="card-face card-front">
                <div class="card-emoji">🃏</div>
                <div class="card-name">準備中...</div>
            </div>
        `;
        cardContainer.appendChild(card);
    }
}

// カードを引く
async function drawCards() {
    // データが読み込まれていない場合は読み込む
    if (!tarotCardsData) {
        const loaded = await loadTarotData();
        if (!loaded) {
            alert('タロットデータの読み込みに失敗しました。ページを再読み込みしてください。');
            return;
        }
    }

    // ボタンを無効化
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;
    drawButton.textContent = '占い中...';

    // カードを選択
    const cardCount = currentSpread === 'daily' ? 1 : 3;
    drawnCards = [];
    const usedIndexes = new Set();

    for (let i = 0; i < cardCount; i++) {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * tarotCardsData.length);
        } while (usedIndexes.has(randomIndex));

        usedIndexes.add(randomIndex);
        const card = tarotCardsData[randomIndex];
        const isUpright = Math.random() > 0.5;

        drawnCards.push({
            ...card,
            isUpright: isUpright,
            position: i
        });
    }

    // カードをめくるアニメーション
    setTimeout(() => {
        drawnCards.forEach((card, index) => {
            const cardElement = document.getElementById(`card-${index}`);
            if (cardElement) {
                cardElement.classList.add('flipped');

                // カード画像を設定
                const frontFace = cardElement.querySelector('.card-front');
                if (frontFace && card.image) {
                    frontFace.style.backgroundImage = `url('${card.image}')`;
                    if (!card.isUpright) {
                        frontFace.style.transform = 'rotateY(180deg) rotate(180deg)';
                    }
                }
            }
        });

        // 結果を表示
        setTimeout(() => {
            displayResults();
        }, 800);
    }, 500);
}

// 結果を表示（新フォーマット）
function displayResults() {
    const resultArea = document.getElementById('resultArea');
    const resultCards = document.getElementById('resultCards');
    const resultTitle = document.getElementById('resultTitle');

    // タイトル設定
    if (currentSpread === 'daily') {
        resultTitle.textContent = '今日の月カード';
    } else if (currentSpread === 'three') {
        resultTitle.textContent = '月の三相占い';
    } else {
        resultTitle.textContent = '満月の恋愛占い';
    }

    // カードエリアを非表示
    document.getElementById('cardArea').style.display = 'none';

    // 結果をクリア
    resultCards.innerHTML = '';

    // 新フォーマットで結果を表示
    drawnCards.forEach((card, index) => {
        const position = card.isUpright ? 'upright' : 'reversed';
        const cardData = card[position];
        const positionText = card.isUpright ? '正位置' : '逆位置';

        let positionLabel = '';
        if (currentSpread === 'three') {
            positionLabel = ['過去', '現在', '未来'][index];
        } else if (currentSpread === 'full') {
            positionLabel = ['あなたの気持ち', '相手の気持ち', '二人の未来'][index];
        }

        const cardHTML = `
            <div class="result-card">
                ${positionLabel ? `<div style="text-align: center; margin-bottom: 20px; font-size: 20px; color: #ffd700;">${positionLabel}</div>` : ''}

                <div class="result-card-header">
                    <div class="result-card-image-container">
                        <img src="${card.image}" alt="${card.name}" class="result-card-image ${!card.isUpright ? 'reversed-card' : ''}" style="${!card.isUpright ? 'transform: rotate(180deg);' : ''}">
                    </div>
                    <div class="result-card-info">
                        <div class="result-card-name">${card.number} ${card.name}</div>
                        <div class="result-card-meaning">${positionText}</div>
                    </div>
                </div>

                <div style="margin-top: 25px;">
                    <div style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                        <h3 style="color: #ffd700; font-size: 18px; margin-bottom: 10px;">【${cardData.meaning}】</h3>
                        <p style="line-height: 1.8;">${cardData.description}</p>
                    </div>

                    <div style="background: rgba(255, 215, 0, 0.1); border-left: 3px solid #ffd700; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        <h4 style="color: #ffd700; margin-bottom: 8px;">【今日のあなたの恋愛】</h4>
                        <p style="line-height: 1.6;">${cardData.loveExample}</p>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                        <h4 style="color: #ffd700; margin-bottom: 8px;">【今日の行動】</h4>
                        <p style="line-height: 1.6;">${cardData.todayAction}</p>
                    </div>

                    <div style="display: flex; gap: 20px; margin-top: 20px;">
                        <div style="flex: 1; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
                            <h5 style="color: #ffd700; font-size: 14px; margin-bottom: 5px;">ラッキーアイテム</h5>
                            <p style="font-size: 14px;">${cardData.luckyItem}</p>
                        </div>
                        <div style="flex: 1; background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 12px;">
                            <h5 style="color: #ffd700; font-size: 14px; margin-bottom: 5px;">気をつけること</h5>
                            <p style="font-size: 14px;">${cardData.caution}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        resultCards.innerHTML += cardHTML;
    });

    // 結果エリアを表示
    resultArea.style.display = 'block';
}

// リセット
function reset() {
    // 結果エリアを非表示
    document.getElementById('resultArea').style.display = 'none';

    // カードエリアを非表示
    document.getElementById('cardArea').style.display = 'none';

    // 選択画面を表示
    document.getElementById('spreadSelection').style.display = 'block';

    // ボタンをリセット
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = false;
    drawButton.textContent = 'カードを引く';

    // データをクリア
    drawnCards = [];
}

// シェア機能
function shareResult() {
    const cardNames = drawnCards.map(c => c.name).join('、');
    const text = `月タロット占いの結果：${cardNames}が出ました！\n月の導きで恋愛運をチェック🌙\n`;
    const url = window.location.href.replace('-admin', ''); // admin版のURLを通常版に変更

    // LINEでシェア（モバイルデバイスの場合）
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + url)}`;
        window.open(lineUrl, '_blank');
    } else {
        // PCの場合はクリップボードにコピー
        const shareText = text + url;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('シェア用のテキストをコピーしました！');
        }).catch(() => {
            alert('シェアテキスト：\n' + shareText);
        });
    }
}

// 画像のプリロード
async function preloadImages() {
    if (!tarotCardsData) {
        await loadTarotData();
    }

    if (tarotCardsData) {
        const imageUrls = tarotCardsData.map(card => card.image).filter(url => url);

        const loadPromises = imageUrls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
            });
        });

        await Promise.all(loadPromises);
        console.log('全カード画像のプリロード完了');
    }
}

// グローバルに関数を公開
window.selectSpread = selectSpread;
window.drawCards = drawCards;
window.reset = reset;
window.shareResult = shareResult;
window.preloadImages = preloadImages;

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('タロット占い管理者版システム初期化中...');

    // データを事前読み込み
    await loadTarotData();

    // Enterキーでもカードを引ける
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.getElementById('cardArea').style.display === 'block') {
            const drawButton = document.getElementById('drawButton');
            if (drawButton && !drawButton.disabled) {
                drawCards();
            }
        }
    });
});