/**
 * PayPay APIテストスクリプト
 */

const fetch = require('node-fetch');

async function testPayPayAPI() {
    console.log('🧪 PayPay APIのテスト開始...\n');
    
    const testData = {
        diagnosisId: 'test-diagnosis-123',
        userId: 'test-user-456'
    };
    
    try {
        console.log('📡 APIにリクエスト送信中...');
        console.log('URL: https://line-love-edu.vercel.app/api/create-paypay-session');
        console.log('Data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('https://line-love-edu.vercel.app/api/create-paypay-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('\n📊 レスポンス:');
        console.log('Status:', response.status);
        console.log('Body:', JSON.stringify(result, null, 2));
        
        if (result.debug) {
            console.log('\n🔍 デバッグ情報:');
            console.log('API Key設定:', result.debug.hasApiKey ? '✅' : '❌');
            console.log('API Secret設定:', result.debug.hasApiSecret ? '✅' : '❌');
            console.log('Merchant ID設定:', result.debug.hasMerchantId ? '✅' : '❌');
        }
        
        if (result.error === 'PayPay configuration error') {
            console.log('\n⚠️ PayPay環境変数が正しく設定されていません');
            console.log('Vercelダッシュボードで以下の環境変数を確認してください:');
            console.log('- PAYPAY_API_KEY');
            console.log('- PAYPAY_API_SECRET');
            console.log('- PAYPAY_MERCHANT_ID');
            console.log('- PAYPAY_ENV (sandbox or production)');
            console.log('- ENABLE_PAYPAY (true)');
        }
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
    }
}

testPayPayAPI();