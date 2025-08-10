// api/stripe-webhook-simple.js
// Stripeからの決済完了通知を受け取り、キューに入れるだけのシンプルなWebhook

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const UserProfileManager = require('../core/user-profile');
const line = require('@line/bot-sdk');

const paymentHandler = new PaymentHandler();
const profileManager = new UserProfileManager();

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
    const sessionId = session.id;
    
    console.log('💰 Payment completed:', { 
      orderId, 
      userId,
      sessionId,
      eventId: event.id,
      created: new Date(session.created * 1000).toISOString()
    });
    
    if (!orderId || !userId) {
      console.error('❌ Missing metadata');
      return res.status(400).send('Missing metadata');
    }
    
    try {
      // まず注文が存在するか確認
      const existingOrder = await ordersDB.getOrder(orderId);
      
      if (!existingOrder) {
        console.error('❌ Order not found:', orderId);
        console.log('⚠️ This might be an old order or duplicate webhook');
        // 注文が存在しない場合でもStripeには成功を返す（重複処理を防ぐ）
        return res.json({ received: true, error: 'Order not found', note: 'Old or duplicate webhook - safely ignored' });
      }
      
      // 既に処理済みの場合はスキップ（冪等性チェック）
      if (existingOrder.status !== 'pending') {
        console.log('⚠️ Order already processed:', {
          orderId: orderId,
          currentStatus: existingOrder.status,
          existingSessionId: existingOrder.stripeSessionId || existingOrder.stripe_session_id,
          newSessionId: sessionId
        });
        
        // 同じセッションIDの場合は正常（重複Webhook）
        if ((existingOrder.stripeSessionId || existingOrder.stripe_session_id) === sessionId) {
          console.log('✅ Duplicate webhook for same session - safely ignored');
          return res.json({ received: true, duplicate: true });
        }
        
        // 異なるセッションIDの場合は警告
        console.warn('⚠️ Different session ID for same order!');
        return res.json({ received: true, status: existingOrder.status, warning: 'Different session' });
      }
      
      // 注文ステータスをpaidに更新
      await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      
      console.log('✅ Order marked as paid:', orderId);
      
      // レポート生成を直接実行
      console.log('🚀 Starting report generation directly...');
      
      try {
        // ステータスをgeneratingに更新
        await ordersDB.updateOrder(orderId, {
          status: 'generating'
        });
        console.log('✅ Status updated to generating');
        
        // LINEクライアントを初期化
        const lineClient = new line.Client({
          channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
          channelSecret: process.env.CHANNEL_SECRET
        });
        
        // ユーザーに通知（エラーは無視して続行）
        try {
          await lineClient.pushMessage(userId, {
            type: 'text',
            text: '✅ 決済完了しました！\n\nレポートを生成中です...\nしばらくお待ちください。'
          });
          console.log('✅ User notified about payment completion');
        } catch (err) {
          console.log('⚠️ LINE notification failed:', err.message);
          // 通知失敗してもレポート生成は続行
        }
        
        // ユーザープロフィールを取得（レート制限対策付き）
        let userProfile = { displayName: 'ユーザー' };
        try {
          userProfile = await lineClient.getProfile(userId);
          console.log(`👤 User profile: ${userProfile.displayName}`);
        } catch (err) {
          if (err.statusCode === 429) {
            console.log('⚠️ LINE API rate limited, using default profile');
          } else {
            console.log('⚠️ LINE profile fetch failed, using default');
          }
        }
        
        // process-report-loopを使用してレポート生成を開始
        console.log('🚀 Starting report generation via process-report-loop...');
        const startTime = Date.now();
        
        // ユーザーに処理開始を通知
        try {
          await lineClient.pushMessage(userId, {
            type: 'text',
            text: '📝 レポート生成を開始しました。\n\n処理には数分かかる場合があります。\n完成次第お知らせします。'
          });
        } catch (err) {
          console.log('⚠️ Start notification failed:', err.message);
        }
        
        // process-report-loopを呼び出し（完了まで自動的にループ）
        console.log('🔄 Starting report processing loop...');
        
        const startProcessingLoop = async () => {
          try {
            const loopUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app'}/api/process-report-loop`;
            console.log(`📡 Calling process-report-loop at: ${loopUrl}`);
            console.log(`📡 Order ID: ${orderId}`);
            
            const response = await fetch(loopUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                orderId: orderId,
                iteration: 1
              })
            });
            
            console.log(`📡 Response status: ${response.status}`);
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Processing loop started:', result.status);
              if (result.success) {
                console.log('🎉 Report completed via loop processing');
              }
            } else {
              const errorText = await response.text().catch(() => 'No error text');
              console.error('❌ Failed to start processing loop:', response.status, errorText);
            }
          } catch (err) {
            console.error('❌ Error starting processing loop:', err.message);
          }
        };
        
        // process-report-loopを即座に開始してからレスポンスを返す
        // 非同期でfetchを開始（待たない）
        const loopPromise = startProcessingLoop().catch(err => {
          console.log('⚠️ Processing loop error:', err.message);
        });
        
        // fetchが開始されるまで少し待つ（100ms）
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`⏱️ Webhook processing time: ${Date.now() - startTime}ms`);
        
        // レスポンスを返す
        res.json({ received: true, status: 'generating' });
        
        return;
      } catch (error) {
        console.error('❌ Error in report generation:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // エラーステータスに更新
        await ordersDB.updateOrder(orderId, {
          status: 'error',
          error_message: error.message
        });
      }
      
    } catch (error) {
      console.error('❌ Error updating order:', error.message);
    }
  }
  
  // Stripeに即座に200を返す
  console.log('✅ Returning 200 to Stripe');
  res.json({ received: true });
};