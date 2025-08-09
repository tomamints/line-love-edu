// api/test-save-progress.js
// 進捗保存のテスト

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  const { orderId, step = 1 } = req.query;
  
  console.log('\n========== TEST SAVE PROGRESS ==========');
  console.log('📍 Order ID:', orderId);
  console.log('📍 Step:', step);
  
  if (!orderId) {
    return res.status(400).json({ error: 'orderId required' });
  }
  
  try {
    // 1. 現在の状態を確認
    console.log('1️⃣ 現在の注文を取得...');
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('📊 現在のステータス:', order.status);
    
    // 2. 進捗を保存
    console.log('2️⃣ 進捗を保存...');
    const progress = {
      currentStep: parseInt(step),
      totalSteps: 5,
      data: {
        test: 'This is test data',
        timestamp: new Date().toISOString()
      },
      attempts: 1,
      startedAt: new Date().toISOString()
    };
    
    const saved = await ordersDB.saveReportProgress(orderId, progress);
    console.log('💾 保存結果:', saved);
    
    // 3. 保存後の状態を確認
    console.log('3️⃣ 保存後の注文を取得...');
    const updatedOrder = await ordersDB.getOrder(orderId);
    console.log('📊 更新後のステータス:', updatedOrder?.status);
    
    // 4. 進捗を取得
    console.log('4️⃣ 進捗を取得...');
    const retrievedProgress = await ordersDB.getReportProgress(orderId);
    console.log('📊 取得した進捗:', retrievedProgress);
    
    return res.json({
      success: true,
      test: 'save_and_retrieve',
      orderId: orderId,
      before: {
        status: order.status
      },
      after: {
        status: updatedOrder?.status,
        saved: saved,
        progress: retrievedProgress
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
};