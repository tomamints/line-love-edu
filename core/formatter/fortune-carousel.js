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
    
    // スタイル定義
    this.styles = {
      primary: '#7B68EE',      // メインカラー（薄紫）
      secondary: '#FFD700',    // セカンダリカラー（ゴールド）
      background: '#1C1C3D',   // 背景色（ダークネイビー）
      text: '#FFFFFF',         // テキスト色（白）
      warning: '#FF6B6B',      // 警告色（赤）
      success: '#4ECDC4',      // 成功色（ティール）
      accent: '#FF69B4',       // アクセント色（ピンク）
      mystical: '#9370DB',     // 神秘色（パープル）
      
      // グラデーション
      gradients: {
        mystical: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cosmic: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        fortune: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        warning: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
      }
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
        ...this.addDestinyMomentPages(), // 3-5. 運命の瞬間（最大3ページ）
        this.addWarningsPage(),         // 6. 注意事項
        this.addLuckyItemsPage(),       // 7. 開運アイテム
        this.addActionSummaryPage()     // 8. アクションまとめ
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
          },
          {
            type: 'text',
            text: this.userName + 'さんへの特別なメッセージ',
            size: 'sm',
            color: this.styles.text,
            align: 'center',
            margin: 'sm'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: '#F8F6FF',
        contents: [
          {
            type: 'text',
            text: mainMessage.substring(0, 150) + (mainMessage.length > 150 ? '...' : ''),
            size: 'sm',
            color: '#333333',
            wrap: true,
            align: 'center'
          },
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            margin: 'lg',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: '✨',
                    size: 'xxl',
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: '運勢',
                    size: 'xs',
                    align: 'center',
                    color: '#666666'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'vertical',
                flex: 2,
                contents: [
                  {
                    type: 'text',
                    text: `${score}点`,
                    size: 'xxl',
                    weight: 'bold',
                    color: this.getScoreColor(score),
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: this.getScoreText(score),
                    size: 'sm',
                    color: this.getScoreColor(score),
                    align: 'center'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: '🌙',
                    size: 'xxl',
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: '神秘',
                    size: 'xs',
                    align: 'center',
                    color: '#666666'
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.primary,
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: '👆 左右にスワイプして詳細を見る 👆',
            size: 'xs',
            color: this.styles.text,
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
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.mystical,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '🔮 総合運勢 🔮',
            size: 'lg',
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
        backgroundColor: '#FFF8FF',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: '総合スコア',
                    size: 'sm',
                    color: '#666666',
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: `${score}`,
                    size: 'xxl',
                    weight: 'bold',
                    color: this.getScoreColor(score),
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: 'points',
                    size: 'xs',
                    color: '#666666',
                    align: 'center'
                  }
                ]
              },
              {
                type: 'separator'
              },
              {
                type: 'box',
                layout: 'vertical',
                flex: 1,
                contents: [
                  {
                    type: 'text',
                    text: '運勢の流れ',
                    size: 'sm',
                    color: '#666666',
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: trend,
                    size: 'lg',
                    weight: 'bold',
                    color: this.styles.primary,
                    align: 'center'
                  }
                ]
              }
            ]
          },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '信頼度', flex: 1, size: 'sm', color: '#333333' },
                  { type: 'text', text: accuracy, flex: 1, size: 'sm', color: this.styles.secondary, align: 'end' }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '支配元素', flex: 1, size: 'sm', color: '#333333' },
                  { type: 'text', text: this.getElementEmoji(element) + element, flex: 1, size: 'sm', color: this.styles.primary, align: 'end' }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '現在の段階', flex: 1, size: 'sm', color: '#333333' },
                  { type: 'text', text: phase, flex: 1, size: 'sm', color: this.styles.accent, align: 'end' }
                ]
              }
            ]
          }
        ]
      }
    };
  }
  
  /**
   * 3-5. 運命の瞬間ページ（最大3ページ）
   */
  addDestinyMomentPages() {
    const moments = this.fortune.destinyMoments || [];
    
    return moments.slice(0, 3).map((moment, index) => {
      return this.createDestinyMomentPage(moment, index + 1);
    });
  }
  
  /**
   * 運命の瞬間の個別ページを作成
   */
  createDestinyMomentPage(moment, rank) {
    const rankEmojis = ['🥇', '🥈', '🥉'];
    const rankColors = [this.styles.secondary, '#C0C0C0', '#CD7F32'];
    
    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: rankColors[rank - 1] || this.styles.primary,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: `${rankEmojis[rank - 1] || '⭐'} 運命の瞬間 ${rank}`,
            size: 'lg',
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
        backgroundColor: '#FFFAF0',
        contents: [
          {
            type: 'text',
            text: moment.datetime || '近日中',
            size: 'xl',
            weight: 'bold',
            color: this.styles.primary,
            align: 'center'
          },
          {
            type: 'text',
            text: moment.dayName || '',
            size: 'sm',
            color: '#666666',
            align: 'center'
          },
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '✨ 推奨アクション',
                size: 'sm',
                weight: 'bold',
                color: this.styles.mystical
              },
              {
                type: 'text',
                text: moment.action || '心からの感謝を伝える',
                size: 'md',
                color: '#333333',
                wrap: true
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: '🌟 宇宙からの理由',
                size: 'sm',
                weight: 'bold',
                color: this.styles.mystical
              },
              {
                type: 'text',
                text: moment.cosmicReason || '愛のエネルギーが高まる時',
                size: 'sm',
                color: '#666666',
                wrap: true
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '成功率',
                flex: 1,
                size: 'sm',
                color: '#333333',
                weight: 'bold'
              },
              {
                type: 'text',
                text: `${moment.successRate || 75}%`,
                flex: 1,
                size: 'lg',
                weight: 'bold',
                color: this.getSuccessRateColor(moment.successRate || 75),
                align: 'end'
              }
            ]
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
        backgroundColor: this.styles.warning,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '⚠️ 注意時間帯 ⚠️',
            size: 'lg',
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
        backgroundColor: '#FFF5F5',
        contents: [
          {
            type: 'text',
            text: '以下の時間帯は慎重に行動しましょう',
            size: 'sm',
            color: '#666666',
            align: 'center',
            margin: 'md'
          },
          ...(warnings.length > 0 ? warnings.map(warning => ({
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            backgroundColor: '#FFEBEE',
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: `🚫 ${warning.message || '詳細情報なし'}`,
                size: 'sm',
                weight: 'bold',
                color: this.styles.warning,
                wrap: true
              },
              {
                type: 'text',
                text: warning.reason || '理由は不明です',
                size: 'xs',
                color: '#666666',
                wrap: true
              }
            ]
          })) : [{
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🌟 特に注意すべき時間帯はありません',
                size: 'sm',
                color: this.styles.success,
                align: 'center',
                wrap: true
              },
              {
                type: 'text',
                text: '自然体で過ごしてください',
                size: 'xs',
                color: '#666666',
                align: 'center',
                margin: 'sm'
              }
            ]
          }]),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#E8F5E8',
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '💡 アドバイス',
                size: 'sm',
                weight: 'bold',
                color: this.styles.success
              },
              {
                type: 'text',
                text: '直感を信じて、相手の気持ちを最優先に考えることが大切です',
                size: 'xs',
                color: '#666666',
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
        backgroundColor: this.styles.secondary,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '🍀 開運アイテム 🍀',
            size: 'lg',
            weight: 'bold',
            color: '#333333',
            align: 'center'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: '#FFFDF0',
        contents: [
          {
            type: 'text',
            text: 'あなたの恋愛運を高める特別なアイテム',
            size: 'sm',
            color: '#666666',
            align: 'center',
            margin: 'md'
          },
          ...[
            {
              title: '🎨 ラッキーカラー',
              item: luckyItems.color,
              defaultValue: 'ピンク'
            },
            {
              title: '🔢 ラッキーナンバー',
              item: luckyItems.number,
              defaultValue: '7'
            },
            {
              title: '✨ ラッキー絵文字',
              item: luckyItems.emoji,
              defaultValue: '💕'
            },
            {
              title: '💬 ラッキーワード',
              item: luckyItems.word,
              defaultValue: 'ありがとう'
            }
          ].map(({ title, item, defaultValue }) => ({
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            backgroundColor: '#F0F8FF',
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'sm',
            contents: [
              {
                type: 'text',
                text: title,
                size: 'sm',
                weight: 'bold',
                color: this.styles.primary
              },
              {
                type: 'text',
                text: item?.name || item?.word || item?.emoji || item?.number?.toString() || defaultValue,
                size: 'md',
                weight: 'bold',
                color: '#333333'
              },
              {
                type: 'text',
                text: item?.meaning || '幸運をもたらします',
                size: 'xs',
                color: '#666666',
                wrap: true
              }
            ]
          })),
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFF0F5',
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'lg',
            contents: [
              {
                type: 'text',
                text: '🌟 特別な組み合わせ',
                size: 'sm',
                weight: 'bold',
                color: this.styles.accent
              },
              {
                type: 'text',
                text: luckyItems.combination || '7の数字を意識した時間に行動する',
                size: 'xs',
                color: '#666666',
                wrap: true
              }
            ]
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
        backgroundColor: this.styles.success,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '📋 今週のアクションプラン',
            size: 'lg',
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
        backgroundColor: '#F0FFF0',
        contents: [
          {
            type: 'text',
            text: '運命の瞬間を逃さないために',
            size: 'sm',
            color: '#666666',
            align: 'center',
            margin: 'md'
          },
          ...moments.slice(0, 3).map((moment, index) => ({
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            backgroundColor: index === 0 ? '#E8F5E8' : '#F8F8F8',
            cornerRadius: '8px',
            paddingAll: '12px',
            margin: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: `${index + 1}.`,
                    flex: 0,
                    size: 'sm',
                    weight: 'bold',
                    color: this.styles.primary
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    spacing: 'xs',
                    margin: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: moment.datetime || '近日中',
                        size: 'sm',
                        weight: 'bold',
                        color: '#333333'
                      },
                      {
                        type: 'text',
                        text: moment.action || 'アクション未定',
                        size: 'xs',
                        color: '#666666',
                        wrap: true
                      }
                    ]
                  }
                ]
              }
            ]
          })),
          { type: 'separator', margin: 'lg' },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFF8DC',
            cornerRadius: '8px',
            paddingAll: '12px',
            contents: [
              {
                type: 'text',
                text: '💝 最後のメッセージ',
                size: 'sm',
                weight: 'bold',
                color: this.styles.accent,
                align: 'center'
              },
              {
                type: 'text',
                text: '愛は勇気です。心を開いて、素直な気持ちを伝えてくださいね ✨',
                size: 'xs',
                color: '#666666',
                wrap: true,
                align: 'center',
                margin: 'sm'
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: this.styles.success,
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: '🌟 あなたの恋愛が実りますように 🌟',
            size: 'xs',
            color: this.styles.text,
            align: 'center'
          }
        ]
      }
    };
  }
  
  /**
   * スコアに基づく色を取得
   */
  getScoreColor(score) {
    if (score >= 85) return this.styles.success;
    if (score >= 70) return this.styles.secondary;
    if (score >= 55) return this.styles.primary;
    return this.styles.warning;
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
    if (rate >= 85) return this.styles.success;
    if (rate >= 70) return this.styles.secondary;
    return this.styles.primary;
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