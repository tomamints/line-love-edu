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
    <div class="title">月光に照らされし者よ</div>
    <div class="message" style="font-size: 18px; line-height: 2; margin-bottom: 30px;">
      汝の想いは、月の記憶に刻まれた<br>
      <span style="opacity: 0.8; font-size: 16px;">二つの魂を結ぶ糸が、今、紡がれ始める</span>
    </div>
    
    <div class="note" style="background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.25)); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
      <div style="font-size: 20px; margin-bottom: 25px; letter-spacing: 2px;">
        ✨ 月からの導き
      </div>
      <div style="font-size: 16px; line-height: 2.2; text-align: left; max-width: 350px; margin: 0 auto;">
        <div style="margin-bottom: 15px;">
          🌙 この画面を閉じ、LINEへ戻りなさい
        </div>
        <div style="margin-bottom: 15px;">
          📱 トーク画面で「相性」と送れば<br>
          　　汝の運命の糸が明かされよう
        </div>
        <div style="margin-bottom: 15px;">
          💭 「会話」と送れば<br>
          　　二人の言葉に宿る想いを読み解こう
        </div>
        <div style="margin-bottom: 15px;">
          💎 「プレミアム」と送れば<br>
          　　更なる深淵なる真実へ導かれん
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: rgba(147, 51, 234, 0.2); border-radius: 12px; border: 1px solid rgba(255,255,255,0.3);">
        <div style="font-size: 14px; line-height: 1.8; font-style: italic;">
          月は満ち欠けを繰り返しながら<br>
          永遠の愛を見守り続ける<br>
          <span style="opacity: 0.7; font-size: 12px;">— 月詠より —</span>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
      このページは自動的に閉じることができます
    </div>
  </div>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};