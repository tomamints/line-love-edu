// api/stripe-webhook.js
// Stripeからの決済完了通知を受け取る正式なWebhook

// 環境変数を確実に読み込む（Vercel以外の環境用）
if (!process.env.VERCEL) {
  require('dotenv').config();
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const line = require('@line/bot-sdk');
const PaymentHandler = require('../core/premium/payment-handler');
const ordersDB = require('../core/database/orders-db');

const paymentHandler = new PaymentHandler();

// Stripe Webhookの署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Vercel設定: body parsingを無効化
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  console.log('\n========== STRIPE WEBHOOK START ==========');
  console.log('🔥 Webhook呼び出し開始:', new Date().toISOString());
  console.log('🔥 Request method:', req.method);
  console.log('🔥 Headers:', Object.keys(req.headers));
  
  const sig = req.headers['stripe-signature'];
  console.log('🔥 Stripe signature exists:', !!sig);
  let event;

  try {
    // Vercel環境でraw bodyを取得
    let rawBody;
    
    // req.bodyがすでにBufferまたは文字列の場合はそのまま使用
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body);
    } else if (req.body && typeof req.body === 'object') {
      // オブジェクトの場合（Vercelがパース済み）、文字列に戻す
      // これは署名検証には使えないが、開発環境用のフォールバック
      console.warn('⚠️ リクエストボディがパース済みです。署名検証をスキップします。');
      
      // 署名検証をスキップしてイベントをそのまま使用
      if (endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET') {
        console.error('署名検証が必要ですが、raw bodyが利用できません');
        return res.status(400).send('Raw body required for signature verification');
      }
      
      event = req.body;
    } else {
      // readable streamから読み取り
      const chunks = [];
      await new Promise((resolve, reject) => {
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', resolve);
        req.on('error', reject);
      });
      rawBody = Buffer.concat(chunks);
    }

    // Stripeからのイベントを検証（raw bodyがある場合のみ）
    if (rawBody && endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET') {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } else if (!event) {
      // テスト環境または署名検証をスキップ
      event = rawBody ? JSON.parse(rawBody.toString()) : req.body;
    }
  } catch (err) {
    console.error('Webhook署名検証エラー:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🎆 Event type:', event.type);
  console.log('🎆 Event ID:', event.id);
  
  // checkout.session.completedイベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('\n========== PAYMENT COMPLETED ==========');
    console.log('💳 Stripe決済完了:', session.id);
    console.log('📦 メタデータ:', JSON.stringify(session.metadata, null, 2));
    console.log('📦 Session status:', session.payment_status);
    console.log('📦 Amount total:', session.amount_total);
    
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    console.log('🆔 Order ID:', orderId);
    console.log('🆔 User ID:', userId);
    
    if (!orderId || !userId) {
      console.error('必要なメタデータがありません');
      return res.status(400).send('Missing metadata');
    }
    
    console.log('\n========== PROCESSING ORDER ==========');
    // Vercel環境ではawaitしないと関数が終了してしまう
    // ただし、タイムアウトを防ぐため、最小限の処理のみ同期的に実行
    try {
      // まず注文が存在するか確認
      console.log('🔍 注文を取得開始...', orderId);
      const existingOrder = await ordersDB.getOrder(orderId);
      console.log('🔍 注文取得結果:', existingOrder ? {
        id: existingOrder.id || existingOrder.orderId,
        status: existingOrder.status,
        userId: existingOrder.user_id || existingOrder.userId
      } : 'null');
      if (!existingOrder) {
        console.error('❌ 注文が見つかりません。スキップします:', orderId);
        res.json({ received: true, error: 'Order not found' });
        return;
      }
      
      // 既に処理済みの場合はスキップ
      if (existingOrder.status !== 'pending') {
        console.log('⚠️ 既に処理済みの注文:', existingOrder.status);
        res.json({ received: true, status: existingOrder.status });
        return;
      }
      
      // 注文ステータスをpaidに更新（これは同期的に実行）
      console.log('🔄 ステータス更新開始...');
      console.log('🔄 更新データ:', {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      
      const updateResult = await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      
      console.log('✅ 注文ステータスをpaidに更新');
      console.log('✅ 更新結果:', updateResult);
      
      // Vercel環境では必ずawaitする必要がある
      // ただし、Stripeのタイムアウト（10秒）を考慮して、基本処理のみ同期実行
      console.log('\n========== STARTING REPORT GENERATION ==========');
      console.log('🚀 processPaymentAsyncを呼び出します...');
      console.log('🚀 引数:', { orderId, userId, sessionId: session.id });
      
      // レポート生成を実行（必ずawaitで待つ）
      try {
        console.log('🚀 processPaymentAsyncを実行開始');
        // Vercel環境でも必ずawaitして完了を待つ
        await processPaymentAsync(orderId, userId, session.id);
        console.log('✅ processPaymentAsync正常完了');
      } catch (asyncError) {
        console.error('❌ processPaymentAsyncエラー:', asyncError.message);
        console.error('❌ エラースタック:', asyncError.stack);
        // エラーが発生してもStripeには成功を返す
      }
      
    } catch (error) {
      console.error('❌ Webhook処理エラー:', error.message);
      console.error('❌ エラースタック:', error.stack);
    }
  }
  
  // Stripeに200を返す
  console.log('\n========== SENDING RESPONSE ==========');
  console.log('🎯 Stripeに200を返します');
  console.log('🎯 現在時刻:', new Date().toISOString());
  console.log('========== STRIPE WEBHOOK END ==========\n');
  res.json({ received: true });
};

// 非同期でレポート生成と送信を処理
async function processPaymentAsync(orderId, userId, stripeSessionId) {
  console.log('\n========== PROCESS PAYMENT ASYNC START ==========');
  console.log('📋 processPaymentAsync実行開始');
  console.log('📋 引数:', { orderId, userId, stripeSessionId });
  console.log('📋 現在時刻:', new Date().toISOString());
  
  try {
    // Vercel環境でのタイムアウトを防ぐため、最初にステータスのみ更新
    console.log('\n--- UPDATING STATUS TO GENERATING ---');
    console.log('📝 注文ステータスをgeneratingに更新開始...');
    
    const genUpdateResult = await ordersDB.updateOrder(orderId, {
      status: 'generating'
    });
    
    console.log('✅ generatingステータス更新完了');
    console.log('✅ 更新結果:', genUpdateResult);
    
    // OrdersDBを再初期化して環境変数を確実に反映
    console.log('\n--- REINITIALIZING DATABASE ---');
    ordersDB.reinitialize();
    console.log('✅ DB再初期化完了');
  
  console.log('\n--- FETCHING LINE PROFILE ---');
  console.log('👤 LINE APIプロファイル取得開始...');
  console.log('👤 CHANNEL_ACCESS_TOKEN exists:', !!process.env.CHANNEL_ACCESS_TOKEN);
  console.log('👤 userId:', userId);
  
  // LINE APIからユーザープロフィールを取得（タイムアウト付き）
  let userProfile = null;
  try {
    if (!process.env.CHANNEL_ACCESS_TOKEN) {
      throw new Error('CHANNEL_ACCESS_TOKEN is not set');
    }
    
    const lineClient = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.CHANNEL_SECRET
    });
    console.log('👤 LINE Client作成成功');
    
    // タイムアウト付きでプロファイル取得（タイムアウトを延長）
    const profilePromise = lineClient.getProfile(userId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
    );
    
    userProfile = await Promise.race([profilePromise, timeoutPromise]);
    console.log('👤 ユーザープロフィール取得成功:', userProfile.displayName);
  } catch (err) {
    console.error('👤 プロフィール取得エラー:', err.message);
    // TLSエラーやタイムアウトの場合はデフォルト値を使用
    userProfile = {
      displayName: 'ユーザー',
      userId: userId
    };
  }
  
  try {
    console.log('\n--- FETCHING ORDER FOR PROCESSING ---');
    // 注文情報を取得（データベースから）
    console.log('🔍 注文を取得開始:', orderId);
    console.log('🔍 ordersDB存在確認:', !!ordersDB);
    console.log('🔍 getOrder関数存在確認:', typeof ordersDB.getOrder);
    
    let order = null;
    try {
      console.log('🔍 getOrder呼び出し前');
      
      // タイムアウト付きで注文を取得（タイムアウトを延長）
      const orderPromise = ordersDB.getOrder(orderId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Order fetch timeout')), 10000)
      );
      
      order = await Promise.race([orderPromise, timeoutPromise]);
      console.log('🔍 注文取得結果:', order ? '成功' : 'null');
    } catch (getOrderError) {
      console.error('❌ getOrderエラー:', getOrderError.message);
      // タイムアウトの場合は処理を中断
      if (getOrderError.message.includes('timeout')) {
        throw new Error('Database timeout - please retry');
      }
    }
    
    if (!order) {
      console.error('❌ 注文が見つかりません:', orderId);
      // 注文が見つからない場合はエラーとして終了
      throw new Error(`Order not found: ${orderId}`);
    }
    
    console.log('📦 取得した注文:', order);
    
    // 注文ステータスを確認（既にpaid以上の場合は処理をスキップ）
    if (order.status === 'completed') {
      console.log('⚠️ 既に完了済みの注文です');
      return;
    }
    
    if (order.status === 'generating') {
      console.log('⚠️ 既に生成中の注文です');
      return;
    }
    
    // 決済完了通知は送らない（決済ページで確認できるため）
    console.log('📝 決済完了処理済み');
    
    console.log('\n--- GENERATING REPORT ---');
    console.log('🔮 レポート生成開始...');
    
    // テスト用のメッセージ履歴を生成
    const testMessages = generateTestMessages();
    
    // レポートを生成（userProfileを渡す）
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, testMessages, userProfile);
    
    console.log('\n--- SAVING REPORT URL ---');
    console.log('📤 レポート情報をデータベースに保存...');
    console.log('📤 completionResult:', completionResult ? {
      success: completionResult.success,
      reportUrl: completionResult.reportUrl,
      orderId: completionResult.orderId
    } : 'null');
    
    // レポートURLをデータベースに保存
    if (completionResult && completionResult.reportUrl) {
      console.log('📤 ステータスをcompletedに更新中...');
      const finalUpdate = await ordersDB.updateOrder(orderId, {
        status: 'completed',
        reportUrl: completionResult.reportUrl  // camelCaseに統一
      });
      console.log('✅ レポートURL保存完了');
      console.log('✅ 最終更新結果:', finalUpdate);
    } else {
      console.error('❌ completionResultまたはreportUrlが存在しません');
    }
    
    // レポート完成通知を次回メッセージ時に送信予定
    const pendingNotifications = global.pendingNotifications || new Map();
    global.pendingNotifications = pendingNotifications;
    
    // レポート完成通知を保存（上書き）
    pendingNotifications.set(userId, {
      type: 'report_complete',
      orderId: orderId,
      reportUrl: completionResult.reportUrl,
      timestamp: Date.now()
    });
    
    console.log('\n--- SETTING UP PENDING NOTIFICATION ---');
    console.log('📝 レポート完成通知を次回メッセージ時に送信予定');
    
    console.log('\n========== PROCESS PAYMENT ASYNC COMPLETE ==========');
    console.log('✅ processPaymentAsync完全終了');
    console.log('✅ 終了時刻:', new Date().toISOString());
    
  } catch (error) {
    console.error('\n========== PROCESS PAYMENT ASYNC ERROR ==========');
    console.error('❌ レポート生成エラー:', error.message);
    console.error('❌ エラータイプ:', error.constructor.name);
    console.error('❌ スタック:', error.stack);
    
    // エラー情報をデータベースに保存
    try {
      await ordersDB.updateOrder(orderId, {
        status: 'error',
        error_message: error.message
      });
      console.log('❌ エラー情報をデータベースに保存');
    } catch (dbError) {
      console.error('DB保存エラー:', dbError);
    }
  }
  } catch (outerError) {
    console.error('\n========== CRITICAL ERROR ==========');
    console.error('❌ processPaymentAsync全体エラー:', outerError.message);
    console.error('❌ エラータイプ:', outerError.constructor.name);
    console.error('❌ エラースタック:', outerError.stack);
    console.error('========== CRITICAL ERROR END ==========\n');
  }
}

// テスト用メッセージ履歴を生成
function generateTestMessages() {
  const now = new Date();
  const testMessages = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    testMessages.push({
      text: getRandomMessage(true, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    testMessages.push({
      text: getRandomMessage(false, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      isUser: false
    });
  }
  
  return testMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function getRandomMessage(isUser, dayIndex) {
  const userMessages = [
    'おはよう！今日も一日頑張ろうね',
    '昨日見た映画がすごく面白かった！',
    'お疲れさま！今日はどんな一日だった？',
    '今度一緒にカフェでも行かない？',
    'ありがとう！すごく嬉しい😊',
    '最近どう？元気にしてる？',
    'その話面白そう！詳しく聞かせて',
    '今度の週末は何か予定ある？',
    'いつも優しくしてくれてありがとう',
    '一緒にいると楽しいです'
  ];
  
  const partnerMessages = [
    'おはよう！今日もよろしくお願いします',
    'それいいですね！私も見てみたいです',
    'お疲れさまでした。充実した一日でした',
    'いいですね！ぜひ行きましょう',
    'こちらこそありがとうございます😊',
    '元気です！心配してくれてありがとう',
    '実は最近こんなことがあって...',
    '特に予定はないです。何かあります？',
    'いつも気にかけてくれて嬉しいです',
    '私も一緒にいると安心します'
  ];
  
  const messages = isUser ? userMessages : partnerMessages;
  const randomIndex = (dayIndex + (isUser ? 0 : 5)) % messages.length;
  
  return messages[randomIndex];
}