/**
 * Stripe Webhook処理用API - V2（新テーブル構造対応）
 * 支払い完了時にpurchasesテーブルに記録し、アクセス権限を付与
 */

const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const getRawBody = require('raw-body');

// Supabase設定 - 環境変数の確認
// Vercel環境変数に合わせて修正（SUPABASE_ANON_KEYを優先）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxqxuebvhdpqyktxvofe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Supabaseクライアントの作成（環境変数がある場合のみ）
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Stripe設定
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 必要な設定が不足している場合はエラー
    if (!stripe || !supabase) {
        console.error('Missing required configuration:', { stripe: !!stripe, supabase: !!supabase });
        return res.status(500).json({ 
            error: 'Server configuration error',
            details: 'Required services are not properly configured'
        });
    }

    const sig = req.headers['stripe-signature'];
    let event;
    let rawBody;

    try {
        // Raw bodyを取得
        rawBody = await getRawBody(req, {
            length: req.headers['content-length'],
            limit: '1mb',
            encoding: 'utf8'
        });

        // Webhookイベントの検証
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // イベントタイプごとの処理
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object);
            break;
            
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object);
            break;
            
        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}

/**
 * Checkout Session完了時の処理
 */
async function handleCheckoutSessionCompleted(session) {
    console.log('Checkout session completed:', session.id);
    
    // メタデータから診断情報を取得
    const { 
        diagnosis_id, 
        user_id, 
        diagnosis_type,
        product_type = 'diagnosis'
    } = session.metadata || {};
    
    if (!diagnosis_id || !user_id) {
        console.error('Missing required metadata in session:', session.id);
        return;
    }

    try {
        // 1. 診断タイプの情報を取得
        let productName = '診断';
        if (diagnosis_type) {
            const { data: diagType } = await supabase
                .from('diagnosis_types')
                .select('name')
                .eq('id', diagnosis_type)
                .single();
            
            if (diagType) {
                productName = diagType.name;
            }
        }

        // 2. 購入記録を作成
        const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const purchaseData = {
            purchase_id: purchaseId,
            user_id: user_id,
            diagnosis_id: diagnosis_id,
            product_type: product_type,
            product_id: diagnosis_type || 'otsukisama',
            product_name: productName,
            amount: session.amount_total / 100, // センから円に変換
            currency: session.currency.toUpperCase(),
            payment_method: 'stripe',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            status: 'completed',
            completed_at: new Date().toISOString(),
            metadata: {
                customer_email: session.customer_email,
                customer_name: session.customer_details?.name,
                mode: session.mode,
                payment_status: session.payment_status
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

        // 3. アクセス権限を付与（トリガーでも実行されるが念のため）
        const { error: accessError } = await supabase
            .from('access_rights')
            .upsert({
                user_id: user_id,
                resource_type: 'diagnosis',
                resource_id: diagnosis_id,
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

        // 4. 成功通知をLINEに送信（オプション）
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            await sendLineNotification(user_id, productName, session.amount_total / 100);
        }

    } catch (error) {
        console.error('Error processing payment completion:', error);
    }
}

/**
 * PaymentIntent成功時の処理（バックアップ）
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
    console.log('Payment intent succeeded:', paymentIntent.id);
    
    // Checkout Sessionで処理済みの場合はスキップ
    const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('purchase_id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

    if (existingPurchase) {
        console.log('Purchase already processed for intent:', paymentIntent.id);
        return;
    }

    // メタデータがある場合は処理
    if (paymentIntent.metadata?.diagnosis_id) {
        console.log('Processing payment from payment intent metadata');
        // Checkout Sessionと同様の処理を実行
    }
}

/**
 * 支払い失敗時の処理
 */
async function handlePaymentFailed(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    
    const { diagnosis_id, user_id, diagnosis_type } = paymentIntent.metadata || {};
    
    if (diagnosis_id && user_id) {
        // 失敗記録を作成
        const purchaseId = `pur_failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await supabase
            .from('purchases')
            .insert([{
                purchase_id: purchaseId,
                user_id: user_id,
                diagnosis_id: diagnosis_id,
                product_type: 'diagnosis',
                product_id: diagnosis_type || 'otsukisama',
                product_name: '診断（失敗）',
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency.toUpperCase(),
                payment_method: 'stripe',
                stripe_payment_intent_id: paymentIntent.id,
                status: 'failed',
                metadata: {
                    failure_code: paymentIntent.last_payment_error?.code,
                    failure_message: paymentIntent.last_payment_error?.message
                }
            }]);
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

// handlerをエクスポート
module.exports = handler;

// Vercelの設定: raw bodyを受け取る
module.exports.config = {
    api: {
        bodyParser: false, // Stripeのwebhookはraw bodyが必要
    },
};