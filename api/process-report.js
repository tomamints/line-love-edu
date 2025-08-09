// api/process-report.js
// レポート生成を最後まで処理するエンドポイント

const ordersDB = require('../core/database/orders-db');

async function processUntilComplete(orderId, attempt = 1) {
  const maxAttempts = 10;
  
  if (attempt > maxAttempts) {
    console.error('❌ Max attempts reached for', orderId);
    await ordersDB.updateOrder(orderId, {
      status: 'error',
      error_message: 'Max processing attempts reached'
    });
    return { status: 'error', message: 'Max attempts reached' };
  }
  
  console.log(`\n🔄 Processing attempt ${attempt} for ${orderId}`);
  
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate-report-chunked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: orderId,
        continueFrom: 'continue'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`📊 Result: ${result.status}`);
    
    // 処理が完了した場合
    if (result.status === 'completed') {
      console.log('✅ Report generation completed!');
      return result;
    }
    
    // エラーの場合
    if (result.status === 'error') {
      console.error('❌ Report generation failed');
      return result;
    }
    
    // まだ続きがある場合は再帰的に呼び出し
    if (result.status === 'continuing') {
      console.log(`⏳ Continuing... (step ${result.nextStep}/${result.totalSteps})`);
      // 少し待ってから次の処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      return processUntilComplete(orderId, attempt + 1);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error in attempt ${attempt}:`, error.message);
    
    // リトライ
    if (attempt < maxAttempts) {
      console.log('🔄 Retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return processUntilComplete(orderId, attempt + 1);
    }
    
    throw error;
  }
}

module.exports = async (req, res) => {
  const { orderId } = req.body || req.query;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }
  
  console.log('\n========== PROCESS REPORT ==========');
  console.log('📍 Order ID:', orderId);
  console.log('📍 Time:', new Date().toISOString());
  
  try {
    // 注文の状態を確認
    const order = await ordersDB.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'completed') {
      return res.json({
        status: 'completed',
        message: 'Already completed',
        reportUrl: order.reportUrl
      });
    }
    
    // 完了まで処理
    const result = await processUntilComplete(orderId);
    
    return res.json(result);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    
    await ordersDB.updateOrder(orderId, {
      status: 'error',
      error_message: error.message
    });
    
    return res.status(500).json({
      error: 'Processing failed',
      message: error.message
    });
  }
};