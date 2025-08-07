// api/stripe-webhook-simple.js
// Stripeからの決済完了通知を受け取り、キューに入れるだけのシンプルなWebhook

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ordersDB = require('../core/database/orders-db');

// Stripe Webhookの署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Vercel設定: body parsingを無効化
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  console.log('\n========== STRIPE WEBHOOK RECEIVED ==========');
  console.log('📍 Time:', new Date().toISOString());
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // raw bodyを取得
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body);
    } else {
      const chunks = [];
      await new Promise((resolve, reject) => {
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', resolve);
        req.on('error', reject);
      });
      rawBody = Buffer.concat(chunks);
    }

    // Stripeイベントを検証
    if (rawBody && endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET') {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else {
      event = rawBody ? JSON.parse(rawBody.toString()) : req.body;
    }
  } catch (err) {
    console.error('❌ Webhook署名検証エラー:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Event type:', event.type);
  
  // checkout.session.completedイベントのみ処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    
    console.log('💰 Payment completed:', { orderId, userId });
    
    if (!orderId || !userId) {
      console.error('❌ Missing metadata');
      return res.status(400).send('Missing metadata');
    }
    
    try {
      // 注文ステータスをpaidに更新するだけ
      await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      
      console.log('✅ Order marked as paid:', orderId);
      
      // レポート生成は別のエンドポイントかcronジョブで処理
      // または、次回のユーザーメッセージ時に処理
      
    } catch (error) {
      console.error('❌ Error updating order:', error.message);
    }
  }
  
  // Stripeに即座に200を返す
  console.log('✅ Returning 200 to Stripe');
  res.json({ received: true });
};