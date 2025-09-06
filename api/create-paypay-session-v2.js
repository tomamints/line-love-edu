/**
 * PayPay決済セッション作成API（公式SDK使用版）
 */

const PAYPAY = require('@paypayopa/paypayopa-sdk-node');
const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// PayPay設定
const PAYPAY_API_KEY = process.env.PAYPAY_API_KEY;
const PAYPAY_API_SECRET = process.env.PAYPAY_API_SECRET;
const PAYPAY_MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
const PAYPAY_ENV = 'STAGING'; // STAGING, PROD, PERF_MODE

// PayPay SDKの設定
if (PAYPAY_API_KEY && PAYPAY_API_SECRET) {
    PAYPAY.Configure({
        clientId: PAYPAY_API_KEY,
        clientSecret: PAYPAY_API_SECRET,
        merchantId: PAYPAY_MERCHANT_ID,
        env: PAYPAY_ENV
    });
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
                message: 'PayPay決済は現在利用できません'
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

        // 既に購入済みかチェック（Supabaseがある場合のみ）
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

        // PayPay決済セッション作成（公式SDK使用）
        const merchantPaymentId = `diag_${diagnosisId}_${Date.now()}`;
        const amount = diagnosis.diagnosis_types?.price || 2980;
        
        const payload = {
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
            },
            requestedAt: Date.now(),
            metadata: {
                diagnosisId: diagnosisId,
                userId: userId || '',
                diagnosisType: diagnosis.diagnosis_type_id
            }
        };

        console.log('Creating PayPay session with SDK:', {
            merchantPaymentId,
            amount
        });

        // PayPay APIを呼び出し（SDK使用）
        if (PAYPAY_API_KEY && PAYPAY_API_SECRET) {
            const response = await PAYPAY.QRCodeCreate(payload);
            
            console.log('PayPay SDK Response:', {
                status: response.STATUS,
                hasBody: !!response.BODY,
                hasData: !!response.BODY?.data
            });
            
            if (response.STATUS === 201 && response.BODY?.data) {
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
                                payment_data: response.BODY.data
                            });
                    } catch (dbError) {
                        console.error('Database save error:', dbError);
                        // エラーがあっても続行
                    }
                }

                return res.json({
                    success: true,
                    redirectUrl: response.BODY.data.url,
                    paymentId: merchantPaymentId,
                    expiresAt: response.BODY.data.expiryDate
                });
            } else {
                console.error('PayPay SDK Error:', response);
                throw new Error(response.BODY?.resultInfo?.message || 'PayPay payment creation failed');
            }
        } else {
            // 開発環境用のモック
            console.log('[Dev Mode] PayPay Mock Payment:', payload);
            
            return res.json({
                success: true,
                redirectUrl: `https://stg-www.sandbox.paypay.ne.jp/app/cashier?code=mock_${merchantPaymentId}`,
                paymentId: merchantPaymentId,
                message: 'Development mode - PayPay mock payment'
            });
        }

    } catch (error) {
        console.error('[PayPay Session V2] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create PayPay session',
            details: error.message 
        });
    }
}