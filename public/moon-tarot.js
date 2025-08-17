// 月タロットカードのデータ
const moonTarotCards = {
    // 月相カード（8枚）
    newMoon: {
        id: 'newMoon',
        name: '新月',
        emoji: '🌑',
        meaning: '新しい始まり',
        love: '新しい恋の種が蒔かれる時期です。今はまだ見えないかもしれませんが、素晴らしい可能性が眠っています。',
        advice: '心を開いて、新しい出会いや変化を受け入れる準備をしましょう。過去にとらわれず、まっさらな気持ちで前を向いてください。',
        keywords: ['始まり', '可能性', 'リセット', '種まき']
    },
    crescentMoon: {
        id: 'crescentMoon',
        name: '三日月',
        emoji: '🌒',
        meaning: '希望の芽生え',
        love: '恋の予感が少しずつ形になってきています。まだ小さな光ですが、確実に成長しています。',
        advice: '焦らず、ゆっくりと関係を育てていきましょう。相手を知る楽しさを味わってください。',
        keywords: ['成長', '希望', '好奇心', '発見']
    },
    firstQuarter: {
        id: 'firstQuarter',
        name: '上弦の月',
        emoji: '🌓',
        meaning: '決断の時',
        love: '関係が次の段階に進むかどうかの分岐点です。勇気を出して一歩踏み出す時期かもしれません。',
        advice: '自分の気持ちに正直になりましょう。迷いがあるなら、心の声をじっくり聞いてください。',
        keywords: ['決断', '分岐点', '勇気', '選択']
    },
    waxingGibbous: {
        id: 'waxingGibbous',
        name: '十三夜月',
        emoji: '🌔',
        meaning: 'バランスと調和',
        love: '関係が安定し、お互いを理解し合える時期です。心地よい距離感が保たれています。',
        advice: '今の関係を大切にしながら、さらに深めていく努力をしましょう。感謝の気持ちを忘れずに。',
        keywords: ['調和', 'バランス', '安定', '理解']
    },
    fullMoon: {
        id: 'fullMoon',
        name: '満月',
        emoji: '🌕',
        meaning: '成就と最高潮',
        love: '恋が最も輝く時期です。告白や次のステップへ進む絶好のタイミング。感情が高まっています。',
        advice: '今の感情を素直に表現しましょう。満月の力があなたの勇気を後押ししてくれます。',
        keywords: ['成就', '告白', '絶頂期', '情熱']
    },
    waningGibbous: {
        id: 'waningGibbous',
        name: '十六夜月',
        emoji: '🌖',
        meaning: '余韻と感謝',
        love: '激しい感情が落ち着き、深い愛情へと変化していく時期です。相手への感謝が深まります。',
        advice: '日常の中にある小さな幸せを大切にしましょう。相手への感謝を言葉にして伝えてください。',
        keywords: ['感謝', '余韻', '深化', '成熟']
    },
    lastQuarter: {
        id: 'lastQuarter',
        name: '下弦の月',
        emoji: '🌗',
        meaning: '手放しと整理',
        love: '不要なものを手放し、本当に大切なものを見極める時期です。関係の見直しが必要かもしれません。',
        advice: '執着を手放し、自然な流れに任せましょう。終わりは新しい始まりの準備です。',
        keywords: ['手放し', '整理', '浄化', '見直し']
    },
    waningCrescent: {
        id: 'waningCrescent',
        name: '暁月',
        emoji: '🌘',
        meaning: '終わりと再生',
        love: '一つのサイクルが終わり、新しいサイクルへの準備期間です。内省と充電の時期。',
        advice: '今は休息と内省の時。次の新月に向けて、心と体を整えましょう。',
        keywords: ['終わり', '再生', '内省', '準備']
    },
    
    // 月の神秘カード（8枚）
    moonlight: {
        id: 'moonlight',
        name: '月光',
        emoji: '✨',
        meaning: '真実の照明',
        love: '隠されていた真実が明らかになります。相手の本当の気持ちが見えてくる時期です。',
        advice: '月光に照らされた真実を受け入れる勇気を持ちましょう。真実は時に優しく、時に厳しいものです。',
        keywords: ['真実', '発見', '明瞭', '理解']
    },
    moonShadow: {
        id: 'moonShadow',
        name: '月影',
        emoji: '🌚',
        meaning: '隠された感情',
        love: 'まだ表に出ていない感情があります。相手も、あなた自身も、隠している想いがあるようです。',
        advice: '影の部分も含めて、すべてを受け入れる準備をしましょう。完璧でなくても大丈夫です。',
        keywords: ['秘密', '潜在意識', '隠れた想い', '内面']
    },
    moonTears: {
        id: 'moonTears',
        name: '月の涙',
        emoji: '💧',
        meaning: '浄化と癒し',
        love: '過去の傷が癒される時期です。涙は浄化のプロセス。新しい愛への準備が整いつつあります。',
        advice: '感情を素直に表現することで、心が軽くなります。涙も笑顔も、すべてが愛の一部です。',
        keywords: ['浄化', '癒し', '解放', '涙']
    },
    moonSmile: {
        id: 'moonSmile',
        name: '月の微笑み',
        emoji: '🌙',
        meaning: '幸運の前兆',
        love: '月があなたに微笑んでいます。恋愛運が上昇し、嬉しい出来事が起こりそうです。',
        advice: 'ポジティブな気持ちを保ちましょう。あなたの笑顔が、さらなる幸運を引き寄せます。',
        keywords: ['幸運', '喜び', '前兆', '祝福']
    },
    eclipse: {
        id: 'eclipse',
        name: '月食',
        emoji: '🌑',
        meaning: '大きな変化',
        love: '関係性に大きな変化が訪れます。これまでとは違う展開が待っているでしょう。',
        advice: '変化を恐れず、流れに身を任せましょう。月食の後には、新しい光が差し込みます。',
        keywords: ['変化', '転換期', '変革', '運命']
    },
    superMoon: {
        id: 'superMoon',
        name: 'スーパームーン',
        emoji: '🌕',
        meaning: '特別な機会',
        love: '普段よりも強いエネルギーが働いています。特別な出会いや、関係の大きな進展が期待できます。',
        advice: 'このチャンスを逃さないように。今こそ行動する時です。月の力があなたを支えています。',
        keywords: ['特別', 'チャンス', '強運', 'パワー']
    },
    blueMoon: {
        id: 'blueMoon',
        name: 'ブルームーン',
        emoji: '🔵',
        meaning: '奇跡的な出会い',
        love: '滅多にない特別な出会いや、奇跡的な展開が起こりそうです。運命の相手かもしれません。',
        advice: '心を開いて、奇跡を受け入れる準備をしましょう。特別なことが起こる予感を信じて。',
        keywords: ['奇跡', '運命', 'レア', '特別な縁']
    },
    moonMirror: {
        id: 'moonMirror',
        name: '月の鏡',
        emoji: '🪞',
        meaning: '自己との対話',
        love: '相手との関係を通じて、自分自身を見つめ直す時期です。相手はあなたの鏡かもしれません。',
        advice: '自分自身と向き合うことで、真の愛を見つけることができます。内なる声に耳を傾けて。',
        keywords: ['内省', '自己理解', '気づき', '成長']
    },
    
    // 特別な月カード
    bloodMoon: {
        id: 'bloodMoon',
        name: 'ブラッドムーン',
        emoji: '🔴',
        meaning: '情熱の爆発',
        love: '抑えきれない情熱が溢れ出す時。理性を超えた強い感情が、あなたを突き動かします。',
        advice: '情熱は力になりますが、冷静さも忘れずに。炎のような恋も、時には優しい光に変える必要があります。',
        keywords: ['情熱', '衝動', '激情', '本能']
    }
};

// グローバル変数
let currentSpread = null;
let selectedCards = [];
let isDrawing = false;

// 占い方法を選択
function selectSpread(type) {
    currentSpread = type;
    document.getElementById('spreadSelection').style.display = 'none';
    document.getElementById('cardArea').style.display = 'block';
    
    // カードの枚数を設定
    let cardCount = 1;
    if (type === 'three') cardCount = 3;
    if (type === 'full') cardCount = 3;  // 5枚から3枚に変更
    
    // カードを表示
    displayCards(cardCount);
}

// カードを表示
function displayCards(count) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = i;
        card.innerHTML = `
            <div class="card-face card-back">
                <div class="card-back-text">月のカード</div>
            </div>
            <div class="card-face card-front">
                <div class="card-emoji"></div>
                <div class="card-name"></div>
            </div>
        `;
        container.appendChild(card);
    }
}

// カードを引く
function drawCards() {
    if (isDrawing) return;
    isDrawing = true;
    
    // カードをランダムに選択
    const allCards = Object.values(moonTarotCards);
    selectedCards = [];
    const usedIndices = new Set();
    
    const cardCount = currentSpread === 'daily' ? 1 : 3;  // すべて3枚に統一
    
    while (selectedCards.length < cardCount) {
        const randomIndex = Math.floor(Math.random() * allCards.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedCards.push(allCards[randomIndex]);
        }
    }
    
    // カードをめくるアニメーション
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('flipped');
            const frontFace = card.querySelector('.card-front');
            const emoji = frontFace.querySelector('.card-emoji');
            const name = frontFace.querySelector('.card-name');
            
            emoji.textContent = selectedCards[index].emoji;
            name.textContent = selectedCards[index].name;
            
            // 最後のカードがめくられたら結果を表示
            if (index === cards.length - 1) {
                setTimeout(() => {
                    showResult();
                }, 1000);
            }
        }, index * 500);
    });
}

// 結果を表示
function showResult() {
    document.getElementById('cardArea').style.display = 'none';
    document.getElementById('resultArea').style.display = 'block';
    
    const resultTitle = document.getElementById('resultTitle');
    const resultCards = document.getElementById('resultCards');
    
    // タイトルを設定
    if (currentSpread === 'daily') {
        resultTitle.textContent = '今日のあなたへのメッセージ';
    } else if (currentSpread === 'three') {
        resultTitle.textContent = '過去・現在・未来の物語';
    } else {
        resultTitle.textContent = '満月が照らす恋愛の全貌';
    }
    
    // 結果カードを表示
    resultCards.innerHTML = '';
    
    selectedCards.forEach((card, index) => {
        let positionLabel = '';
        if (currentSpread === 'three') {
            positionLabel = ['過去', '現在', '未来'][index] + '：';
        } else if (currentSpread === 'full') {
            positionLabel = ['現在の状況', '相手の気持ち', 'これからの展開'][index] + '：';
        }
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.style.animation = `slideIn 0.5s ease-out ${index * 0.2}s both`;
        
        resultCard.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-emoji">${card.emoji}</div>
                <div class="result-card-info">
                    <div class="result-card-name">${positionLabel}${card.name}</div>
                    <div class="result-card-meaning">${card.meaning}</div>
                </div>
            </div>
            <div class="result-card-message">${card.love}</div>
            <div class="result-card-advice">
                <strong>月詠からのアドバイス：</strong><br>
                ${card.advice}
            </div>
            <div class="result-keywords">
                ${card.keywords.map(keyword => `<span class="keyword">#${keyword}</span>`).join('')}
            </div>
        `;
        
        resultCards.appendChild(resultCard);
    });
    
    // 総合メッセージを追加（複数枚の場合）
    if (selectedCards.length > 1) {
        const overallMessage = createOverallMessage();
        const overallDiv = document.createElement('div');
        overallDiv.className = 'result-card';
        overallDiv.style.background = 'rgba(255, 215, 0, 0.05)';
        overallDiv.style.borderColor = 'rgba(255, 215, 0, 0.3)';
        overallDiv.innerHTML = `
            <div class="result-card-header">
                <div class="result-card-emoji">🌟</div>
                <div class="result-card-info">
                    <div class="result-card-name">総合メッセージ</div>
                    <div class="result-card-meaning">月詠からの統合的なアドバイス</div>
                </div>
            </div>
            <div class="result-card-message">${overallMessage}</div>
        `;
        resultCards.appendChild(overallDiv);
    }
}

// 総合メッセージを作成
function createOverallMessage() {
    if (currentSpread === 'three') {
        return `過去の${selectedCards[0].name}が教えてくれるのは、${selectedCards[0].keywords[0]}の大切さ。
                現在の${selectedCards[1].name}は、今まさに${selectedCards[1].keywords[0]}の時期であることを示しています。
                そして未来の${selectedCards[2].name}は、${selectedCards[2].keywords[0]}への道筋を照らしています。
                月の導きに従い、自然な流れに身を任せましょう。`;
    } else if (currentSpread === 'full') {
        return `現在の状況を表す${selectedCards[0].name}は、${selectedCards[0].keywords[0]}のエネルギーに満ちています。
                相手の気持ちを示す${selectedCards[1].name}からは、${selectedCards[1].keywords[0]}の想いが読み取れます。
                そしてこれからの展開を示す${selectedCards[2].name}は、${selectedCards[2].keywords[0]}へと向かうことを暗示しています。
                月はあなたの恋を優しく照らし、導いてくれるでしょう。`;
    }
    return '';
}

// リセット
function reset() {
    currentSpread = null;
    selectedCards = [];
    isDrawing = false;
    
    document.getElementById('spreadSelection').style.display = 'block';
    document.getElementById('cardArea').style.display = 'none';
    document.getElementById('resultArea').style.display = 'none';
}