// Web版おつきさま診断のJavaScript

// 月タイプ定義
const moonTypes = {
    '新月': {
        emoji: '🌑',
        title: '新月タイプの物語',
        introduction: 'あなたが生まれた夜、空には月が見えませんでした。',
        symbolism: '新月は「始まり」「真っさらな可能性」「まだ見えない未来」を象徴します。',
        traits: [
            '直感力と瞬発力が飛び抜けています',
            '未知の人・場所・体験に強く惹かれる',
            '心が動いた瞬間に行動できる',
            '初対面でも自然に距離を縮められる',
            '「今」の気持ちを大事にし、勢いがある'
        ],
        loveStyle: '新月の恋は、雷が落ちるように始まります。「この人だ！」と直感したら、一気に距離を詰め、短期間で深い関係に。',
        loveExamples: [
            '出会って数時間で「来週、ご飯行こう！」と即提案',
            'LINEは熱量高め、写真や動画もすぐ共有',
            '付き合う前でもサプライズや遠出を提案し、相手をワクワクさせる'
        ],
        caution: 'ただし、安定期に入るとメッセージが短くなったり、会う間隔が空いたりすることも。本人は「落ち着いただけ」でも、相手は「冷められた？」と感じやすい点に注意。',
        actionAdvice: [
            '「安定デー」をカレンダーに先置き：月に2回は動かないデート（自炊・散歩・映画）を予約',
            '熱量の"3段変速"運転：初期＝全開／中期＝安定／長期＝低燃費',
            '週1日は連絡や提案をせず、相手からの動きを待つ'
        ]
    },
    '三日月': {
        emoji: '🌒',
        title: '三日月タイプの物語',
        introduction: 'あなたが生まれた日の夜空には、右側に細く光る三日月が浮かんでいました。',
        symbolism: '三日月は「準備」「芽吹きの保護」「柔軟な適応力」を象徴します。',
        traits: [
            '状況をよく観察し、相手や環境に合わせて距離感を調整できる',
            '相手の感情や雰囲気を敏感に察知する',
            '自分よりも相手を優先する場面が多い',
            '無理をせず自然体で関係を続けられる'
        ],
        loveStyle: '三日月の恋は、種を少しずつ育てる庭師のようです。一目惚れよりも、安心感を積み重ねて距離を縮めます。',
        loveExamples: [
            '気になる相手には、まずLINEや会話で信頼関係を作ってからデートに誘う',
            '相手が忙しいときは無理に会おうとせず、短いメッセージだけ送る',
            '恋人の疲れを察知して、会う代わりに「ゆっくり休んでね」と伝える'
        ],
        caution: '優しさが強すぎて本音を後回しにすることがあり、恋愛の進展がゆっくりになりがちです。',
        actionAdvice: [
            '"小さな一歩アクション"を月3回：軽い誘いやメッセージで自分から動く習慣',
            '本音メモを週1回：相手に伝えたいことをメモに書き出し、その中から1つだけ伝える',
            '感情共有デー：月末に「今月の嬉しかったこと・不安だったこと」をお互い話す'
        ]
    },
    '上弦の月': {
        emoji: '🌓',
        title: '上弦の月タイプの物語',
        introduction: 'あなたが生まれた夜、右半分がくっきりと光る上弦の月が空にかかっていました。',
        symbolism: '上弦の月は「行動計画」「加速」「段階的な成長」を象徴します。',
        traits: [
            '目的を決めたら"いつ・何を・どうやって"を自然に組み立てる',
            '勢いだけで走るのではなく、現実に落とし込む設計図づくりが得意',
            '着実に前へ進める推進力がある',
            '計画を守る意識が強い'
        ],
        loveStyle: '上弦タイプの恋は、"見通し"を持つところから始まります。相手をよく観察し、価値観や生活リズムが噛み合うかを確認。',
        loveExamples: [
            '初回の食事が良い感触なら、帰り際に「来週どこかでランチどう？」とカレンダー前提で誘う',
            '相手が忙しい時期は、"負担を上げない接点"としてボイスメッセージやスタンプで様子見',
            '関係が進むと、旅行・記念日・将来の暮らし方など中期計画の話題を自然に持ち込む'
        ],
        caution: 'ペース設定がやや"前のめり"になりやすく、相手には「急かされている」と感じられる場合があります。',
        actionAdvice: [
            '"余白デー"をカレンダーに先置き：月に2回、あえて"何もしないデート"を予約',
            '会話の冒頭15分は"共感モード固定"：解決策・提案は15分以降',
            'デートの幹を相手に丸投げする"お任せ回"を定期開催'
        ]
    },
    '十三夜': {
        emoji: '🌔',
        title: '十三夜タイプの物語',
        introduction: 'あなたが生まれた夜、ほぼ満ちた月――十三夜が、満ちる直前の静かな高まりを湛えていました。',
        symbolism: '十三夜は「実り」「充足」「安定した発展」を象徴します。',
        traits: [
            '落ち着いた物腰と、相手の気持ちを受け止める包容力',
            '声を荒げず、状況を整え、場の温度をちょうどよく保つ',
            '仕事では火消し・段取りの微修正・関係調整が得意',
            '友人間では"聞き役"として安心を供給'
        ],
        loveStyle: '十三夜の恋は、安心の土台づくりから始まります。連絡は量より質。会う頻度も"持続可能なペース"を重視。',
        loveExamples: [
            '週3の短いLINEより、週2の丁寧な通話で互いの近況と感情を共有',
            '外食続きより、自宅で一緒に料理→ドラマ1話のほうが満足度が高い',
            '将来の話も「2年以内に同棲」「双方の通勤30分圏内」など現実的な条件で擦り合わせ'
        ],
        caution: '慎重さが"受け身"に見えることがあり、相手のチャレンジ提案に「今度ね」を重ねると、関係が停滞してしまうことがあります。',
        actionAdvice: [
            '"小さな変化クォータ"を月2回：新しい店/未経験ジャンルの映画など、低リスクの冒険を予定化',
            'ケアと言語化の両輪：相手が落ち込む日は温かい料理＋15分の傾聴',
            '安心の合言葉を決める：例「私たちは長距離走」'
        ]
    },
    '満月': {
        emoji: '🌕',
        title: '満月タイプの物語',
        introduction: 'あなたが生まれた夜空には、まん丸に輝く満月が、暗闇を余すことなく照らしていました。',
        symbolism: '満月は「光」「開放」「感情の豊かさ」を象徴します。',
        traits: [
            'まるで灯台のように、人を自然と惹きつける',
            '感情表現がストレートで、嬉しいときは全身で喜ぶ',
            '悲しいときは涙を隠さない正直さ',
            '信頼できる、一緒にいて心が温まる存在'
        ],
        loveStyle: '満月の恋は、花火が夜空に一気に開くようなスタート。出会った瞬間から距離を縮め、短期間で深い絆を築きます。',
        loveExamples: [
            '交際初期から「毎日おはようとおやすみのLINE」を欠かさない',
            '誕生日や記念日には全力でお祝いし、相手の喜ぶ顔を見たい一心で計画',
            '落ち込む相手を、笑わせようと冗談や行動で全力フォロー'
        ],
        caution: '感情の波が大きいため、熱が冷めると急に距離を置く傾向も。相手を不安にさせやすい面があります。',
        actionAdvice: [
            '愛を受け取る練習：デート計画を相手に任せてみる',
            '月に1〜2回は「自分から誘わない日」を意識的に作る',
            '感情のピークは"一晩保管"ルール：翌朝読み返してから送信'
        ]
    },
    '十六夜': {
        emoji: '🌖',
        title: '十六夜タイプの物語',
        introduction: 'あなたが生まれた夜空に浮かんでいたのは、満月の翌日に少しだけ欠け始めた十六夜の月。',
        symbolism: '十六夜は「成熟」「余裕」「引き際の美学」を象徴します。',
        traits: [
            '一歩引いて全体を見渡す視点',
            '物事を円滑に進める調整力',
            '大きな声で主張しなくても存在感がある',
            '人間関係の温度を一定に保つことができる'
        ],
        loveStyle: '十六夜の恋は、静かで安定的な炎。相手をよく観察し、過剰なアプローチや押しすぎはしません。',
        loveExamples: [
            '会いたい気持ちがあっても、相手の疲れや予定を優先して連絡を控える',
            '記念日やサプライズよりも、日常の中で相手が喜ぶ行動を選ぶ',
            '喧嘩になりそうな時は沈黙を選び、時間をおいて冷静な話し合いに持ち込む'
        ],
        caution: 'あまりに落ち着きすぎて「本当に好きなのかな？」と思われたり、情熱が見えにくくなることも。',
        actionAdvice: [
            '"半歩前進デー"を設定：月に1回は、自分からデートや旅行の提案をする',
            '感情を"見える形"で渡す習慣：手紙・短いメッセージで普段言わない気持ちを可視化',
            '"思い出トリガー"を活用：過去の楽しかったデートを時々引っ張り出して共有'
        ]
    },
    '下弦の月': {
        emoji: '🌗',
        title: '下弦の月タイプの物語',
        introduction: 'あなたが生まれた夜空には、左半分がくっきりと光る下弦の月。',
        symbolism: '下弦は「整理」「収束」「安定化」を象徴します。',
        traits: [
            '情報・感情・出来事を冷静に整理する力',
            '物事を引き算で整える',
            '流行や感情に左右されず、自分の軸を持つ',
            '他人の感情を受け止めつつも、飲み込まれない距離感'
        ],
        loveStyle: '下弦の恋は、じっくり熟成型。急速な距離の詰め方よりも、お互いの信頼を積み上げてから深まります。',
        loveExamples: [
            '連絡は適度、相手の生活リズムを尊重して返す',
            '相手が落ち込んでいても、必要以上に踏み込まず、そばにいる安心感を与える',
            '交際が安定期に入ると、会う頻度や過ごし方も心地よいパターンに定着'
        ],
        caution: '変化を求められたり、強い感情表現を受けると「自分のペースを乱される」と感じやすい傾向があります。',
        actionAdvice: [
            '"変化体験"を月1回だけ入れる：普段の安定デートに加え、新しい場所や体験を試す',
            '感情を"事実の前"に話す：提案や整理よりも先に感情を一言添える',
            '"予定なし時間"を一緒に過ごす訓練：ゴールのないデートを月に1回'
        ]
    },
    '暁': {
        emoji: '🌘',
        title: '暁タイプの物語',
        introduction: 'あなたが生まれた夜空は、月が沈み、夜明け前の静けさが世界を包んでいました。',
        symbolism: '暁は「終わりと始まりの境目」「静かな内省」「次のステージへの準備」を象徴します。',
        traits: [
            '深く考える力と、物事を静かに整えていく力',
            '感情を外に激しく出すより、まず内側で整理',
            'じっくり考えてから行動する',
            '本当に大切だと思える相手やことだけを選び抜く'
        ],
        loveStyle: '暁の恋は、静かに深まる水脈のよう。一気に燃え上がるよりも、少しずつ心を許し、時間をかけて絆を強くしていきます。',
        loveExamples: [
            '連絡頻度は少なめでも、会ったときの時間密度は濃い',
            '相手の感情にすぐ反応せず、まずは聞いて受け止めてから返す',
            'デートは落ち着いた場所や二人きりになれる空間を好む'
        ],
        caution: 'テンポの速い恋愛や、感情表現の激しい相手とは、ペースの違いで疲れやすい傾向があります。',
        actionAdvice: [
            '"半歩先アクション"を習慣化：自分からも軽い提案を月2回する',
            '感情の"事前シグナル"を出す：考える時間が必要なときは一言添える',
            '月1回"オープンデー"を設定：その日は意識的に自分の気持ちを多めに話す'
        ]
    }
};

// 月齢から月タイプへのマッピング
const moonPhaseRanges = [
    { type: '新月', range: [0, 3.7] },
    { type: '三日月', range: [3.7, 7.4] },
    { type: '上弦の月', range: [7.4, 11.1] },
    { type: '十三夜', range: [11.1, 14.8] },
    { type: '満月', range: [14.8, 18.5] },
    { type: '十六夜', range: [18.5, 22.1] },
    { type: '下弦の月', range: [22.1, 25.8] },
    { type: '暁', range: [25.8, 29.53] }
];

// 月齢を計算
function calculateMoonAge(date) {
    const referenceDate = new Date('2000-01-06 18:14:00');
    const lunarCycle = 29.53059;
    const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
    let moonAge = daysDiff % lunarCycle;
    if (moonAge < 0) moonAge += lunarCycle;
    return Math.round(moonAge * 10) / 10;
}

// 月齢から月タイプを判定
function getMoonTypeFromAge(moonAge) {
    for (const phase of moonPhaseRanges) {
        if (moonAge >= phase.range[0] && moonAge < phase.range[1]) {
            return phase.type;
        }
    }
    return '新月';
}

// 診断実行
function diagnose() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    
    if (!year || !month || !day) {
        alert('誕生日を選択してください');
        return;
    }
    
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(birthdate + ' 00:00:00');
    const moonAge = calculateMoonAge(date);
    const moonType = getMoonTypeFromAge(moonAge);
    const moonData = moonTypes[moonType];
    
    displayResult(moonType, moonData, birthdate);
}

// 診断結果を表示
function displayResult(moonType, moonData, birthdate) {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    inputSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    resultSection.innerHTML = `
        <div class="moon-type-card">
            <div class="moon-emoji">${moonData.emoji}</div>
            <div class="moon-type-name">${moonType}タイプ</div>
            <div class="moon-type-title">${moonData.title}</div>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>📖</span>
                <span>あなたの物語</span>
            </div>
            <div class="description-text">
                ${moonData.introduction}<br><br>
                ${moonData.symbolism}
            </div>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>✨</span>
                <span>あなたの特徴</span>
            </div>
            <ul class="traits-list">
                ${moonData.traits.map(trait => `<li>${trait}</li>`).join('')}
            </ul>
        </div>
        
        <div class="description-box love-style-box">
            <div class="description-title">
                <span>💕</span>
                <span>恋愛スタイル</span>
            </div>
            <div class="description-text">
                ${moonData.loveStyle}
            </div>
        </div>
        
        <div class="description-box examples-box">
            <div class="description-title">
                <span>💭</span>
                <span>恋愛での具体例</span>
            </div>
            <ul class="traits-list">
                ${moonData.loveExamples.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>⚠️</span>
                <span>気をつけたいこと</span>
            </div>
            <div class="description-text">
                ${moonData.caution}
            </div>
        </div>
        
        <div class="description-box advice-box">
            <div class="description-title">
                <span>💡</span>
                <span>今すぐできる改善アクション</span>
            </div>
            <ul class="traits-list">
                ${moonData.actionAdvice.map(advice => `<li>${advice}</li>`).join('')}
            </ul>
        </div>
        
        <div class="share-section">
            <p class="share-text">診断結果をシェアする</p>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`私は${moonType}タイプでした！🌙\n\nおつきさま診断で自分の本当の性格と恋愛スタイルがわかる✨\n`)}&url=${encodeURIComponent(window.location.href)}" 
                   target="_blank" 
                   class="share-btn share-twitter">
                    Xでシェア
                </a>
                <a href="https://line.me/R/msg/text/?${encodeURIComponent(`私は${moonType}タイプでした！🌙\n\nおつきさま診断で自分の本当の性格と恋愛スタイルがわかる✨\n${window.location.href}`)}" 
                   target="_blank" 
                   class="share-btn share-line">
                    LINEでシェア
                </a>
            </div>
        </div>
        
        <button class="btn-retry" onclick="retry()">
            もう一度診断する
        </button>
    `;
}

// もう一度診断
function retry() {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    inputSection.style.display = 'block';
    resultSection.style.display = 'none';
    
    document.getElementById('year').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
}

// セレクトボックスにオプションを追加
function populateDateSelectors() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    // 年のオプション（1900年から今年まで）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // 月のオプション
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    
    // 日のオプション（最初は31日まで）
    updateDays();
    
    // 月や年が変更されたら日を更新
    yearSelect.addEventListener('change', updateDays);
    monthSelect.addEventListener('change', updateDays);
}

// 日のオプションを更新
function updateDays() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    
    // 選択された月の最大日数を取得
    let maxDays = 31;
    if (month) {
        if (month === 2) {
            // うるう年の判定
            if (year && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
                maxDays = 29;
            } else {
                maxDays = 28;
            }
        } else if ([4, 6, 9, 11].includes(month)) {
            maxDays = 30;
        }
    }
    
    // 現在の選択値を保存
    const currentDay = daySelect.value;
    
    // 日のオプションをクリアして再生成
    daySelect.innerHTML = '<option value="">日</option>';
    for (let day = 1; day <= maxDays; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
    
    // 可能であれば以前の選択値を復元
    if (currentDay && currentDay <= maxDays) {
        daySelect.value = currentDay;
    }
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // セレクトボックスを初期化
    populateDateSelectors();
    
    // Enterキーで診断実行
    const selects = ['year', 'month', 'day'];
    selects.forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                diagnose();
            }
        });
    });
});