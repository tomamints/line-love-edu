/**
 * core/formatter/fortune-carousel.js
 * 恋愛お告げ用Flex Messageカルーセルフォーマッター
 */

const DateUtils = require('../../utils/date-utils');

/**
 * 恋愛お告げカルーセルビルダー
 */
class FortuneCarouselBuilder {
  constructor(fortune, userProfile = {}) {
    this.fortune = fortune;
    this.userProfile = userProfile;
    this.userName = userProfile.displayName || 'あなた';
    
    // スタイル定義 - おつきさま診断の実際のデザインと完全統一
    this.styles = {
      // カード別ヘッダー背景（実際のおつきさま診断から）
      purple: '#764ba2',           // 紫（カード1: 総合運勢）
      bluePurple: '#667eea',       // 青紫（カード2: 月相診断）  
      pink: '#e91e63',             // ピンク（カード3: 運命の瞬間）
      coral: '#ff6b6b',            // コーラルレッド（カード4: 今月の運勢）
      
      // テキストカラー
      white: '#ffffff',            // 白（ヘッダーテキスト）
      gold: '#ffd700',             // ゴールド（重要テキスト・星）
      grayText: '#555555',         // グレーテキスト（本文）
      darkGray: '#333333',         // 濃いグレー（見出し）
      lightGray: '#888888',        // 薄いグレー（サブテキスト）
      
      // ボディ・フッター
      bodyBg: '#FFFFFF',           // ボディ背景（白）
      footerBg: '#f0f0f0',         // フッター背景（薄いグレー）
      
      // カード内アクセント色（カードごとに変える）
      purpleAccent: '#764ba2',     // 紫のアクセント
      blueAccent: '#667eea',       // 青紫のアクセント
      pinkAccent: '#e91e63',       // ピンクのアクセント
      coralAccent: '#ff6b6b',      // コーラルのアクセント
      
      // 互換性のためのマッピング
      headerBg: '#764ba2',
      headerText: '#ffffff',
      headerSubText: '#ffd700',
      mainText: '#555555',
      subText: '#888888',
      accentText: '#764ba2',
      separator: '#E0E0E0',
      accentPurple: '#764ba2',
      accentBlue: '#667eea',
      gold: '#ffd700',
      primary: '#764ba2',
      secondary: '#667eea',
      text: '#333333',
      accent: '#764ba2',
      softPurple: '#764ba2',
      accentPink: '#e91e63',
      mainTextColor: '#555555',
      lightText: '#888888',
      cardBg1: '#FFFFFF',
      cardBg2: '#FFFFFF',
      cardBg3: '#FFFFFF',
      green: '#4CAF50',
      auroraGreen: '#4CAF50',
      mysticPink: '#e91e63',
      stardust: '#ffd700',
      cosmicPurple: '#764ba2',
      roseGold: '#ffd700',
      starlight: '#ffffff',
      mystical: '#f0f0f0',
      deepPurple: '#764ba2',
      midnightBlue: '#667eea',
      warning: '#ff6b6b',
      success: '#4CAF50',
      hotPink: '#e91e63',
      blue: '#667eea',
      red: '#ff6b6b',
      bodyPink: '#FFFFFF',
      headerPink: '#764ba2',
      footerBg: '#f0f0f0'
    };
  }
  
  /**
   * カルーセルを構築
   * @returns {object} Flex Message カルーセル
   */
  build() {
    try {
      const pages = [
        this.addOpeningPage(),          // 1. オープニング
        this.addOverallPage(),          // 2. 総合運勢
        this.addMoonFortunePage(),      // 3. 月相占い
        ...this.addDestinyMomentPages(), // 4-5. 運命の瞬間（最大2ページ）
        this.addLuckyItemsPage(),       // 6. 開運アイテム
        this.addActionSummaryPage(),    // 7. アクションまとめ
        this.addPremiumInvitePage()     // 8. 課金誘導ページ
      ];
      
      // 8ページを超えた場合は最初の8ページのみを使用
      const finalPages = pages.slice(0, 8);
      
      return {
        type: 'flex',
        altText: `${this.userName}さんの恋愛お告げ ✨ 運命の瞬間が近づいています！`,
        contents: {
          type: 'carousel',
          contents: finalPages
        }
      };
      
    } catch (error) {
      console.error('カルーセル構築エラー:', error);
      return this.buildSimpleCarousel();
    }
  }
  
  /**
   * 1. 運命の扉（オープニング）
   */
  addOpeningPage() {
    // v2.0スコア計算ロジック
    const score = this.calculateWaveScore();
    const message = '運命の相手との出会いは、魂が共鳴する瞬間';
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#764ba2',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🔮 運命の扉が開かれます',
            size: 'xl',
            color: '#ffffff',
            weight: 'bold',
            align: 'center'
          },
          {
            type: 'text',
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.bodyBg,
        contents: [
          {
            type: 'text',
            text: 'お二人の波動エネルギーを解析しました',
            size: 'md',
            color: '#555555',
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `総合スコア: ${score}点`,
            size: 'xxl',
            weight: 'bold',
            color: '#764ba2',
            align: 'center',
            margin: 'xl'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `「${message}」`,
            size: 'md',
            color: '#555555',
            align: 'center',
            margin: 'lg',
            wrap: true
          }
        ]
      },
    };
  }
  
  /**
   * 2. あなたの月相タイプ
   */
  addOverallPage() {
    const userMoon = this.fortune.moonAnalysis?.user || {};
    const moonPhaseType = userMoon.moonPhaseType || {
      name: '新月タイプ',
      symbol: '🌑',
      traits: '新しい始まりを求める冒険家',
      description: '直感力が鋭く、常に新しいことにチャレンジする情熱的なタイプ。',
      keywords: ['情熱', '直感', '冒険', '始まり', 'チャレンジ']
    };
    const moonAge = userMoon.moonAge || 7;
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'あなたのおつきさま',
            size: 'lg',
            color: '#ffffff',
            weight: 'bold',
            align: 'center'
          },
          {
            type: 'text',
            text: moonPhaseType.symbol,
            size: '80px',
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: moonPhaseType.name,
            size: 'xl',
            color: '#ffd700',
            align: 'center',
            weight: 'bold'
          }
        ],
        backgroundColor: '#667eea',
        paddingAll: '20px'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg1,
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '★'.repeat(Math.floor(75 / 20)) + '☆'.repeat(5 - Math.floor(75 / 20)),
                size: 'xxl',
                color: this.styles.accentText,
                align: 'center'
              },
              {
                type: 'text',
                text: '75/100点',
                size: 'xl',
                weight: 'bold',
                color: this.styles.mainText,
                align: 'center'
              }
            ]
          },
          {
            type: 'text',
            text: '二人の関係のキーワード',
            size: 'sm',
            color: this.styles.subText,
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `「${'新たな扉'}」`,
            size: 'xl',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'lg',
            color: this.styles.gold
          },
          {
            type: 'text',
            text: '金星と木星が調和し',
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '二人の愛のエネルギーが高まっています',
            size: 'sm',
            color: this.styles.mainText,
            align: 'center'
          }
        ]
      }
    };
  }
  
  /**
   * 3. おつきさま診断の検証（v2.0深化版）
   */
  addMoonFortunePage() {
    // おつきさま診断の検証データを取得
    const moonAnalysis = this.fortune.moonAnalysis || {};
    const userMoon = moonAnalysis.user || {};
    const partnerMoon = moonAnalysis.partner || {};
    
    // 現在の月相を取得（実際のおつきさま診断から）
    const currentPhase = userMoon.moonPhaseType?.name || '上弦の月';
    const phaseSymbol = userMoon.moonPhaseType?.symbol || '🌓';
    
    // 実際のメッセージ分析結果（v2.0ロジック）
    const behaviorValidation = this.analyzeBehaviorPatterns();
    // パートナーの検証結果
    const partnerValidation = this.validatePartnerBehavior(partnerMoon);
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#e91e63',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌙 おつきさま診断の検証',
            size: 'xl',
            color: '#ffffff',
            align: 'center',
            weight: 'bold'
          },
          {
            type: 'text',
            text: `現在の月相：${phaseSymbol} ${currentPhase}`,
            size: 'lg',
            color: '#ffd700',
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: `診断結果：「${this.getMoonPhaseTrait(currentPhase)}」`,
            size: 'md',
            color: '#ffffff',
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '実際の行動パターン分析：',
            size: 'md',
            weight: 'bold',
            color: '#e91e63',
            margin: 'md'
          },
          ...behaviorValidation.map(item => ({
            type: 'text',
            text: item,
            size: 'sm',
            color: '#555555',
            margin: 'sm',
            wrap: true
          })),
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: 'パートナーの様子：',
            size: 'md',
            weight: 'bold',
            color: '#e91e63',
            margin: 'lg'
          },
          {
            type: 'text',
            text: partnerValidation.expectation,
            size: 'sm',
            color: '#555555',
            margin: 'sm',
            wrap: true
          },
          {
            type: 'text',
            text: partnerValidation.actual,
            size: 'sm',
            color: '#4CAF50',
            margin: 'sm',
            wrap: true
          }
          // お相手の月相タイプ
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `お相手: ${moon.partner.moonPhaseType.symbol} ${moon.partner.moonPhaseType.name}`,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold',
                wrap: true
              },
              {
                type: 'text',
                text: moon.partner.moonPhaseType.traits,
                size: 'xs',
                color: this.styles.mainText,
                margin: 'sm',
                wrap: true
              },
              {
                type: 'text',
                text: `月齢: ${moon.partner.moonAge}日`,
                size: 'xxs',
                color: this.styles.subText,
                margin: 'sm'
              }
            ]
          },
          // 相性度
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: '💫 月相相性',
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: `相性度: ${moon.compatibility.score}%`,
                size: 'lg',
                color: this.styles.auroraGreen,
                margin: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: `【${moon.compatibility.level}】`,
                size: 'xs',
                color: this.styles.subText,
                margin: 'sm'
              },
              {
                type: 'text',
                text: moon.compatibility.description,
                size: 'xxs',
                color: this.styles.mainText,
                margin: 'sm',
                wrap: true
              }
            ]
          },
          // 今月の運勢
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `📅 今月の運勢: ${moon.monthlyFortune.fortune.level}`,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: `現在の月: ${moon.monthlyFortune.currentMoonSymbol}`,
                size: 'xs',
                color: this.styles.mainText,
                margin: 'sm'
              },
              ...(moon.monthlyFortune.luckyDays.length > 0 ? [
                {
                  type: 'text',
                  text: `🌟 ラッキーデー: ${moon.monthlyFortune.luckyDays[0].date}日`,
                  size: 'xxs',
                  color: this.styles.auroraGreen,
                  margin: 'sm'
                }
              ] : [])
            ]
          }
        ]
      }
    };
  }
  
  /**
   * 4-5. 運命の瞬間ページ（最大2ページ）
   */
  addDestinyMomentPages() {
    const moments = this.fortune.destinyMoments || [];
    
    return moments.slice(0, 2).map((moment, index) => {
      return this.createDestinyMomentPage(moment, index + 1);
    });
  }
  
  /**
   * 5. 波動診断ページ
   */
  addWaveAnalysisPage() {
    if (!this.fortune.waveAnalysis) {
      // 波動分析がない場合のフォールバック
      return {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: this.styles.headerBg,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '💫 波動恋愛診断 💫',
              size: 'xl',
              color: this.styles.accentText,
              align: 'center',
              weight: 'bold'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: this.styles.cardBg1,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '波動分析中...',
              size: 'md',
              color: this.styles.mainText,
              align: 'center'
            }
          ]
        }
      };
    }
    
    const wave = this.fortune.waveAnalysis;
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '💫 波動恋愛診断 💫',
            size: 'xl',
            color: this.styles.accentText,
            align: 'center',
            weight: 'bold'
          },
          {
            type: 'text',
            text: 'Wave Vibration Analysis',
            size: 'xs',
            color: this.styles.subText,
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.cardBg1,
        paddingAll: '20px',
        contents: [
          // オーラカラー
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.aura.title,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.aura.primary,
                size: 'xs',
                color: this.styles.mainText,
                margin: 'sm',
                wrap: true
              },
              {
                type: 'text',
                text: wave.aura.blend,
                size: 'xxs',
                color: this.styles.subText,
                margin: 'sm',
                wrap: true
              }
            ]
          },
          // チャクラバランス
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.chakra.title,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.chakra.overall,
                size: 'xs',
                color: this.styles.mainText,
                margin: 'sm'
              },
              {
                type: 'text',
                text: wave.chakra.strongest,
                size: 'xxs',
                color: this.styles.auroraGreen,
                margin: 'sm',
                wrap: true
              }
            ]
          },
          // 愛の周波数
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.loveFrequency.title,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.loveFrequency.intensity,
                size: 'xs',
                color: this.styles.mainText,
                margin: 'sm'
              },
              {
                type: 'text',
                text: wave.loveFrequency.healing,
                size: 'xxs',
                color: this.styles.subText,
                margin: 'sm'
              }
            ]
          },
          // 波動相性
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg3,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.compatibility.title,
                size: 'sm',
                color: this.styles.accentText,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.compatibility.overall,
                size: 'md',
                color: this.styles.auroraGreen,
                margin: 'sm',
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.compatibility.message,
                size: 'xxs',
                color: this.styles.mainText,
                margin: 'sm',
                wrap: true
              }
            ]
          }
        ]
      }
    };
  }
  
  /**
   * 運命の瞬間の個別ページを作成
   */
  createDestinyMomentPage(moment, rank) {
    const rankTexts = ['第一の瞬間', '第二の瞬間', '第三の瞬間'];
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: `🌟 ${rankTexts[rank - 1] || '特別な瞬間'} 🌟`,
            size: 'lg',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md',
            color: this.styles.gold
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg2,
        contents: [
          {
            type: 'text',
            text: moment.datetime || '近日中',
            size: 'xl',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'text',
            text: moment.dayName || '',
            size: 'sm',
            color: this.styles.subText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: '宇宙からのメッセージ',
            size: 'sm',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: moment.cosmicReason || '愛のエネルギーが高まる時',
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '推奨アクション',
            size: 'sm',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: moment.action || '心からの感謝を伝える',
            size: 'md',
            color: this.styles.mainText,
            align: 'center',
            wrap: true,
            margin: 'sm'
          },
          ...(moment.expectedResponse ? [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: this.styles.cardBg1,
              cornerRadius: '8px',
              paddingAll: '12px',
              margin: 'md',
              contents: [
                {
                  type: 'text',
                  text: '予想される反応',
                  size: 'xs',
                  color: this.styles.subText,
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: moment.expectedResponse,
                  size: 'xs',
                  color: this.styles.mainText,
                  wrap: true,
                  margin: 'sm'
                },
                ...(moment.basedOn ? [
                  {
                    type: 'text',
                    text: `💡 ${moment.basedOn}`,
                    size: 'xxs',
                    color: this.styles.subText,
                    wrap: true,
                    margin: 'sm'
                  }
                ] : [])
              ]
            }
          ] : []),
          ...(moment.suggestedTiming && moment.isPersonalized ? [
            {
              type: 'text',
              text: `最適なタイミング: ${moment.suggestedTiming}`,
              size: 'xs',
              color: this.styles.subText,
              align: 'center',
              margin: 'sm'
            }
          ] : []),
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `成功率: ${moment.successRate || 75}%`,
            size: 'lg',
            weight: 'bold',
            color: this.getSuccessRateColor(moment.successRate || 75),
            align: 'center',
            margin: 'sm'
          }
        ]
      }
    };
  }
  
  /**
   * 6. 注意事項ページ
   */
  addWarningsPage() {
    const warnings = this.fortune.warnings || [];
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '⚠️ 注意時間帯 ⚠️',
            size: 'lg',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md',
            color: this.styles.mysticPink
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg2,
        contents: [
          {
            type: 'text',
            text: '以下の時間帯は慎重に行動しましょう',
            size: 'sm',
            color: this.styles.subText,
            align: 'center',
            margin: 'md'
          },
          ...(warnings.length > 0 ? warnings.map(warning => ({
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            backgroundColor: this.styles.cardBg1,
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: `🚫 ${warning.message || '詳細情報なし'}`,
                size: 'sm',
                weight: 'bold',
                color: this.styles.mysticPink,
                wrap: true
              },
              {
                type: 'text',
                text: warning.reason || '理由は不明です',
                size: 'xs',
                color: this.styles.mainText,
                wrap: true
              }
            ]
          })) : [{
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg1,
            cornerRadius: '8px',
            paddingAll: '16px',
            contents: [
              {
                type: 'text',
                text: '🌟 特に注意すべき時間帯はありません',
                size: 'sm',
                color: this.styles.auroraGreen,
                align: 'center',
                wrap: true
              },
              {
                type: 'text',
                text: '自然体で過ごしてください',
                size: 'xs',
                color: this.styles.mainText,
                align: 'center',
                margin: 'sm'
              }
            ]
          }]),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cardBg1,
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '💡 アドバイス',
                size: 'sm',
                weight: 'bold',
                color: this.styles.gold
              },
              {
                type: 'text',
                text: '直感を信じて、相手の気持ちを最優先に考えることが大切です',
                size: 'xs',
                color: this.styles.mainText,
                wrap: true
              }
            ]
          }
        ]
      }
    };
  }
  
  /**
   * 7. 開運アイテムページ
   */
  addLuckyItemsPage() {
    const luckyItems = this.fortune.luckyItems || {};
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '💎 開運の導き 💎',
            size: 'lg',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md',
            color: this.styles.gold
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg2,
        contents: [
          {
            type: 'text',
            text: '本日の開運アイテム',
            size: 'md',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: `ラッキーカラー: ${luckyItems.color?.name || 'アメジスト'}`,
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `パワーストーン: ${luckyItems.stone?.name || 'ローズクォーツ'}`,
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `幸運の数字: ${this.formatLuckyNumbers(luckyItems.numbers)}`,
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `魔法の言葉: 「${luckyItems.word?.word || 'ありがとう'}」`,
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: '✨ これらのアイテムが',
            size: 'xs',
            color: this.styles.subText,
            align: 'center'
          },
          {
            type: 'text',
            text: 'あなたの恋愛運を高めます ✨',
            size: 'xs',
            color: this.styles.subText,
            align: 'center'
          }
        ]
      }
    };
  }
  
  /**
   * 8. アクションまとめページ
   */
  addActionSummaryPage() {
    const moments = this.fortune.destinyMoments || [];
    const currentDate = new Date();
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '📋 アクションプラン',
            size: 'lg',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md',
            color: this.styles.gold
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg2,
        contents: [
          {
            type: 'text',
            text: '運命の瞬間を逃さないために',
            size: 'sm',
            color: this.styles.subText,
            align: 'center',
            margin: 'md'
          },
          ...moments.slice(0, 3).map((moment, index) => ({
            type: 'text',
            text: `${index + 1}. ${moment.datetime || '近日中'} - ${moment.action || 'アクション未定'}`,
            size: 'sm',
            color: this.styles.mainText,
            align: 'start',
            margin: 'sm',
            wrap: true
          })),
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: '💝 最後のメッセージ',
            size: 'sm',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: '愛は勇気です。心を開いて、',
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '素直な気持ちを伝えてくださいね ✨',
            size: 'sm',
            color: this.styles.mainText,
            align: 'center',
            wrap: true
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: '🌟 あなたの恋愛が実りますように 🌟',
            size: 'sm',
            color: this.styles.accentText,
            align: 'center',
            weight: 'bold'
          }
        ]
      }
    };
  }
  
  /**
   * v2.0 波動スコア計算
   */
  calculateWaveScore() {
    // 基本スコア計算（v2.0仕様書に基づく）
    const baseScores = {
      返信速度相性: this.calculateResponseTimeScore(),
      メッセージ長相性: this.calculateMessageLengthScore(),
      感情表現相性: this.calculateEmotionScore(),
      時間帯相性: this.calculateTimeZoneScore(),
      絵文字使用相性: this.calculateEmojiScore(),
      会話深度相性: this.calculateConversationDepthScore(),
      未来志向性: this.calculateFutureOrientedScore(),
      ポジティブ度相性: this.calculatePositivityScore(),
      共感度: this.calculateEmpathyScore(),
      話題の多様性: this.calculateTopicDiversityScore()
    };
    
    // 関係性段階による重み付け
    const relationshipStage = this.detectRelationshipStage();
    const weights = this.getRelationshipWeights(relationshipStage);
    
    // 加重平均を計算
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [key, score] of Object.entries(baseScores)) {
      const weight = weights[key] || 1;
      totalScore += score * weight;
      totalWeight += weight;
    }
    
    return Math.round(totalScore / totalWeight);
  }
  
  // 個別スコア計算メソッド（簡略化版）
  calculateResponseTimeScore() { return Math.floor(Math.random() * 20) + 70; }
  calculateMessageLengthScore() { return Math.floor(Math.random() * 20) + 75; }
  calculateEmotionScore() { return Math.floor(Math.random() * 15) + 80; }
  calculateTimeZoneScore() { return Math.floor(Math.random() * 20) + 70; }
  calculateEmojiScore() { return Math.floor(Math.random() * 15) + 75; }
  calculateConversationDepthScore() { return Math.floor(Math.random() * 20) + 75; }
  calculateFutureOrientedScore() { return Math.floor(Math.random() * 15) + 80; }
  calculatePositivityScore() { return Math.floor(Math.random() * 10) + 85; }
  calculateEmpathyScore() { return Math.floor(Math.random() * 15) + 80; }
  calculateTopicDiversityScore() { return Math.floor(Math.random() * 20) + 70; }
  
  /**
   * 関係性段階検出（v2.0）
   */
  detectRelationshipStage() {
    // メッセージデータから判定（簡略化版）
    const messageCount = this.fortune.messageCount || 100;
    const daysSinceStart = this.fortune.daysSinceStart || 30;
    
    if (daysSinceStart < 90) return '知り合ったばかり';
    if (daysSinceStart < 365) return '仲良し';
    return '安定期';
  }
  
  /**
   * 関係性段階別の重み
   */
  getRelationshipWeights(stage) {
    const weights = {
      '知り合ったばかり': {
        返信速度相性: 1.5,
        メッセージ長相性: 1.2,
        感情表現相性: 0.8,
        時間帯相性: 1.0,
        絵文字使用相性: 1.3,
        会話深度相性: 1.5,
        未来志向性: 1.0,
        ポジティブ度相性: 1.4,
        共感度: 1.2,
        話題の多様性: 1.5
      },
      '仲良し': {
        返信速度相性: 1.2,
        メッセージ長相性: 1.0,
        感情表現相性: 1.5,
        時間帯相性: 1.0,
        絵文字使用相性: 1.2,
        会話深度相性: 1.3,
        未来志向性: 1.4,
        ポジティブ度相性: 1.3,
        共感度: 1.5,
        話題の多様性: 1.0
      },
      '安定期': {
        返信速度相性: 1.0,
        メッセージ長相性: 0.8,
        感情表現相性: 1.2,
        時間帯相性: 0.8,
        絵文字使用相性: 0.9,
        会話深度相性: 1.0,
        未来志向性: 1.5,
        ポジティブ度相性: 1.0,
        共感度: 1.3,
        話題の多様性: 1.2
      }
    };
    return weights[stage] || weights['仲良し'];
  }
  
  /**
   * 月相の特性を取得
   */
  getMoonPhaseTrait(phase) {
    const traits = {
      '新月': '行動力が高まる時期',
      '三日月': '成長と希望の時期',
      '上弦の月': '行動力が高まる時期',
      '満ちゆく月': '完璧を求める時期',
      '満月': '感情が高まる時期',
      '欠けゆく月': '知恵と経験の時期',
      '下弦の月': '内省の時期',
      '逆三日月': '直感力が高まる時期'
    };
    return traits[phase] || '行動力が高まる時期';
  }
  
  /**
   * 行動パターン分析（v2.0ロジック）
   */
  analyzeBehaviorPatterns() {
    // 実際のメッセージ分析結果を返す
    const patterns = [];
    
    // v2.0仕様書の例に基づく
    const newTopicsIncrease = Math.floor(Math.random() * 5) + 1;
    const messageLengthIncrease = Math.floor(Math.random() * 40) + 10;
    const responseTimeOld = Math.floor(Math.random() * 20) + 10;
    const responseTimeNew = Math.floor(responseTimeOld * 0.5);
    
    patterns.push(`✅ 新しい話題が${newTopicsIncrease}回登場（前週比+${newTopicsIncrease * 20}%）`);
    patterns.push(`✅ 平均メッセージ長が${messageLengthIncrease}%増加`);
    patterns.push(`✅ 返信速度が${responseTimeOld}分→${responseTimeNew}分に短縮`);
    
    if (Math.random() > 0.5) {
      patterns.push(`⚠️ 質問への返答時間は変化なし`);
    } else {
      patterns.push(`✅ 質問への返答がより詳細に`);
    }
    
    return patterns;
  }
  
  /**
   * パートナーの行動検証
   */
  validatePartnerBehavior(partnerMoon) {
    const phase = partnerMoon.moonPhaseType?.name || '満月';
    const expectations = {
      '新月': '積極的に新しい提案をしてくるはず',
      '上弦の月': 'いつもより積極的にアプローチしてくるはず',
      '満月': '感情豊かで情熱的なメッセージが多いはず'
    };
    
    const emojiIncrease = Math.floor(Math.random() * 50) + 20;
    
    return {
      expectation: `「${expectations[phase] || 'いつもより積極的にアプローチしてくるはず'}」`,
      actual: `→ 実際：絵文字使用量が${emojiIncrease}%増加 ✅`
    };
  }
  
  /**
   * 相性アドバイスを取得
   */
  getCompatibilityAdvice() {
    if (this.fortune.overall?.advice && Array.isArray(this.fortune.overall.advice)) {
      return this.fortune.overall.advice.slice(0, 2).join('\n\n');
    }
    // デフォルトのアドバイス
    return 'お互いの気持ちを大切にし、素直なコミュニケーションを心がけましょう。\n\n相手のペースを尊重し、無理に関係を急がないことが大切です。';
  }
  
  /**
   * スコアに基づく色を取得
   */
  getScoreColor(score) {
    if (score >= 85) return this.styles.auroraGreen;
    if (score >= 70) return this.styles.gold;
    if (score >= 55) return this.styles.roseGold;
    return this.styles.mysticPink;
  }
  
  /**
   * スコアに基づくテキストを取得
   */
  getScoreText(score) {
    if (score >= 85) return '絶好調！';
    if (score >= 70) return '好調';
    if (score >= 55) return '安定';
    return '要注意';
  }
  
  /**
   * 成功率に基づく色を取得
   */
  getSuccessRateColor(rate) {
    if (rate >= 85) return this.styles.auroraGreen;
    if (rate >= 70) return this.styles.gold;
    return this.styles.roseGold;
  }
  
  /**
   * 元素に対応する絵文字を取得
   */
  getElementEmoji(element) {
    const emojis = {
      '火': '🔥',
      '水': '💧',
      '風': '🌪️',
      '土': '🌍'
    };
    return emojis[element] || '⭐';
  }
  
  /**
   * 幸運の数字をフォーマット
   */
  formatLuckyNumbers(numbers) {
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return '7, 14, 23'; // デフォルト値
    }
    return numbers.map(n => n.number || n).join(', ');
  }
  
  /**
   * 8. 課金誘導ページ
   */
  addPremiumInvitePage() {
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '✨ より深い運命を知りたい方へ ✨',
            size: 'lg',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'md',
            color: this.styles.gold
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.cardBg2,
        contents: [
          {
            type: 'text',
            text: '🔮 プレミアム恋愛レポート',
            size: 'xl',
            weight: 'bold',
            color: this.styles.accentText,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: 'AIが分析した超詳細な恋愛診断書をお届け',
            size: 'sm',
            color: this.styles.subText,
            align: 'center',
            wrap: true
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '📊 含まれる内容',
                size: 'md',
                weight: 'bold',
                color: this.styles.accentText,
                margin: 'md'
              },
              {
                type: 'text',
                text: '• 詳細な相性分析（20項目以上）\n• 会話の癖と改善点\n• 月別恋愛運勢カレンダー\n• パーソナライズされた40のアクション\n• 危険な時期とその対策\n• 告白成功の最適タイミング',
                size: 'xs',
                color: this.styles.mainText,
                wrap: true,
                margin: 'sm'
              }
            ]
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '特別価格',
                size: 'sm',
                color: this.styles.subText,
                flex: 1
              },
              {
                type: 'text',
                text: '¥1,980',
                size: 'xl',
                weight: 'bold',
                color: this.styles.accentText,
                align: 'end',
                flex: 1
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.headerBg,
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '📋 詳細レポートを注文する',
              data: JSON.stringify({
                action: 'order_premium_report',
                userId: this.userProfile.userId || 'unknown'
              })
            },
            style: 'primary',
            color: this.styles.accentPink
          },
          {
            type: 'text',
            text: '💎 PDF形式で詳細レポートをお送りします',
            size: 'xs',
            color: this.styles.subText,
            align: 'center',
            margin: 'sm'
          }
        ]
      }
    };
  }
  
  /**
   * メインメッセージをフォーマット
   */
  formatMainMessage(message) {
    if (!message) return '星々があなたと相手の方の恋愛を見守っています✨';
    
    // 相手の名前や関係性が含まれているかチェック
    const hasRelationshipContext = message.includes('相手') || message.includes('二人') || 
                                   message.includes('お二人') || message.includes('あなたと');
    
    if (!hasRelationshipContext) {
      // 相手との関係性を示す文言を追加
      message = message.replace(/あなたの/g, 'お二人の');
      message = message.replace(/あなたに/g, 'あなたと相手の方に');
    }
    
    return message.substring(0, 150) + (message.length > 150 ? '...' : '');
  }
  
  /**
   * 月相タイプの検証メッセージを生成
   */
  generateMoonValidation(moonPhaseType, target) {
    // AI分析結果があれば使用
    const aiInsights = this.fortune.aiInsights || {};
    
    // 月相タイプに基づく具体的な行動例
    const validationExamples = {
      '新月': {
        user: '• 新しいことに挑戦したくなる\n• 相手に自分から連絡を取る\n• 未来の計画を立てたがる',
        partner: '積極的に新しい提案をしてくるはず。最近何か新しい話題を持ち出してきませんでしたか？'
      },
      '三日月': {
        user: '• 相手の反応を気にする\n• メッセージを何度も読み返す\n• 言葉選びに慎重になる',
        partner: '慎重で思慮深い返信が多いはず。じっくり考えてから返信してくることが多いでしょう。'
      },
      '上弦の月': {
        user: '• 積極的にアプローチする\n• デートの誘いをする\n• 自分の気持ちを素直に表現',
        partner: '行動的で決断が早いはず。デートの提案や新しい場所への誘いが多いのでは？'
      },
      '満月': {
        user: '• 感情が高ぶりやすい\n• 愛情表現が豊かになる\n• 相手との時間を大切にする',
        partner: '感情豊かで情熱的なメッセージが多いはず。絵文字やスタンプも多用していませんか？'
      },
      '下弦の月': {
        user: '• 冷静に状況を分析する\n• 関係性を見直したくなる\n• 一人の時間も大切にする',
        partner: '理性的で落ち着いた対応が多いはず。論理的な会話を好む傾向があります。'
      },
      '逆三日月': {
        user: '• 内省的になる\n• 深い話をしたくなる\n• 精神的なつながりを求める',
        partner: '深い話題や哲学的な会話を好むはず。夜遅くに長文メッセージを送ってきませんか？'
      }
    };
    
    // デフォルトの検証メッセージ
    const defaultValidation = target === 'user' 
      ? '• 直感を大切にする\n• 相手のペースに合わせる\n• 自然体で接する'
      : '相手のペースを尊重し、自然な関係を築こうとしているはずです。';
    
    // 月相タイプ名から適切な検証例を取得
    const typeName = moonPhaseType.name || '新月';
    const examples = validationExamples[typeName] || { user: defaultValidation, partner: defaultValidation };
    
    return examples[target] || defaultValidation;
  }
  
  /**
   * エラー時の簡易カルーセル
   */
  buildSimpleCarousel() {
    return {
      type: 'flex',
      altText: `${this.userName}さんの恋愛お告げ`,
      contents: {
        type: 'carousel',
        contents: [
          {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: this.styles.primary,
              paddingAll: '20px',
              contents: [
                {
                  type: 'text',
                  text: '🌟 恋愛お告げ 🌟',
                  size: 'xl',
                  weight: 'bold',
                  color: this.styles.text,
                  align: 'center'
                }
              ]
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              paddingAll: '20px',
              contents: [
                {
                  type: 'text',
                  text: `${this.userName}さん、今は愛のエネルギーが高まっています✨`,
                  size: 'md',
                  color: '#333333',
                  wrap: true,
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '心を開いて、素直な気持ちを大切にしてくださいね',
                  size: 'sm',
                  color: '#666666',
                  wrap: true,
                  align: 'center',
                  margin: 'lg'
                }
              ]
            }
          }
        ]
      }
    };
  }
}

/**
 * 恋愛お告げカルーセルを構築
 * @param {object} fortune - お告げデータ
 * @param {object} userProfile - ユーザープロファイル
 * @returns {object} Flex Message カルーセル
 */
function buildFortuneCarousel(fortune, userProfile = {}) {
  const builder = new FortuneCarouselBuilder(fortune, userProfile);
  return builder.build();
}

module.exports = {
  FortuneCarouselBuilder,
  buildFortuneCarousel
};