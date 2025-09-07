const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Stripe初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase初期化
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Missing diagnosis ID' });
    }

    try {
        // 診断データを取得
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
            console.error('Diagnosis not found:', diagnosisError);
            return res.status(404).json({ error: 'Diagnosis not found' });
        }

        // 既に購入済みか確認
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('*')
            .eq('diagnosis_id', diagnosisId)
            .eq('user_id', userId || diagnosis.user_id)
            .eq('status', 'completed')
            .single();

        if (existingPurchase) {
            return res.status(400).json({ 
                error: 'Already purchased',
                redirectUrl: `/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId || diagnosis.user_id}`
            });
        }

        // 価格を取得（デフォルト: 980円）
        const price = diagnosis.diagnosis_types?.price || 980;
        const productName = diagnosis.diagnosis_types?.name || 'おつきさま診断';

        // Stripe Checkout Session作成
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'jpy',
                    product_data: {
                        name: `${productName} - 完全版`,
                        description: `${diagnosis.user_name || 'お客様'}の診断結果`,
                        metadata: {
                            diagnosis_id: diagnosisId,
                            user_id: userId || diagnosis.user_id
                        }
                    },
                    unit_amount: price
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${req.headers.origin || 'https://line-love-edu.vercel.app'}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&id=${diagnosisId}&userId=${userId || diagnosis.user_id}`,
            cancel_url: `${req.headers.origin || 'https://line-love-edu.vercel.app'}/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId || diagnosis.user_id}&payment=cancel`,
            metadata: {
                diagnosis_id: diagnosisId,
                user_id: userId || diagnosis.user_id,
                diagnosis_type_id: diagnosis.diagnosis_types?.id || 'otsukisama',
                product_name: productName
            },
            locale: 'ja',
            payment_intent_data: {
                metadata: {
                    diagnosis_id: diagnosisId,
                    user_id: userId || diagnosis.user_id
                }
            }
        });

        // payment_intentsテーブルに記録
        await supabase
            .from('payment_intents')
            .insert({
                id: session.id,
                diagnosis_id: diagnosisId,
                user_id: userId || diagnosis.user_id,
                amount: price,
                status: 'pending',
                payment_method: 'stripe',
                payment_data: {
                    session_id: session.id,
                    payment_intent: session.payment_intent
                }
            });

        return res.json({ 
            sessionId: session.id,
            redirectUrl: session.url
        });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        return res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
};