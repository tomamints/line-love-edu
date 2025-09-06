/**
 * PayPay決済セッション作成API
 * PayPay Web Paymentを使用した決済処理
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// PayPay設定
const PAYPAY_API_KEY = process.env.PAYPAY_API_KEY;
const PAYPAY_API_SECRET = process.env.PAYPAY_API_SECRET;
const PAYPAY_MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
const PAYPAY_ENV = process.env.PAYPAY_ENV || 'sandbox'; // 'sandbox' or 'production'

// PayPay APIのベースURL
const PAYPAY_BASE_URL = PAYPAY_ENV === 'production' 
    ? 'https://api.paypay.ne.jp/v2'
    : 'https://stg-api.sandbox.paypay.ne.jp/v2';

// HMAC-SHA256署名を生成
function generateAuthHeader(method, path, contentType, body = '') {
    if (!PAYPAY_API_SECRET || !PAYPAY_API_KEY) {
        console.error('PayPay credentials missing');
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
    
    console.log('Signature data:', {
        path,
        method,
        nonce,
        epoch,
        contentType,
        bodyHash: bodyHash.substring(0, 10) + '...',
        signatureData: signatureData.substring(0, 100) + '...'
    });
    
    // HMAC-SHA256署名
    const signature = crypto
        .createHmac('sha256', PAYPAY_API_SECRET)
        .update(signatureData, 'utf8')
        .digest('base64');
    
    // 認証ヘッダーのフォーマット
    return `hmac OPA-Auth:${PAYPAY_API_KEY}:${signature}:${nonce}:${epoch}:${bodyHash}`;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Supabase設定確認（オプショナル）
    const hasSupabase = !!supabase;
    console.log('Supabase configured:', hasSupabase);

    // PayPay設定確認
    if (!PAYPAY_API_KEY || !PAYPAY_API_SECRET || !PAYPAY_MERCHANT_ID) {
        console.error('PayPay configuration missing:', {
            hasApiKey: !!PAYPAY_API_KEY,
            hasApiSecret: !!PAYPAY_API_SECRET,
            hasMerchantId: !!PAYPAY_MERCHANT_ID,
            env: PAYPAY_ENV
        });
        // 開発環境では警告のみ
        if (process.env.NODE_ENV === 'production') {
            return res.status(500).json({ 
                error: 'PayPay configuration error',
                message: 'PayPay決済は現在利用できません',
                debug: {
                    hasApiKey: !!PAYPAY_API_KEY,
                    hasApiSecret: !!PAYPAY_API_SECRET,
                    hasMerchantId: !!PAYPAY_MERCHANT_ID
                }
            });
        }
    }

    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Missing diagnosis ID' });
    }

    try {
        let diagnosis = null;
        let price = 2980; // デフォルト価格
        
        // Supabaseが設定されている場合は診断情報を取得
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
            
            if (diagnosisError || !data) {
                console.log('Diagnosis not found in database, using default');
            } else {
                diagnosis = data;
                price = diagnosis.diagnosis_types?.price || 2980;
            }
        }
        
        // Supabaseがない場合、またはデータが見つからない場合はデフォルト値を使用
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

        // 2. 既に購入済みかチェック（Supabaseがある場合のみ）
        if (hasSupabase) {
            const { data: existingAccess } = await supabase
                .from('access_rights')
                .select('access_level')
                .eq('user_id', userId || diagnosis.user_id)
                .eq('resource_type', 'diagnosis')
                .eq('resource_id', diagnosisId)
                .single();

            if (existingAccess?.access_level === 'full') {
                return res.status(400).json({ 
                    error: 'Already purchased',
                    message: 'この診断は既に購入済みです'
                });
            }
        }

        // 3. PayPay決済セッション作成
        const merchantPaymentId = `diag_${diagnosisId}_${Date.now()}`;
        const amount = diagnosis.diagnosis_types?.price || 2980;
        
        const paymentData = {
            merchantPaymentId: merchantPaymentId,
            codeType: "ORDER_QR",
            redirectUrl: `https://line-love-edu.vercel.app/payment-success.html?id=${diagnosisId}&userId=${userId || ''}&payment=success`,
            redirectType: "WEB_LINK",
            orderDescription: `おつきさま診断 - ${diagnosis.user_name}様`,
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
            },
            requestedAt: Date.now(),
            userAgent: req.headers['user-agent'] || 'Mozilla/5.0',
            metadata: {
                diagnosisId: diagnosisId,
                userId: userId || '',
                diagnosisType: diagnosis.diagnosis_type_id
            }
        };

        const bodyJson = JSON.stringify(paymentData);
        const path = '/codes';
        
        // PayPay APIを呼び出し（実際の実装）
        if (PAYPAY_API_KEY && PAYPAY_API_SECRET) {
            const authHeader = generateAuthHeader('POST', path, 'application/json', bodyJson);
            
            const response = await fetch(`${PAYPAY_BASE_URL}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                    'X-ASSUME-MERCHANT': PAYPAY_MERCHANT_ID
                },
                body: bodyJson
            });

            const result = await response.json();
            
            if (result.resultInfo?.code === 'SUCCESS' && result.data) {
                // 決済情報をデータベースに保存（Supabaseがある場合のみ）
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
                        // エラーがあっても続行
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
        } else {
            // 開発環境用のモック
            console.log('[Dev Mode] PayPay Mock Payment:', paymentData);
            
            return res.json({
                success: true,
                redirectUrl: `https://stg-www.sandbox.paypay.ne.jp/app/cashier?code=mock_${merchantPaymentId}`,
                paymentId: merchantPaymentId,
                message: 'Development mode - PayPay mock payment'
            });
        }

    } catch (error) {
        console.error('[PayPay Session] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create PayPay session',
            details: error.message 
        });
    }
}