#!/usr/bin/env node

// ローカル環境でStripe Webhookをテストするスクリプト
// 環境変数を読み込む
require('dotenv').config();

// テスト環境ではLINE通知を無効化するオプション
const SKIP_LINE_NOTIFICATION = process.env.SKIP_LINE_NOTIFICATION === 'true' || process.argv.includes('--skip-line');

const https = require('https');
const http = require('http');

// コマンドライン引数から注文IDとユーザーIDを取得
const args = process.argv.slice(2);
const orderId = args[0] || 'ORDER_TEST_' + Date.now();
const userId = args[1] || process.env.TEST_USER_ID || 'U69bf66f589f5303a9615e94d7a7dc693';

console.log('🚀 Testing Stripe webhook locally...');
console.log('📋 Order ID:', orderId);
console.log('👤 User ID:', userId);

// まず注文を作成
const ordersDB = require('./core/database/orders-db');

async function testWebhook() {
  try {
    // 1. 注文を作成
    console.log('\n1️⃣ Creating order...');
    await ordersDB.createOrder({
      id: orderId,
      orderId: orderId,
      userId: userId,
      user_id: userId,
      amount: 1980,
      status: 'pending'
    });
    console.log('✅ Order created');

    // 2. Webhook処理を直接実行
    console.log('\n2️⃣ Executing webhook handler...');
    
    // ローカルテスト用の環境変数を設定
    process.env.STRIPE_WEBHOOK_SECRET = '';  // 署名検証をスキップ
    
    if (SKIP_LINE_NOTIFICATION) {
      console.log('⚠️ LINE notifications disabled for testing');
      // LINE APIのトークンを一時的に無効化
      process.env.CHANNEL_ACCESS_TOKEN_BACKUP = process.env.CHANNEL_ACCESS_TOKEN;
      process.env.CHANNEL_ACCESS_TOKEN = '';
    }
    
    const webhookHandler = require('./api/stripe-webhook-simple');
    
    // リクエストとレスポンスのモック
    const mockBody = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Date.now(),
          metadata: {
            orderId: orderId,
            userId: userId
          }
        }
      }
    };
    
    const mockReq = {
      headers: {
        'stripe-signature': 'test-signature'
      },
      body: Buffer.from(JSON.stringify(mockBody)),
      on: (event, handler) => {
        if (event === 'end') handler();
      }
    };

    const mockRes = {
      status: (code) => ({
        send: (msg) => console.log(`Response ${code}:`, msg),
        json: (data) => console.log(`Response ${code}:`, data)
      }),
      json: (data) => console.log('Response:', data),
      send: (msg) => console.log('Response:', msg)
    };

    // Webhook処理を実行
    await webhookHandler(mockReq, mockRes);
    
    console.log('\n✅ Webhook test completed!');
    
    // 3. 注文ステータスを確認
    console.log('\n3️⃣ Checking order status...');
    const order = await ordersDB.getOrder(orderId);
    if (order) {
      console.log('📊 Order status:', order.status);
      console.log('📊 Report URL:', order.reportUrl || order.report_url || 'Not yet generated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// 実行
testWebhook();