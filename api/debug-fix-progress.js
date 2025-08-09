// api/debug-fix-progress.js
// デバッグ用: 進捗データの問題を修正

const ordersDB = require('../core/database/orders-db');
const { supabase } = require('../core/database/supabase');

module.exports = async (req, res) => {
  const { orderId, action = 'check' } = req.query;
  
  console.log('\n========== DEBUG FIX PROGRESS ==========');
  console.log('📍 Order ID:', orderId);
  console.log('📍 Action:', action);
  
  if (!orderId) {
    return res.status(400).json({ error: 'orderId required' });
  }
  
  try {
    // 現在の状態を確認
    const order = await ordersDB.getOrder(orderId);
    const progress = await ordersDB.getReportProgress(orderId);
    
    console.log('📊 Current order:', {
      orderId: order?.orderId,
      status: order?.status,
      hasReportProgress: !!order?.report_progress
    });
    
    console.log('📊 Current progress:', progress);
    
    if (action === 'clear') {
      // 進捗をクリア
      console.log('🧹 Clearing progress...');
      await ordersDB.clearReportProgress(orderId);
      
      // ステータスもリセット
      if (order && order.status === 'generating') {
        await ordersDB.updateOrder(orderId, {
          status: 'paid'
        });
        console.log('✅ Status reset to paid');
      }
      
      return res.json({
        action: 'cleared',
        orderId: orderId,
        message: 'Progress cleared successfully'
      });
    }
    
    if (action === 'fix') {
      // 直接Supabaseで確認
      if (supabase) {
        const { data: rawOrder, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (error) {
          console.error('❌ Supabase error:', error);
        } else {
          console.log('📊 Raw Supabase data:', {
            id: rawOrder.id,
            status: rawOrder.status,
            report_progress: rawOrder.report_progress,
            updated_at: rawOrder.updated_at
          });
          
          // report_progressがnullの場合、初期化
          if (!rawOrder.report_progress && rawOrder.status === 'generating') {
            console.log('🔧 Initializing missing progress...');
            const newProgress = {
              currentStep: 1,
              totalSteps: 5,
              data: {},
              attempts: 0,
              startedAt: new Date().toISOString()
            };
            
            await ordersDB.saveReportProgress(orderId, newProgress);
            console.log('✅ Progress initialized');
            
            return res.json({
              action: 'fixed',
              orderId: orderId,
              progress: newProgress,
              message: 'Progress initialized successfully'
            });
          }
        }
      }
    }
    
    if (action === 'restart') {
      // 完全にリスタート
      console.log('🔄 Restarting from scratch...');
      
      // 進捗をクリア
      await ordersDB.clearReportProgress(orderId);
      
      // ステータスをpaidに戻す
      await ordersDB.updateOrder(orderId, {
        status: 'paid'
      });
      
      // process-report-loopを呼び出し
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/process-report-loop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
          iteration: 1
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return res.json({
          action: 'restarted',
          orderId: orderId,
          result: result,
          message: 'Processing restarted successfully'
        });
      } else {
        throw new Error(`Failed to restart: ${response.status}`);
      }
    }
    
    // デフォルト: 状態確認のみ
    return res.json({
      action: 'check',
      orderId: orderId,
      order: {
        status: order?.status,
        hasReportProgress: !!order?.report_progress
      },
      progress: progress
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Debug operation failed',
      message: error.message
    });
  }
};