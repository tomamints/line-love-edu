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
      
      // バックグラウンドでレポート生成を開始（レスポンスは待たない）
      const https = require('https');
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'https://line-love-edu.vercel.app';
      
      // 少し遅延を入れて、本体のレポート生成を呼び出す
      setTimeout(() => {
        const fullProcessUrl = `${baseUrl}/api/process-paid-orders?orderId=${orderId}`;
        console.log('🚀 Starting full report generation:', fullProcessUrl);
        
        https.get(fullProcessUrl, (resp) => {
          console.log('📊 Full generation started, status:', resp.statusCode);
        }).on('error', (err) => {
          console.error('❌ Failed to start full generation:', err.message);
        });
      }, 2000); // 2秒後に実行
      
      return res.json({ 
        success: true, 
        message: 'Report generation started',
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