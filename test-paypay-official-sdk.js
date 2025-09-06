/**
 * PayPay公式SDKを使ったテスト
 */

const PAYPAY = require('@paypayopa/paypayopa-sdk-node');
const fs = require('fs');

// 環境変数を読み込む
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.log('⚠️ .env.localファイルが見つかりません');
}

// PayPay SDKの設定
PAYPAY.Configure({
    clientId: process.env.PAYPAY_API_KEY,
    clientSecret: process.env.PAYPAY_API_SECRET,
    merchantId: process.env.PAYPAY_MERCHANT_ID,
    productionMode: false // Staging環境を使用
});

console.log('=== PayPay公式SDK テスト ===\n');
console.log('設定:');
console.log('- Client ID:', process.env.PAYPAY_API_KEY);
console.log('- Merchant ID:', process.env.PAYPAY_MERCHANT_ID);
console.log('- Environment:', process.env.PAYPAY_ENV || 'sandbox');
console.log('');

async function testPayPaySDK() {
    try {
        const payload = {
            merchantPaymentId: `test_${Date.now()}`,
            codeType: "ORDER_QR",
            redirectUrl: "https://example.com/success",
            redirectType: "WEB_LINK",
            orderDescription: "テスト注文",
            orderItems: [{
                name: "テスト商品",
                category: "DIGITAL_CONTENT",
                quantity: 1,
                productId: "test_001",
                unitPrice: {
                    amount: 100,
                    currency: "JPY"
                }
            }],
            amount: {
                amount: 100,
                currency: "JPY"
            }
        };
        
        console.log('リクエストペイロード:');
        console.log(JSON.stringify(payload, null, 2));
        console.log('\nAPIリクエスト送信中...\n');
        
        const response = await PAYPAY.QRCodeCreate(payload);
        
        console.log('レスポンス:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.STATUS === 201 && response.BODY) {
            console.log('\n✅ 成功！');
            console.log('決済URL:', response.BODY.data?.url);
            console.log('QRコード:', response.BODY.data?.deeplink);
        } else {
            console.log('\n❌ エラー:', response.ERROR || response.BODY?.resultInfo?.message);
        }
        
    } catch (error) {
        console.error('\n❌ エラー:', error);
    }
}

testPayPaySDK();