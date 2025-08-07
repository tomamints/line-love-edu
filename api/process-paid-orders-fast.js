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
      
      // 自動レポート生成は無効化
      // ユーザーが「レポート状況」を送信した時に正しいトーク履歴で生成される
      console.log('📝 Note: レポート生成は「レポート状況」コマンドで実行されます');
      
      // LINEでユーザーに通知
      try {
        const line = require('@line/bot-sdk');
        const lineClient = new line.Client({
          channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
          channelSecret: process.env.CHANNEL_SECRET
        });
        
        await lineClient.pushMessage(order.user_id || order.userId, {
          type: 'text',
          text: '✅ 決済完了しました！\n\nレポート生成の準備ができました。\n\n以下の手順でレポートを生成してください：\n\n1️⃣ トーク履歴をエクスポート\n2️⃣ このチャットに送信\n3️⃣ 「レポート状況」と送信\n\nトーク履歴の取り方が分からない場合は「使い方」と送信してください。'
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