/**
 * Stripe Checkout Session作成API
 * 診断結果の購入用決済ページを作成
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Stripe設定
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
        diagnosisId,
        userId,
        successUrl,
        cancelUrl 
    } = req.body;

    if (!diagnosisId || !userId) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['diagnosisId', 'userId']
        });
    }

    try {
        // 1. 診断情報を取得
        const { data: diagnosis, error: diagnosisError } = await supabase
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

        if (diagnosisError || !diagnosis) {
            return res.status(404).json({ 
                error: 'Diagnosis not found' 
            });
        }

        // 2. 既に購入済みかチェック
        const { data: existingAccess } = await supabase
            .from('access_rights')
            .select('access_level')
            .eq('user_id', userId)
            .eq('resource_type', 'diagnosis')
            .eq('resource_id', diagnosisId)
            .single();

        if (existingAccess?.access_level === 'full') {
            return res.status(400).json({ 
                error: 'Already purchased',
                message: 'この診断は既に購入済みです'
            });
        }

        // 3. 商品情報を設定
        const diagnosisType = diagnosis.diagnosis_types;
        const productName = diagnosisType?.name || 'おつきさま診断';
        const price = diagnosisType?.price || 980;

        // 4. Stripe Checkout Sessionを作成
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'jpy',
                    product_data: {
                        name: `${productName} - 完全版`,
                        description: `${diagnosis.user_name}様の診断結果（${diagnosis.birth_date}）`,
                        metadata: {
                            diagnosis_id: diagnosisId,
                            diagnosis_type: diagnosis.diagnosis_type_id
                        }
                    },
                    unit_amount: price // 円単位の価格
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/lp-otsukisama-unified.html?id=${diagnosisId}&payment=success`,
            cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/lp-otsukisama-unified.html?id=${diagnosisId}&payment=cancelled`,
            metadata: {
                diagnosis_id: diagnosisId,
                user_id: userId,
                diagnosis_type: diagnosis.diagnosis_type_id,
                product_type: 'diagnosis'
            },
            // 顧客情報（オプション）
            customer_email: req.body.customerEmail, // メールアドレスがあれば設定
            // 日本語対応
            locale: 'ja',
            // 支払い期限（24時間）
            expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        });

        console.log('[Create Checkout Session] Success:', session.id);

        // 5. セッション情報を返す
        return res.json({
            success: true,
            sessionId: session.id,
            checkoutUrl: session.url,
            expiresAt: new Date(session.expires_at * 1000).toISOString()
        });

    } catch (error) {
        console.error('[Create Checkout Session] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
}