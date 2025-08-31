/**
 * Stripe Webhook処理用API
 * 支払い完了時にPaymentsテーブルに記録
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Stripe設定
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Webhookイベントの検証
        event = stripe.webhooks.constructEvent(
            req.body,
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
    const { diagnosis_id, user_id, diagnosis_type } = session.metadata || {};
    
    if (!diagnosis_id || !user_id) {
        console.error('Missing required metadata in session:', session.id);
        return;
    }

    try {
        // 支払い記録を作成
        const paymentData = {
            payment_id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            diagnosis_id,
            user_id,
            diagnosis_type: diagnosis_type || 'otsukisama',
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

        // Paymentsテーブルに挿入
        const { data: payment, error: paymentError } = await supabase
            .from('Payments')
            .insert([paymentData])
            .select()
            .single();

        if (paymentError) {
            console.error('Failed to create payment record:', paymentError);
            throw paymentError;
        }

        console.log('Payment record created:', payment.id);

        // 診断の支払い状態を更新（トリガーで自動更新されるが念のため）
        const { error: updateError } = await supabase
            .from('Diagnoses')
            .update({ is_paid: true })
            .eq('id', diagnosis_id);

        if (updateError) {
            console.error('Failed to update diagnosis payment status:', updateError);
        }

        // 成功通知をLINEに送信（オプション）
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            await sendLineNotification(user_id, diagnosis_type, session.amount_total / 100);
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
    const { data: existingPayment } = await supabase
        .from('Payments')
        .select('id')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

    if (existingPayment) {
        console.log('Payment already processed for intent:', paymentIntent.id);
        return;
    }

    // メタデータがある場合は処理
    if (paymentIntent.metadata?.diagnosis_id) {
        // Checkout Sessionと同様の処理
        console.log('Processing payment from payment intent metadata');
    }
}

/**
 * 支払い失敗時の処理
 */
async function handlePaymentFailed(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    
    const { diagnosis_id, user_id } = paymentIntent.metadata || {};
    
    if (diagnosis_id) {
        // 失敗記録を作成
        await supabase
            .from('Payments')
            .insert([{
                payment_id: `pay_failed_${Date.now()}`,
                diagnosis_id,
                user_id: user_id || 'unknown',
                diagnosis_type: paymentIntent.metadata?.diagnosis_type || 'otsukisama',
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
 * LINE通知送信（オプション）
 */
async function sendLineNotification(userId, diagnosisType, amount) {
    try {
        const typeNames = {
            'otsukisama': 'おつきさま診断',
            'aijou': '愛嬢診断'
        };
        
        const message = {
            to: userId,
            messages: [{
                type: 'text',
                text: `✨ お支払いありがとうございます！\n\n` +
                      `${typeNames[diagnosisType] || '診断'}の完全版が閲覧可能になりました。\n` +
                      `金額: ¥${amount.toLocaleString()}\n\n` +
                      `診断結果ページからご確認ください。`
            }]
        };

        // LINE Messaging API呼び出し
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

// Vercelの設定: raw bodyを受け取る
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
        // Stripeのwebhookはraw bodyが必要
        bodyParser: false,
    },
};