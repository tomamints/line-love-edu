// 保存成功ページ
module.exports = async (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>保存完了</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      padding: 40px 20px;
      color: white;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .note {
      padding: 20px;
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🌙</div>
    <div class="title">保存完了！</div>
    <div class="message">
      プロフィールを保存しました<br>
      月の相性診断の準備ができました✨
    </div>
    <div class="note" style="background: rgba(255,255,255,0.3); padding: 25px;">
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">
        ✅ 次のステップ
      </div>
      <div style="font-size: 16px; line-height: 1.8;">
        1. このページを閉じてLINEに戻る<br>
        2. 「プロフィール設定」メッセージの<br>
        　 「🌙 診断結果を見る」ボタンをタップ<br>
        3. 美しい月の相性カードが届きます✨
      </div>
      <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
        <div style="font-size: 14px; opacity: 0.9;">
          💡 ヒント: LINEトークで「診断結果」と<br>
          　送信しても結果を見ることができます
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};