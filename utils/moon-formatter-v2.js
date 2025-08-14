// 月占いV2のフォーマッター
// 新しいデータ構造に対応した表示用ヘルパー

function formatMoonReportV2(moonReport) {
  // 相性スコアの処理
  const compatScore = moonReport.compatibility?.score || 0;
  const starCount = Math.floor(compatScore / 20);
  
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
              text: '🌙 おつきさま診断',
              size: 'xl',
              color: '#ffffff',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: `総合相性: ${compatScore}%`,
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
            {
              type: 'text',
              text: `【${moonReport.compatibility?.level || ''}】`,
              weight: 'bold',
              size: 'xl',
              color: '#764ba2',
              align: 'center'
            },
            {
              type: 'text',
              text: moonReport.compatibility?.description || '',
              wrap: true,
              size: 'md',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'text',
              text: '🔮 相性のポイント',
              weight: 'bold',
              size: 'lg',
              color: '#764ba2',
              margin: 'xl'
            },
            {
              type: 'text',
              text: moonReport.compatibility?.specific ? 
                `${moonReport.compatibility.specific.reason}\n\n${moonReport.compatibility.specific.example}` :
                '詳細な相性分析が利用可能です',
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
              text: '🌟 特徴',
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
              text: '💖 恋愛スタイル',
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
              text: '🌟 特徴',
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
              text: '💖 恋愛スタイル',
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
      // カード4: 今月の恋愛運
      {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📅 今月の恋愛運',
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
              text: '💫 今月のアドバイス',
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
                text: '🌟 ラッキーデー',
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
      // カード5: アクションアドバイス
      {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✨ 実践アドバイス',
              size: 'lg',
              color: '#ffffff',
              weight: 'bold',
              align: 'center'
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
            {
              type: 'text',
              text: '💪 今すぐできる改善アクション',
              weight: 'bold',
              size: 'md',
              color: '#e74c3c'
            },
            ...(moonReport.user?.story?.advice || []).slice(0, 3).map((advice, index) => ({
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              contents: [
                {
                  type: 'text',
                  text: `${index + 1}. ${advice}`,
                  wrap: true,
                  size: 'sm',
                  color: '#555555'
                }
              ]
            })),
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'text',
              text: moonReport.compatibility?.specific?.advice || 
                '相性を活かして、より良い関係を築きましょう',
              wrap: true,
              size: 'sm',
              margin: 'lg',
              color: '#666666',
              align: 'center'
            }
          ],
          paddingAll: '20px'
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#f8f4ff',
          paddingAll: '15px',
          contents: [
            {
              type: 'text',
              text: '🎯 より詳しい分析をご希望の方は',
              size: 'sm',
              color: '#764ba2',
              weight: 'bold',
              align: 'center'
            },
            {
              type: 'text',
              text: 'トーク履歴を送信してプレミアム診断へ',
              size: 'xs',
              color: '#888888',
              align: 'center',
              margin: 'xs'
            }
          ]
        }
      }
    ]
  };
}

module.exports = { formatMoonReportV2 };