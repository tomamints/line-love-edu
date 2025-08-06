// api/stripe-webhook.js
// Stripeからの決済完了通知を受け取る正式なWebhook

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Client } = require('@line/bot-sdk');
const PaymentHandler = require('../core/premium/payment-handler');
const orderStorage = require('../core/premium/order-storage');

const lineConfig = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const lineClient = new Client(lineConfig);
const paymentHandler = new PaymentHandler();

// Stripe Webhookの署名検証用
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Stripeからのイベントを検証
    if (endpointSecret && endpointSecret !== 'whsec_YOUR_WEBHOOK_SECRET') {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // テスト環境では署名検証をスキップ
      event = req.body;
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
    
    // レポート生成を非同期で実行（レスポンスを待たない）
    processPaymentAsync(orderId, userId, session.id);
  }
  
  // Stripeに即座に200を返す（レポート生成を待たない）
  res.json({ received: true });
};

// 非同期でレポート生成と送信を処理
async function processPaymentAsync(orderId, userId, stripeSessionId) {
  try {
    // 注文情報を取得
    const order = await orderStorage.getOrder(orderId);
    if (!order) {
      console.error('注文が見つかりません:', orderId);
      return;
    }
    
    // 注文ステータスを更新
    await orderStorage.updateOrder(orderId, {
      status: 'paid',
      stripeSessionId: stripeSessionId,
      paidAt: new Date().toISOString()
    });
    
    console.log('🔮 レポート生成開始...');
    
    // テスト用のメッセージ履歴を生成
    const testMessages = generateTestMessages();
    
    // レポートを生成
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, testMessages);
    
    console.log('📤 LINEでレポート送信...');
    
    // LINEでレポート完成通知を送信
    const completionMessages = paymentHandler.generateCompletionMessage(completionResult);
    
    if (Array.isArray(completionMessages)) {
      for (const message of completionMessages) {
        await lineClient.pushMessage(userId, message);
      }
    } else {
      await lineClient.pushMessage(userId, completionMessages);
    }
    
    console.log('✅ Stripe Webhook処理完了');
    
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