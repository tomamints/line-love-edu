/**
 * PayPay決済状態ポーリングAPI
 * 決済作成直後の状態を確認
 */

const { HmacSHA256, enc, algo } = require("crypto-js");
const crypto = require("crypto");
const https = require("https");

// UUID生成
const uuidv4 = () => crypto.randomUUID();

// PayPay設定
const auth = {
    clientId: process.env.PAYPAY_API_KEY || 'a_7Nh7OQU4LD_sgIG',
    clientSecret: process.env.PAYPAY_API_SECRET || 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: process.env.PAYPAY_MERCHANT_ID || '958667152543465472'
};

// PayPay認証ヘッダー生成
function createAuthHeader(method, resourceUrl, body) {
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4();

    const jsonified = JSON.stringify(body);
    const isempty = [undefined, null, "", "undefined", "null"];

    let contentType;
    let payloadDigest;
    if (isempty.includes(jsonified)) {
        contentType = "empty";
        payloadDigest = "empty";
    } else {
        contentType = "application/json";
        payloadDigest = algo.MD5.create()
            .update(contentType)
            .update(jsonified)
            .finalize()
            .toString(enc.Base64);
    }
    
    const signatureRawList = [resourceUrl, method, nonce, epoch, contentType, payloadDigest];
    const signatureRawData = signatureRawList.join("\n");
    const hashed = HmacSHA256(signatureRawData, auth.clientSecret);
    const hashed64 = enc.Base64.stringify(hashed);
    const headList = [auth.clientId, hashed64, nonce, epoch, payloadDigest];
    const header = headList.join(":");
    
    return `hmac OPA-Auth:${header}`;
}

// PayPay API呼び出し
async function callPayPayAPI(path, method, body) {
    return new Promise((resolve, reject) => {
        const bodyStr = body ? JSON.stringify(body) : '';
        const authHeader = createAuthHeader(method, path, body);
        
        const options = {
            hostname: 'stg-api.paypay.ne.jp',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
                'X-ASSUME-MERCHANT': auth.merchantId
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
                    resolve({
                        status: res.statusCode,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        parseError: true
                    });
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

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { merchantPaymentId, maxAttempts = 10, interval = 2000 } = req.body;
    
    if (!merchantPaymentId) {
        return res.status(400).json({ error: 'merchantPaymentId is required' });
    }
    
    console.log(`[PayPay Poll] Starting to poll status for: ${merchantPaymentId}`);
    
    const results = [];
    let finalStatus = null;
    
    try {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await callPayPayAPI(
                `/v2/codes/payments/${merchantPaymentId}`,
                'GET',
                null
            );
            
            const timestamp = new Date().toISOString();
            const data = response.data.data || response.data;
            
            const result = {
                attempt: i + 1,
                timestamp,
                httpStatus: response.status,
                paymentStatus: data.status || 'UNKNOWN',
                resultCode: data.resultInfo?.code,
                resultMessage: data.resultInfo?.message
            };
            
            results.push(result);
            
            console.log(`[PayPay Poll] Attempt ${i + 1}:`, {
                status: result.paymentStatus,
                code: result.resultCode,
                message: result.resultMessage
            });
            
            // 終了条件
            if (data.status === 'COMPLETED' || 
                data.status === 'FAILED' || 
                data.status === 'EXPIRED' ||
                response.status === 404) {
                finalStatus = data.status || 'NOT_FOUND';
                break;
            }
            
            // 次のポーリングまで待機
            if (i < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
        
        return res.json({
            success: true,
            merchantPaymentId,
            finalStatus,
            attempts: results.length,
            results
        });
        
    } catch (error) {
        console.error('[PayPay Poll] Error:', error);
        return res.status(500).json({
            error: 'Polling failed',
            details: error.message
        });
    }
}