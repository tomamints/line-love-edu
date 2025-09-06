/**
 * PayPay API ローカルテストスクリプト
 * 環境変数を設定してから実行してください:
 * PAYPAY_API_KEY=xxx PAYPAY_API_SECRET=xxx PAYPAY_MERCHANT_ID=xxx node test-paypay-local.js
 */

const crypto = require('crypto');

// 環境変数から認証情報を取得
const PAYPAY_API_KEY = process.env.PAYPAY_API_KEY;
const PAYPAY_API_SECRET = process.env.PAYPAY_API_SECRET;
const PAYPAY_MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
const PAYPAY_ENV = process.env.PAYPAY_ENV || 'sandbox';

// PayPay APIのベースURL
const PAYPAY_BASE_URL = PAYPAY_ENV === 'production' 
    ? 'https://api.paypay.ne.jp/v2'
    : 'https://stg-api.paypay.ne.jp/v2';

console.log('🔧 PayPay API設定:');
console.log('- Environment:', PAYPAY_ENV);
console.log('- Base URL:', PAYPAY_BASE_URL);
console.log('- API Key:', PAYPAY_API_KEY ? '設定済み' : '❌ 未設定');
console.log('- API Secret:', PAYPAY_API_SECRET ? '設定済み' : '❌ 未設定');
console.log('- Merchant ID:', PAYPAY_MERCHANT_ID || '❌ 未設定');
console.log('');

// HMAC-SHA256署名を生成
function generateAuthHeader(method, path, contentType, body = '') {
    if (!PAYPAY_API_SECRET || !PAYPAY_API_KEY) {
        console.error('❌ PayPay認証情報が不足しています');
        return '';
    }
    
    const nonce = crypto.randomBytes(8).toString('hex');
    const epoch = Math.floor(Date.now() / 1000).toString();
    
    // ペイロードハッシュ（MD5）- Content-TypeとBodyを連結してハッシュ化
    let bodyHash = 'empty';
    if (body) {
        const md5 = crypto.createHash('md5');
        md5.update(contentType, 'utf8');
        md5.update(body, 'utf8');
        bodyHash = md5.digest('base64');
    }
    
    // 署名対象文字列（順序が重要）
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        bodyHash
    ].join('\n');
    
    console.log('📝 署名データ:');
    console.log('- Path:', path);
    console.log('- Method:', method);
    console.log('- Nonce:', nonce);
    console.log('- Epoch:', epoch);
    console.log('- Content-Type:', contentType);
    console.log('- Body Hash:', bodyHash);
    console.log('- Signature Data (first 100 chars):', signatureData.substring(0, 100) + '...');
    
    // HMAC-SHA256署名
    const signature = crypto
        .createHmac('sha256', PAYPAY_API_SECRET)
        .update(signatureData, 'utf8')
        .digest('base64');
    
    console.log('- Signature:', signature);
    
    // 認証ヘッダーのフォーマット
    const authHeader = `hmac OPA-Auth:${PAYPAY_API_KEY}:${signature}:${nonce}:${epoch}:${bodyHash}`;
    console.log('- Auth Header:', authHeader.substring(0, 100) + '...');
    console.log('');
    
    return authHeader;
}

async function testCreatePayment() {
    console.log('🚀 PayPay決済セッション作成テスト開始\n');
    
    if (!PAYPAY_API_KEY || !PAYPAY_API_SECRET || !PAYPAY_MERCHANT_ID) {
        console.error('❌ 環境変数が設定されていません。以下のコマンドで実行してください:');
        console.error('PAYPAY_API_KEY=xxx PAYPAY_API_SECRET=xxx PAYPAY_MERCHANT_ID=xxx node test-paypay-local.js');
        return;
    }
    
    const merchantPaymentId = `test_${Date.now()}`;
    const amount = 100; // テスト用に100円
    
    const paymentData = {
        merchantPaymentId: merchantPaymentId,
        codeType: "ORDER_QR",
        redirectUrl: `https://example.com/success`,
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
        requestedAt: Date.now(),
        userAgent: "Mozilla/5.0"
    };
    
    const bodyJson = JSON.stringify(paymentData);
    const path = '/codes';
    const method = 'POST';
    const contentType = 'application/json';
    
    console.log('📤 リクエストデータ:');
    console.log(JSON.stringify(paymentData, null, 2));
    console.log('');
    
    const authHeader = generateAuthHeader(method, path, contentType, bodyJson);
    
    if (!authHeader) {
        return;
    }
    
    const headers = {
        'Content-Type': contentType,
        'Authorization': authHeader,
        'X-ASSUME-MERCHANT': PAYPAY_MERCHANT_ID
    };
    
    console.log('📨 HTTPヘッダー:');
    Object.entries(headers).forEach(([key, value]) => {
        if (key === 'Authorization') {
            console.log(`- ${key}:`, value.substring(0, 80) + '...');
        } else {
            console.log(`- ${key}:`, value);
        }
    });
    console.log('');
    
    try {
        const fetch = (await import('node-fetch')).default;
        
        console.log('🌐 APIリクエスト送信中...');
        console.log(`URL: ${PAYPAY_BASE_URL}${path}`);
        console.log('');
        
        const response = await fetch(`${PAYPAY_BASE_URL}${path}`, {
            method: method,
            headers: headers,
            body: bodyJson
        });
        
        const responseText = await response.text();
        let result;
        
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ レスポンスのパースエラー:');
            console.error(responseText);
            return;
        }
        
        console.log('📥 レスポンス:');
        console.log('- Status:', response.status);
        console.log('- Headers:', Object.fromEntries(response.headers.entries()));
        console.log('- Body:', JSON.stringify(result, null, 2));
        console.log('');
        
        if (result.resultInfo?.code === 'SUCCESS' && result.data) {
            console.log('✅ 決済セッション作成成功！');
            console.log('- Payment URL:', result.data.url);
            console.log('- Payment ID:', merchantPaymentId);
            console.log('- Expires at:', result.data.expiryDate);
        } else {
            console.error('❌ 決済セッション作成失敗');
            console.error('Error Code:', result.resultInfo?.code);
            console.error('Error Message:', result.resultInfo?.message);
            console.error('Code ID:', result.resultInfo?.codeId);
            
            if (result.resultInfo?.code === 'UNAUTHORIZED') {
                console.log('\n🔍 認証エラーの可能性:');
                console.log('1. API KeyとAPI Secretが正しいか確認');
                console.log('2. Merchant IDが正しいか確認');
                console.log('3. 環境（sandbox/production）が正しいか確認');
                console.log('4. 署名の計算方法が正しいか確認');
            }
        }
        
    } catch (error) {
        console.error('❌ エラー:', error.message);
        console.error(error);
    }
}

// テスト実行
testCreatePayment();