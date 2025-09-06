/**
 * PayPay認証デバッグスクリプト
 * 署名生成の各ステップを詳細に確認
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

// 環境変数を.env.localから読み込む
const fs = require('fs');
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

console.log('=== PayPay認証デバッグ ===\n');
console.log('認証情報:');
console.log('API Key:', PAYPAY_API_KEY);
console.log('API Secret:', PAYPAY_API_SECRET ? '***' + PAYPAY_API_SECRET.substring(PAYPAY_API_SECRET.length - 4) : 'なし');
console.log('Merchant ID:', PAYPAY_MERCHANT_ID);
console.log('');

// テストペイロード
const payload = {
    merchantPaymentId: `test_${Date.now()}`,
    codeType: "ORDER_QR",
    redirectUrl: "https://example.com/success",
    redirectType: "WEB_LINK",
    orderDescription: "Test Order",
    orderItems: [{
        name: "Test Item",
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
    },
    requestedAt: Date.now()
};

const bodyJson = JSON.stringify(payload);
const contentType = 'application/json';
const method = 'POST';
const path = '/codes';

// 各ステップの値を記録
console.log('=== 署名生成ステップ ===\n');

// Step 1: Nonce生成
const nonce = crypto.randomBytes(8).toString('hex');
console.log('1. Nonce:', nonce);

// Step 2: Epoch生成
const epoch = Math.floor(Date.now() / 1000).toString();
console.log('2. Epoch:', epoch);

// Step 3: Body Hash（MD5）
console.log('\n3. Body Hash計算:');
console.log('   Content-Type:', contentType);
console.log('   Body Length:', bodyJson.length);

// PayPayの仕様に従ってMD5を計算
const md5 = crypto.createHash('md5');
md5.update(contentType, 'utf8');
md5.update(bodyJson, 'utf8');
const bodyHash = md5.digest('base64');
console.log('   MD5 Hash:', bodyHash);

// Step 4: 署名対象文字列
const signatureData = [
    path,
    method,
    nonce,
    epoch,
    contentType,
    bodyHash
].join('\n');

console.log('\n4. 署名対象文字列:');
console.log('---');
console.log(signatureData);
console.log('---');

// Step 5: HMAC-SHA256署名
const signature = crypto
    .createHmac('sha256', PAYPAY_API_SECRET)
    .update(signatureData, 'utf8')
    .digest('base64');

console.log('\n5. HMAC-SHA256署名:', signature);

// Step 6: 認証ヘッダー
const authHeader = `hmac OPA-Auth:${PAYPAY_API_KEY}:${signature}:${nonce}:${epoch}:${bodyHash}`;
console.log('\n6. 認証ヘッダー:');
console.log(authHeader);

// APIリクエスト送信
console.log('\n=== APIリクエスト送信 ===\n');

const url = 'https://stg-api.sandbox.paypay.ne.jp/v2/codes';
console.log('URL:', url);
console.log('');

async function sendRequest() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Authorization': authHeader,
                'X-ASSUME-MERCHANT': PAYPAY_MERCHANT_ID
            },
            body: bodyJson
        });
        
        const result = await response.json();
        
        console.log('レスポンスステータス:', response.status);
        console.log('レスポンス:', JSON.stringify(result, null, 2));
        
        if (result.resultInfo?.code === 'UNAUTHORIZED') {
            console.log('\n❌ 認証エラー診断:');
            console.log('1. API KeyとAPI Secretが正しいペアか確認');
            console.log('2. Merchant IDが正しいか確認');
            console.log('3. sandboxアカウントであることを確認');
            console.log('4. 時刻が正しいか確認（Epochが現在時刻になっているか）');
        }
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

sendRequest();