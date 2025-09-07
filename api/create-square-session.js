/**
 * Square決済セッション作成API
 * 共通ハンドラーを使用した実装例
 */

const { Client, Environment } = require('square');
const PaymentHandler = require('./common/payment-handler');
const { createClient } = require('@supabase/supabase-js');

// Square初期化
const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
});

// Supabase初期化
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { diagnosisId, userId, userName, amount = 980 } = req.body;

    if (!diagnosisId) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            required: ['diagnosisId']
        });
    }

    try {
        // 診断データを取得
        let diagnosis = null;
        if (supabase) {
            const { data } = await supabase
                .from('diagnoses')
                .select('*, diagnosis_types(*)')
                .eq('id', diagnosisId)
                .single();
            diagnosis = data;
        }

        // Square Checkout APIでリンクを作成
        const { result } = await squareClient.checkoutApi.createPaymentLink({
            quickPay: {
                name: 'おつきさま診断 - 完全版',
                priceMoney: {
                    amount: amount,
                    currency: 'JPY'
                },
                locationId: process.env.SQUARE_LOCATION_ID
            },
            checkoutOptions: {
                allowTipping: false,
                redirectUrl: `${process.env.BASE_URL}/api/update-square-payment`,
                merchantSupportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
            },
            prePopulatedData: {
                buyerEmail: diagnosis?.user_email,
                buyerPhoneNumber: diagnosis?.user_phone
            },
            paymentNote: `診断ID: ${diagnosisId}`
        });

        if (result.paymentLink) {
            // 共通ハンドラーで購入レコードを作成
            const paymentHandler = new PaymentHandler();
            
            const purchaseResult = await paymentHandler.createPurchaseRecord({
                diagnosisId: diagnosisId,
                userId: userId || diagnosis?.user_id || 'anonymous',
                amount: amount,
                paymentMethod: 'square',
                metadata: {
                    order_description: `おつきさま診断 - ${userName || diagnosis?.user_name || 'お客様'}`,
                    square_payment_link_id: result.paymentLink.id,
                    square_checkout_url: result.paymentLink.url,
                    square_order_id: result.paymentLink.orderId
                }
            });

            if (!purchaseResult.success) {
                console.error('Failed to create purchase record:', purchaseResult.error);
            }

            return res.json({
                success: true,
                redirectUrl: result.paymentLink.url,
                paymentLinkId: result.paymentLink.id
            });
        } else {
            throw new Error('Failed to create payment link');
        }

    } catch (error) {
        console.error('[Square Session] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create payment session',
            details: error.message 
        });
    }
};