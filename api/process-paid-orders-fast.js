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
    
    // paidの場合はgeneratingに更新
    if (order.status === 'paid') {
      await ordersDB.updateOrder(orderId, {
        status: 'generating'
      });
      console.log('✅ Status updated to generating');
      
      // ここで実際のレポート生成は行わない
      // 後で別のプロセスかユーザーのメッセージ時に生成
      
      return res.json({ 
        success: true, 
        message: 'Report generation queued',
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