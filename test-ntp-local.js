const crypto = require('crypto');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// PayPay設定
const PAYPAY_CONFIG = {
    apiKey: 'a_7Nh7OQU4LD_sgIG',
    apiSecret: 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: '958667152543465472',
    hostname: 'stg-api.paypay.ne.jp'
};

// 2024年12月の固定時刻を使用
function getAccurateTime() {
    // PayPayサーバーは2024年12月で動作していると想定
    const baseTime = new Date('2024-12-07T03:00:00Z'); // 日本時間12:00
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    baseTime.setMinutes(minutes);
    baseTime.setSeconds(seconds);
    
    const epochTime = Math.floor(baseTime.getTime() / 1000);
    console.log('Using fixed 2024 time:', new Date(epochTime * 1000).toISOString());
    return epochTime;
}

// HMAC-SHA256署名を生成
function generateAuthHeader(method, path, body, epochOverride = null) {
    const nonce = uuidv4().substring(0, 8);
    const epoch = epochOverride || Math.floor(Date.now() / 1000);
    
    let contentType = 'empty';
    let payloadDigest = 'empty';
    
    if (body) {
        contentType = 'application/json';
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        const md5 = crypto.createHash('md5');
        md5.update(contentType);
        md5.update(bodyStr);
        payloadDigest = md5.digest('base64');
    }
    
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        payloadDigest
    ].join('\n');
    
    console.log('Signature data:', signatureData);
    
    const hmac = crypto.createHmac('sha256', PAYPAY_CONFIG.apiSecret);
    hmac.update(signatureData);
    const signature = hmac.digest('base64');
    
    return `hmac OPA-Auth:${PAYPAY_CONFIG.apiKey}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
}

// PayPay APIを呼び出す
async function callPayPayAPI(path, method, body, epochOverride = null) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const authHeader = generateAuthHeader(method, path, body, epochOverride);
        
        console.log('Auth header:', authHeader);
        
        const options = {
            hostname: PAYPAY_CONFIG.hostname,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
                'X-ASSUME-MERCHANT': PAYPAY_CONFIG.merchantId
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('Response:', res.statusCode, parsed);
                    if (res.statusCode === 201 || res.statusCode === 200) {
                        resolve({ success: true, data: parsed });
                    } else {
                        resolve({ success: false, data: parsed, status: res.statusCode });
                    }
                } catch (e) {
                    reject(new Error('Failed to parse response: ' + data));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        if (bodyStr) {
            req.write(bodyStr);
        }
        req.end();
    });
}

async function test() {
    console.log('Testing PayPay API with fixed 2024 timestamp...\n');
    
    const accurateEpoch = getAccurateTime();
    
    const paymentData = {
        merchantPaymentId: `test_${Date.now()}`,
        codeType: "ORDER_QR",
        redirectUrl: `https://line-love-edu.vercel.app/payment-success.html`,
        redirectType: "WEB_LINK",
        orderDescription: `テスト注文`,
        orderItems: [{
            name: "テスト商品",
            category: "DIGITAL_CONTENT",
            quantity: 1,
            productId: "test_product",
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
    
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
    console.log('\nCalling PayPay API...\n');
    
    try {
        const response = await callPayPayAPI('/v2/codes', 'POST', paymentData, accurateEpoch);
        
        if (response.success) {
            console.log('✅ SUCCESS!');
            console.log('Payment URL:', response.data.data?.url);
        } else {
            console.log('❌ FAILED');
            console.log('Error:', response.data.resultInfo);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

test();