// 月相占いエンジン
// 月の満ち欠けに基づく恋愛相性診断

class MoonFortuneEngine {
  constructor() {
    // 月相タイプの定義
    this.moonPhaseTypes = {
      newMoon: {
        name: '新月タイプ',
        phase: [0, 45],
        symbol: '🌑',
        traits: '新たなる始まりを求める冒険者',
        description: '月が告げています。直感力が鋭く、常に新しいことにチャレンジする情熱的なタイプ。恋愛においても積極的で、運命的な出会いを信じています。',
        keywords: ['情熱', '直感', '冒険', '始まり', 'チャレンジ']
      },
      waxingCrescent: {
        name: '三日月タイプ',
        phase: [45, 90],
        symbol: '🌒',
        traits: '成長と希望の追求者',
        description: '月が導いています。希望に満ちた楽観主義者。少しずつ関係を深めていくことを好み、相手の成長を見守ることに喜びを感じます。',
        keywords: ['希望', '成長', '楽観', '見守る', '育む']
      },
      firstQuarter: {
        name: '上弦の月タイプ',
        phase: [90, 135],
        symbol: '🌓',
        traits: '決断力のあるリーダー',
        description: '月が囁いています。強い意志と決断力を持つリーダータイプ。恋愛では主導権を握ることが多く、相手を引っ張っていく力があります。',
        keywords: ['決断', 'リーダー', '意志', '主導', '力強さ']
      },
      waxingGibbous: {
        name: '満ちゆく月タイプ',
        phase: [135, 180],
        symbol: '🌔',
        traits: '完璧を求める努力家',
        description: '月が照らしています。理想が高く、完璧を求める努力家。恋愛においても真剣で、相手との関係を大切に育てていきます。',
        keywords: ['完璧', '努力', '理想', '真剣', '大切']
      },
      fullMoon: {
        name: '満月タイプ',
        phase: [180, 225],
        symbol: '🌕',
        traits: 'カリスマ性のある表現者',
        description: '満月が輝いています。明るく華やかで、人を惹きつける魅力があります。感情表現が豊かで、愛情を惜しみなく相手に注ぎます。',
        keywords: ['カリスマ', '魅力', '華やか', '表現', '愛情']
      },
      waningGibbous: {
        name: '欠けゆく月タイプ',
        phase: [225, 270],
        symbol: '🌖',
        traits: '知恵と経験の伝道者',
        description: '月が教えています。経験豊富で落ち着いた大人の魅力を持つタイプ。相手を包み込むような優しさで、安心感を与えます。',
        keywords: ['知恵', '経験', '落ち着き', '優しさ', '安心']
      },
      lastQuarter: {
        name: '下弦の月タイプ',
        phase: [270, 315],
        symbol: '🌗',
        traits: '内省的な思索家',
        description: '月が示しています。深い思考力と洞察力を持つ哲学者タイプ。恋愛では慎重で、相手の本質を見極めようとします。',
        keywords: ['内省', '思索', '洞察', '慎重', '本質']
      },
      waningCrescent: {
        name: '逆三日月タイプ',
        phase: [315, 360],
        symbol: '🌘',
        traits: '直感力の高い神秘家',
        description: '月が導いています。ミステリアスな魅力を持ち、直感力が非常に高いタイプ。深い精神的な繋がりを求める恋愛をします。',
        keywords: ['神秘', '直感', 'ミステリアス', '精神性', '深い繋がり']
      }
    };

    // 相性マトリックス（0-100のスコア）
    this.compatibilityMatrix = {
      'newMoon-newMoon': 75,
      'newMoon-waxingCrescent': 85,
      'newMoon-firstQuarter': 70,
      'newMoon-waxingGibbous': 65,
      'newMoon-fullMoon': 95,
      'newMoon-waningGibbous': 60,
      'newMoon-lastQuarter': 55,
      'newMoon-waningCrescent': 80,
      
      'waxingCrescent-waxingCrescent': 80,
      'waxingCrescent-firstQuarter': 75,
      'waxingCrescent-waxingGibbous': 90,
      'waxingCrescent-fullMoon': 85,
      'waxingCrescent-waningGibbous': 70,
      'waxingCrescent-lastQuarter': 60,
      'waxingCrescent-waningCrescent': 65,
      
      'firstQuarter-firstQuarter': 70,
      'firstQuarter-waxingGibbous': 80,
      'firstQuarter-fullMoon': 75,
      'firstQuarter-waningGibbous': 85,
      'firstQuarter-lastQuarter': 95,
      'firstQuarter-waningCrescent': 60,
      
      'waxingGibbous-waxingGibbous': 85,
      'waxingGibbous-fullMoon': 90,
      'waxingGibbous-waningGibbous': 75,
      'waxingGibbous-lastQuarter': 70,
      'waxingGibbous-waningCrescent': 65,
      
      'fullMoon-fullMoon': 80,
      'fullMoon-waningGibbous': 85,
      'fullMoon-lastQuarter': 70,
      'fullMoon-waningCrescent': 75,
      
      'waningGibbous-waningGibbous': 90,
      'waningGibbous-lastQuarter': 80,
      'waningGibbous-waningCrescent': 70,
      
      'lastQuarter-lastQuarter': 85,
      'lastQuarter-waningCrescent': 75,
      
      'waningCrescent-waningCrescent': 90
    };
  }

  // 生年月日から月相を計算
  calculateMoonPhase(birthDate, birthTime = '00:00') {
    const date = new Date(birthDate + ' ' + birthTime);
    
    // 基準日（新月）: 2000年1月6日
    const referenceDate = new Date('2000-01-06 18:14:00');
    const lunarCycle = 29.53059; // 朔望月（日）
    
    // 経過日数を計算
    const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
    
    // 月相を計算（0-360度）
    const moonPhase = ((daysDiff % lunarCycle) / lunarCycle) * 360;
    
    return moonPhase >= 0 ? moonPhase : moonPhase + 360;
  }

  // 月相から月相タイプを取得
  getMoonPhaseType(moonPhase) {
    for (const [key, type] of Object.entries(this.moonPhaseTypes)) {
      const [min, max] = type.phase;
      if (moonPhase >= min && moonPhase < max) {
        return { key, ...type, moonPhase };
      }
    }
    // 360度に近い場合は新月
    return { key: 'newMoon', ...this.moonPhaseTypes.newMoon, moonPhase };
  }

  // 月齢を計算
  calculateMoonAge(moonPhase) {
    return (moonPhase / 360) * 29.53059;
  }

  // 輝面比を計算
  calculateIllumination(moonPhase) {
    return (1 - Math.cos(moonPhase * Math.PI / 180)) / 2 * 100;
  }

  // 相性を計算
  calculateCompatibility(userType, partnerType) {
    const key1 = `${userType.key}-${partnerType.key}`;
    const key2 = `${partnerType.key}-${userType.key}`;
    
    const baseScore = this.compatibilityMatrix[key1] || this.compatibilityMatrix[key2] || 70;
    
    // 月相の差による微調整
    const phaseDiff = Math.abs(userType.moonPhase - partnerType.moonPhase);
    const harmony = phaseDiff > 180 ? 360 - phaseDiff : phaseDiff;
    
    // 調和度による補正（0-10点）
    const harmonyBonus = (180 - harmony) / 18;
    
    return Math.min(100, baseScore + harmonyBonus);
  }

  // 相性の説明を生成
  getCompatibilityDescription(score) {
    if (score >= 90) {
      return {
        level: '最高の相性',
        description: '月の導きが示す、運命的な結びつきです。互いの魂が深いレベルで共鳴し合う、稀有な関係性です。'
      };
    } else if (score >= 80) {
      return {
        level: '素晴らしい相性',
        description: '月のリズムが美しく調和する関係です。お互いの長所を引き出し合い、成長できる理想的なパートナーシップです。'
      };
    } else if (score >= 70) {
      return {
        level: '良好な相性',
        description: '安定した関係を築ける相性です。お互いを理解し尊重することで、より深い絆を育むことができます。'
      };
    } else if (score >= 60) {
      return {
        level: '標準的な相性',
        description: '努力次第で良い関係を築けます。相手の価値観を理解し、歩み寄ることが大切です。'
      };
    } else {
      return {
        level: 'チャレンジングな相性',
        description: '違いを認め合うことで成長できる関係です。互いの個性を尊重し、新しい視点を得られます。'
      };
    }
  }

  // 今月の運勢を生成
  generateMonthlyFortune(userType, currentDate = new Date()) {
    const currentPhase = this.calculateMoonPhase(
      currentDate.toISOString().split('T')[0],
      currentDate.toTimeString().split(' ')[0]
    );
    
    const currentType = this.getMoonPhaseType(currentPhase);
    
    // ユーザーの月相タイプと現在の月相の関係から運勢を決定
    const compatibility = this.calculateCompatibility(userType, currentType);
    
    return {
      currentMoonPhase: currentType.name,
      currentMoonSymbol: currentType.symbol,
      fortune: this.getMonthlyFortuneMessage(compatibility),
      luckyDays: this.calculateLuckyDays(userType, currentDate),
      cautionDays: this.calculateCautionDays(userType, currentDate)
    };
  }

  // 月の運勢メッセージ
  getMonthlyFortuneMessage(compatibility) {
    if (compatibility >= 80) {
      return {
        level: '絶好調',
        message: '月のエネルギーがあなたを強力にサポートします。積極的に行動することで、素晴らしい結果が期待できるでしょう。'
      };
    } else if (compatibility >= 60) {
      return {
        level: '好調',
        message: '月の力が安定してあなたを支えています。自然体で過ごすことで、良い流れを引き寄せられます。'
      };
    } else {
      return {
        level: '充電期',
        message: '月のエネルギーが内面に向かう時期です。無理をせず、自分自身と向き合う時間を大切にしましょう。'
      };
    }
  }

  // ラッキーデーを計算
  calculateLuckyDays(userType, currentDate) {
    const luckyDays = [];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // 月相タイプに応じたラッキーな月相を計算
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      
      const phase = this.calculateMoonPhase(
        date.toISOString().split('T')[0]
      );
      const dayType = this.getMoonPhaseType(phase);
      
      // 相性が良い日をラッキーデーとする
      const compatibility = this.calculateCompatibility(userType, dayType);
      if (compatibility >= 85) {
        luckyDays.push({
          date: day,
          moonPhase: dayType.symbol,
          advice: this.getLuckyDayAdvice(userType, dayType)
        });
      }
    }
    
    return luckyDays.slice(0, 3); // 最大3日まで
  }

  // 注意日を計算
  calculateCautionDays(userType, currentDate) {
    const cautionDays = [];
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      
      const phase = this.calculateMoonPhase(
        date.toISOString().split('T')[0]
      );
      const dayType = this.getMoonPhaseType(phase);
      
      // 相性が低い日を注意日とする
      const compatibility = this.calculateCompatibility(userType, dayType);
      if (compatibility <= 60) {
        cautionDays.push({
          date: day,
          moonPhase: dayType.symbol,
          advice: this.getCautionDayAdvice(userType, dayType)
        });
      }
    }
    
    return cautionDays.slice(0, 2); // 最大2日まで
  }

  // ラッキーデーのアドバイス
  getLuckyDayAdvice(userType, dayType) {
    const advices = [
      '告白や重要な話し合いに最適な日',
      'デートや特別な時間を過ごすのに適した日',
      '新しい出会いが期待できる日',
      '関係を深めるチャンスの日'
    ];
    return advices[Math.floor(Math.random() * advices.length)];
  }

  // 注意日のアドバイス
  getCautionDayAdvice(userType, dayType) {
    const advices = [
      '感情的になりやすいので冷静さを保って',
      'すれ違いが起きやすいので丁寧なコミュニケーションを',
      '無理をせずゆったりと過ごすことが大切',
      '相手の気持ちを尊重する姿勢が重要'
    ];
    return advices[Math.floor(Math.random() * advices.length)];
  }

  // 無料版レポート生成
  generateFreeReport(userProfile, partnerProfile) {
    // ユーザーの月相タイプ
    const userPhase = this.calculateMoonPhase(userProfile.birthDate, userProfile.birthTime);
    const userType = this.getMoonPhaseType(userPhase);
    const userAge = this.calculateMoonAge(userPhase);
    const userIllumination = this.calculateIllumination(userPhase);
    
    // パートナーの月相タイプ
    const partnerPhase = this.calculateMoonPhase(partnerProfile.birthDate, partnerProfile.birthTime);
    const partnerType = this.getMoonPhaseType(partnerPhase);
    const partnerAge = this.calculateMoonAge(partnerPhase);
    const partnerIllumination = this.calculateIllumination(partnerPhase);
    
    // 相性計算
    const compatibility = this.calculateCompatibility(userType, partnerType);
    const compatibilityDesc = this.getCompatibilityDescription(compatibility);
    
    // 今月の運勢
    const monthlyFortune = this.generateMonthlyFortune(userType);
    
    return {
      user: {
        moonPhaseType: userType,
        moonAge: userAge.toFixed(2),
        illumination: userIllumination.toFixed(1),
        birthDate: userProfile.birthDate
      },
      partner: {
        moonPhaseType: partnerType,
        moonAge: partnerAge.toFixed(2),
        illumination: partnerIllumination.toFixed(1),
        birthDate: partnerProfile.birthDate
      },
      compatibility: {
        score: compatibility.toFixed(0),
        level: compatibilityDesc.level,
        description: compatibilityDesc.description,
        advice: this.generateRelationshipAdvice(userType, partnerType, compatibility)
      },
      monthlyFortune: monthlyFortune,
      teaser: {
        title: '🌙 プレミアムレポートで分かること',
        items: [
          '二人の詳細な月相相性分析',
          '今後3ヶ月の関係性予測',
          '最適なコミュニケーション方法',
          'ベストタイミングカレンダー',
          '関係改善の具体的アクション'
        ]
      }
    };
  }

  // 関係性へのアドバイス生成
  generateRelationshipAdvice(userType, partnerType, compatibility) {
    const advices = [];
    
    // 相性レベルに応じた基本アドバイス
    if (compatibility >= 80) {
      advices.push('月が告げています。素晴らしき調和が二人の間に流れています。自然体でいることこそが、縁をより深める鍵になるでしょう。');
    } else if (compatibility >= 70) {
      advices.push('月が語りかけています。良き調和が二人を結びつけています。お互いの違いを認め合うことで、より豊かな縁が紡がれるでしょう。');
    } else {
      advices.push('月の導きが示しています。お互いの個性を大切にし、新たなる学びの機会として受け入れることで、意外なる絆が芽生えるかもしれません。');
    }
    
    // タイプ別の具体的アドバイス
    if (userType.key === 'newMoon' && partnerType.key === 'fullMoon') {
      advices.push('月が囁いています。あなたの冒険心と、相手の表現力が美しき調和を奏でるでしょう。');
    } else if (userType.key === 'fullMoon' && partnerType.key === 'newMoon') {
      advices.push('満月が照らす道。あなたの輝きが、相手の新たなる挑戦を優しく照らし出すことでしょう。');
    }
    
    // 月相の差によるアドバイス
    const phaseDiff = Math.abs(userType.moonPhase - partnerType.moonPhase);
    if (phaseDiff > 170 && phaseDiff < 190) {
      advices.push('月の神秘が明かす真実。正反対の月相を持つ二人は、互いに足りない部分を補い合う、理想の縁で結ばれています。');
    } else if (phaseDiff < 30) {
      advices.push('月が囁く優しき言葉。似た月相を持つ二人は、共に感じ、共に歩む、安らぎの縁を築けるでしょう。');
    }
    
    return advices;
  }

  // FlexメッセージカードF生成（LINE表示用）
  createFlexMessageCard(report) {
    return {
      type: 'flex',
      altText: '🌙 月の相性診断結果',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#1a0033',
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '🌙 おつきさま相性診断',
              color: '#ffffff',
              size: 'xl',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: '〜 月の満ち欠けが紡ぐ二人の運命 〜',
              color: '#e0e0e0',
              size: 'xs',
              align: 'center',
              margin: 'sm'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'lg',
          paddingAll: '20px',
          contents: [
            // 月相の表示
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              backgroundColor: '#f8f4ff',
              cornerRadius: '12px',
              paddingAll: '15px',
              contents: [
                {
                  type: 'text',
                  text: '✨ 二人の月相',
                  color: '#764ba2',
                  size: 'md',
                  weight: 'bold'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  margin: 'md',
                  contents: [
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: report.user.moonPhaseType.symbol,
                          size: 'xxl',
                          flex: 0
                        },
                        {
                          type: 'box',
                          layout: 'vertical',
                          margin: 'md',
                          flex: 1,
                          contents: [
                            {
                              type: 'text',
                              text: 'あなた',
                              size: 'xs',
                              color: '#888888'
                            },
                            {
                              type: 'text',
                              text: report.user.moonPhaseType.name,
                              size: 'sm',
                              weight: 'bold',
                              color: '#333333'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: report.partner.moonPhaseType.symbol,
                          size: 'xxl',
                          flex: 0
                        },
                        {
                          type: 'box',
                          layout: 'vertical',
                          margin: 'md',
                          flex: 1,
                          contents: [
                            {
                              type: 'text',
                              text: 'お相手',
                              size: 'xs',
                              color: '#888888'
                            },
                            {
                              type: 'text',
                              text: report.partner.moonPhaseType.name,
                              size: 'sm',
                              weight: 'bold',
                              color: '#333333'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            // 相性スコア
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '💕 相性診断結果',
                  size: 'md',
                  weight: 'bold',
                  color: '#764ba2'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'md',
                  spacing: 'xs',
                  contents: [
                    {
                      type: 'box',
                      layout: 'horizontal',
                      contents: [
                        {
                          type: 'text',
                          text: '相性スコア',
                          size: 'sm',
                          color: '#888888',
                          flex: 0
                        },
                        {
                          type: 'text',
                          text: `${report.compatibility.score}%`,
                          size: 'xl',
                          weight: 'bold',
                          color: '#ff69b4',
                          align: 'end',
                          flex: 1
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'sm',
                      contents: [
                        {
                          type: 'box',
                          layout: 'vertical',
                          backgroundColor: '#ffc0cb',
                          height: '8px',
                          cornerRadius: '4px',
                          width: `${report.compatibility.score}%`
                        },
                        {
                          type: 'box',
                          layout: 'vertical',
                          backgroundColor: '#f0f0f0',
                          height: '8px',
                          width: `${100 - report.compatibility.score}%`
                        }
                      ]
                    },
                    {
                      type: 'text',
                      text: report.compatibility.level,
                      size: 'lg',
                      weight: 'bold',
                      color: '#667eea',
                      align: 'center',
                      margin: 'md'
                    }
                  ]
                }
              ]
            },
            // 診断メッセージ
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#fff4f4',
              cornerRadius: '8px',
              paddingAll: '12px',
              contents: [
                {
                  type: 'text',
                  text: report.compatibility.description,
                  wrap: true,
                  size: 'sm',
                  color: '#666666'
                }
              ]
            },
            // アドバイス
            {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '💫 恋愛アドバイス',
                  size: 'md',
                  weight: 'bold',
                  color: '#764ba2'
                },
                ...report.compatibility.advice.map(advice => ({
                  type: 'box',
                  layout: 'horizontal',
                  margin: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '•',
                      size: 'sm',
                      color: '#ff69b4',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: advice,
                      wrap: true,
                      size: 'sm',
                      color: '#666666',
                      margin: 'sm',
                      flex: 1
                    }
                  ]
                }))
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#f8f4ff',
          paddingAll: '15px',
          contents: [
            {
              type: 'text',
              text: '✨ もっと詳しい分析を見る',
              size: 'sm',
              color: '#764ba2',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: 'トーク履歴を送信でプレミアム診断',
              size: 'xs',
              color: '#888888',
              align: 'center',
              margin: 'xs'
            }
          ]
        }
      }
    };
  }

  // フォーマット済みレポート生成（LINE表示用）
  formatReportForLine(report) {
    const lines = [];
    
    lines.push('🌙 月相恋愛占い結果 🌙');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('');
    
    // あなたの月相
    lines.push(`【あなた】${report.user.moonPhaseType.symbol} ${report.user.moonPhaseType.name}`);
    lines.push(report.user.moonPhaseType.description);
    lines.push(`月齢: ${report.user.moonAge}日 | 輝面比: ${report.user.illumination}%`);
    lines.push('');
    
    // お相手の月相
    lines.push(`【お相手】${report.partner.moonPhaseType.symbol} ${report.partner.moonPhaseType.name}`);
    lines.push(report.partner.moonPhaseType.description);
    lines.push(`月齢: ${report.partner.moonAge}日 | 輝面比: ${report.partner.illumination}%`);
    lines.push('');
    
    // 相性診断
    lines.push('💫 相性診断');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push(`相性度: ${'★'.repeat(Math.floor(report.compatibility.score / 20))}${'☆'.repeat(5 - Math.floor(report.compatibility.score / 20))} ${report.compatibility.score}%`);
    lines.push(`【${report.compatibility.level}】`);
    lines.push(report.compatibility.description);
    lines.push('');
    
    // アドバイス
    lines.push('💝 アドバイス');
    lines.push('━━━━━━━━━━━━━━━');
    report.compatibility.advice.forEach(advice => {
      lines.push(`・${advice}`);
    });
    lines.push('');
    
    // 今月の運勢
    lines.push('📅 今月の運勢');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push(`現在の月相: ${report.monthlyFortune.currentMoonSymbol} ${report.monthlyFortune.currentMoonPhase}`);
    lines.push(`運勢: 【${report.monthlyFortune.fortune.level}】`);
    lines.push(report.monthlyFortune.fortune.message);
    lines.push('');
    
    // ラッキーデー
    if (report.monthlyFortune.luckyDays.length > 0) {
      lines.push('🌟 ラッキーデー');
      report.monthlyFortune.luckyDays.forEach(day => {
        lines.push(`${day.date}日 ${day.moonPhase} - ${day.advice}`);
      });
      lines.push('');
    }
    
    // 注意日
    if (report.monthlyFortune.cautionDays.length > 0) {
      lines.push('⚠️ 注意日');
      report.monthlyFortune.cautionDays.forEach(day => {
        lines.push(`${day.date}日 ${day.moonPhase} - ${day.advice}`);
      });
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

module.exports = MoonFortuneEngine;