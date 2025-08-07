// api/stripe-webhook-queue.js
// Stripeからの決済完了通知を受け取り、キューに入れて即座に返す

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ordersDB = require('../core/database/orders-db');
const line = require('@line/bot-sdk');

// Stripe Webhookの署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Vercel設定: body parsingを無効化
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  console.log('\n========== STRIPE WEBHOOK QUEUE ==========');
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
    if (rawBody && endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET' && endpointSecret !== '') {
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
    const sessionId = session.id;
    
    console.log('💰 Payment completed:', { orderId, userId, sessionId });
    
    if (!orderId || !userId) {
      console.error('❌ Missing metadata');
      return res.status(400).send('Missing metadata');
    }
    
    try {
      // 注文が存在するか確認
      const existingOrder = await ordersDB.getOrder(orderId);
      
      if (!existingOrder) {
        console.log('❌ Order not found:', orderId);
        return res.json({ received: true });
      }
      
      // 既に処理済みの場合はスキップ
      if (existingOrder.status !== 'pending') {
        console.log('⚠️ Order already processed:', existingOrder.status);
        return res.json({ received: true });
      }
      
      // 注文ステータスをpaidに更新して、キューに入れる
      await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: sessionId,
        paidAt: new Date().toISOString()
      });
      
      console.log('✅ Order marked as paid and queued:', orderId);
      
      // LINEで通知（エラーは無視）
      try {
        const lineClient = new line.Client({
          channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
          channelSecret: process.env.CHANNEL_SECRET
        });
        
        await lineClient.pushMessage(userId, {
          type: 'text',
          text: '✅ 決済完了しました！\n\nレポート生成を開始しました。\n完成まで数分お待ちください。\n\n完成したらお知らせします。'
        });
        console.log('✅ User notified');
      } catch (err) {
        console.log('⚠️ LINE notification failed:', err.message);
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  // Stripeに即座に200を返す（3秒以内）
  console.log('✅ Returning 200 to Stripe immediately');
  res.json({ received: true });
};