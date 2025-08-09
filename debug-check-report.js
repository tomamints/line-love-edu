// debug-check-report.js
// レポート生成の成功/失敗を確認するデバッグスクリプト

const ordersDB = require('./core/database/orders-db');
require('dotenv').config();

async function checkRecentReports() {
  console.log('\n========== レポート生成状況チェック ==========');
  console.log('📍 時刻:', new Date().toISOString());
  
  try {
    // 最近の注文を取得（実装依存）
    // ここでは特定のorder IDを直接指定することもできます
    const orders = await ordersDB.getAllOrders ? 
      await ordersDB.getAllOrders() : 
      [];
    
    if (orders.length === 0) {
      console.log('⚠️ 注文が見つかりません');
      
      // 特定のOrder IDで確認したい場合はここに入力
      const testOrderId = process.argv[2]; // コマンドライン引数から取得
      if (testOrderId) {
        console.log(`\n📝 Order ID: ${testOrderId} を確認中...`);
        await checkSingleOrder(testOrderId);
      }
      return;
    }
    
    // 各注文の状態を確認
    for (const order of orders.slice(-5)) { // 最新5件を確認
      await checkSingleOrder(order.id || order.orderId);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function checkSingleOrder(orderId) {
  console.log(`\n📋 Order: ${orderId}`);
  console.log('-----------------------------------');
  
  try {
    // 注文情報を取得
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      console.log('  ❌ 注文が見つかりません');
      return;
    }
    
    // ステータスによる判定
    const statusEmoji = {
      'completed': '✅',
      'error': '❌',
      'generating': '⏳',
      'paid': '💰',
      'pending': '⏸️'
    };
    
    console.log(`  状態: ${statusEmoji[order.status] || '❓'} ${order.status}`);
    console.log(`  作成: ${order.created_at}`);
    console.log(`  更新: ${order.updated_at}`);
    
    // 成功判定
    if (order.status === 'completed') {
      console.log('\n  🎉 レポート生成成功！');
      console.log(`  📊 URL: ${order.reportUrl || 'なし'}`);
      console.log(`  📄 PDF: ${order.pdf_data ? 'あり' : 'なし'}`);
      
      // 所要時間を計算
      if (order.paidAt && order.updated_at) {
        const start = new Date(order.paidAt);
        const end = new Date(order.updated_at);
        const duration = Math.round((end - start) / 1000);
        console.log(`  ⏱️ 処理時間: ${duration}秒`);
      }
    }
    
    // エラー判定
    else if (order.status === 'error') {
      console.log('\n  💔 レポート生成失敗');
      console.log(`  エラー: ${order.error_message || '詳細不明'}`);
    }
    
    // 処理中判定
    else if (order.status === 'generating') {
      console.log('\n  ⏳ 現在処理中...');
      
      // 進捗情報を取得
      const progress = await ordersDB.getReportProgress(orderId);
      if (progress) {
        const percent = Math.round((progress.currentStep / (progress.totalSteps || 5)) * 100);
        console.log(`  進捗: ${progress.currentStep}/${progress.totalSteps || 5} (${percent}%)`);
        console.log(`  試行: ${progress.attempts || 1}回目`);
        
        // タイムアウトの可能性を判定
        if (progress.startedAt) {
          const elapsed = Date.now() - new Date(progress.startedAt).getTime();
          const minutes = Math.floor(elapsed / 60000);
          console.log(`  経過: ${minutes}分`);
          
          if (minutes > 5) {
            console.log('  ⚠️ 長時間処理中 - タイムアウトの可能性');
          }
        }
      }
    }
    
    // 支払い済み判定
    else if (order.status === 'paid') {
      console.log('\n  💰 支払い完了・生成待機中');
      if (order.paidAt) {
        const elapsed = Date.now() - new Date(order.paidAt).getTime();
        const seconds = Math.floor(elapsed / 1000);
        console.log(`  待機時間: ${seconds}秒`);
        
        if (seconds > 60) {
          console.log('  ⚠️ 生成開始に時間がかかっています');
        }
      }
    }
    
  } catch (error) {
    console.log(`  ❌ エラー: ${error.message}`);
  }
}

// 使い方をヘルプ表示
function showHelp() {
  console.log(`
使い方:
  node debug-check-report.js [ORDER_ID]
  
例:
  node debug-check-report.js                    # 最近の注文を確認
  node debug-check-report.js order_abc123       # 特定の注文を確認
  
判定基準:
  ✅ completed = 成功（レポート生成完了）
  ❌ error = 失敗（エラーで中断）
  ⏳ generating = 処理中（チャンク処理実行中）
  💰 paid = 支払い済み（生成開始待ち）
  ⏸️ pending = 未払い
`);
}

// メイン実行
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  showHelp();
} else {
  checkRecentReports().then(() => {
    console.log('\n========================================\n');
    process.exit(0);
  });
}