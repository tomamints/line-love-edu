/**
 * Test webhook endpoint for local development
 * Bypasses signature verification for testing
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!supabase) {
        return res.status(500).json({ error: 'Supabase not configured' });
    }

    console.log('[Test Webhook] Received event:', req.body.type);

    // Simulate checkout.session.completed event
    if (req.body.type === 'checkout.session.completed') {
        const session = req.body.data.object;
        
        const { 
            diagnosis_id, 
            user_id, 
            diagnosis_type,
            product_type = 'diagnosis'
        } = session.metadata || {};
        
        if (!diagnosis_id || !user_id) {
            return res.status(400).json({ error: 'Missing metadata' });
        }

        try {
            // Get diagnosis type info
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

            // Create purchase record
            const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // IMPORTANT: Convert amount from cents to yen using Math.floor
            const amountInYen = session.amount_total ? Math.floor(session.amount_total / 100) : 980;
            
            console.log('[Test Webhook] Creating purchase:');
            console.log('  - amount_total (cents):', session.amount_total);
            console.log('  - amount (yen):', amountInYen);
            console.log('  - purchase_id:', purchaseId);
            
            const purchaseData = {
                purchase_id: purchaseId,
                user_id: user_id,
                diagnosis_id: diagnosis_id,
                product_type: product_type,
                product_id: diagnosis_type || 'otsukisama',
                product_name: productName,
                amount: amountInYen, // Integer yen amount
                currency: session.currency ? session.currency.toUpperCase() : 'JPY',
                payment_method: 'stripe',
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent,
                status: 'completed',
                completed_at: new Date().toISOString(),
                metadata: {
                    customer_email: session.customer_email,
                    test: true
                }
            };

            const { data: purchase, error: purchaseError } = await supabase
                .from('purchases')
                .insert([purchaseData])
                .select()
                .single();

            if (purchaseError) {
                console.error('[Test Webhook] Failed to create purchase:', purchaseError);
                return res.status(500).json({ error: purchaseError.message });
            }

            console.log('[Test Webhook] Purchase created:', purchase.purchase_id);

            // Grant access rights
            const { error: accessError } = await supabase
                .from('access_rights')
                .upsert({
                    user_id: user_id,
                    resource_type: 'diagnosis',
                    resource_id: diagnosis_id,
                    access_level: 'full',
                    purchase_id: purchaseId,
                    valid_from: new Date().toISOString(),
                    valid_until: null
                }, {
                    onConflict: 'user_id,resource_type,resource_id'
                });

            if (accessError) {
                console.error('[Test Webhook] Failed to grant access:', accessError);
            } else {
                console.log('[Test Webhook] Access rights granted');
            }

            return res.json({ 
                success: true, 
                purchase_id: purchaseId,
                amount: amountInYen 
            });

        } catch (error) {
            console.error('[Test Webhook] Error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.json({ received: true });
}

module.exports = handler;