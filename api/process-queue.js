// api/process-queue.js
// キューに入った注文を処理（手動実行またはCron）

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const UserProfileManager = require('../core/user-profile');
const line = require('@line/bot-sdk');

const paymentHandler = new PaymentHandler();
const profileManager = new UserProfileManager();

module.exports = async (req, res) => {
  console.log('\n========== PROCESS QUEUE START ==========');
  console.log('📍 Time:', new Date().toISOString());
  
  try {
    // 特定の注文IDが指定されている場合
    const specificOrderId = req.query?.orderId || req.body?.orderId;
    
    let orders = [];
    
    if (specificOrderId) {
      console.log(`📋 Processing specific order: ${specificOrderId}`);
      const order = await ordersDB.getOrder(specificOrderId);
      if (order && order.status === 'paid') {
        orders = [order];
      }
    } else {
      // 支払い済みでレポート未生成の注文を取得
      console.log('📋 Getting all paid orders...');
      orders = await ordersDB.getPaidOrders();
    }
    
    if (!orders || orders.length === 0) {
      console.log('✅ No paid orders to process');
      return res.json({ processed: 0, message: 'No orders in queue' });
    }
    
    console.log(`📋 Found ${orders.length} paid orders to process`);
    
    const results = [];
    
    for (const order of orders) {
      const orderId = order.id || order.orderId;
      const userId = order.user_id || order.userId;
      
      try {
        console.log(`\n🔄 Processing order: ${orderId}`);
        
        // ステータスをgeneratingに更新
        await ordersDB.updateOrder(orderId, {
          status: 'generating'
        });
        
        // LINEクライアントを初期化
        const lineClient = new line.Client({
          channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
          channelSecret: process.env.CHANNEL_SECRET
        });
        
        // ユーザープロフィールを取得
        let userProfile = { displayName: 'ユーザー' };
        try {
          userProfile = await lineClient.getProfile(userId);
          console.log(`👤 User profile: ${userProfile.displayName}`);
        } catch (err) {
          console.log('⚠️ Profile fetch failed');
        }
        
        // 保存されたトーク履歴を取得
        let messages = [];
        try {
          const profile = await profileManager.getProfile(userId);
          if (profile && profile.messages && profile.messages.length > 0) {
            messages = profile.messages;
            console.log(`📊 Using ${messages.length} saved messages`);
          }
        } catch (err) {
          console.log('⚠️ Could not load saved messages');
        }
        
        // メッセージが見つからない場合はデフォルトを使用
        if (messages.length === 0) {
          console.log('⚠️ Using default messages');
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
        }
        
        // レポートを生成（時間制限なし）
        console.log('🔮 Generating report...');
        const result = await paymentHandler.handlePaymentSuccess(
          orderId,
          messages,
          userProfile
        );
        
        if (result.success) {
          console.log('✅ Report generated successfully');
          
          // 完了通知を送信
          try {
            const completionMessage = paymentHandler.generateCompletionMessage(result);
            await lineClient.pushMessage(userId, completionMessage);
            console.log('✅ Completion notification sent');
          } catch (err) {
            console.log('⚠️ Failed to send completion notification:', err.message);
          }
          
          results.push({
            orderId,
            status: 'success',
            reportUrl: result.reportUrl
          });
        } else {
          console.error('❌ Report generation failed');
          
          // エラーステータスに更新
          await ordersDB.updateOrder(orderId, {
            status: 'error',
            error_message: result.message
          });
          
          results.push({
            orderId,
            status: 'error',
            message: result.message
          });
        }
        
      } catch (error) {
        console.error(`❌ Error processing order ${orderId}:`, error.message);
        
        // エラーステータスに更新
        await ordersDB.updateOrder(orderId, {
          status: 'error',
          error_message: error.message
        });
        
        results.push({
          orderId,
          status: 'error',
          message: error.message
        });
      }
    }
    
    console.log('\n✅ Queue processing completed');
    return res.json({
      processed: results.length,
      results: results
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};