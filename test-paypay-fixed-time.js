/**
 * PayPay API テスト（時刻修正版）
 */

const crypto = require('crypto');
const fetch = require('node-fetch');
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

const PAYPAY_API_KEY = process.env.PAYPAY_API_KEY;
const PAYPAY_API_SECRET = process.env.PAYPAY_API_SECRET;
const PAYPAY_MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;

// HMAC-SHA256署名を生成
function generateAuthHeader(method, path, contentType, body = '') {
    const nonce = crypto.randomBytes(8).toString('hex');
    
    // 2024年の正しい時刻を使用（現在は2024年12月6日）
    const realNow = new Date('2024-12-06T20:30:00Z');
    const epoch = Math.floor(realNow.getTime() / 1000).toString();
    
    // MD5ハッシュ
    let bodyHash = 'empty';
    if (body) {
        const md5 = crypto.createHash('md5');
        md5.update(contentType, 'utf8');
        md5.update(body, 'utf8');
        bodyHash = md5.digest('base64');
    }
    
    // 署名対象文字列
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        bodyHash
    ].join('\n');
    
    console.log('署名データ:');
    console.log('- Epoch (2024年12月):', epoch);
    console.log('- Nonce:', nonce);
    console.log('- Body Hash:', bodyHash);
    
    // HMAC-SHA256署名
    const signature = crypto
        .createHmac('sha256', PAYPAY_API_SECRET)
        .update(signatureData, 'utf8')
        .digest('base64');
    
    return `hmac OPA-Auth:${PAYPAY_API_KEY}:${signature}:${nonce}:${epoch}:${bodyHash}`;
}

async function testPayPay() {
    const merchantPaymentId = `test_${Date.now()}`;
    const amount = 100;
    
    const paymentData = {
        merchantPaymentId: merchantPaymentId,
        codeType: "ORDER_QR",
        redirectUrl: "https://example.com/success",
        redirectType: "WEB_LINK",
        orderDescription: "テスト注文",
        orderItems: [{
            name: "テスト商品",
            category: "DIGITAL_CONTENT",
            quantity: 1,
            productId: "test_product",
            unitPrice: {
                amount: amount,
                currency: "JPY"
            }
        }],
        amount: {
            amount: amount,
            currency: "JPY"
        },
        requestedAt: new Date('2024-12-06T20:30:00Z').getTime() // 2024年の時刻を使用
    };
    
    const bodyJson = JSON.stringify(paymentData);
    const authHeader = generateAuthHeader('POST', '/codes', 'application/json', bodyJson);
    
    console.log('\nAPIリクエスト送信中...');
    
    try {
        const response = await fetch('https://stg-api.sandbox.paypay.ne.jp/v2/codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-ASSUME-MERCHANT': PAYPAY_MERCHANT_ID
            },
            body: bodyJson
        });
        
        const result = await response.json();
        
        console.log('\nレスポンス:', JSON.stringify(result, null, 2));
        
        if (result.resultInfo?.code === 'SUCCESS') {
            console.log('\n✅ 成功！決済URL:', result.data?.url);
        } else {
            console.log('\n❌ エラー:', result.resultInfo?.message);
        }
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

testPayPay();