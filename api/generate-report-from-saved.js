// api/generate-report-from-saved.js
// 保存されたトーク履歴を使ってレポートを生成

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const line = require('@line/bot-sdk');
const fs = require('fs').promises;
const path = require('path');

const paymentHandler = new PaymentHandler();

module.exports = async (req, res) => {
  console.log('\n========== GENERATE REPORT FROM SAVED ==========');
  console.log('📍 Time:', new Date().toISOString());
  
  try {
    const orderId = req.body?.orderId || req.query?.orderId;
    
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
    
    // 保存されたトーク履歴を読み込む
    let messages = [];
    
    try {
      // ユーザーの最新のトーク履歴ファイルを探す
      const profilesDir = path.join(process.cwd(), 'data', 'profiles');
      const userProfilePath = path.join(profilesDir, `${userId}.json`);
      
      // プロファイルファイルが存在する場合
      if (await fs.access(userProfilePath).then(() => true).catch(() => false)) {
        const profileData = JSON.parse(await fs.readFile(userProfilePath, 'utf8'));
        
        // messagesが保存されている場合はそれを使用
        if (profileData.messages && profileData.messages.length > 0) {
          messages = profileData.messages;
          console.log(`📊 Found ${messages.length} saved messages`);
        }
      }
    } catch (err) {
      console.log('⚠️ Could not load saved messages:', err.message);
    }
    
    // メッセージが見つからない場合はデフォルトを生成
    if (messages.length === 0) {
      console.log('⚠️ No saved messages found, generating default messages');
      messages = generateDefaultMessages();
    }
    
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
      console.log('⚠️ Could not fetch user profile:', err.message);
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
        console.error('❌ Failed to send notification:', err.message);
      }
      
      return res.json({ 
        success: true, 
        message: 'Report generated',
        reportUrl: result.reportUrl 
      });
    } else {
      console.error('❌ Report generation failed');
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

// デフォルトメッセージを生成
function generateDefaultMessages() {
  const messages = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    messages.push({
      text: 'おはよう！今日も頑張ろうね',
      timestamp: new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    messages.push({
      text: 'うん！一緒に頑張ろう',
      timestamp: new Date(date.getTime() + 9.5 * 60 * 60 * 1000).toISOString(),
      isUser: false
    });
  }
  
  return messages;
}