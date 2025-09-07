/**
 * PayPay決済状態確認スクリプト
 */

const { HmacSHA256, enc, algo } = require("crypto-js");
const crypto = require("crypto");
const https = require("https");

// UUID生成
const uuidv4 = () => crypto.randomUUID();

// PayPay設定
const auth = {
    clientId: 'a_7Nh7OQU4LD_sgIG',
    clientSecret: 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: '958667152543465472'
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
            hostname: 'stg-api.sandbox.paypay.ne.jp', // 公式SDKと同じサンドボックスURL
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

async function checkPaymentStatus(merchantPaymentId) {
    console.log(`\n🔍 決済状態確認: ${merchantPaymentId}`);
    
    try {
        const response = await callPayPayAPI(
            `/v2/codes/payments/${merchantPaymentId}`,
            'GET',
            null
        );
        
        console.log('HTTPステータス:', response.status);
        
        if (response.data) {
            const data = response.data.data || response.data;
            
            if (data.status) {
                console.log('決済ステータス:', data.status);
                
                switch(data.status) {
                    case 'CREATED':
                        console.log('→ QRコードが作成されましたが、まだ支払いは開始されていません');
                        break;
                    case 'AUTHORIZED':
                        console.log('→ 支払いが承認されました（事前承認）');
                        break;
                    case 'COMPLETED':
                        console.log('→ ✅ 支払いが正常に完了しました');
                        break;
                    case 'EXPIRED':
                        console.log('→ ❌ QRコードの有効期限が切れました');
                        break;
                    case 'FAILED':
                        console.log('→ ❌ 支払いに失敗しました');
                        break;
                    default:
                        console.log('→ 不明なステータス');
                }
            }
            
            if (data.amount) {
                console.log('金額:', data.amount.amount, data.amount.currency);
            }
            
            if (data.expiryDate) {
                const expiry = new Date(data.expiryDate);
                const now = new Date();
                const isExpired = expiry < now;
                console.log('有効期限:', data.expiryDate, isExpired ? '(期限切れ)' : '(有効)');
            }
            
            if (data.url) {
                console.log('決済URL:', data.url);
            }
            
            if (data.resultInfo) {
                console.log('結果情報:', data.resultInfo.code, '-', data.resultInfo.message);
            }
            
            // エラーの詳細を確認
            if (data.status === 'FAILED' || data.status === 'EXPIRED') {
                console.log('\n❌ エラー原因の可能性:');
                console.log('1. テストユーザーの残高不足（PayPayダッシュボードで確認）');
                console.log('2. QRコードの有効期限切れ');
                console.log('3. 重複したmerchantPaymentId');
                console.log('4. Developer Modeが正しく設定されていない');
            }
            
            return data;
        } else {
            console.log('データなし');
        }
        
    } catch (error) {
        console.error('エラー:', error.message);
    }
}

// コマンドライン引数からmerchantPaymentIdを取得
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('使用方法: node check-paypay-status.js <merchantPaymentId>');
    console.log('例: node check-paypay-status.js diag_1757241246974_abc123');
    
    // 最近のテスト用
    console.log('\n最近のmerchantPaymentIdで確認:');
    checkPaymentStatus('diag_1757241246974_8j2o67sb');
} else {
    checkPaymentStatus(args[0]);
}