// api/test-report-generation.js
// レポート生成をテストするためのエンドポイント
// 本番環境では削除してください

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  const { orderId } = req.query;
  
  console.log('\n========== TEST REPORT GENERATION ==========');
  console.log('📍 Time:', new Date().toISOString());
  
  try {
    // orderIdが指定されていない場合は、最新のgenerating状態の注文を探す
    let targetOrderId = orderId;
    
    if (!targetOrderId) {
      console.log('🔍 Finding generating orders...');
      
      // 注文一覧を取得（実装依存）
      const orders = await ordersDB.getAllOrders ? 
        await ordersDB.getAllOrders() : [];
      
      // generating状態の注文を探す
      const generatingOrder = orders.find(o => 
        o.status === 'generating' || o.status === 'paid'
      );
      
      if (generatingOrder) {
        targetOrderId = generatingOrder.id || generatingOrder.orderId;
        console.log(`📋 Found order: ${targetOrderId}`);
      } else {
        return res.json({
          message: 'No orders in generating/paid state',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // process-report-loopを呼び出し
    console.log(`🚀 Starting process-report-loop for ${targetOrderId}...`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/process-report-loop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: targetOrderId,
        iteration: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📊 Result:', result);
    
    return res.json({
      message: 'Test completed',
      orderId: targetOrderId,
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};