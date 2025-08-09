// api/test-progress.js
// 進捗保存と取得をテスト

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  const { orderId = 'test-order-123', action = 'test' } = req.query;
  
  console.log('\n========== TEST PROGRESS ==========');
  console.log('📍 Order ID:', orderId);
  console.log('📍 Action:', action);
  
  try {
    if (action === 'save') {
      // テスト用の進捗データを保存
      const testProgress = {
        currentStep: 2,
        totalSteps: 5,
        data: {
          test: 'This is test data',
          timestamp: new Date().toISOString()
        },
        attempts: 1,
        startedAt: new Date().toISOString()
      };
      
      console.log('💾 Saving test progress:', testProgress);
      const saved = await ordersDB.saveReportProgress(orderId, testProgress);
      
      return res.json({
        action: 'save',
        orderId: orderId,
        saved: saved,
        progress: testProgress
      });
    }
    
    if (action === 'get') {
      // 進捗データを取得
      console.log('📊 Getting progress...');
      const progress = await ordersDB.getReportProgress(orderId);
      
      return res.json({
        action: 'get',
        orderId: orderId,
        found: !!progress,
        progress: progress
      });
    }
    
    if (action === 'clear') {
      // 進捗データをクリア
      console.log('🧹 Clearing progress...');
      await ordersDB.clearReportProgress(orderId);
      
      return res.json({
        action: 'clear',
        orderId: orderId,
        cleared: true
      });
    }
    
    // デフォルト: 完全なテスト（保存→取得→クリア→再取得）
    console.log('🔄 Running full test...');
    
    // 1. 保存
    const testProgress = {
      currentStep: 3,
      totalSteps: 5,
      data: {
        message: 'Full test data',
        timestamp: new Date().toISOString()
      },
      attempts: 1,
      startedAt: new Date().toISOString()
    };
    
    console.log('1️⃣ Saving...');
    const saved = await ordersDB.saveReportProgress(orderId, testProgress);
    console.log('   Result:', saved);
    
    // 2. 取得
    console.log('2️⃣ Getting...');
    const retrieved = await ordersDB.getReportProgress(orderId);
    console.log('   Found:', !!retrieved);
    console.log('   Data matches:', JSON.stringify(retrieved) === JSON.stringify(testProgress));
    
    // 3. クリア
    console.log('3️⃣ Clearing...');
    await ordersDB.clearReportProgress(orderId);
    
    // 4. 再取得（nullになるはず）
    console.log('4️⃣ Getting after clear...');
    const afterClear = await ordersDB.getReportProgress(orderId);
    console.log('   Should be null:', afterClear === null);
    
    return res.json({
      action: 'test',
      orderId: orderId,
      results: {
        save: saved,
        retrieve: !!retrieved,
        dataMatches: JSON.stringify(retrieved) === JSON.stringify(testProgress),
        clearWorks: afterClear === null
      },
      success: saved && retrieved && afterClear === null
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
};