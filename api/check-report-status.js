// api/check-report-status.js
// レポート生成の状態を確認するエンドポイント

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  const { orderId } = req.query;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }
  
  try {
    // 注文情報を取得
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        orderId 
      });
    }
    
    // 進捗情報を取得
    const progress = await ordersDB.getReportProgress(orderId);
    
    // ステータス判定
    const isSuccess = order.status === 'completed';
    const isFailed = order.status === 'error';
    const isProcessing = order.status === 'generating';
    const isPending = order.status === 'pending';
    const isPaid = order.status === 'paid';
    
    // 詳細な判定結果
    const result = {
      orderId,
      status: order.status,
      success: isSuccess,
      failed: isFailed,
      processing: isProcessing || isPaid,
      
      // 成功した場合
      ...(isSuccess && {
        reportUrl: order.reportUrl,
        completedAt: order.updated_at,
        hasPdfData: !!order.pdf_data,
        message: '✅ レポート生成が完了しました'
      }),
      
      // エラーの場合
      ...(isFailed && {
        errorMessage: order.error_message,
        failedAt: order.updated_at,
        message: `❌ レポート生成に失敗: ${order.error_message}`
      }),
      
      // 処理中の場合
      ...(isProcessing && progress && {
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps || 5,
        percentComplete: Math.round((progress.currentStep / (progress.totalSteps || 5)) * 100),
        attempts: progress.attempts || 1,
        lastUpdate: progress.updatedAt || progress.startedAt,
        message: `⏳ 処理中: ステップ ${progress.currentStep}/${progress.totalSteps || 5} (${Math.round((progress.currentStep / (progress.totalSteps || 5)) * 100)}%)`
      }),
      
      // 支払い待ちの場合
      ...(isPending && {
        message: '💳 支払い待ち'
      }),
      
      // 支払い完了・処理開始前の場合
      ...(isPaid && !progress && {
        message: '🚀 レポート生成を開始しています...'
      }),
      
      // タイムスタンプ
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      
      // Stripe情報
      stripeSessionId: order.stripeSessionId || order.stripe_session_id,
      paidAt: order.paidAt || order.paid_at
    };
    
    // コンソールログ用の詳細出力
    console.log('\n========== REPORT STATUS CHECK ==========');
    console.log('📍 Order ID:', orderId);
    console.log('📊 Status:', order.status);
    console.log('✅ Success:', isSuccess);
    console.log('❌ Failed:', isFailed);
    console.log('⏳ Processing:', isProcessing);
    
    if (progress) {
      console.log('\n📈 Progress Details:');
      console.log('  - Current Step:', progress.currentStep);
      console.log('  - Total Steps:', progress.totalSteps || 5);
      console.log('  - Attempts:', progress.attempts || 1);
      console.log('  - Started At:', progress.startedAt);
    }
    
    if (isSuccess) {
      console.log('\n🎉 SUCCESS DETAILS:');
      console.log('  - Report URL:', order.reportUrl);
      console.log('  - Has PDF Data:', !!order.pdf_data);
      console.log('  - Completed At:', order.updated_at);
    }
    
    if (isFailed) {
      console.log('\n💔 FAILURE DETAILS:');
      console.log('  - Error:', order.error_message);
      console.log('  - Failed At:', order.updated_at);
    }
    
    console.log('==========================================\n');
    
    return res.json(result);
    
  } catch (error) {
    console.error('❌ Error checking report status:', error);
    return res.status(500).json({
      error: 'Failed to check status',
      message: error.message
    });
  }
};