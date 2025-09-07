/**
 * PayPay決済完了後のステータス更新API
 * purchasesテーブルとaccess_rightsテーブルを更新
 */

const { createClient } = require('@supabase/supabase-js');
const { HmacSHA256, enc, algo } = require("crypto-js");
const crypto = require("crypto");
const https = require("https");

// UUID生成
const uuidv4 = () => crypto.randomUUID();

// 日本標準時（JST）のISO文字列を取得する関数
function getJSTDateTime() {
    const now = new Date();
    const jstOffset = 9 * 60; // 9時間 = 540分
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    
    const year = jstTime.getUTCFullYear();
    const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(jstTime.getUTCDate()).padStart(2, '0');
    const hours = String(jstTime.getUTCHours()).padStart(2, '0');
    const minutes = String(jstTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(jstTime.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(jstTime.getUTCMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

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

    if (!merchantPaymentId || !diagnosisId || !userId) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            required: ['merchantPaymentId', 'diagnosisId', 'userId']
        });
    }

    if (!supabase) {
        console.error('Supabase not configured');
        return res.status(500).json({ error: 'Database not configured' });
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

        // purchasesテーブルを更新 (metadataからpaypay_merchant_payment_idを検索)
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('purchase_id, status')
            .contains('metadata', { paypay_merchant_payment_id: merchantPaymentId })
            .single();

        if (existingPurchase && existingPurchase.status === 'completed') {
            console.log('Purchase already completed:', merchantPaymentId);
            return res.json({ 
                success: true, 
                message: 'Already processed',
                purchaseId: existingPurchase.purchase_id 
            });
        }

        // purchasesテーブルを完了状態に更新
        const { data: updatedPurchase, error: updateError } = await supabase
            .from('purchases')
            .update({
                status: 'completed',
                completed_at: getJSTDateTime(),
                metadata: {
                    payment_status: paymentData.status,
                    transaction_id: paymentData.transactionId,
                    paypay_transaction_id: paymentData.transactionId,
                    accepted_at: paymentData.acceptedAt,
                    paypay_merchant_payment_id: merchantPaymentId
                }
            })
            .contains('metadata', { paypay_merchant_payment_id: merchantPaymentId })
            .select()
            .single();

        if (updateError) {
            console.error('Failed to update purchase:', updateError);
        }

        // アクセス権限を付与（Stripeと同じ）
        const purchaseId = updatedPurchase?.purchase_id || existingPurchase?.purchase_id;
        if (purchaseId) {
            const { error: accessError } = await supabase
                .from('access_rights')
                .upsert({
                    user_id: userId,
                    resource_type: 'diagnosis',
                    resource_id: diagnosisId,
                    access_level: 'full',
                    purchase_id: purchaseId,
                    valid_from: getJSTDateTime(),
                    valid_until: null // 永久アクセス
                }, {
                    onConflict: 'user_id,resource_type,resource_id'
                });

            if (accessError) {
                console.error('Failed to grant access rights:', accessError);
            }
        }

        // 診断テーブルは支払い関連カラムがないため、更新をスキップ
        // access_rightsテーブルで支払い状態を管理

        // LINE通知送信（オプション）
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            const amount = paymentData.amount?.amount || 2980;
            await sendLineNotification(userId, 'おつきさま診断', amount);
        }

        return res.json({
            success: true,
            purchaseId: purchaseId,
            paymentData: {
                merchantPaymentId: paymentData.merchantPaymentId,
                amount: paymentData.amount?.amount,
                completedAt: paymentData.acceptedAt,
                transactionId: paymentData.transactionId
            }
        });

    } catch (error) {
        console.error('[PayPay Update] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to update payment status',
            details: error.message 
        });
    }
}

/**
 * LINE通知送信
 */
async function sendLineNotification(userId, productName, amount) {
    try {
        const message = {
            to: userId,
            messages: [{
                type: 'text',
                text: `✨ お支払いありがとうございます！\n\n` +
                      `${productName}の完全版が閲覧可能になりました。\n` +
                      `金額: ¥${amount.toLocaleString()}\n\n` +
                      `診断結果ページからご確認ください。`
            }]
        };

        const response = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify(message)
        });

        if (!response.ok) {
            console.error('Failed to send LINE notification:', await response.text());
        }
    } catch (error) {
        console.error('Error sending LINE notification:', error);
    }
}