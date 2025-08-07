// api/stripe-webhook-fast.js
// Stripeからの決済完了通知を受け取り、キューに入れるだけの高速Webhook

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
  console.log('\n========== STRIPE WEBHOOK FAST ==========');
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
    const sessionId = session.id;
    
    console.log('💰 Payment completed:', { 
      orderId, 
      userId,
      sessionId
    });
    
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
      
      // 注文ステータスをpaidに更新
      await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      
      console.log('✅ Order marked as paid:', orderId);
      
      // バックグラウンドでレポート生成をトリガー
      const https = require('https');
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'https://line-love-edu.vercel.app';
      
      const reportUrl = `${baseUrl}/api/generate-report-async?orderId=${orderId}`;
      console.log('🚀 Triggering async report generation:', reportUrl);
      
      // 非同期でレポート生成を開始
      const triggerPromise = new Promise((resolve) => {
        https.get(reportUrl, (resp) => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => {
            console.log('✅ Report trigger response:', resp.statusCode);
            resolve();
          });
        }).on('error', (err) => {
          console.error('❌ Failed to trigger:', err.message);
          resolve(); // エラーでも続行
        });
      });
      
      // 最大2秒待つ
      await Promise.race([
        triggerPromise,
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  // Stripeに即座に200を返す（3秒以内）
  console.log('✅ Returning 200 to Stripe immediately');
  res.json({ received: true });
};