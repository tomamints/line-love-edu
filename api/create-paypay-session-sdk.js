/**
 * PayPay決済セッション作成API（SDK版）
 */

const PAYPAY = require('@paypayopa/paypayopa-sdk-node');

// PayPay SDK設定
PAYPAY.Configure({
    clientId: 'a_7Nh7OQU4LD_sgIG',
    clientSecret: 'WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=',
    merchantId: '958667152543465472',
    productionMode: false
});

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Missing diagnosis ID' });
    }

    try {
        const merchantPaymentId = `diag_${diagnosisId}_${Date.now()}`;
        const amount = 2980;
        
        const payload = {
            merchantPaymentId: merchantPaymentId,
            amount: {
                amount: amount,
                currency: "JPY"
            },
            codeType: "ORDER_QR",
            orderDescription: `おつきさま診断 - ${userId || 'お客様'}`,
            isAuthorization: false,
            redirectUrl: `https://line-love-edu.vercel.app/payment-success.html?id=${diagnosisId}&userId=${userId || ''}&payment=success`,
            redirectType: "WEB_LINK",
            userAgent: req.headers['user-agent'] || 'Mozilla/5.0',
            orderItems: [{
                name: "おつきさま診断 完全版",
                category: "DIGITAL_CONTENT",
                quantity: 1,
                productId: "otsukisama_diagnosis",
                unitPrice: {
                    amount: amount,
                    currency: "JPY"
                }
            }]
        };

        console.log('Creating PayPay QR Code with SDK...');
        
        const response = await PAYPAY.QRCode.createQRCode(payload);
        
        console.log('PayPay SDK Response:', response);
        
        if (response && response.BODY && response.BODY.resultInfo) {
            if (response.BODY.resultInfo.code === 'SUCCESS') {
                return res.json({
                    success: true,
                    redirectUrl: response.BODY.data.url,
                    paymentId: merchantPaymentId,
                    expiresAt: response.BODY.data.expiryDate
                });
            } else {
                console.error('PayPay API Error:', response.BODY.resultInfo);
                throw new Error(response.BODY.resultInfo.message || 'PayPay payment creation failed');
            }
        } else {
            throw new Error('Invalid response from PayPay SDK');
        }

    } catch (error) {
        console.error('[PayPay SDK] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to create PayPay session',
            details: error.message 
        });
    }
}