// api/payment-webhook.js
// 決済完了の通知を処理してLINEでレポートを送信

const { Client } = require('@line/bot-sdk');
const PaymentHandler = require('../core/premium/payment-handler');

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new Client(config);
const paymentHandler = new PaymentHandler();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { type, orderId } = req.body;
  
  if (type !== 'payment.success' || !orderId) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  try {
    console.log(`💰 決済完了通知受信: ${orderId}`);
    
    // 注文情報を取得
    const orderStatus = paymentHandler.getOrderStatus(orderId);
    if (!orderStatus.success) {
      console.error('注文情報が見つかりません:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // ユーザーIDを取得
    const order = paymentHandler.orders.get(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order details not found' });
    }
    
    const userId = order.userId;
    
    // 決済完了を処理（ダミーのメッセージ履歴を使用）
    const testMessages = generateTestMessages();
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, testMessages);
    
    // レポート完成通知を送信
    const completionMessages = paymentHandler.generateCompletionMessage(completionResult);
    
    if (Array.isArray(completionMessages)) {
      for (const message of completionMessages) {
        await client.pushMessage(userId, message);
      }
    } else {
      await client.pushMessage(userId, completionMessages);
    }
    
    console.log('✅ 決済完了処理成功');
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('決済完了処理エラー:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// テスト用メッセージ履歴を生成
function generateTestMessages() {
  const now = new Date();
  const testMessages = [];
  
  // 過去1ヶ月のメッセージを生成
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // ユーザーのメッセージ
    testMessages.push({
      text: getRandomMessage(true, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    // 相手のメッセージ（返信）
    testMessages.push({
      text: getRandomMessage(false, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      isUser: false
    });
  }
  
  return testMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// ランダムなメッセージを生成
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