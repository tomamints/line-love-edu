/**
 * PayPay決済セッション作成API（直接実装版）
 * 環境変数の問題を回避するため、値を直接埋め込み
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// PayPay設定 - ハードコード（環境変数の問題を回避）
const PAYPAY_CONFIG = {
    apiKey: 'a_7Nh7OQU4LD_sgIG',
    apiSecret: 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: '958667152543465472',
    baseUrl: 'https://stg-api.paypay.ne.jp/v2'
};

// HMAC-SHA256署名を生成
function generateAuthHeader(method, path, body = null) {
    const { v4: uuidv4 } = require('uuid');
    const nonce = uuidv4().substring(0, 8);
    const epoch = Math.floor(Date.now() / 1000);
    
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
    
    const hmac = crypto.createHmac('sha256', PAYPAY_CONFIG.apiSecret);
    hmac.update(signatureData);
    const signature = hmac.digest('base64');
    
    return `hmac OPA-Auth:${PAYPAY_CONFIG.apiKey}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const hasSupabase = !!supabase;
    console.log('Direct PayPay API - Supabase:', hasSupabase);

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
        
        const paymentData = {
            merchantPaymentId: merchantPaymentId,
            codeType: "ORDER_QR",
            redirectUrl: `https://line-love-edu.vercel.app/payment-success.html?id=${diagnosisId}&userId=${userId || ''}&payment=success`,
            redirectType: "WEB_LINK",
            orderDescription: `おつきさま診断 - ${diagnosis.user_name || 'お客様'}`,
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

        const bodyJson = JSON.stringify(paymentData);
        const path = '/codes';
        const authHeader = generateAuthHeader('POST', path, paymentData);
        
        console.log('Making PayPay API request to:', PAYPAY_CONFIG.baseUrl + path);
        
        const response = await fetch(`${PAYPAY_CONFIG.baseUrl}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
                'X-ASSUME-MERCHANT': PAYPAY_CONFIG.merchantId
            },
            body: bodyJson
        });

        const result = await response.json();
        console.log('PayPay API Response:', response.status, result.resultInfo?.code);
        
        if (result.resultInfo?.code === 'SUCCESS' && result.data) {
            // 成功時の処理
            if (hasSupabase) {
                try {
                    await supabase
                        .from('payment_intents')
                        .insert({
                            id: merchantPaymentId,
                            diagnosis_id: diagnosisId,
                            user_id: userId || diagnosis.user_id,
                            amount: amount,
                            status: 'pending',
                            payment_method: 'paypay',
                            payment_data: result.data
                        });
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                }
            }

            return res.json({
                success: true,
                redirectUrl: result.data.url,
                paymentId: merchantPaymentId,
                expiresAt: result.data.expiryDate
            });
        } else {
            console.error('PayPay API Error:', result);
            throw new Error(result.resultInfo?.message || 'PayPay payment creation failed');
        }

    } catch (error) {
        console.error('[PayPay Direct] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create PayPay session',
            details: error.message 
        });
    }
}