// api/process-paid-orders.js
// 支払い済みの注文を処理してレポートを生成

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const line = require('@line/bot-sdk');

const paymentHandler = new PaymentHandler();

module.exports = async (req, res) => {
  console.log('\n========== PROCESS PAID ORDERS START ==========');
  console.log('📍 Time:', new Date().toISOString());
  console.log('📍 Method:', req.method);
  console.log('📍 Query:', req.query);
  console.log('📍 Body:', req.body);
  
  try {
    let orders = [];
    
    // 特定の注文IDが指定されている場合
    if (req.body?.orderId || req.query?.orderId) {
      const orderId = req.body?.orderId || req.query?.orderId;
      console.log(`📋 Processing specific order: ${orderId}`);
      const order = await ordersDB.getOrder(orderId);
      console.log(`📋 Order found:`, order ? `${order.status}` : 'null');
      if (order && (order.status === 'paid' || order.status === 'generating')) {
        orders = [order];
      }
    } else {
      // 支払い済みでレポート未生成の注文を取得
      console.log('📋 Getting all paid orders...');
      orders = await ordersDB.getPaidOrders();
    }
    
    if (!orders || orders.length === 0) {
      console.log('✅ No paid orders to process');
      return res.json({ processed: 0 });
    }
    
    console.log(`📋 Found ${orders.length} paid orders to process`);
    
    let processed = 0;
    
    for (const order of orders) {
      try {
        console.log(`\n🔄 Processing order: ${order.id || order.orderId}`);
        
        // ステータスをgeneratingに更新
        await ordersDB.updateOrder(order.id || order.orderId, {
          status: 'generating'
        });
        
        // ユーザープロフィールを取得（エラー時はデフォルト値）
        let userProfile = { displayName: 'ユーザー' };
        try {
          if (process.env.CHANNEL_ACCESS_TOKEN) {
            const lineClient = new line.Client({
              channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
              channelSecret: process.env.CHANNEL_SECRET
            });
            userProfile = await lineClient.getProfile(order.user_id || order.userId);
          }
        } catch (err) {
          console.log('⚠️ LINE profile fetch failed, using default');
        }
        
        // テスト用メッセージを生成
        const testMessages = generateTestMessages();
        
        // レポートを生成
        const result = await paymentHandler.handlePaymentSuccess(
          order.id || order.orderId, 
          testMessages, 
          userProfile
        );
        
        if (result.success) {
          console.log(`✅ Order processed successfully: ${order.id || order.orderId}`);
          processed++;
        } else {
          console.error(`❌ Failed to process order: ${order.id || order.orderId}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing order ${order.id || order.orderId}:`, error.message);
        
        // エラーステータスに更新
        await ordersDB.updateOrder(order.id || order.orderId, {
          status: 'error',
          error_message: error.message
        });
      }
    }
    
    console.log(`\n✅ Processed ${processed} orders`);
    return res.json({ processed });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// テスト用メッセージ生成
function generateTestMessages() {
  const messages = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    messages.push({
      text: 'こんにちは！今日も元気です',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    messages.push({
      text: 'こちらこそ！良い一日を',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 1000).toISOString(),
      isUser: false
    });
  }
  
  return messages;
}