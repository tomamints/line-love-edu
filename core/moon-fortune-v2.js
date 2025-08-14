// 月相占いエンジン V2
// aisyo.md の詳細な月タイプ診断を実装

class MoonFortuneEngineV2 {
  constructor() {
    // 8つの月タイプ定義（aisyo.mdベース）
    this.moonTypes = [
      '新月',      // 0
      '三日月',    // 1
      '上弦の月',  // 2
      '十三夜',    // 3
      '満月',      // 4
      '十六夜',    // 5
      '下弦の月',  // 6
      '暁'         // 7
    ];

    // 月齢から月タイプへのマッピング（V1との互換性を保つ）
    this.moonPhaseRanges = [
      { type: '新月', emoji: '🌑', range: [0, 3.7] },        // 旧: 新月タイプ (0-45°)
      { type: '三日月', emoji: '🌒', range: [3.7, 7.4] },    // 旧: 三日月タイプ (45-90°)
      { type: '上弦の月', emoji: '🌓', range: [7.4, 11.1] }, // 旧: 上弦の月タイプ (90-135°)
      { type: '十三夜', emoji: '🌔', range: [11.1, 14.8] },  // 旧: 満ちゆく月タイプ (135-180°)
      { type: '満月', emoji: '🌕', range: [14.8, 18.5] },    // 旧: 満月タイプ (180-225°)
      { type: '十六夜', emoji: '🌖', range: [18.5, 22.1] },  // 旧: 欠けゆく月タイプ (225-270°)
      { type: '下弦の月', emoji: '🌗', range: [22.1, 25.8] },// 旧: 下弦の月タイプ (270-315°)
      { type: '暁', emoji: '🌘', range: [25.8, 29.53] }      // 旧: 逆三日月タイプ (315-360°)
    ];

    // 相性マトリックス（aisyo.mdから）
    // ◎=95点、○=75点、△=55点
    this.compatibilityMatrix = {
      '新月': {
        '新月': 95, '三日月': 55, '上弦の月': 75, '十三夜': 95,
        '満月': 95, '十六夜': 75, '下弦の月': 55, '暁': 55
      },
      '三日月': {
        '新月': 55, '三日月': 95, '上弦の月': 95, '十三夜': 75,
        '満月': 75, '十六夜': 95, '下弦の月': 75, '暁': 55
      },
      '上弦の月': {
        '新月': 75, '三日月': 95, '上弦の月': 75, '十三夜': 75,
        '満月': 55, '十六夜': 55, '下弦の月': 95, '暁': 75
      },
      '十三夜': {
        '新月': 95, '三日月': 75, '上弦の月': 75, '十三夜': 95,
        '満月': 75, '十六夜': 55, '下弦の月': 55, '暁': 95
      },
      '満月': {
        '新月': 95, '三日月': 75, '上弦の月': 55, '十三夜': 75,
        '満月': 55, '十六夜': 95, '下弦の月': 75, '暁': 55
      },
      '十六夜': {
        '新月': 75, '三日月': 95, '上弦の月': 55, '十三夜': 55,
        '満月': 95, '十六夜': 95, '下弦の月': 75, '暁': 75
      },
      '下弦の月': {
        '新月': 55, '三日月': 75, '上弦の月': 95, '十三夜': 55,
        '満月': 75, '十六夜': 75, '下弦の月': 95, '暁': 95
      },
      '暁': {
        '新月': 55, '三日月': 55, '上弦の月': 75, '十三夜': 95,
        '満月': 55, '十六夜': 75, '下弦の月': 95, '暁': 95
      }
    };

    // 月タイプごとの詳細説明（aisyo.mdから抜粋）
    this.moonTypeDetails = {
      '新月': {
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

    // 相性の詳細説明
    this.compatibilityDetails = {
      95: {
        level: '◎ とても相性が良い',
        description: '月が告げています。お二人の波長は完璧に調和し、互いの魅力を最大限に引き出す関係です。'
      },
      75: {
        level: '○ 相性が良い',
        description: '月が導いています。お互いを成長させる良い関係。時に違いを感じても、それが新鮮な刺激となります。'
      },
      55: {
        level: '△ 普通',
        description: '月が示しています。異なる個性が出会うことで、新しい可能性が生まれます。理解と尊重が関係を深める鍵となるでしょう。'
      }
    };
  }

  // 月齢を計算（正確な天文学的計算）
  calculateMoonAge(date) {
    // 基準日（新月）: 2000年1月6日 18:14:00
    const referenceDate = new Date('2000-01-06 18:14:00');
    const lunarCycle = 29.53059; // 朔望月（日）
    
    // 経過日数を計算
    const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
    
    // 月齢を計算（0-29.53日）
    let moonAge = daysDiff % lunarCycle;
    if (moonAge < 0) moonAge += lunarCycle;
    
    return Math.round(moonAge * 10) / 10;
  }

  // 月齢から月タイプを判定
  getMoonTypeFromAge(moonAge) {
    for (const phase of this.moonPhaseRanges) {
      if (moonAge >= phase.range[0] && moonAge < phase.range[1]) {
        return {
          type: phase.type,
          emoji: phase.emoji
        };
      }
    }
    // デフォルト
    return {
      type: '新月',
      emoji: '🌑'
    };
  }

  // 生年月日から月タイプを取得
  getMoonTypeFromBirthdate(birthdate) {
    const date = new Date(birthdate);
    const moonAge = this.calculateMoonAge(date);
    return this.getMoonTypeFromAge(moonAge);
  }

  // 相性スコアを取得
  getCompatibilityScore(type1, type2) {
    return this.compatibilityMatrix[type1]?.[type2] || 55;
  }

  // 相性の詳細情報を生成
  getCompatibilityDetails(userType, partnerType) {
    const score = this.getCompatibilityScore(userType, partnerType);
    const baseDetails = this.compatibilityDetails[score] || this.compatibilityDetails[55];
    
    // aisyo.mdからの具体的な相性説明を追加
    const specificDetails = this.getSpecificCompatibilityAdvice(userType, partnerType);
    
    return {
      score,
      ...baseDetails,
      specific: specificDetails
    };
  }

  // 特定の組み合わせに対する詳細アドバイス
  getSpecificCompatibilityAdvice(userType, partnerType) {
    // aisyo.mdの相性説明から主要なパターンを実装
    const key = `${userType}-${partnerType}`;
    
    const adviceMap = {
      '新月-新月': {
        reason: '同じスピード感と熱量で走れる同志',
        example: '金曜夜に「明日温泉行かない？」と片方が言えば、すぐに荷造りしてGO',
        advice: '互いに刺激を与え合い、毎日がイベントのように過ごせます'
      },
      '新月-満月': {
        reason: '満月の温かさと感情表現が、新月の衝動を肯定し安心に変える',
        example: '新月が突然落ち込んでも、満月が全力で励まし、翌日には一緒に笑っている',
        advice: '二人の情熱が共鳴し、関係がより深まります'
      },
      '三日月-上弦の月': {
        reason: '上弦の行動力が三日月の慎重さを良い方向に引き上げる',
        example: '上弦が計画を立て、三日月が「それなら安心」と乗るデート',
        advice: '三日月は安心して一歩踏み出せるようになります'
      },
      '十三夜-暁': {
        reason: '暁の内省と深い対話が、十三夜の安心基盤にぴたり',
        example: '週末は各自の趣味→夜に1時間の深いおしゃべり',
        advice: '静けさ×滋養で心が満ちる関係'
      },
      // ... 他の組み合わせも追加
    };
    
    return adviceMap[key] || {
      reason: 'お互いの個性が調和する関係',
      example: 'それぞれの魅力を活かしながら成長できます',
      advice: '違いを認め合うことで、より深い絆が生まれるでしょう'
    };
  }

  // 今月の恋愛運を生成
  generateMonthlyFortune(userType, currentDate = new Date()) {
    const currentMoonAge = this.calculateMoonAge(currentDate);
    const currentMoonType = this.getMoonTypeFromAge(currentMoonAge);
    
    // 現在の月相と誕生月相の関係から運勢を決定
    const compatibility = this.getCompatibilityScore(userType, currentMoonType.type);
    
    return {
      currentMoon: {
        type: currentMoonType.type,
        emoji: currentMoonType.emoji
      },
      compatibility,
      fortune: this.getMonthlyFortuneMessage(userType, currentMoonType.type, compatibility),
      luckyDays: this.calculateLuckyDays(userType, currentDate),
      actionAdvice: this.getMonthlyActionAdvice(userType, currentDate)
    };
  }

  // 月間運勢メッセージ
  getMonthlyFortuneMessage(userType, currentType, compatibility) {
    const userDetails = this.moonTypeDetails[userType];
    const month = new Date().getMonth() + 1;
    
    if (compatibility >= 85) {
      return {
        level: '絶好調',
        message: `${month}月の${currentType}は、${userType}タイプのあなたに最高のエネルギーを注ぎます。${userDetails.traits[0]}という特性が最大限に発揮される時。`,
        advice: userDetails.actionAdvice[0]
      };
    } else if (compatibility >= 65) {
      return {
        level: '好調',
        message: `${month}月は安定した運気。${userType}タイプの持つ${userDetails.traits[1]}を活かすチャンスが訪れます。`,
        advice: userDetails.actionAdvice[1]
      };
    } else {
      return {
        level: '充電期',
        message: `${month}月は内面を見つめる時期。${userType}タイプの${userDetails.caution.substring(0, 30)}...に注意して過ごしましょう。`,
        advice: userDetails.actionAdvice[2]
      };
    }
  }

  // ラッキーデーを計算（より詳細に）
  calculateLuckyDays(userType, currentDate) {
    const luckyDays = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      
      const moonAge = this.calculateMoonAge(date);
      const dayType = this.getMoonTypeFromAge(moonAge);
      const compatibility = this.getCompatibilityScore(userType, dayType.type);
      
      if (compatibility >= 85) {
        luckyDays.push({
          date: day,
          moonType: dayType.type,
          emoji: dayType.emoji,
          advice: this.getLuckyDayAdvice(userType, dayType.type)
        });
      }
    }
    
    return luckyDays.slice(0, 3);
  }

  // ラッキーデーのアドバイス
  getLuckyDayAdvice(userType, dayMoonType) {
    const compatibility = this.getCompatibilityScore(userType, dayMoonType);
    
    if (compatibility >= 95) {
      return '最高の波動が訪れる日。大切な告白や決断に最適。';
    } else if (compatibility >= 85) {
      return '良い流れが期待できる日。積極的な行動が吉。';
    } else {
      return '穏やかに過ごすのが良い日。';
    }
  }

  // 月ごとの行動アドバイス
  getMonthlyActionAdvice(userType, currentDate) {
    const month = currentDate.getMonth() + 1;
    const userDetails = this.moonTypeDetails[userType];
    
    // 月と月タイプに応じた具体的なアドバイス
    const seasonalAdvice = {
      1: '新年の始まり。新しい関係性を築くチャンス。',
      2: 'バレンタイン月。素直な気持ちを伝える時期。',
      3: '春の訪れ。変化を受け入れる準備を。',
      4: '新しい出会いの季節。積極的に行動を。',
      5: '安定期。関係を深める良い時期。',
      6: '梅雨の時期。室内デートで親密度UP。',
      7: '夏の情熱。感情を素直に表現して。',
      8: '真夏の恋。思い出作りに最適。',
      9: '秋の始まり。落ち着いた関係構築を。',
      10: '実りの秋。関係の成果が見える時。',
      11: '深まる秋。内面的な繋がりを大切に。',
      12: '年末の振り返り。来年への準備期間。'
    };
    
    return {
      seasonal: seasonalAdvice[month],
      personal: userDetails.actionAdvice.slice(0, 2)
    };
  }

  // フォーマットされた診断結果を生成
  generateCompleteReading(userBirthdate, partnerBirthdate = null) {
    const userMoonType = this.getMoonTypeFromBirthdate(userBirthdate);
    const userDetails = this.moonTypeDetails[userMoonType.type];
    
    const result = {
      user: {
        moonType: userMoonType.type,
        emoji: userMoonType.emoji,
        story: {
          title: userDetails.title,
          introduction: userDetails.introduction,
          symbolism: userDetails.symbolism,
          traits: userDetails.traits,
          loveStyle: userDetails.loveStyle,
          examples: userDetails.loveExamples,
          caution: userDetails.caution,
          advice: userDetails.actionAdvice
        }
      },
      monthlyFortune: this.generateMonthlyFortune(userMoonType.type)
    };
    
    if (partnerBirthdate) {
      const partnerMoonType = this.getMoonTypeFromBirthdate(partnerBirthdate);
      const partnerDetails = this.moonTypeDetails[partnerMoonType.type];
      
      result.partner = {
        moonType: partnerMoonType.type,
        emoji: partnerMoonType.emoji,
        story: {
          title: partnerDetails.title,
          introduction: partnerDetails.introduction,
          traits: partnerDetails.traits.slice(0, 3),
          loveStyle: partnerDetails.loveStyle
        }
      };
      
      result.compatibility = this.getCompatibilityDetails(
        userMoonType.type,
        partnerMoonType.type
      );
    }
    
    return result;
  }
}

module.exports = MoonFortuneEngineV2;