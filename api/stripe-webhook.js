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
  const sig = req.headers['stripe-signature'];
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

  // checkout.session.completedイベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    console.log('💳 Stripe決済完了:', session.id);
    console.log('📦 メタデータ:', session.metadata);
    
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    
    if (!orderId || !userId) {
      console.error('必要なメタデータがありません');
      return res.status(400).send('Missing metadata');
    }
    
    // Vercel環境ではawaitしないと関数が終了してしまう
    // ただし、タイムアウトを防ぐため、最小限の処理のみ同期的に実行
    try {
      // 注文ステータスをpaidに更新（これは同期的に実行）
      await ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: session.id,
        paidAt: new Date().toISOString()
      });
      console.log('✅ 注文ステータスをpaidに更新');
      
      // レポート生成は非同期で実行（ただしVercelでも実行されるようにPromiseを作成）
      processPaymentAsync(orderId, userId, session.id).catch(error => {
        console.error('❌ processPaymentAsyncエラー:', error);
        console.error('❌ エラースタック:', error.stack);
      });
      
      // 少し待ってから200を返す（processPaymentAsyncが開始されることを保証）
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ Webhook処理エラー:', error);
    }
  }
  
  // Stripeに200を返す
  res.json({ received: true });
};

// 非同期でレポート生成と送信を処理
async function processPaymentAsync(orderId, userId, stripeSessionId) {
  console.log('📋 processPaymentAsync実行開始');
  console.log('📋 引数:', { orderId, userId, stripeSessionId });
  
  try {
    // OrdersDBを再初期化して環境変数を確実に反映
    ordersDB.reinitialize();
  
  console.log('👤 LINE APIプロファイル取得開始...');
  console.log('👤 CHANNEL_ACCESS_TOKEN exists:', !!process.env.CHANNEL_ACCESS_TOKEN);
  
  // LINE APIからユーザープロフィールを取得
  let userProfile = null;
  try {
    if (!process.env.CHANNEL_ACCESS_TOKEN) {
      throw new Error('CHANNEL_ACCESS_TOKEN is not set');
    }
    
    const lineClient = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
    });
    console.log('👤 LINE Client作成成功');
    
    userProfile = await lineClient.getProfile(userId);
    console.log('👤 ユーザープロフィール取得成功:', userProfile.displayName);
  } catch (err) {
    console.error('👤 プロフィール取得エラー:', err.message);
    console.error('  詳細:', err);
    userProfile = {
      displayName: 'ユーザー',
      userId: userId
    };
  }
  
  try {
    // 注文情報を取得（データベースから）
    console.log('🔍 注文を取得開始:', orderId);
    let order = null;
    try {
      order = await ordersDB.getOrder(orderId);
      console.log('🔍 注文取得結果:', order ? '成功' : 'null');
    } catch (getOrderError) {
      console.error('❌ getOrderエラー:', getOrderError);
      console.error('❌ エラースタック:', getOrderError.stack);
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
    
    console.log('🔮 レポート生成開始...');
    
    // テスト用のメッセージ履歴を生成
    const testMessages = generateTestMessages();
    
    // レポートを生成（userProfileを渡す）
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, testMessages, userProfile);
    
    console.log('📤 レポート情報をデータベースに保存...');
    
    // レポートURLをデータベースに保存
    if (completionResult && completionResult.reportUrl) {
      await ordersDB.updateOrder(orderId, {
        status: 'completed',
        reportUrl: completionResult.reportUrl  // camelCaseに統一
      });
      console.log('✅ レポートURL保存完了');
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
    
    console.log('📝 レポート完成通知を次回メッセージ時に送信予定');
    
    console.log('✅ Stripe Webhook処理完了');
    
  } catch (error) {
    console.error('レポート生成エラー:', error);
    
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
    console.error('❌ processPaymentAsync全体エラー:', outerError);
    console.error('❌ エラースタック:', outerError.stack);
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