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

  // オーラカラー検出（詳細な分析ロジック）
  detectAuraColor(messages) {
    const colors = {
      red: { name: '恋月の紅', meaning: '恋する心に宿る月の色', score: 0, keywords: [] },
      pink: { name: '恋月の紅', meaning: '優しい愛に包まれた月の色', score: 0, keywords: [] },
      orange: { name: '暖月の橙', meaning: '温かな月の光に包まれた色', score: 0, keywords: [] },
      yellow: { name: '希月の金', meaning: '希望に満ちた月の輝き', score: 0, keywords: [] },
      green: { name: '癒月の碧', meaning: '心を癒す月の光', score: 0, keywords: [] },
      blue: { name: '静月の藍', meaning: '静かに見守る月の深い色', score: 0, keywords: [] },
      purple: { name: '神月の紫', meaning: '神秘的な月の光が宿る色', score: 0, keywords: [] },
      white: { name: '煌月の銀', meaning: '清らかな月光の煌めき', score: 0, keywords: [] },
      gold: { name: '輝月の光', meaning: '満月の輝きそのもの', score: 0, keywords: [] }
    };

    // 詳細なキーワード定義と重み付け
    const keywordWeights = {
      red: {
        high: ['情熱', '欲望', '燃える', '熱い', '激しい'],
        medium: ['会いたい', '寂しい', '触れ', 'キス', 'ハグ'],
        low: ['赤', '火', '炎', '血']
      },
      pink: {
        high: ['愛してる', '大好き', '愛情', '優しさ', '思いやり'],
        medium: ['好き', '愛', '大切', '幸せ', 'ありがとう'],
        low: ['ピンク', 'ハート', '♡', '❤️']
      },
      orange: {
        high: ['冒険', '挑戦', 'チャレンジ', 'ワクワク', '創造'],
        medium: ['楽しい', '面白い', '新しい', '元気', '活発'],
        low: ['オレンジ', '夕日', '暖かい']
      },
      yellow: {
        high: ['賢い', '知的', '理論', '分析', '学習'],
        medium: ['明るい', '嬉しい', '笑顔', '楽しみ', 'ポジティブ'],
        low: ['黄色', '太陽', '光']
      },
      green: {
        high: ['癒し', '成長', '調和', '平和', 'バランス'],
        medium: ['感謝', '自然', '健康', '安心', '穏やか'],
        low: ['緑', '植物', '森']
      },
      blue: {
        high: ['誠実', '信頼', '真実', '深い', '静寂'],
        medium: ['理解', '冷静', '落ち着き', '心配', '不安'],
        low: ['青', '海', '空']
      },
      purple: {
        high: ['直感', '霊的', '神秘', '瞑想', '悟り'],
        medium: ['感じる', '察する', '理解', '共感', '深層'],
        low: ['紫', '神秘的', 'ミステリアス']
      },
      white: {
        high: ['純粋', '清らか', '新生', '浄化', '無垢'],
        medium: ['新しい', '始まり', 'リセット', 'クリア', '白紙'],
        low: ['白', '透明', '光']
      },
      gold: {
        high: ['悟り', '覚醒', '至福', '神聖', '永遠'],
        medium: ['一緒', '共に', '絆', '運命', '特別'],
        low: ['金', '輝き', '宝']
      }
    };

    // メッセージパターンからオーラを詳細分析
    messages.forEach(msg => {
      if (!msg || !msg.text) return;
      const text = msg.text.toLowerCase();
      
      // 各色のキーワードをチェック
      Object.entries(keywordWeights).forEach(([color, keywords]) => {
        keywords.high.forEach(keyword => {
          if (text.includes(keyword)) {
            colors[color].score += 3;
            colors[color].keywords.push(keyword);
          }
        });
        keywords.medium.forEach(keyword => {
          if (text.includes(keyword)) {
            colors[color].score += 2;
            colors[color].keywords.push(keyword);
          }
        });
        keywords.low.forEach(keyword => {
          if (text.includes(keyword)) {
            colors[color].score += 1;
            colors[color].keywords.push(keyword);
          }
        });
      });
      
      // 絵文字による追加スコアリング
      const emojiPatterns = {
        red: /[🔥❤️‍🔥💋]/g,
        pink: /[💕💖💗💝💓]/g,
        orange: /[🌅🎯🎨]/g,
        yellow: /[☀️😊😄🌟]/g,
        green: /[🌿🍃💚]/g,
        blue: /[💙🌊🌌]/g,
        purple: /[💜🔮✨]/g,
        white: /[⚪️🤍☁️]/g,
        gold: /[⭐️🌟✨]/g
      };
      
      Object.entries(emojiPatterns).forEach(([color, pattern]) => {
        const matches = text.match(pattern);
        if (matches) {
          colors[color].score += matches.length * 1.5;
        }
      });
    });

    // スコアがすべて0の場合のフォールバック処理
    const totalScore = Object.values(colors).reduce((sum, color) => sum + color.score, 0);
    
    if (totalScore === 0) {
      // メッセージの長さと頻度から推測
      const avgLength = messages.reduce((sum, msg) => sum + (msg.text?.length || 0), 0) / messages.length;
      const messageCount = messages.length;
      
      if (avgLength > 100) {
        colors.blue.score = 5; // 長文＝深い思考
        colors.purple.score = 3;
      } else if (avgLength < 30) {
        colors.yellow.score = 5; // 短文＝軽快
        colors.orange.score = 3;
      } else {
        colors.green.score = 5; // 中間＝バランス
        colors.pink.score = 3;
      }
      
      if (messageCount > 100) {
        colors.red.score += 2; // 多い＝情熱的
      }
    }

    // 最も強いオーラカラーを特定
    const sortedColors = Object.entries(colors)
      .sort((a, b) => b[1].score - a[1].score);
    
    const dominantColor = sortedColors[0];
    const secondaryColor = sortedColors[1];

    // 分析の信頼度を計算
    const confidence = Math.min(100, (dominantColor[1].score / Math.max(1, totalScore)) * 100);

    return {
      primary: dominantColor[1],
      secondary: secondaryColor[1],
      blend: this.createAuraBlend(dominantColor[0], secondaryColor[0]),
      confidence: Math.round(confidence),
      detectedKeywords: dominantColor[1].keywords.slice(0, 5) // トップ5キーワード
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