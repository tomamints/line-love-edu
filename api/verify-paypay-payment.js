/**
 * PayPay決済状態確認・データベース更新API
 */

const { createClient } = require('@supabase/supabase-js');
const { HmacSHA256, enc, algo } = require("crypto-js");
const crypto = require("crypto");
const https = require("https");

// UUID生成
const uuidv4 = () => crypto.randomUUID();

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// PayPay設定
const auth = {
    clientId: 'a_7Nh7OQU4LD_sgIG',
    clientSecret: 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: '958667152543465472'
};

// PayPay公式SDKと同じ認証ヘッダー生成
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
async function callPayPayAPI(path, method, body = null) {
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
                'X-ASSUME-MERCHANT': auth.merchantId
            }
        };

        if (bodyStr) {
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 200) {
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

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { merchantPaymentId, diagnosisId, userId } = req.body;

    if (!merchantPaymentId) {
        return res.status(400).json({ error: 'Missing merchantPaymentId' });
    }

    try {
        // PayPay APIで決済状態を確認
        console.log(`Checking PayPay payment status for: ${merchantPaymentId}`);
        const paymentResponse = await callPayPayAPI(`/v2/codes/payments/${merchantPaymentId}`, 'GET');
        
        if (!paymentResponse.success || !paymentResponse.data.data) {
            console.error('PayPay API Error:', paymentResponse.data);
            return res.status(400).json({ 
                error: 'Payment not found',
                details: paymentResponse.data.resultInfo 
            });
        }

        const paymentData = paymentResponse.data.data;
        const paymentStatus = paymentData.status;
        
        console.log(`Payment status: ${paymentStatus}`);

        // ステータスチェック（COMPLETED = 決済完了）
        if (paymentStatus !== 'COMPLETED') {
            return res.json({
                success: false,
                status: paymentStatus,
                message: 'Payment not completed yet'
            });
        }

        // Supabaseがある場合はデータベースを更新
        if (supabase && diagnosisId) {
            try {
                // payment_intentsテーブルを更新
                const { error: updateError } = await supabase
                    .from('payment_intents')
                    .update({
                        status: 'succeeded',
                        payment_data: paymentData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', merchantPaymentId);

                if (updateError) {
                    console.error('Payment intent update error:', updateError);
                }

                // diagnosesテーブルのis_paidをtrueに更新
                const { error: diagnosisError } = await supabase
                    .from('diagnoses')
                    .update({
                        is_paid: true,
                        payment_method: 'paypay',
                        payment_completed_at: new Date().toISOString(),
                        merchant_payment_id: merchantPaymentId
                    })
                    .eq('id', diagnosisId);

                if (diagnosisError) {
                    console.error('Diagnosis update error:', diagnosisError);
                }

                console.log(`Database updated for diagnosis: ${diagnosisId}`);
            } catch (dbError) {
                console.error('Database update error:', dbError);
                // データベースエラーがあっても決済は成功しているので続行
            }
        }

        return res.json({
            success: true,
            status: paymentStatus,
            paymentData: {
                merchantPaymentId: paymentData.merchantPaymentId,
                amount: paymentData.amount,
                orderDescription: paymentData.orderDescription,
                completedAt: paymentData.acceptedAt,
                transactionId: paymentData.transactionId
            }
        });

    } catch (error) {
        console.error('[PayPay Verify] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to verify payment',
            details: error.message 
        });
    }
}