// 月占いV2のフォーマッター
// 新しいデータ構造に対応した表示用ヘルパー

const { getCompatibilityData, getStarCount } = require('../core/fortune/compatibility-data');
const { getMoonAdvice } = require('../core/fortune/moon-advice-data');

// 月タイプの絵文字マッピング
const moonEmojis = {
  '新月': '🌑',
  '三日月': '🌒',
  '上弦の月': '🌓',
  '十三夜': '🌔',
  '満月': '🌕',
  '十六夜': '🌖',
  '下弦の月': '🌗',
  '暁': '🌘'
};

function formatMoonReportV2(moonReport) {
  // 動的な相性データを取得
  const userMoonType = moonReport.user?.moonType || '';
  const partnerMoonType = moonReport.partner?.moonType || '';
  const compatData = getCompatibilityData(userMoonType, partnerMoonType);
  
  // 絵文字付きの月タイプ名を作成
  const userMoonWithEmoji = `${userMoonType}${moonEmojis[userMoonType] || ''}`;
  const partnerMoonWithEmoji = `${partnerMoonType}${moonEmojis[partnerMoonType] || ''}`;
  
  // 相性スコアの処理（動的データを優先、なければ既存データを使用）
  const compatScore = compatData.score || moonReport.compatibility?.score || 0;
  const starCount = getStarCount(compatScore);
  
  return {
    type: 'carousel',
    contents: [
      // カード1: 総合相性
      {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'おつきさま診断',
              size: 'xl',
              color: '#ffffff',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: `総合相性: ${compatScore}点`,
              size: 'xxl',
              color: '#ffd700',
              align: 'center',
              margin: 'md',
              weight: 'bold'
            },
            {
              type: 'text',
              text: '★'.repeat(starCount) + '☆'.repeat(5 - starCount),
              size: 'xxl',
              color: '#ffd700',
              align: 'center',
              margin: 'sm'
            }
          ],
          backgroundColor: '#764ba2',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            // 1〜5位の場合のみ順位を表示
            ...(compatData.rank && compatData.rank <= 5 ? [{
              type: 'text',
              text: `相性No.${compatData.rank}`,
              weight: 'bold',
              size: 'xl',
              color: '#FFD700',
              align: 'center'
            }] : []),
            {
              type: 'text',
              text: `${userMoonWithEmoji}×${partnerMoonWithEmoji}`,
              wrap: true,
              size: 'xxl',  // md → xxl に変更して大きく
              margin: 'md',
              align: 'center',
              color: '#764ba2',  // より目立つ紫色
              weight: 'bold'  // 太字を追加
            },
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'text',
              text: '【相性の理由】',
              weight: 'bold',
              size: 'md',
              color: '#764ba2',
              margin: 'xl'
            },
            {
              type: 'text',
              text: compatData.reason || moonReport.compatibility?.specific?.reason || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【あなたとお相手の関係性】',
              weight: 'bold',
              size: 'md',
              color: '#764ba2',
              margin: 'lg'
            },
            {
              type: 'text',
              text: compatData.relationship || moonReport.compatibility?.specific?.example || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【アドバイス】',
              weight: 'bold',
              size: 'md',
              color: '#764ba2',
              margin: 'lg'
            },
            {
              type: 'text',
              text: compatData.userAdvice || moonReport.compatibility?.specific?.advice || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            }
          ],
          paddingAll: '20px'
        }
      },
      // カード2: あなたの月相タイプ
      {
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
              text: moonReport.user?.emoji || '🌙',
              size: '80px',
              align: 'center',
              margin: 'md'
            },
            {
              type: 'text',
              text: `${moonReport.user?.moonType || ''}タイプ`,
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
          contents: [
            {
              type: 'text',
              text: moonReport.user?.story?.title || '',
              weight: 'bold',
              size: 'md',
              color: '#667eea',
              align: 'center'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: moonReport.user?.story?.introduction || '',
              wrap: true,
              size: 'sm',
              margin: 'md'
            },
            {
              type: 'text',
              text: moonReport.user?.story?.symbolism || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#666666'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【あなたの特徴】',
              weight: 'bold',
              size: 'md',
              color: '#667eea',
              margin: 'lg'
            },
            ...(moonReport.user?.story?.traits || []).slice(0, 3).map(trait => ({
              type: 'text',
              text: `• ${trait}`,
              wrap: true,
              size: 'sm',
              margin: 'sm',
              color: '#555555'
            })),
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【あなたの恋愛スタイル】',
              weight: 'bold',
              size: 'md',
              color: '#ff69b4',
              margin: 'lg'
            },
            {
              type: 'text',
              text: moonReport.user?.story?.loveStyle || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            }
          ],
          paddingAll: '20px'
        }
      },
      // カード3: お相手の月相タイプ（パートナーがいる場合）
      ...(moonReport.partner ? [{
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'お相手のおつきさま',
              size: 'lg',
              color: '#ffffff',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: moonReport.partner?.emoji || '🌙',
              size: '80px',
              align: 'center',
              margin: 'md'
            },
            {
              type: 'text',
              text: `${moonReport.partner?.moonType || ''}タイプ`,
              size: 'xl',
              color: '#ffd700',
              align: 'center',
              weight: 'bold'
            }
          ],
          backgroundColor: '#ff69b4',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: moonReport.partner?.story?.title || '',
              weight: 'bold',
              size: 'md',
              color: '#ff69b4',
              align: 'center'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: moonReport.partner?.story?.introduction || '',
              wrap: true,
              size: 'sm',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【お相手の特徴】',
              weight: 'bold',
              size: 'md',
              color: '#ff69b4',
              margin: 'lg'
            },
            ...(moonReport.partner?.story?.traits || []).map(trait => ({
              type: 'text',
              text: `• ${trait}`,
              wrap: true,
              size: 'sm',
              margin: 'sm',
              color: '#555555'
            })),
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '【お相手の恋愛スタイル】',
              weight: 'bold',
              size: 'md',
              color: '#ff69b4',
              margin: 'lg'
            },
            {
              type: 'text',
              text: moonReport.partner?.story?.loveStyle || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            }
          ],
          paddingAll: '20px'
        }
      }] : []),
      // カード4: 実践アドバイス（月相の組み合わせに基づく）
      (() => {
        // 月相の組み合わせに基づくアドバイスを取得
        const advice = getMoonAdvice(userMoonType, partnerMoonType);
        
        return {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🔮 実践アドバイス',
                size: 'lg',
                color: '#ffffff',
                weight: 'bold',
                align: 'center'
              },
              {
                type: 'text',
                text: 'こんな行動がおつきさまのオススメです',
                size: 'sm',
                color: '#ffd700',
                align: 'center',
                margin: 'sm'
              }
            ],
            backgroundColor: '#e74c3c',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: [
              // 関係性のテーマ
              {
                type: 'text',
                text: '【あなたとお相手の関係性のテーマ】',
                weight: 'bold',
                size: 'md',
                color: '#764ba2',
                align: 'center'
              },
              {
                type: 'text',
                text: advice.theme,
                wrap: true,
                size: 'sm',
                margin: 'md',
                color: '#555555',
                align: 'center'
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              // あなたの運気が上がる行い
              {
                type: 'text',
                text: '🌙 あなたの運気が上がる行い',
                weight: 'bold',
                size: 'md',
                color: '#667eea',
                margin: 'lg'
              },
              {
                type: 'text',
                text: advice.yourAction,
                wrap: true,
                size: 'sm',
                margin: 'md',
                color: '#555555'
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              // お相手に向けて
              {
                type: 'text',
                text: '💕 お相手に向けて',
                weight: 'bold',
                size: 'md',
                color: '#ff69b4',
                margin: 'lg'
              },
              {
                type: 'text',
                text: advice.toPartner,
                wrap: true,
                size: 'sm',
                margin: 'md',
                color: '#555555'
              },
              {
                type: 'separator',
                margin: 'xl'
              },
              // 過去の経験
              {
                type: 'text',
                text: moonReport.partner ? 
                  `きっと以前も、${advice.toPartner.includes('のではないでしょうか') ? 
                    advice.toPartner.split('きっと以前も、')[1]?.replace('。', '') || 
                    'あなたの気持ちを受け止めてくれたのではないでしょうか' : 
                    'あなたの気持ちを受け止めてくれたのではないでしょうか'}。` : 
                  'お相手との出会いを大切にしてください。',
                wrap: true,
                size: 'xs',
                margin: 'md',
                color: '#999999',
                align: 'center',
                style: 'italic'
              }
            ],
            paddingAll: '20px'
          }
        };
      })(),
      // カード5: 今月の恋愛運
      {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '今月の恋愛運',
              size: 'lg',
              color: '#ffffff',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: `現在の月: ${moonReport.monthlyFortune?.currentMoon?.emoji || '🌙'} ${moonReport.monthlyFortune?.currentMoon?.type || ''}`,
              size: 'md',
              color: '#ffd700',
              align: 'center',
              margin: 'md'
            }
          ],
          backgroundColor: '#9b59b6',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: `【${moonReport.monthlyFortune?.fortune?.level || ''}】`,
              weight: 'bold',
              size: 'lg',
              color: '#9b59b6',
              align: 'center'
            },
            {
              type: 'text',
              text: moonReport.monthlyFortune?.fortune?.message || '',
              wrap: true,
              size: 'sm',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '今月のアドバイス',
              weight: 'bold',
              size: 'md',
              color: '#9b59b6',
              margin: 'lg'
            },
            {
              type: 'text',
              text: moonReport.monthlyFortune?.fortune?.advice || '',
              wrap: true,
              size: 'sm',
              margin: 'md',
              color: '#555555'
            },
            ...(moonReport.monthlyFortune?.luckyDays?.length > 0 ? [
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: 'ラッキーデー',
                weight: 'bold',
                size: 'md',
                color: '#9b59b6',
                margin: 'lg'
              },
              ...(moonReport.monthlyFortune.luckyDays.map(day => ({
                type: 'text',
                text: `${day.date}日 ${day.emoji} - ${day.advice}`,
                wrap: true,
                size: 'sm',
                margin: 'sm',
                color: '#555555'
              })))
            ] : [])
          ],
          paddingAll: '20px'
        }
      },
      // カード6: より詳しい分析
      {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'この診断は',
              size: 'md',
              color: '#ffffff',
              align: 'center'
            },
            {
              type: 'text',
              text: 'まだ序章に過ぎません🌙',
              size: 'lg',
              color: '#ffd700',
              weight: 'bold',
              align: 'center',
              margin: 'sm'
            }
          ],
          backgroundColor: '#764ba2',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: 'おつきさま診断では月タイプと\nあなたとお相手の実際の会話を\n掛け合わせて診断することによって',
              wrap: true,
              size: 'sm',
              color: '#555555',
              align: 'center',
              margin: 'md'
            },
            {
              type: 'text',
              text: 'より本質に近い、\nあなたとお相手の過去や現在、\nそして未来を診断することができます',
              wrap: true,
              size: 'sm',
              color: '#555555',
              align: 'center',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'text',
              text: '今、あなたがより知りたいのは\nどちらでしょう？',
              size: 'md',
              weight: 'bold',
              color: '#764ba2',
              align: 'center',
              margin: 'lg',
              wrap: true
            },
            {
              type: 'text',
              text: '①お相手に今のあなたの\n　想いが伝わるのかどうか',
              size: 'sm',
              color: '#667eea',
              align: 'center',
              margin: 'md',
              wrap: true
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '① 想いが伝わるか',
                data: 'action=want_feelings_reach',
                displayText: 'お相手に今のあなたの想いが伝わるのかどうか知りたい'
              },
              style: 'primary',
              color: '#667eea',
              margin: 'sm',
              height: 'md'
            },
            {
              type: 'text',
              text: '②お相手が今あなたに\n　向ける気持ち',
              size: 'sm',
              color: '#ff69b4',
              align: 'center',
              margin: 'md',
              wrap: true
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '② 相手の気持ち',
                data: 'action=want_partner_feelings',
                displayText: 'お相手が今あなたに向ける気持ちを知りたい'
              },
              style: 'primary',
              color: '#ff69b4',
              margin: 'sm',
              height: 'md'
            },
            {
              type: 'text',
              text: 'どちらか選んで\n教えてください🌙',
              size: 'sm',
              color: '#888888',
              align: 'center',
              margin: 'xl'
            }
          ],
          paddingAll: '20px'
        }
      }
    ]
  };
}

module.exports = { formatMoonReportV2 };