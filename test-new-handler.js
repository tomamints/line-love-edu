// ── ⑥ テキストメッセージ処理（新しい実装）
async function handleTextMessage(event) {
  const userId = event.source.userId;
  const text = event.message.text;
  
  try {
    // 占いを始める
    if (text === '占いを始める' || text === 'start') {
      // 生年月日入力カードを送信
      await client.replyMessage(event.replyToken, [
        {
          type: 'flex',
          altText: 'あなたの生年月日を選択',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'STEP 1/2',
                  size: 'xs',
                  color: '#ffffff'
                },
                {
                  type: 'text',
                  text: 'あなたの情報',
                  size: 'lg',
                  color: '#ffffff',
                  weight: 'bold'
                }
              ],
              backgroundColor: '#764ba2',
              paddingAll: '15px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '生年月日を選択してください',
                  size: 'md',
                  wrap: true
                },
                {
                  type: 'text',
                  text: 'タップするとカレンダーが開きます',
                  size: 'xs',
                  color: '#999999',
                  margin: 'sm'
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'datetimepicker',
                    label: '📅 生年月日を選択',
                    data: 'action=userBirthDate',
                    mode: 'date',
                    initial: '1995-01-01',
                    max: '2010-12-31',
                    min: '1950-01-01'
                  },
                  style: 'primary',
                  color: '#764ba2'
                }
              ]
            }
          }
        }
      ]);
      return;
    }
    
    // リセットコマンド
    if (text === 'リセット' || text === 'reset') {
      await profileManager.deleteProfile(userId);
      
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: 'プロファイルをリセットしました✨\n\nもう一度占いを始めるには「占いを始める」とメッセージを送信してください。'
        }
      ]);
      return;
    }
    
    // プロファイルが完成している場合
    const hasComplete = await profileManager.hasCompleteProfile(userId);
    if (hasComplete) {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: '占い結果を更新するには、トーク履歴ファイルを送信してください📁\n\n生年月日を変更したい場合は「リセット」と送信してください。'
      });
      return;
    }
    
    // その他のメッセージ
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '月相恋愛占いを始めるには「占いを始める」と送信してください🌙',
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '🔮 占いを始める',
              text: '占いを始める'
            }
          }
        ]
      }
    });
    
  } catch (error) {
    console.error('テキストメッセージ処理エラー:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'エラーが発生しました。もう一度お試しください。'
    });
  }
}