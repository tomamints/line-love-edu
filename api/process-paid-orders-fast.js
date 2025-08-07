// api/process-paid-orders-fast.js
// 高速版：ステータス更新のみ行い、重い処理は後回し

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  console.log('\n========== FAST PROCESS START ==========');
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
    
    console.log(`📋 Order status: ${order.status}`);
    
    // paidの場合はgeneratingに更新して、実際の生成も開始
    if (order.status === 'paid') {
      await ordersDB.updateOrder(orderId, {
        status: 'generating'
      });
      console.log('✅ Status updated to generating');
      
      // レポート生成を開始
      console.log('🚀 Starting report generation...');
      
      // バックグラウンドでレポート生成
      const https = require('https');
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'https://line-love-edu.vercel.app';
      
      setTimeout(() => {
        const fullProcessUrl = `${baseUrl}/api/generate-report-from-saved?orderId=${orderId}`;
        console.log('📊 Calling report generator:', fullProcessUrl);
        
        https.get(fullProcessUrl, (resp) => {
          console.log('✅ Report generation started, status:', resp.statusCode);
        }).on('error', (err) => {
          console.error('❌ Failed to start generation:', err.message);
        });
      }, 2000);
      
      // ユーザーに通知
      try {
        const line = require('@line/bot-sdk');
        const lineClient = new line.Client({
          channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
          channelSecret: process.env.CHANNEL_SECRET
        });
        
        await lineClient.pushMessage(order.user_id || order.userId, {
          type: 'text',
          text: '✅ 決済完了しました！\n\n🔮 レポートを生成中です...\n\n完成まで2-3分お待ちください。\n完成したら自動的に通知いたします。'
        });
        console.log('✅ User notified');
      } catch (err) {
        console.error('❌ Failed to notify user:', err.message);
      }
      
      return res.json({ 
        success: true, 
        message: 'Report generation ready',
        orderId 
      });
    }
    
    return res.json({ 
      success: false, 
      message: `Order status is ${order.status}`,
      orderId 
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};