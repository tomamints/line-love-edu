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
    
    // スタイル定義 - NEW_UI_DESIGN.mdに基づく
    this.styles = {
      // メインカラー
      deepPurple: '#1a0033',       // ディープパープル（背景）
      midnightBlue: '#0f0c29',     // ミッドナイトブルー（グラデーション）
      cosmicPurple: '#24243e',     // コズミックパープル（カード背景）
      
      // アクセントカラー
      gold: '#FFD700',             // ゴールド（重要テキスト）
      roseGold: '#E8B4B8',         // ローズゴールド（サブテキスト）
      starlight: '#F8F8FF',        // スターライト（通常テキスト）
      
      // エフェクトカラー
      auroraGreen: '#00FF88',      // オーロラグリーン（ポジティブ）
      mysticPink: '#FF006E',       // ミスティックピンク（注意）
      stardust: '#B8E7FC',         // スターダスト（キラキラ）
      
      // 旧互換性のため一部マッピング
      primary: '#1a0033',
      secondary: '#FFD700',
      text: '#F8F8FF',
      warning: '#FF006E',
      success: '#00FF88',
      accent: '#E8B4B8',
      mystical: '#24243e'
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
   * 1. オープニングページ
   */
  addOpeningPage() {
    const mainMessage = this.fortune.mainMessage || '星々があなたの恋愛を見守っています✨';
    const score = this.fortune.overall?.score || 75;
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌙 ✨ 🌙',
            size: 'xl',
            color: this.styles.gold,
            align: 'center'
          },
          {
            type: 'text',
            text: '運命の扉が開かれます',
            size: 'lg',
            weight: 'bold',
            color: this.styles.starlight,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: 'あなたの恋の行方を',
            size: 'md',
            color: this.styles.roseGold,
            align: 'center'
          },
          {
            type: 'text',
            text: '星々に問いかけます',
            size: 'md',
            color: this.styles.roseGold,
            align: 'center'
          },
          {
            type: 'text',
            text: '💫 ✨ 💫',
            size: 'lg',
            color: this.styles.gold,
            align: 'center',
            margin: 'md'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: this.userName + 'さんと相手の方へ',
            size: 'md',
            color: this.styles.gold,
            align: 'center',
            weight: 'bold'
          },
          {
            type: 'text',
            text: this.formatMainMessage(mainMessage),
            size: 'sm',
            color: this.styles.starlight,
            wrap: true,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'separator',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `二人の恋愛運勢: ${score}点 - ${this.getScoreText(score)}`,
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: '✨ 二人の間に神秘的なエネルギーが高まっています ✨',
            size: 'sm',
            color: this.styles.roseGold,
            align: 'center'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.deepPurple,
        paddingAll: '10px',
        contents: [
          {
            type: 'text',
            text: '▶ スワイプして次へ',
            size: 'sm',
            color: this.styles.gold,
            align: 'center'
          }
        ]
      }
    };
  }
  
  /**
   * 2. 総合運勢ページ
   */
  addOverallPage() {
    const overall = this.fortune.overall || {};
    const score = overall.score || 75;
    const trend = overall.trendText || '安定';
    const accuracy = overall.accuracy || '★★★☆☆';
    const element = overall.element || '火';
    const phase = overall.phase || '成長期';
    
    // スコアに応じた星の数を生成
    const starCount = Math.min(5, Math.max(1, Math.round(score / 20)));
    const stars = '⭐'.repeat(starCount) + '☆'.repeat(5 - starCount);
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.midnightBlue,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '✨ 二人の恋愛運勢 ✨',
            size: 'xl',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.cosmicPurple,
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: stars,
                size: 'xxl',
                color: this.styles.gold,
                align: 'center'
              },
              {
                type: 'text',
                text: `${score}/100点`,
                size: 'xl',
                weight: 'bold',
                color: this.styles.starlight,
                align: 'center'
              }
            ]
          },
          {
            type: 'text',
            text: '二人の関係のキーワード',
            size: 'sm',
            color: this.styles.roseGold,
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: `「${overall.keyword || '新たな扉'}」`,
            size: 'xl',
            weight: 'bold',
            color: this.styles.gold,
            align: 'center'
          },
          {
            type: 'separator',
            margin: 'lg',
            color: this.styles.gold
          },
          {
            type: 'text',
            text: overall.cosmicMessage || '金星と木星が調和し',
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '二人の愛のエネルギーが高まっています',
            size: 'sm',
            color: this.styles.starlight,
            align: 'center'
          }
        ]
      }
    };
  }
  
  /**
   * 3. 月相占いページ
   */
  addMoonFortunePage() {
    if (!this.fortune.moonAnalysis) {
      // 月相占いがない場合のフォールバック
      return {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: this.styles.deepPurple,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '🌙 月相恋愛占い 🌙',
              size: 'xl',
              color: this.styles.gold,
              align: 'center',
              weight: 'bold'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: this.styles.cosmicPurple,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '月相分析中...',
              size: 'md',
              color: this.styles.starlight,
              align: 'center'
            }
          ]
        }
      };
    }
    
    const moon = this.fortune.moonAnalysis;
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌙 月相恋愛占い 🌙',
            size: 'xl',
            color: this.styles.gold,
            align: 'center',
            weight: 'bold'
          },
          {
            type: 'text',
            text: 'Moon Phase Love Fortune',
            size: 'xs',
            color: this.styles.stardust,
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.cosmicPurple,
        paddingAll: '20px',
        contents: [
          // あなたの月相タイプ
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `あなた: ${moon.user.moonPhaseType.symbol} ${moon.user.moonPhaseType.name}`,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold',
                wrap: true
              },
              {
                type: 'text',
                text: moon.user.moonPhaseType.traits,
                size: 'xs',
                color: this.styles.starlight,
                margin: 'sm',
                wrap: true
              },
              {
                type: 'text',
                text: `月齢: ${moon.user.moonAge}日`,
                size: 'xxs',
                color: this.styles.roseGold,
                margin: 'sm'
              }
            ]
          },
          // お相手の月相タイプ
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `お相手: ${moon.partner.moonPhaseType.symbol} ${moon.partner.moonPhaseType.name}`,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold',
                wrap: true
              },
              {
                type: 'text',
                text: moon.partner.moonPhaseType.traits,
                size: 'xs',
                color: this.styles.starlight,
                margin: 'sm',
                wrap: true
              },
              {
                type: 'text',
                text: `月齢: ${moon.partner.moonAge}日`,
                size: 'xxs',
                color: this.styles.roseGold,
                margin: 'sm'
              }
            ]
          },
          // 相性度
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: '💫 月相相性',
                size: 'sm',
                color: this.styles.gold,
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
                color: this.styles.roseGold,
                margin: 'sm'
              },
              {
                type: 'text',
                text: moon.compatibility.description,
                size: 'xxs',
                color: this.styles.starlight,
                margin: 'sm',
                wrap: true
              }
            ]
          },
          // 今月の運勢
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: `📅 今月の運勢: ${moon.monthlyFortune.fortune.level}`,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold'
              },
              {
                type: 'text',
                text: `現在の月: ${moon.monthlyFortune.currentMoonSymbol}`,
                size: 'xs',
                color: this.styles.starlight,
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
          backgroundColor: this.styles.deepPurple,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '💫 波動恋愛診断 💫',
              size: 'xl',
              color: this.styles.gold,
              align: 'center',
              weight: 'bold'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: this.styles.cosmicPurple,
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '波動分析中...',
              size: 'md',
              color: this.styles.starlight,
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '💫 波動恋愛診断 💫',
            size: 'xl',
            color: this.styles.gold,
            align: 'center',
            weight: 'bold'
          },
          {
            type: 'text',
            text: 'Wave Vibration Analysis',
            size: 'xs',
            color: this.styles.stardust,
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.cosmicPurple,
        paddingAll: '20px',
        contents: [
          // オーラカラー
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.aura.title,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.aura.primary,
                size: 'xs',
                color: this.styles.starlight,
                margin: 'sm',
                wrap: true
              },
              {
                type: 'text',
                text: wave.aura.blend,
                size: 'xxs',
                color: this.styles.roseGold,
                margin: 'sm',
                wrap: true
              }
            ]
          },
          // チャクラバランス
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.chakra.title,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.chakra.overall,
                size: 'xs',
                color: this.styles.starlight,
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
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.loveFrequency.title,
                size: 'sm',
                color: this.styles.gold,
                weight: 'bold'
              },
              {
                type: 'text',
                text: wave.loveFrequency.intensity,
                size: 'xs',
                color: this.styles.starlight,
                margin: 'sm'
              },
              {
                type: 'text',
                text: wave.loveFrequency.healing,
                size: 'xxs',
                color: this.styles.roseGold,
                margin: 'sm'
              }
            ]
          },
          // 波動相性
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.mystical,
            cornerRadius: '12px',
            paddingAll: '15px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: wave.compatibility.title,
                size: 'sm',
                color: this.styles.gold,
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
                color: this.styles.starlight,
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: `🌟 ${rankTexts[rank - 1] || '特別な瞬間'} 🌟`,
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: moment.datetime || '近日中',
            size: 'xl',
            weight: 'bold',
            color: this.styles.gold,
            align: 'center'
          },
          {
            type: 'text',
            text: moment.dayName || '',
            size: 'sm',
            color: this.styles.roseGold,
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
            color: this.styles.gold,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: moment.cosmicReason || '愛のエネルギーが高まる時',
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '推奨アクション',
            size: 'sm',
            weight: 'bold',
            color: this.styles.gold,
            align: 'center',
            margin: 'lg'
          },
          {
            type: 'text',
            text: moment.action || '心からの感謝を伝える',
            size: 'md',
            color: this.styles.starlight,
            align: 'center',
            wrap: true,
            margin: 'sm'
          },
          ...(moment.expectedResponse ? [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: this.styles.cosmicPurple,
              cornerRadius: '8px',
              paddingAll: '12px',
              margin: 'md',
              borderWidth: '1px',
              borderColor: this.styles.stardust,
              contents: [
                {
                  type: 'text',
                  text: '予想される反応',
                  size: 'xs',
                  color: this.styles.roseGold,
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: moment.expectedResponse,
                  size: 'xs',
                  color: this.styles.starlight,
                  wrap: true,
                  margin: 'sm'
                },
                ...(moment.basedOn ? [
                  {
                    type: 'text',
                    text: `💡 ${moment.basedOn}`,
                    size: 'xxs',
                    color: this.styles.stardust,
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
              color: this.styles.roseGold,
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '⚠️ 注意時間帯 ⚠️',
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: '以下の時間帯は慎重に行動しましょう',
            size: 'sm',
            color: this.styles.roseGold,
            align: 'center',
            margin: 'md'
          },
          ...(warnings.length > 0 ? warnings.map(warning => ({
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            backgroundColor: this.styles.cosmicPurple,
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'sm',
            borderWidth: '1px',
            borderColor: this.styles.mysticPink,
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
                color: this.styles.starlight,
                wrap: true
              }
            ]
          })) : [{
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cosmicPurple,
            cornerRadius: '8px',
            paddingAll: '16px',
            borderWidth: '1px',
            borderColor: this.styles.auroraGreen,
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
                color: this.styles.starlight,
                align: 'center',
                margin: 'sm'
              }
            ]
          }]),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: this.styles.cosmicPurple,
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'lg',
            borderWidth: '1px',
            borderColor: this.styles.gold,
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
                color: this.styles.starlight,
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '💎 開運の導き 💎',
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: '本日の開運アイテム',
            size: 'md',
            weight: 'bold',
            color: this.styles.gold,
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
            color: this.styles.starlight,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `パワーストーン: ${luckyItems.stone?.name || 'ローズクォーツ'}`,
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `幸運の数字: ${this.formatLuckyNumbers(luckyItems.numbers)}`,
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            margin: 'sm'
          },
          {
            type: 'text',
            text: `魔法の言葉: 「${luckyItems.word?.word || 'ありがとう'}」`,
            size: 'sm',
            color: this.styles.starlight,
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
            color: this.styles.roseGold,
            align: 'center'
          },
          {
            type: 'text',
            text: 'あなたの恋愛運を高めます ✨',
            size: 'xs',
            color: this.styles.roseGold,
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '📋 アクションプラン',
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: '運命の瞬間を逃さないために',
            size: 'sm',
            color: this.styles.roseGold,
            align: 'center',
            margin: 'md'
          },
          ...moments.slice(0, 3).map((moment, index) => ({
            type: 'text',
            text: `${index + 1}. ${moment.datetime || '近日中'} - ${moment.action || 'アクション未定'}`,
            size: 'sm',
            color: this.styles.starlight,
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
            color: this.styles.gold,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: '愛は勇気です。心を開いて、',
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            wrap: true
          },
          {
            type: 'text',
            text: '素直な気持ちを伝えてくださいね ✨',
            size: 'sm',
            color: this.styles.starlight,
            align: 'center',
            wrap: true
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.deepPurple,
        paddingAll: '12px',
        borderWidth: '1px',
        borderColor: this.styles.gold,
        contents: [
          {
            type: 'text',
            text: '🌟 あなたの恋愛が実りますように 🌟',
            size: 'sm',
            color: this.styles.gold,
            align: 'center',
            weight: 'bold'
          }
        ]
      }
    };
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
        backgroundColor: this.styles.deepPurple,
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '✨ より深い運命を知りたい方へ ✨',
            size: 'lg',
            weight: 'bold',
            color: this.styles.gold,
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
        backgroundColor: this.styles.midnightBlue,
        contents: [
          {
            type: 'text',
            text: '🔮 プレミアム恋愛レポート',
            size: 'xl',
            weight: 'bold',
            color: this.styles.gold,
            align: 'center',
            margin: 'md'
          },
          {
            type: 'text',
            text: 'AIが分析した超詳細な恋愛診断書をお届け',
            size: 'sm',
            color: this.styles.roseGold,
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
                color: this.styles.gold,
                margin: 'md'
              },
              {
                type: 'text',
                text: '• 詳細な相性分析（20項目以上）\n• 会話の癖と改善点\n• 月別恋愛運勢カレンダー\n• パーソナライズされた40のアクション\n• 危険な時期とその対策\n• 告白成功の最適タイミング',
                size: 'xs',
                color: this.styles.starlight,
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
                color: this.styles.roseGold,
                flex: 1
              },
              {
                type: 'text',
                text: '¥1,980',
                size: 'xl',
                weight: 'bold',
                color: this.styles.gold,
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
        backgroundColor: this.styles.deepPurple,
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
            color: this.styles.gold
          },
          {
            type: 'text',
            text: '💎 PDF形式で詳細レポートをお送りします',
            size: 'xs',
            color: this.styles.stardust,
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