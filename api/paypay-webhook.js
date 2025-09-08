/**
 * PayPay Webhook受信エンドポイント
 * PayPayから決済完了通知を受け取り、即座にデータベースを更新
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// PayPay Webhook署名検証
function verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64');
    
    return signature === expectedSignature;
}

module.exports = async function handler(req, res) {
    // PayPayからのPOSTリクエストのみ受け付ける
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    console.log('=== PayPay Webhook Received ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        // Webhookの署名検証（本番環境では必須）
        const webhookSecret = process.env.PAYPAY_WEBHOOK_SECRET;
        if (webhookSecret && req.headers['x-paypay-signature']) {
            const isValid = verifyWebhookSignature(
                JSON.stringify(req.body),
                req.headers['x-paypay-signature'],
                webhookSecret
            );
            
            if (!isValid) {
                console.error('Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        }
        
        // Webhookデータを解析
        const webhookData = req.body;
        
        // 決済完了通知の場合
        if (webhookData.notification_type === 'Transaction' && 
            webhookData.state === 'COMPLETED') {
            
            const merchantPaymentId = webhookData.merchant_payment_id;
            const paymentId = webhookData.payment_id;
            const amount = webhookData.amount?.amount;
            const completedAt = webhookData.paid_at || new Date().toISOString();
            
            console.log(`Payment completed: ${merchantPaymentId}`);
            console.log(`PayPay Payment ID: ${paymentId}`);
            console.log(`Amount: ${amount}`);
            
            // merchantPaymentIdから診断IDを抽出（形式: diag_[diagnosisId]_[timestamp]）
            const diagnosisId = merchantPaymentId.match(/diag_([^_]+)_/)?.[1];
            
            if (!diagnosisId) {
                console.error('Could not extract diagnosis ID from merchant payment ID:', merchantPaymentId);
                return res.status(400).json({ error: 'Invalid merchant payment ID format' });
            }
            
            console.log(`Extracted diagnosis ID: ${diagnosisId}`);
            
            // Supabaseが利用可能な場合、決済情報を更新
            if (supabase) {
                // purchasesテーブルを更新
                const { data: updateData, error: updateError } = await supabase
                    .from('purchases')
                    .update({
                        payment_status: 'completed',
                        completed_at: completedAt,
                        paypay_payment_id: paymentId,
                        webhook_received_at: new Date().toISOString(),
                        metadata: {
                            ...{},
                            webhook_data: webhookData
                        }
                    })
                    .eq('diagnosis_id', diagnosisId)
                    .eq('payment_method', 'paypay')
                    .select()
                    .single();
                
                if (updateError) {
                    console.error('Failed to update purchase record:', updateError);
                    
                    // レコードが存在しない場合は新規作成を試みる
                    if (updateError.code === 'PGRST116') {
                        const { data: insertData, error: insertError } = await supabase
                            .from('purchases')
                            .insert({
                                diagnosis_id: diagnosisId,
                                amount: amount || 2980,
                                payment_method: 'paypay',
                                payment_status: 'completed',
                                completed_at: completedAt,
                                paypay_payment_id: paymentId,
                                paypay_merchant_payment_id: merchantPaymentId,
                                webhook_received_at: new Date().toISOString(),
                                metadata: {
                                    webhook_data: webhookData
                                }
                            })
                            .select()
                            .single();
                        
                        if (insertError) {
                            console.error('Failed to create purchase record:', insertError);
                        } else {
                            console.log('Purchase record created via webhook:', insertData.id);
                        }
                    }
                } else {
                    console.log('Purchase record updated via webhook:', updateData.id);
                }
                
                // diagnosesテーブルのpayment_statusを更新
                const { error: diagnosisUpdateError } = await supabase
                    .from('diagnoses')
                    .update({
                        payment_status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', diagnosisId);
                
                if (diagnosisUpdateError) {
                    console.error('Failed to update diagnosis payment status:', diagnosisUpdateError);
                } else {
                    console.log('Diagnosis payment status updated to completed:', diagnosisId);
                }
                
                // access_rightsテーブルも更新
                const { error: accessError } = await supabase
                    .from('access_rights')
                    .upsert({
                        diagnosis_id: diagnosisId,
                        has_full_access: true,
                        granted_at: completedAt,
                        granted_via: 'paypay_webhook',
                        payment_method: 'paypay'
                    }, {
                        onConflict: 'diagnosis_id'
                    });
                
                if (accessError) {
                    console.error('Failed to update access rights:', accessError);
                } else {
                    console.log('Access rights granted for diagnosis:', diagnosisId);
                }
                
                // 購入者のリッチメニューを切り替え
                try {
                    // diagnosisからline_user_idを取得
                    const { data: diagnosis } = await supabase
                        .from('diagnoses')
                        .select('line_user_id')
                        .eq('id', diagnosisId)
                        .single();
                    
                    if (diagnosis?.line_user_id) {
                        const { updateUserRichMenu } = require('./update-user-rich-menu');
                        await updateUserRichMenu(diagnosis.line_user_id, true);
                        console.log('Rich menu updated to premium for user:', diagnosis.line_user_id);
                    }
                } catch (menuError) {
                    console.error('Failed to update rich menu:', menuError);
                }
            }
            
            // 成功レスポンスを返す
            return res.status(200).json({
                success: true,
                message: 'Payment notification processed',
                diagnosisId: diagnosisId,
                paymentId: paymentId
            });
        }
        
        // 決済キャンセル通知の場合
        if (webhookData.notification_type === 'Transaction' && 
            (webhookData.state === 'CANCELED' || webhookData.state === 'FAILED')) {
            
            const merchantPaymentId = webhookData.merchant_payment_id;
            console.log(`Payment canceled/failed: ${merchantPaymentId}`);
            
            // merchantPaymentIdから診断IDを抽出
            const diagnosisId = merchantPaymentId.match(/diag_([^_]+)_/)?.[1];
            
            if (diagnosisId && supabase) {
                // purchasesテーブルを更新
                await supabase
                    .from('purchases')
                    .update({
                        payment_status: webhookData.state.toLowerCase(),
                        webhook_received_at: new Date().toISOString(),
                        metadata: {
                            ...{},
                            webhook_data: webhookData
                        }
                    })
                    .eq('diagnosis_id', diagnosisId)
                    .eq('payment_method', 'paypay');
                
                console.log(`Payment status updated to ${webhookData.state} for diagnosis:`, diagnosisId);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Payment cancellation processed'
            });
        }
        
        // その他の通知タイプ
        console.log('Unhandled notification type:', webhookData.notification_type);
        return res.status(200).json({
            success: true,
            message: 'Notification received',
            type: webhookData.notification_type
        });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({
            error: 'Failed to process webhook',
            details: error.message
        });
    }
}