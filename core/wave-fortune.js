// 波動系恋愛占いエンジン

class WaveFortuneEngine {
  constructor() {
    this.waveTypes = {
      aura: 'オーラ波動',
      chakra: 'チャクラ波動',
      energy: '恋愛エネルギー波動',
      vibration: '魂の振動数',
      frequency: '愛の周波数'
    };
  }

  // メッセージから波動を分析
  analyzeWaveVibration(messages) {
    const analysis = {
      auraColor: this.detectAuraColor(messages),
      chakraBalance: this.analyzeChakraBalance(messages),
      energyFlow: this.measureEnergyFlow(messages),
      soulVibration: this.calculateSoulVibration(messages),
      loveFrequency: this.measureLoveFrequency(messages),
      compatibility: this.calculateWaveCompatibility(messages),
      blockages: this.detectEnergyBlockages(messages)
    };

    // healingは分析結果を使って生成（無限再帰を防ぐ）
    analysis.healing = this.suggestHealingMethodsFromAnalysis(analysis);

    return analysis;
  }

  // オーラカラー検出
  detectAuraColor(messages) {
    const colors = {
      red: { name: '情熱の赤', meaning: '強い愛情と欲求', score: 0 },
      pink: { name: 'ローズピンク', meaning: '無条件の愛と優しさ', score: 0 },
      orange: { name: '創造のオレンジ', meaning: '楽しさと冒険心', score: 0 },
      yellow: { name: '太陽の黄', meaning: '知性と明るさ', score: 0 },
      green: { name: '調和の緑', meaning: '癒しと成長', score: 0 },
      blue: { name: '真実の青', meaning: '誠実さと深い理解', score: 0 },
      purple: { name: '霊性の紫', meaning: '直感と精神性', score: 0 },
      white: { name: '純粋な白', meaning: '清らかさと新しい始まり', score: 0 },
      gold: { name: '黄金の光', meaning: '高次の愛と悟り', score: 0 }
    };

    // メッセージパターンからオーラを分析
    messages.forEach(msg => {
      if (!msg || !msg.text) return; // textが存在しない場合はスキップ
      const text = msg.text.toLowerCase();
      
      if (text.includes('愛') || text.includes('好き')) colors.pink.score += 2;
      if (text.includes('楽し') || text.includes('嬉し')) colors.yellow.score += 2;
      if (text.includes('ありがと') || text.includes('感謝')) colors.green.score += 2;
      if (text.includes('心配') || text.includes('不安')) colors.blue.score += 1;
      if (text.includes('会いたい') || text.includes('寂し')) colors.red.score += 2;
      if (text.includes('理解') || text.includes('分か')) colors.purple.score += 1;
      if (text.includes('一緒') || text.includes('共に')) colors.gold.score += 1;
      if (text.includes('新し') || text.includes('始')) colors.white.score += 1;
      if (text.includes('面白') || text.includes('冒険')) colors.orange.score += 1;
    });

    // 最も強いオーラカラーを特定
    const dominantColor = Object.entries(colors)
      .sort((a, b) => b[1].score - a[1].score)[0];

    // セカンダリーカラーも特定
    const secondaryColor = Object.entries(colors)
      .sort((a, b) => b[1].score - a[1].score)[1];

    return {
      primary: dominantColor[1],
      secondary: secondaryColor[1],
      blend: this.createAuraBlend(dominantColor[0], secondaryColor[0])
    };
  }

  // チャクラバランス分析
  analyzeChakraBalance(messages) {
    const chakras = [
      { 
        name: '第1チャクラ（ルート）',
        color: '赤',
        theme: '安定と信頼',
        balance: 50
      },
      {
        name: '第2チャクラ（仙骨）',
        color: 'オレンジ',
        theme: '情熱と創造性',
        balance: 50
      },
      {
        name: '第3チャクラ（太陽神経叢）',
        color: '黄',
        theme: '自信と力',
        balance: 50
      },
      {
        name: '第4チャクラ（ハート）',
        color: '緑/ピンク',
        theme: '愛と思いやり',
        balance: 50
      },
      {
        name: '第5チャクラ（喉）',
        color: '青',
        theme: 'コミュニケーション',
        balance: 50
      },
      {
        name: '第6チャクラ（第三の目）',
        color: '藍',
        theme: '直感と洞察',
        balance: 50
      },
      {
        name: '第7チャクラ（クラウン）',
        color: '紫/白',
        theme: '精神性と悟り',
        balance: 50
      }
    ];

    // メッセージパターンからチャクラバランスを計算
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.isUser);
    const partnerMessages = messages.filter(m => !m.isUser);

    // 各チャクラのバランスを評価
    chakras[0].balance = this.evaluateRootChakra(messages);
    chakras[1].balance = this.evaluateSacralChakra(messages);
    chakras[2].balance = this.evaluateSolarPlexus(messages);
    chakras[3].balance = this.evaluateHeartChakra(messages);
    chakras[4].balance = this.evaluateThroatChakra(messages);
    chakras[5].balance = this.evaluateThirdEye(messages);
    chakras[6].balance = this.evaluateCrownChakra(messages);

    return {
      chakras,
      overall: chakras.reduce((sum, c) => sum + c.balance, 0) / 7,
      strongest: chakras.sort((a, b) => b.balance - a.balance)[0],
      weakest: chakras.sort((a, b) => a.balance - b.balance)[0]
    };
  }

  // エネルギーフロー測定
  measureEnergyFlow(messages) {
    const flow = {
      incoming: 0,
      outgoing: 0,
      circulation: 0,
      blockages: [],
      peaks: []
    };

    // 時系列でエネルギーの流れを分析
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (!current || !next) continue;
      
      if (current.isUser && !next.isUser && current.text) {
        flow.outgoing += this.calculateMessageEnergy(current.text);
      } else if (!current.isUser && next.isUser && current.text) {
        flow.incoming += this.calculateMessageEnergy(current.text);
      }

      // エネルギーの停滞を検出
      if (current.timestamp && next.timestamp) {
        const timeDiff = new Date(next.timestamp) - new Date(current.timestamp);
        if (timeDiff > 24 * 60 * 60 * 1000) {
          flow.blockages.push({
            position: i,
            duration: timeDiff,
            type: 'temporal'
          });
        }
      }
    }

    if (flow.incoming > 0 && flow.outgoing > 0) {
      flow.circulation = Math.min(flow.incoming, flow.outgoing) / 
                        Math.max(flow.incoming, flow.outgoing) * 100;
    } else {
      flow.circulation = 50;
    }

    return flow;
  }

  // 魂の振動数計算
  calculateSoulVibration(messages) {
    const vibrations = {
      low: { range: '200-400Hz', meaning: '不安と恐れ', count: 0 },
      medium: { range: '400-600Hz', meaning: '中立と安定', count: 0 },
      high: { range: '600-800Hz', meaning: '愛と喜び', count: 0 },
      veryHigh: { range: '800Hz以上', meaning: '悟りと至福', count: 0 }
    };

    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      const frequency = this.textToFrequency(msg.text);
      if (frequency < 400) vibrations.low.count++;
      else if (frequency < 600) vibrations.medium.count++;
      else if (frequency < 800) vibrations.high.count++;
      else vibrations.veryHigh.count++;
    });

    const dominant = Object.entries(vibrations)
      .sort((a, b) => b[1].count - a[1].count)[0];

    return {
      current: dominant[1],
      average: this.calculateAverageVibration(messages),
      trend: this.calculateVibrationTrend(messages),
      recommendation: this.getVibrationRecommendation(dominant[0])
    };
  }

  // 愛の周波数測定
  measureLoveFrequency(messages) {
    const frequency = {
      hz: 528, // ソルフェジオ周波数（愛の周波数）
      intensity: 0,
      purity: 0,
      resonance: 0
    };

    const loveWords = ['愛', '好き', '大切', '大事', '幸せ', '嬉しい', '楽しい'];
    const negativeWords = ['嫌', '辛い', '悲しい', '寂しい', '不安'];

    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      const text = msg.text;
      loveWords.forEach(word => {
        if (text.includes(word)) frequency.intensity += 10;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) frequency.intensity -= 5;
      });
    });

    frequency.intensity = Math.max(0, Math.min(100, frequency.intensity));
    frequency.purity = this.calculatePurity(messages);
    frequency.resonance = this.calculateResonance(messages);

    return {
      ...frequency,
      harmonics: this.generateHarmonics(frequency),
      healing: frequency.intensity > 60 ? '高い癒し効果' : '癒しが必要'
    };
  }

  // 波動の相性計算
  calculateWaveCompatibility(messages) {
    const userWave = this.extractUserWave(messages);
    const partnerWave = this.extractPartnerWave(messages);

    const compatibility = {
      overall: 0,
      resonance: 0,
      harmony: 0,
      interference: [],
      synergy: []
    };

    // 共鳴度を計算
    compatibility.resonance = this.calculateResonanceBetween(userWave, partnerWave);
    
    // ハーモニー度を計算
    compatibility.harmony = this.calculateHarmony(userWave, partnerWave);
    
    // 全体的な相性
    compatibility.overall = (compatibility.resonance + compatibility.harmony) / 2;

    // 干渉パターンを検出
    if (compatibility.overall < 50) {
      compatibility.interference.push('エネルギーの不調和');
    }

    // シナジー効果を検出
    if (compatibility.overall > 70) {
      compatibility.synergy.push('相乗効果による波動上昇');
    }

    return compatibility;
  }

  // エネルギーブロックの検出
  detectEnergyBlockages(messages) {
    const blockages = [];

    // コミュニケーションの停滞
    const gaps = this.findCommunicationGaps(messages);
    gaps.forEach(gap => {
      if (gap.duration > 48 * 60 * 60 * 1000) {
        blockages.push({
          type: 'コミュニケーションブロック',
          severity: '中',
          location: '第5チャクラ（喉）',
          solution: '素直な気持ちを伝える'
        });
      }
    });

    // ネガティブエネルギーの蓄積
    const negativeCount = messages.filter(m => 
      this.isNegativeMessage(m.text)
    ).length;

    if (negativeCount > messages.length * 0.3) {
      blockages.push({
        type: 'ネガティブエネルギーの蓄積',
        severity: '高',
        location: '第4チャクラ（ハート）',
        solution: '感謝の気持ちを表現する'
      });
    }

    return blockages;
  }

  // 分析結果からヒーリング方法の提案
  suggestHealingMethodsFromAnalysis(analysis) {
    const methods = [];

    // オーラに基づくヒーリング
    if (analysis.auraColor.primary.name.includes('赤')) {
      methods.push({
        type: 'クリスタルヒーリング',
        stone: 'ローズクォーツ',
        effect: '愛のエネルギーを高める'
      });
    }

    // チャクラバランスに基づくヒーリング
    if (analysis.chakraBalance.weakest.balance < 30) {
      methods.push({
        type: 'チャクラ瞑想',
        focus: analysis.chakraBalance.weakest.name,
        duration: '毎日15分'
      });
    }

    // 周波数ヒーリング
    methods.push({
      type: 'ソルフェジオ周波数',
      frequency: '528Hz',
      effect: '愛と調和のバイブレーション'
    });

    // アロマテラピー
    methods.push({
      type: 'アロマテラピー',
      oil: this.recommendAromaOil(analysis),
      usage: 'ディフューザーで拡散'
    });

    return methods;
  }

  // ヘルパー関数群
  createAuraBlend(primary, secondary) {
    const blends = {
      'red-pink': '情熱的な愛',
      'pink-green': '優しい癒し',
      'blue-purple': '深い理解',
      'yellow-orange': '楽しい冒険',
      'green-blue': '安定した信頼',
      'purple-white': '精神的な結びつき',
      'gold-white': '神聖な愛'
    };

    const key = `${primary}-${secondary}`;
    return blends[key] || '独特なエネルギーブレンド';
  }

  evaluateRootChakra(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('安心') || msg.text.includes('信頼')) balance += 5;
      if (msg.text.includes('不安') || msg.text.includes('怖')) balance -= 5;
    });
    return Math.max(0, Math.min(100, balance));
  }

  evaluateSacralChakra(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('楽し') || msg.text.includes('創造')) balance += 5;
      if (msg.text.includes('退屈') || msg.text.includes('つまらない')) balance -= 5;
    });
    return Math.max(0, Math.min(100, balance));
  }

  evaluateSolarPlexus(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('自信') || msg.text.includes('できる')) balance += 5;
      if (msg.text.includes('無理') || msg.text.includes('できない')) balance -= 5;
    });
    return Math.max(0, Math.min(100, balance));
  }

  evaluateHeartChakra(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('愛') || msg.text.includes('好き')) balance += 7;
      if (msg.text.includes('嫌い') || msg.text.includes('憎')) balance -= 7;
    });
    return Math.max(0, Math.min(100, balance));
  }

  evaluateThroatChakra(messages) {
    const validMessages = messages.filter(m => m && m.text);
    if (validMessages.length === 0) return 50;
    const avgLength = validMessages.reduce((sum, m) => sum + m.text.length, 0) / validMessages.length;
    return Math.min(100, avgLength * 2);
  }

  evaluateThirdEye(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('感じ') || msg.text.includes('直感')) balance += 5;
      if (msg.text.includes('分からない') || msg.text.includes('混乱')) balance -= 5;
    });
    return Math.max(0, Math.min(100, balance));
  }

  evaluateCrownChakra(messages) {
    let balance = 50;
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      if (msg.text.includes('感謝') || msg.text.includes('悟')) balance += 5;
      if (msg.text.includes('執着') || msg.text.includes('欲')) balance -= 5;
    });
    return Math.max(0, Math.min(100, balance));
  }

  calculateMessageEnergy(text) {
    if (!text) return 0;
    return text.length * 10 + (text.match(/[!！♪♡❤️😊]/g) || []).length * 20;
  }

  textToFrequency(text) {
    if (!text) return 500;
    const positiveWords = ['愛', '好き', '嬉しい', '楽しい', '幸せ'];
    const negativeWords = ['嫌', '悲しい', '辛い', '苦しい'];
    
    let frequency = 500;
    positiveWords.forEach(word => {
      if (text.includes(word)) frequency += 100;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) frequency -= 100;
    });
    
    return frequency;
  }

  calculateAverageVibration(messages) {
    const validMessages = messages.filter(m => m && m.text);
    if (validMessages.length === 0) return 500;
    const total = validMessages.reduce((sum, msg) => 
      sum + this.textToFrequency(msg.text), 0
    );
    return Math.round(total / validMessages.length);
  }

  calculateVibrationTrend(messages) {
    if (messages.length < 2) return 'stable';
    
    const firstHalf = messages.slice(0, Math.floor(messages.length / 2));
    const secondHalf = messages.slice(Math.floor(messages.length / 2));
    
    const firstAvg = this.calculateAverageVibration(firstHalf);
    const secondAvg = this.calculateAverageVibration(secondHalf);
    
    if (secondAvg > firstAvg + 50) return '上昇中 ↑';
    if (secondAvg < firstAvg - 50) return '下降中 ↓';
    return '安定 →';
  }

  getVibrationRecommendation(level) {
    const recommendations = {
      low: '瞑想と深呼吸で波動を上げましょう',
      medium: 'ポジティブな言葉を増やしましょう',
      high: '素晴らしい波動です。維持しましょう',
      veryHigh: '最高の波動状態です'
    };
    return recommendations[level];
  }

  calculatePurity(messages) {
    const validMessages = messages.filter(m => m && m.text);
    if (validMessages.length === 0) return 50;
    const loveMessages = validMessages.filter(m => 
      m.text.includes('愛') || m.text.includes('好き')
    );
    return Math.min(100, (loveMessages.length / validMessages.length) * 200);
  }

  calculateResonance(messages) {
    let resonance = 50;
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      if (!current || !next) continue;
      
      if (current.isUser !== next.isUser && current.timestamp && next.timestamp) {
        const timeDiff = new Date(next.timestamp) - new Date(current.timestamp);
        if (timeDiff < 5 * 60 * 1000) resonance += 2; // 5分以内の返信
      }
    }
    return Math.min(100, resonance);
  }

  generateHarmonics(frequency) {
    return {
      first: frequency.hz,
      second: frequency.hz * 2,
      third: frequency.hz * 3,
      healing: frequency.hz * 1.5
    };
  }

  extractUserWave(messages) {
    const userMessages = messages.filter(m => m.isUser);
    return {
      frequency: this.calculateAverageVibration(userMessages),
      amplitude: userMessages.length,
      phase: 0
    };
  }

  extractPartnerWave(messages) {
    const partnerMessages = messages.filter(m => !m.isUser);
    return {
      frequency: this.calculateAverageVibration(partnerMessages),
      amplitude: partnerMessages.length,
      phase: 0
    };
  }

  calculateResonanceBetween(wave1, wave2) {
    const freqDiff = Math.abs(wave1.frequency - wave2.frequency);
    return Math.max(0, 100 - freqDiff / 10);
  }

  calculateHarmony(wave1, wave2) {
    const ratio = wave1.frequency / wave2.frequency;
    if (Math.abs(ratio - 1) < 0.1) return 100; // 完全な調和
    if (Math.abs(ratio - 1.5) < 0.1) return 80; // 5度の調和
    if (Math.abs(ratio - 2) < 0.1) return 70; // オクターブ
    return 50;
  }

  findCommunicationGaps(messages) {
    const gaps = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      if (!current || !next || !current.timestamp || !next.timestamp) continue;
      
      const timeDiff = new Date(next.timestamp) - new Date(current.timestamp);
      if (timeDiff > 24 * 60 * 60 * 1000) {
        gaps.push({ index: i, duration: timeDiff });
      }
    }
    return gaps;
  }

  isNegativeMessage(text) {
    if (!text) return false;
    const negativeWords = ['嫌', '悲しい', '辛い', '苦しい', '不安', '怖い'];
    return negativeWords.some(word => text.includes(word));
  }

  recommendAromaOil(analysis) {
    if (analysis.auraColor.primary.name.includes('赤')) return 'ローズ';
    if (analysis.auraColor.primary.name.includes('青')) return 'ラベンダー';
    if (analysis.auraColor.primary.name.includes('緑')) return 'ユーカリ';
    if (analysis.auraColor.primary.name.includes('黄')) return 'レモン';
    return 'サンダルウッド';
  }

  // 波動占い結果のフォーマット
  formatWaveFortuneResult(analysis) {
    return {
      title: '💫 波動恋愛診断結果',
      aura: {
        title: '🌈 あなたたちのオーラ',
        primary: `主要オーラ: ${analysis.auraColor.primary.name}`,
        meaning: analysis.auraColor.primary.meaning,
        secondary: `補助オーラ: ${analysis.auraColor.secondary.name}`,
        blend: `エネルギーブレンド: ${analysis.auraColor.blend}`
      },
      chakra: {
        title: '⚡ チャクラバランス',
        overall: `全体バランス: ${Math.round(analysis.chakraBalance.overall)}%`,
        strongest: `最強チャクラ: ${analysis.chakraBalance.strongest.name} (${analysis.chakraBalance.strongest.balance}%)`,
        weakest: `要強化チャクラ: ${analysis.chakraBalance.weakest.name} (${analysis.chakraBalance.weakest.balance}%)`,
        advice: analysis.chakraBalance.weakest.balance < 30 ? 
          '弱いチャクラの強化が必要です' : 'バランスは良好です'
      },
      vibration: {
        title: '🎵 魂の振動数',
        current: `現在の振動数: ${analysis.soulVibration.current.range}`,
        meaning: analysis.soulVibration.current.meaning,
        trend: `トレンド: ${analysis.soulVibration.trend}`,
        advice: analysis.soulVibration.recommendation
      },
      loveFrequency: {
        title: '💖 愛の周波数',
        intensity: `強度: ${analysis.loveFrequency.intensity}%`,
        purity: `純度: ${analysis.loveFrequency.purity}%`,
        resonance: `共鳴度: ${analysis.loveFrequency.resonance}%`,
        healing: analysis.loveFrequency.healing
      },
      compatibility: {
        title: '🔮 波動相性',
        overall: `総合相性: ${Math.round(analysis.compatibility.overall)}%`,
        resonance: `共鳴度: ${Math.round(analysis.compatibility.resonance)}%`,
        harmony: `調和度: ${Math.round(analysis.compatibility.harmony)}%`,
        message: analysis.compatibility.overall > 70 ? 
          '素晴らしい波動の調和！' : '波動の調整が必要かもしれません'
      },
      healing: {
        title: '🌟 推奨ヒーリング',
        methods: analysis.healing.map(h => `${h.type}: ${h.effect || h.usage || h.duration || ''}`).join('\n')
      },
      blockages: {
        title: '⚠️ エネルギーブロック',
        list: analysis.blockages.length > 0 ? 
          analysis.blockages.map(b => `${b.type}: ${b.solution}`).join('\n') :
          'ブロックは検出されませんでした'
      }
    };
  }
}

module.exports = WaveFortuneEngine;