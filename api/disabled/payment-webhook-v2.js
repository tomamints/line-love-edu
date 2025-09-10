const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const { buffer } = require('micro');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Supabase初期化
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // イベントタイプに応じて処理
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

async function handleCheckoutSessionCompleted(session) {
    console.log('Checkout session completed:', session.id);
    
    const diagnosisId = session.metadata?.diagnosis_id;
    const userId = session.metadata?.user_id;
    const productName = session.metadata?.product_name || 'おつきさま診断';
    const productId = session.metadata?.diagnosis_type_id || 'otsukisama';
    
    if (!diagnosisId || !userId) {
        console.error('Missing metadata in session:', session.id);
        return;
    }

    try {
        // 購入記録を作成
        const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const { data: purchase, error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                purchase_id: purchaseId,
                user_id: userId,
                diagnosis_id: diagnosisId,
                product_type: 'diagnosis',
                product_id: productId,
                product_name: productName,
                amount: session.amount_total,
                currency: session.currency,
                payment_method: 'stripe',
                stripe_session_id: session.id,
                stripe_payment_intent: session.payment_intent,
                status: 'completed',
                metadata: {
                    customer_email: session.customer_email,
                    customer_name: session.customer_details?.name
                }
            })
            .select()
            .single();

        if (purchaseError) {
            console.error('Failed to create purchase record:', purchaseError);
            return;
        }

        console.log('Purchase record created:', purchase.purchase_id);

        // アクセス権を付与
        const { error: accessError } = await supabase
            .from('access_rights')
            .insert({
                user_id: userId,
                diagnosis_id: diagnosisId,
                access_type: 'full',
                granted_at: new Date().toISOString(),
                expires_at: null, // 無期限アクセス
                purchase_id: purchaseId
            });

        if (accessError) {
            console.error('Failed to grant access rights:', accessError);
        } else {
            console.log('Access rights granted for diagnosis:', diagnosisId);
        }

    } catch (error) {
        console.error('Error processing checkout session:', error);
    }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
    console.log('Payment intent succeeded:', paymentIntent.id);
    
    const diagnosisId = paymentIntent.metadata?.diagnosis_id;
    const userId = paymentIntent.metadata?.user_id;
    
    if (!diagnosisId || !userId) {
        console.log('No metadata in payment intent, skipping...');
        return;
    }

    // 必要に応じて購入記録を更新
    console.log('Payment intent succeeded for diagnosis:', diagnosisId);
}

async function handlePaymentIntentFailed(paymentIntent) {
    console.log('Payment intent failed:', paymentIntent.id);
    
    const diagnosisId = paymentIntent.metadata?.diagnosis_id;
    const userId = paymentIntent.metadata?.user_id;
    
    if (!diagnosisId || !userId) {
        return;
    }

    // 失敗をログに記録
    console.log('Payment failed for diagnosis:', diagnosisId);
}

// Vercelでは以下の設定が必要
export const config = {
    api: {
        bodyParser: false,
    },
};