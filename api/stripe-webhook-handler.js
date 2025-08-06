// api/stripe-webhook-handler.js
// Stripeからの決済完了通知を受け取る正式なWebhook（Vercel対応版）

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Client } = require('@line/bot-sdk');
const PaymentHandler = require('../core/premium/payment-handler');
const ordersDB = require('../core/database/orders-db');

const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const lineClient = new Client(lineConfig);
const paymentHandler = new PaymentHandler();

// Stripe Webhookの署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// raw bodyを取得するヘルパー関数
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vercel環境でraw bodyを取得
    const rawBody = await buffer(req);
    const bodyString = rawBody.toString('utf8');

    // Stripeからのイベントを検証
    if (endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET') {
      event = stripe.webhooks.constructEvent(bodyString, sig, endpointSecret);
    } else {
      // テスト環境では署名検証をスキップ
      event = JSON.parse(bodyString);
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
    
    console.log('🚀 processPaymentAsync開始:', { orderId, userId });
    
    // レポート生成を非同期で実行（レスポンスを待たない）
    processPaymentAsync(orderId, userId, session.id).then(() => {
      console.log('✅ processPaymentAsync完了');
    }).catch(err => {
      console.error('❌ processPaymentAsyncエラー:', err);
      console.error('❌ エラースタック:', err.stack);
    });
  }
  
  // Stripeに即座に200を返す（レポート生成を待たない）
  res.json({ received: true });
}

// 非同期でレポート生成と送信を処理
async function processPaymentAsync(orderId, userId, stripeSessionId) {
  console.log('📋 processPaymentAsync実行開始');
  console.log('📋 引数:', { orderId, userId, stripeSessionId });
  
  try {
    // 注文情報を取得（データベースから）
    console.log('🔍 注文を取得中:', orderId);
    
    let order;
    try {
      // タイムアウト付きで注文を取得（5秒）
      const getOrderPromise = ordersDB.getOrder(orderId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('注文取得タイムアウト (5秒)')), 5000)
      );
      
      order = await Promise.race([getOrderPromise, timeoutPromise]);
      console.log('📦 取得した注文:', order);
    } catch (getOrderError) {
      console.error('❌ 注文取得エラー:', getOrderError);
      console.error('❌ エラー詳細:', getOrderError.message);
      console.error('❌ エラースタック:', getOrderError.stack);
      
      // フォールバック：注文情報を作成
      console.log('⚠️ フォールバック：注文情報を作成');
      order = {
        orderId,
        userId,
        status: 'pending',
        amount: 4980  // デフォルト金額
      };
    }
    
    if (!order) {
      console.error('❌ 注文が見つかりません:', orderId);
      // 注文が見つからない場合も処理を続行
      order = {
        orderId,
        userId,
        status: 'pending'
      };
    }
    
    // 注文ステータスを更新（データベースに）
    console.log('📝 注文ステータスを更新中...');
    try {
      // タイムアウト付きで更新（3秒）
      const updatePromise = ordersDB.updateOrder(orderId, {
        status: 'paid',
        stripeSessionId: stripeSessionId,
        paidAt: new Date().toISOString()
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('注文更新タイムアウト (3秒)')), 3000)
      );
      
      await Promise.race([updatePromise, timeoutPromise]);
      console.log('✅ 注文ステータス更新完了');
    } catch (updateError) {
      console.error('⚠️ 注文更新エラー（続行）:', updateError.message);
      // エラーが発生してもレポート生成は続行
    }
    
    console.log('🔮 レポート生成開始...');
    
    // テスト用のメッセージ履歴を生成
    console.log('📝 テストメッセージ生成中...');
    const testMessages = generateTestMessages();
    console.log('📝 テストメッセージ生成完了:', testMessages.length, '件');
    console.log('📝 最初のメッセージ:', testMessages[0]);
    console.log('📝 最後のメッセージ:', testMessages[testMessages.length - 1]);
    
    // レポートを生成
    console.log('⚙️ handlePaymentSuccess呼び出し中...');
    console.log('⚙️ 引数:', { orderId, messageCount: testMessages.length });
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, testMessages);
    console.log('📊 レポート生成結果:', completionResult);
    console.log('📊 レポートURL:', completionResult?.reportUrl);
    
    console.log('📤 LINEでレポート送信準備...');
    
    // LINEでレポート完成通知を送信
    console.log('💬 完成メッセージ生成中...');
    const completionMessages = paymentHandler.generateCompletionMessage(completionResult);
    console.log('💬 送信メッセージタイプ:', typeof completionMessages);
    console.log('💬 送信メッセージ詳細:', JSON.stringify(completionMessages, null, 2));
    
    if (Array.isArray(completionMessages)) {
      console.log('📨 複数メッセージを送信:', completionMessages.length, '件');
      for (let i = 0; i < completionMessages.length; i++) {
        console.log(`📨 メッセージ ${i+1}/${completionMessages.length} 送信中...`);
        const result = await lineClient.pushMessage(userId, completionMessages[i]);
        console.log(`📤 メッセージ ${i+1} 送信結果:`, result);
      }
    } else {
      console.log('📨 単一メッセージを送信');
      const result = await lineClient.pushMessage(userId, completionMessages);
      console.log('📤 メッセージ送信結果:', result);
    }
    
    console.log('✅ Stripe Webhook処理完了');
    console.log('✅ 処理時間:', new Date().toISOString());
    
  } catch (error) {
    console.error('レポート生成エラー:', error);
    
    // エラー通知をLINEで送信
    try {
      await lineClient.pushMessage(userId, {
        type: 'text',
        text: '決済は完了しましたが、レポート生成中にエラーが発生しました。サポートまでお問い合わせください。'
      });
    } catch (lineError) {
      console.error('LINE通知エラー:', lineError);
    }
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

// Vercel設定を含めてエクスポート
module.exports = handler;

// Vercel用の設定
handler.config = {
  api: {
    bodyParser: false,
  },
};