// api/payment-cancel.js
// Stripe決済キャンセル時の処理

module.exports = async (req, res) => {
  // HTML表示
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>決済キャンセル - プレミアム恋愛レポート</title>
      <style>
        body {
          font-family: 'Hiragino Sans', 'Arial', sans-serif;
          background: linear-gradient(135deg, #1a0033, #0f0c29);
          color: #F8F8FF;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: rgba(36, 36, 62, 0.9);
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 {
          color: #FF006E;
          font-size: 2em;
          margin-bottom: 20px;
        }
        .icon {
          font-size: 4em;
          margin-bottom: 20px;
        }
        p {
          font-size: 1.1em;
          line-height: 1.6;
          margin: 20px 0;
        }
        .notice {
          color: #E8B4B8;
          font-size: 0.9em;
          margin-top: 30px;
        }
        .line-button {
          background: #00B900;
          color: white;
          padding: 15px 30px;
          border-radius: 30px;
          text-decoration: none;
          display: inline-block;
          margin-top: 20px;
          font-weight: bold;
        }
        .line-button:hover {
          background: #00A000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">😢</div>
        <h1>決済がキャンセルされました</h1>
        <p>
          プレミアムレポートの購入手続きが<br>
          キャンセルされました。
        </p>
        <p>
          またのご利用をお待ちしております。<br>
          ご不明な点がございましたら、<br>
          お気軽にお問い合わせください。
        </p>
        <div class="notice">
          ※ 決済に関するご質問は、<br>
          LINEで「サポート」とメッセージをお送りください。
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 15px;">
          <p style="font-size: 1.1em; color: #FFD700; margin-bottom: 15px;">
            📱 LINEアプリに戻る方法
          </p>
          <p style="font-size: 0.95em; color: #F8F8FF; line-height: 1.8;">
            このページの右上の「✕」ボタンをタップして<br>
            ブラウザを閉じてください。<br>
            自動的にLINEアプリに戻ります。
          </p>
          <div style="margin-top: 20px; padding: 15px; background: rgba(232, 180, 184, 0.2); border-radius: 10px;">
            <p style="font-size: 0.85em; color: #E8B4B8; margin: 0;">
              ※ もしLINEに戻れない場合は、<br>
              ホーム画面からLINEアプリを開いてください。
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
};