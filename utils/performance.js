// パフォーマンス最適化ユーティリティ

/**
 * 高速応答のための簡潔なクイック返信オプション
 */
const quickReplyTemplates = {
  startFortune: {
    items: [{
      type: 'action',
      action: {
        type: 'message',
        label: '診断を始める',
        text: '診断を始める'
      }
    }]
  }
};

/**
 * Promise.allで並列処理可能なタスクをまとめる
 */
function parallelExecute(tasks) {
  return Promise.all(tasks.map(task => 
    task().catch(err => {
      console.error('並列処理エラー:', err);
      return null;
    })
  ));
}

/**
 * 重複する文字列を事前定義
 */
const messages = {
  welcome: '🌙 おつきさま診断へようこそ！\n\n「診断を始める」と送信してください',
  pleaseWait: '少々お待ちください...',
  error: 'エラーが発生しました。もう一度お試しください。',
  thankYou: 'ありがとうございます！'
};

module.exports = {
  quickReplyTemplates,
  parallelExecute,
  messages
};