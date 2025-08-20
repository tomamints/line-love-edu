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
      padding: 20px;
    }
    .container {
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 25px 20px;
      border-radius: 15px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      white-space: nowrap;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 25px;
    }
    .moon-emoji {
      font-size: 24px;
      margin: 0 5px;
    }
    .instructions {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      text-align: left;
    }
    .instruction-title {
      font-size: 16px;
      font-weight: bold;
      color: #764ba2;
      margin-bottom: 15px;
      text-align: center;
    }
    .instruction-step {
      font-size: 14px;
      line-height: 1.8;
      color: #555;
      margin-bottom: 15px;
      text-align: left;
    }
    .step-number {
      font-weight: bold;
      color: #764ba2;
      margin-right: 5px;
    }
    .line-button {
      display: inline-block;
      background: #06c755;
      color: white;
      padding: 15px 30px;
      border-radius: 25px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      margin-top: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(6, 199, 85, 0.3);
    }
    .line-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">【おつきさまからお返事です】</div>
    </div>
    
    <div class="message">
      あなたが真剣に書いてくれたおかげで<br>
      詳しく診断ができました<br>
      教えてくれてありがとう<span class="moon-emoji">🌙</span>
    </div>
    
    <div class="instructions">
      <div class="instruction-title">診断結果の見方を教えます</div>
      <div class="instruction-step">
        <span class="step-number">①</span>下のボタンを押して、LINEへ戻りなさい
      </div>
      <div class="instruction-step">
        <span class="step-number">②</span>先ほどの下部メニューの<span style="font-size: 18px; font-weight: bold; color: #764ba2; display: inline-block; margin: 0 3px;">「診断結果を見る」</span>を押してください<br>
        <span style="margin-left: 22px;">あなたとお相手の関係性をお告げします</span>
      </div>
    </div>
    
    <a href="https://lin.ee/Kk1OqSm" class="line-button">
      おつきさま診断LINEに戻る
    </a>
  </div>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};