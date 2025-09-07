/**
 * PayPay決済セッション作成API（最終版 - crypto-js使用）
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

// PayPay設定 - ハードコード
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

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const hasSupabase = !!supabase;
    console.log('PayPay Final API - Supabase:', hasSupabase);

    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Missing diagnosis ID' });
    }

    try {
        let diagnosis = null;
        let price = 2980;
        
        if (hasSupabase) {
            const { data, error: diagnosisError } = await supabase
                .from('diagnoses')
                .select(`
                    *,
                    diagnosis_types (
                        id,
                        name,
                        description,
                        price
                    )
                `)
                .eq('id', diagnosisId)
                .single();
            
            if (data) {
                diagnosis = data;
                price = diagnosis.diagnosis_types?.price || 2980;
            }
        }
        
        if (!diagnosis) {
            diagnosis = {
                id: diagnosisId,
                user_id: userId,
                diagnosis_types: {
                    name: 'おつきさま診断',
                    price: price
                }
            };
        }

        // PayPay決済セッション作成
        const merchantPaymentId = `diag_${diagnosisId}_${Date.now()}`;
        const amount = diagnosis.diagnosis_types?.price || 2980;
        
        // User-Agentからモバイルデバイスを検出
        const userAgent = req.headers['user-agent'] || '';
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
        
        const paymentData = {
            merchantPaymentId: merchantPaymentId,
            codeType: "ORDER_QR",
            redirectUrl: `https://line-love-edu.vercel.app/payment-success.html?id=${diagnosisId}&userId=${userId || ''}&merchantPaymentId=${merchantPaymentId}`,
            redirectType: isMobile ? "APP_DEEP_LINK" : "WEB_LINK", // モバイルの場合はAPP_DEEP_LINK
            orderDescription: `おつきさま診断 - ${diagnosis.user_name || 'お客様'}`,
            userAgent: userAgent, // PayPayにユーザーエージェントを送信
            orderItems: [{
                name: "おつきさま診断 完全版",
                category: "DIGITAL_CONTENT",
                quantity: 1,
                productId: "otsukisama_diagnosis",
                unitPrice: {
                    amount: amount,
                    currency: "JPY"
                }
            }],
            amount: {
                amount: amount,
                currency: "JPY"
            }
        };

        console.log('Making PayPay API request with crypto-js...');
        console.log('Mobile detected:', isMobile);
        console.log('RedirectType:', paymentData.redirectType);
        
        const response = await callPayPayAPI('/v2/codes', 'POST', paymentData);
        
        console.log('PayPay API Response:', response.success ? 'SUCCESS' : 'FAILED');
        if (response.success && response.data.data) {
            console.log('Response URL:', response.data.data.url);
            console.log('Response deeplink:', response.data.data.deeplink);
        }
        
        if (response.success && response.data.data) {
            // モバイルの場合、deeplinkを優先的に使用
            const redirectUrl = isMobile && response.data.data.deeplink 
                ? response.data.data.deeplink 
                : response.data.data.url;
            
            // 成功時の処理
            if (hasSupabase) {
                try {
                    // purchasesテーブルに記録（Stripeと同じ構造）
                    const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const productName = diagnosis?.diagnosis_types?.name || 'おつきさま診断';
                    const productId = diagnosis?.diagnosis_types?.id || 'otsukisama';
                    
                    await supabase
                        .from('purchases')
                        .insert({
                            purchase_id: purchaseId,
                            user_id: userId || diagnosis.user_id,
                            diagnosis_id: diagnosisId,
                            product_type: 'diagnosis',
                            product_id: productId,
                            product_name: productName,
                            amount: amount,
                            currency: 'JPY',
                            payment_method: 'paypay',
                            status: 'pending', // 初期はpending、決済完了後にcompletedに更新
                            created_at: getJSTDateTime(),
                            metadata: {
                                order_description: `おつきさま診断 - ${diagnosis.user_name || 'お客様'}`,
                                code_url: response.data.data.url,
                                paypay_merchant_payment_id: merchantPaymentId
                            }
                        });
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                }
            }

            return res.json({
                success: true,
                redirectUrl: redirectUrl,
                paymentId: merchantPaymentId,
                expiresAt: response.data.data.expiryDate,
                isMobile: isMobile,
                deeplink: response.data.data.deeplink
            });
        } else {
            console.error('PayPay API Error:', response.data);
            throw new Error(response.data.resultInfo?.message || 'PayPay payment creation failed');
        }

    } catch (error) {
        console.error('[PayPay Final] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create PayPay session',
            details: error.message 
        });
    }
}