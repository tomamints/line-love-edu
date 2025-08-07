#!/usr/bin/env node

// 注文のステータスを確認するスクリプト
require('dotenv').config();

const ordersDB = require('./core/database/orders-db');

async function checkOrderStatus(orderId) {
  try {
    console.log('\n=== 注文ステータス確認 ===');
    console.log('📋 Order ID:', orderId);
    
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      console.log('❌ 注文が見つかりません');
      return;
    }
    
    console.log('\n📊 注文情報:');
    console.log('  Status:', order.status);
    console.log('  Amount:', order.amount);
    console.log('  Paid at:', order.paidAt || order.paid_at || 'Not paid');
    console.log('  Report URL:', order.reportUrl || order.report_url || 'Not generated');
    console.log('  Created:', order.createdAt || order.created_at);
    console.log('  Updated:', order.updatedAt || order.updated_at);
    
    // ステータスに応じたメッセージ
    switch(order.status) {
      case 'pending':
        console.log('\n⏳ 決済待ち');
        break;
      case 'paid':
        console.log('\n💰 決済完了 - レポート生成待機中');
        break;
      case 'generating':
        console.log('\n🔄 レポート生成中...');
        break;
      case 'completed':
        console.log('\n✅ 完了！レポートが生成されました');
        if (order.reportUrl || order.report_url) {
          console.log('📄 レポートURL:', order.reportUrl || order.report_url);
        }
        break;
      case 'error':
        console.log('\n❌ エラーが発生しました');
        if (order.error_message) {
          console.log('Error:', order.error_message);
        }
        break;
      default:
        console.log('\n❓ 不明なステータス:', order.status);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// コマンドライン引数から注文IDを取得
const orderId = process.argv[2];

if (!orderId) {
  console.log('使い方: node check-order-status.js <ORDER_ID>');
  console.log('例: node check-order-status.js ORDER_U69bf66f_1754581840762_e1pye5');
  process.exit(1);
}

checkOrderStatus(orderId);