const fetch = require('node-fetch');
const crypto = require('crypto');

// Simulate Stripe webhook payload
const payload = {
    type: 'checkout.session.completed',
    data: {
        object: {
            id: 'cs_test_' + Date.now(),
            amount_total: 98000, // 980円（Stripeは最小通貨単位で送る）
            currency: 'jpy',
            metadata: {
                diagnosis_id: 'diag_1756715414668_3p6heltzc',
                user_id: 'U69bf66f589f5303a9615e94d7a7dc693',
                diagnosis_type: 'otsukisama',
                product_type: 'diagnosis'
            },
            customer_email: 'test@example.com',
            payment_intent: 'pi_test_' + Date.now(),
            payment_status: 'paid',
            mode: 'payment',
            customer_details: {
                name: 'Test User'
            }
        }
    }
};

async function testWebhook() {
    console.log('Webhook Payload Test');
    console.log('='.repeat(60));
    console.log('Testing with amount_total:', payload.data.object.amount_total);
    console.log('Expected amount in DB:', Math.floor(payload.data.object.amount_total / 100), '円');
    
    const body = JSON.stringify(payload);
    
    // Generate fake signature (webhook will fail verification but we can see the processing)
    const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${body}`;
    const signature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
    const header = `t=${timestamp},v1=${signature}`;
    
    try {
        const response = await fetch('http://localhost:3000/api/payment-webhook-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': header
            },
            body: body
        });
        
        const result = await response.text();
        console.log('Response:', result);
        
        if (!response.ok) {
            console.log('Status:', response.status);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testWebhook();