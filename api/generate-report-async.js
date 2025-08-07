// api/generate-report-async.js
// 非同期でレポートを生成する専用エンドポイント

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const UserProfileManager = require('../core/user-profile');
const line = require('@line/bot-sdk');

const paymentHandler = new PaymentHandler();
const profileManager = new UserProfileManager();

module.exports = async (req, res) => {
  console.log('\n========== ASYNC REPORT GENERATION ==========');
  console.log('📍 Time:', new Date().toISOString());
  
  try {
    const orderId = req.query?.orderId || req.body?.orderId;
    
    if (!orderId) {
      console.log('❌ No orderId provided');
      return res.status(400).json({ error: 'orderId required' });
    }
    
    console.log(`📋 Processing order: ${orderId}`);
    
    // 注文を取得
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      console.log('❌ Order not found');
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const userId = order.user_id || order.userId;
    console.log(`👤 User ID: ${userId}`);
    
    // ステータスをgeneratingに更新
    if (order.status === 'paid') {
      await ordersDB.updateOrder(orderId, {
        status: 'generating'
      });
      console.log('✅ Status updated to generating');
    }
    
    // LINEクライアントを初期化
    const lineClient = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.CHANNEL_SECRET
    });
    
    // ユーザーに通知（エラーは無視）
    try {
      await lineClient.pushMessage(userId, {
        type: 'text',
        text: '✅ 決済完了しました！\n\nレポートを生成中です...\nしばらくお待ちください。'
      });
      console.log('✅ User notified');
    } catch (err) {
      console.log('⚠️ Failed to notify user:', err.message);
    }
    
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
    
    // レポートを生成
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
      
      return res.json({ 
        success: true, 
        message: 'Report generated',
        reportUrl: result.reportUrl 
      });
    } else {
      console.error('❌ Report generation failed:', result.message);
      
      // エラーステータスに更新
      await ordersDB.updateOrder(orderId, {
        status: 'error',
        error_message: result.message
      });
      
      return res.status(500).json({ 
        success: false, 
        message: result.message 
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
};