/**
 * Square決済完了後のステータス更新API
 * 共通ハンドラーを使用した実装例
 */

const { Client, Environment } = require('square');
const PaymentHandler = require('./common/payment-handler');

// Square初期化
const squareClient = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.NODE_ENV === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
});

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderId, paymentLinkId, diagnosisId, userId } = req.body;

    if (!orderId || !diagnosisId || !userId) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            required: ['orderId', 'diagnosisId', 'userId']
        });
    }

    try {
        // Square APIで決済状態を確認
        console.log(`Checking Square payment status for order: ${orderId}`);
        
        const { result } = await squareClient.ordersApi.retrieveOrder(orderId);
        
        if (!result.order) {
            return res.status(400).json({ 
                error: 'Order not found' 
            });
        }

        const order = result.order;
        const paymentStatus = order.state; // OPEN, COMPLETED, CANCELED, etc.
        
        console.log(`Payment status: ${paymentStatus}`);

        // ステータスチェック（COMPLETED = 決済完了）
        if (paymentStatus !== 'COMPLETED') {
            return res.json({
                success: false,
                status: paymentStatus,
                message: 'Payment not completed yet'
            });
        }

        // 共通ハンドラーを使用
        const paymentHandler = new PaymentHandler();

        // 既存の購入レコードを確認
        const findResult = await paymentHandler.findPurchaseByMetadata(
            'square_order_id', 
            orderId
        );

        if (findResult.success && findResult.purchase?.status === 'completed') {
            console.log('Purchase already completed:', orderId);
            return res.json({ 
                success: true, 
                message: 'Already processed',
                purchaseId: findResult.purchase.purchase_id 
            });
        }

        // purchasesテーブルを完了状態に更新（共通ハンドラーを使用）
        const completeResult = await paymentHandler.completePurchase({
            merchantPaymentId: orderId, // Square order IDで検索
            transactionData: {
                payment_status: paymentStatus,
                square_order_id: orderId,
                square_payment_link_id: paymentLinkId,
                transaction_id: order.tenders?.[0]?.id, // 最初の支払い方法のID
                completed_at: order.closedAt || new Date().toISOString(),
                total_amount: order.totalMoney?.amount,
                receipt_url: order.tenders?.[0]?.cardDetails?.receiptUrl
            }
        });

        if (!completeResult.success) {
            console.error('Failed to complete purchase:', completeResult.error);
            // エラーでも処理を続行
        }

        // アクセス権限を更新（共通ハンドラーを使用）
        const purchaseId = completeResult.purchase?.purchase_id || findResult.purchase?.purchase_id;
        if (purchaseId) {
            const accessResult = await paymentHandler.grantFullAccess({
                diagnosisId: diagnosisId,
                userId: userId,
                purchaseId: purchaseId
            });

            if (!accessResult.success) {
                console.error('Failed to grant access rights:', accessResult.error);
            } else {
                console.log('Access rights granted successfully');
            }
        }

        // LINE通知送信（オプション）
        if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
            const amount = order.totalMoney?.amount || 980;
            const baseUrl = process.env.BASE_URL || 'https://line-love-edu.vercel.app';
            const resultUrl = `${baseUrl}/lp-otsukisama-unified.html?id=${diagnosisId}`;
            await sendLineNotification(userId, 'おつきさま診断', amount, resultUrl);
        }

        return res.json({
            success: true,
            purchaseId: purchaseId,
            paymentData: {
                orderId: orderId,
                amount: order.totalMoney?.amount,
                completedAt: order.closedAt,
                transactionId: order.tenders?.[0]?.id
            }
        });

    } catch (error) {
        console.error('[Square Update] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to update payment status',
            details: error.message 
        });
    }
}

/**
 * LINE通知送信（PayPayと共通）
 */
async function sendLineNotification(userId, productName, amount, resultUrl) {
    try {
        const message = {
            to: userId,
            messages: [{
                type: 'text',
                text: `✨ お支払いありがとうございます！\n\n` +
                      `${productName}の完全版が閲覧可能になりました。\n` +
                      `金額: ¥${amount.toLocaleString()}\n\n` +
                      `診断結果を見る:\n` +
                      `${resultUrl}`
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