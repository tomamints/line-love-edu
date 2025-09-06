/**
 * PayPay Webhook処理用API
 * 支払い完了時にpurchasesテーブルに記録し、アクセス権限を付与
 * Stripeと同じテーブル構造を使用
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

/**
 * PayPay決済完了処理（Stripeと同じ構造）
 */
async function handlePayPayPaymentCompleted(merchantPaymentId, diagnosisId, userId) {
    console.log('Processing PayPay payment completion:', merchantPaymentId);
    
    if (!supabase) {
        console.error('Supabase not configured');
        return { success: false, error: 'Database not configured' };
    }

    try {
        // PayPay APIで決済状態を確認
        const paymentResponse = await callPayPayAPI(`/v2/codes/payments/${merchantPaymentId}`, 'GET');
        
        if (!paymentResponse.success || !paymentResponse.data.data) {
            console.error('PayPay API Error:', paymentResponse.data);
            return { success: false, error: 'Payment not found' };
        }

        const paymentData = paymentResponse.data.data;
        
        // ステータスチェック（COMPLETED = 決済完了）
        if (paymentData.status !== 'COMPLETED') {
            return {
                success: false,
                status: paymentData.status,
                message: 'Payment not completed yet'
            };
        }

        // 既存の購入記録をチェック
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('purchase_id')
            .eq('paypay_merchant_payment_id', merchantPaymentId)
            .single();

        if (existingPurchase) {
            console.log('Purchase already processed:', merchantPaymentId);
            return { success: true, message: 'Already processed', purchaseId: existingPurchase.purchase_id };
        }

        // 1. 診断情報を取得
        const { data: diagnosis } = await supabase
            .from('diagnoses')
            .select(`
                *,
                diagnosis_types (
                    id,
                    name,
                    price
                )
            `)
            .eq('id', diagnosisId)
            .single();

        const productName = diagnosis?.diagnosis_types?.name || 'おつきさま診断';
        const productId = diagnosis?.diagnosis_types?.id || 'otsukisama';
        const amount = paymentData.amount?.amount || 2980;

        // 2. 購入記録を作成（Stripeと同じ構造）
        const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const purchaseData = {
            purchase_id: purchaseId,
            user_id: userId,
            diagnosis_id: diagnosisId,
            product_type: 'diagnosis',
            product_id: productId,
            product_name: productName,
            amount: amount,
            currency: 'JPY',
            payment_method: 'paypay',
            paypay_merchant_payment_id: merchantPaymentId,
            paypay_transaction_id: paymentData.transactionId,
            status: 'completed',
            completed_at: paymentData.acceptedAt || new Date().toISOString(),
            metadata: {
                order_description: paymentData.orderDescription,
                payment_status: paymentData.status,
                code_id: paymentData.codeId,
                user_name: diagnosis?.user_name
            }
        };

        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .insert([purchaseData])
            .select()
            .single();

        if (purchaseError) {
            console.error('Failed to create purchase record:', purchaseError);
            throw purchaseError;
        }

        console.log('Purchase record created:', purchase.purchase_id);

        // 3. アクセス権限を付与（Stripeと同じ）
        const { error: accessError } = await supabase
            .from('access_rights')
            .upsert({
                user_id: userId,
                resource_type: 'diagnosis',
                resource_id: diagnosisId,
                access_level: 'full',
                purchase_id: purchaseId,
                valid_from: new Date().toISOString(),
                valid_until: null // 永久アクセス
            }, {
                onConflict: 'user_id,resource_type,resource_id'
            });

        if (accessError) {
            console.error('Failed to grant access rights:', accessError);
        }

        // 4. 診断テーブルのis_paidをtrueに更新
        const { error: diagnosisError } = await supabase
            .from('diagnoses')
            .update({
                is_paid: true,
                payment_method: 'paypay',
                payment_completed_at: paymentData.acceptedAt || new Date().toISOString()
            })
            .eq('id', diagnosisId);

        if (diagnosisError) {
            console.error('Failed to update diagnosis:', diagnosisError);
        }

        // 5. LINE通知送信（オプション）
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            await sendLineNotification(userId, productName, amount);
        }

        return {
            success: true,
            purchaseId: purchaseId,
            paymentData: {
                merchantPaymentId: paymentData.merchantPaymentId,
                amount: amount,
                orderDescription: paymentData.orderDescription,
                completedAt: paymentData.acceptedAt,
                transactionId: paymentData.transactionId
            }
        };

    } catch (error) {
        console.error('Error processing PayPay payment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * LINE通知送信（Stripeと同じ）
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

/**
 * メインハンドラー
 */
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

    try {
        const result = await handlePayPayPaymentCompleted(merchantPaymentId, diagnosisId, userId);
        
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error('[PayPay Webhook] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to process payment',
            details: error.message 
        });
    }
}