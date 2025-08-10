// api/process-report-loop.js
// レポート生成を完了まで自動的にループ処理する
// Vercelの60秒制限内で可能な限り処理し、必要に応じて自己呼び出しする

const ordersDB = require('../core/database/orders-db');
const line = require('@line/bot-sdk');
const PaymentHandler = require('../core/premium/payment-handler');

const paymentHandler = new PaymentHandler();

/**
 * レポート生成を完了まで処理
 * @param {string} orderId - 注文ID
 * @param {number} iteration - 現在の反復回数
 * @returns {object} 処理結果
 */
async function processReportWithLoop(orderId, iteration = 1) {
  const maxIterations = 5; // 最大5回まで（Step数と同じ）
  const startTime = Date.now();
  const TIME_LIMIT = 55000; // 55秒（Vercelの60秒制限に対して余裕を持つ）
  
  console.log(`\n🔄 Process Report Loop - Iteration ${iteration}/${maxIterations}`);
  console.log(`📍 Order ID: ${orderId}`);
  console.log(`📍 Time: ${new Date().toISOString()}`);
  
  try {
    // 注文状態を確認
    const order = await ordersDB.getOrder(orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return { success: false, error: 'Order not found' };
    }
    
    // 既に完了している場合
    if (order.status === 'completed') {
      console.log('✅ Already completed');
      return { 
        success: true, 
        status: 'completed',
        reportUrl: order.reportUrl 
      };
    }
    
    // エラー状態の場合
    if (order.status === 'error') {
      console.log('❌ Order in error state');
      return { 
        success: false, 
        status: 'error',
        error: order.error_message 
      };
    }
    
    // generate-report-chunkedを呼び出し続ける
    let lastStatus = 'continuing';
    let callCount = 0;
    const maxCallsPerIteration = 1; // 1回のイテレーションで最大1回呼び出し（2→1に変更）
    
    while ((Date.now() - startTime) < TIME_LIMIT && callCount < maxCallsPerIteration) {
      console.log(`\n📞 Calling generate-report-chunked (call ${callCount + 1}/${maxCallsPerIteration})`);
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
        const response = await fetch(`${baseUrl}/api/generate-report-chunked`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderId,
            continueFrom: callCount === 0 ? 'start' : 'continue'
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Chunked API error: ${errorText}`);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`📊 Result: ${result.status}`);
        lastStatus = result.status;
        
        // 完了した場合
        if (result.status === 'completed') {
          console.log('🎉 Report generation completed!');
          
          // pushMessageは使用しない（ユーザーは「レポート」で確認）
          console.log('🎉 Report completed - user can check with "レポート" command');
          
          return {
            success: true,
            status: 'completed',
            reportUrl: result.reportUrl
          };
        }
        
        // エラーの場合
        if (result.status === 'error') {
          console.error('❌ Report generation failed');
          return {
            success: false,
            status: 'error',
            error: result.message
          };
        }
        
        // Batch API待機中でも通常処理（無限ループエラーが出るが動く）
        if (result.status === 'waiting_batch') {
          console.log(`⏳ Batch API waiting... (${result.message})`);
          lastStatus = 'continuing'; // continuingとして扱う
          callCount++;
          
          // 少し待つ（サーバー負荷軽減、無限ループ検出を回避）
          await new Promise(resolve => setTimeout(resolve, 45000)); // 45秒待つ
        }
        
        // Step 3完了でStep 4に進む場合は、process-report-loopを終了
        if (result.nextStep === 4) {
          console.log('🏁 Step 3 completed, Step 4+ will be handled by generate-report-chunked directly');
          return {
            success: false,
            status: 'step3_completed',
            message: 'Step 3 completed, continuing with Step 4 via generate-report-chunked'
          };
        }
        // まだ続きがある場合（waiting_batchの場合は除く）
        else if (result.status === 'continuing') {
          console.log(`⏳ Continuing... (step ${result.nextStep}/${result.totalSteps})`);
          callCount++;
          
          // 少し待つ（サーバー負荷軽減、Vercelの無限ループ検出を回避）
          await new Promise(resolve => setTimeout(resolve, 45000)); // 45秒待つ
        }
        
      } catch (error) {
        console.error(`❌ Error calling generate-report-chunked:`, error.message);
        callCount++;
        
        // エラーでも続行を試みる（Vercelの無限ループ検出を回避）
        await new Promise(resolve => setTimeout(resolve, 45000)); // 45秒待つ
      }
      
      // 時間チェック
      const elapsed = Date.now() - startTime;
      if (elapsed > TIME_LIMIT - 10000) { // 残り10秒を切ったら
        console.log('⏰ Time limit approaching, preparing to self-invoke');
        break;
      }
    }
    
    // まだ完了していない場合、自分自身を再呼び出し
    console.log(`📊 Loop ended - lastStatus: ${lastStatus}, iteration: ${iteration}/${maxIterations}, callCount: ${callCount}`);
    
    if (lastStatus === 'continuing' && iteration < maxIterations) {
      console.log('🔄 Self-invoking for next iteration...');
      
      // 非同期で次のイテレーションを開始（待たない）
      const triggerNextIteration = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
          const response = await fetch(`${baseUrl}/api/process-report-loop`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderId: orderId,
              iteration: iteration + 1
            })
          });
          
          if (response.ok) {
            console.log('✅ Next iteration triggered successfully');
          } else {
            console.error('❌ Failed to trigger next iteration:', response.status);
          }
        } catch (error) {
          console.error('❌ Error triggering next iteration:', error.message);
        }
      };
      
      // 非同期実行（少し待つ）
      const triggerPromise = triggerNextIteration().catch(err => {
        console.error('❌ Trigger failed:', err);
      });
      
      // fetchが開始されるまで少し待つ（500ms）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // レスポンスを返す
      return {
        success: false,
        status: 'continuing',
        message: `Processing continues in iteration ${iteration + 1}`
      };
    }
    
    // 最大イテレーション数に達した場合
    if (iteration >= maxIterations) {
      console.error('❌ Max iterations reached');
      await ordersDB.updateOrder(orderId, {
        status: 'error',
        error_message: 'Max processing iterations reached'
      });
      return {
        success: false,
        status: 'error',
        error: 'Max iterations reached'
      };
    }
    
    
    return {
      success: false,
      status: lastStatus,
      message: 'Processing incomplete'
    };
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    
    // エラーステータスに更新
    await ordersDB.updateOrder(orderId, {
      status: 'error',
      error_message: error.message
    });
    
    return {
      success: false,
      status: 'error',
      error: error.message
    };
  }
}

// pushMessageを使用しないため、通知関数は不要

// APIエンドポイント
module.exports = async (req, res) => {
  const { orderId, iteration = 1 } = req.body || req.query;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }
  
  console.log('\n========== PROCESS REPORT LOOP ==========');
  
  try {
    const result = await processReportWithLoop(orderId, iteration);
    return res.json(result);
  } catch (error) {
    console.error('❌ Process report loop error:', error);
    return res.status(500).json({
      error: 'Processing failed',
      message: error.message
    });
  }
};