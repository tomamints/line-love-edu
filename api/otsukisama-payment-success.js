// api/otsukisama-payment-success.js
// おつきさま診断の決済成功処理

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  try {
    const { session_id, diagnosis_id } = req.query;
    
    if (!session_id || !diagnosis_id) {
      return res.status(400).send('必要なパラメータが不足しています');
    }
    
    // Stripeセッションを確認
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).send('支払いが確認できません');
    }
    
    // 診断データを支払い済みに更新
    const { error: updateError } = await supabase
      .from('diagnoses')
      .update({ 
        is_paid: true,
        paid_at: new Date().toISOString(),
        stripe_session_id: session_id,
        payment_amount: session.amount_total
      })
      .eq('id', diagnosis_id);
    
    if (updateError) {
      console.error('診断データ更新エラー:', updateError);
    }
    
    // 成功ページ（既存の本番ページ）へリダイレクト
    // paid=trueパラメータを付けて、支払い済みであることを示す
    const redirectUrl = `/lp-otsukisama.html?id=${diagnosis_id}&paid=true`;
    
    // HTMLでリダイレクト（Stripeからのリダイレクトに対応）
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>決済完了</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 { margin-bottom: 20px; }
          p { margin-bottom: 30px; opacity: 0.9; }
          .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <script>
          setTimeout(function() {
            window.location.href = '${redirectUrl}';
          }, 2000);
        </script>
      </head>
      <body>
        <div class="container">
          <h1>✨ お支払いありがとうございます</h1>
          <p>診断結果ページへ移動しています...</p>
          <div class="spinner"></div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Payment success処理エラー:', error);
    res.status(500).send('エラーが発生しました');
  }
};