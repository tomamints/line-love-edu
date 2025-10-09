/**
 * PAY.JP Webhook受信API
 * PAY.JPからの決済イベント通知を受け取る
 */

import { createClient } from '@supabase/supabase-js';
const crypto = require('crypto');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook署名の検証（本番環境で必要）
function verifyWebhookSignature(payload, signature, secret) {
  // PAY.JPのWebhook署名検証
  // 本番環境では署名検証を実装
  return true; // 開発環境では常にtrue
}

export default async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const event = req.body;

    console.log('[PAY.JP Webhook] Received event:', {
      type: event.type,
      id: event.id
    });

    // イベントタイプごとの処理
    switch (event.type) {
      case 'charge.succeeded':
        // 決済成功
        await handleChargeSucceeded(event.data);
        break;
        
      case 'charge.failed':
        // 決済失敗
        await handleChargeFailed(event.data);
        break;
        
      case 'charge.refunded':
        // 返金処理
        await handleChargeRefunded(event.data);
        break;
        
      default:
        console.log('[PAY.JP Webhook] Unhandled event type:', event.type);
    }

    // 200 OKを返す（PAY.JPに受信成功を通知）
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('[PAY.JP Webhook] Error processing webhook:', error);
    // エラーでも200を返す（再送信を防ぐため）
    return res.status(200).json({ received: true, error: error.message });
  }
}

// 決済成功時の処理
async function handleChargeSucceeded(charge) {
  const diagnosisId = charge.metadata?.diagnosis_id;
  const userId = charge.metadata?.user_id || 'anonymous';
  
  if (!diagnosisId) {
    console.error('[PAY.JP Webhook] No diagnosis_id in metadata');
    return;
  }

  console.log('[PAY.JP Webhook] Processing successful charge:', {
    chargeId: charge.id,
    diagnosisId,
    userId
  });

  // 購入記録を更新
  const purchaseId = `payjp_${charge.id}`;
  
  const { error: updateError } = await supabase
    .from('purchases')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('purchase_id', purchaseId);

  if (updateError) {
    console.error('[PAY.JP Webhook] Failed to update purchase:', updateError);
  }

  try {
    const { updateUserRichMenu } = require('./update-user-rich-menu');
    await updateUserRichMenu(userId, true);
  } catch (menuError) {
    console.error('[PAY.JP Webhook] Failed to update rich menu:', menuError);
  }

}

// 決済失敗時の処理
async function handleChargeFailed(charge) {
  const diagnosisId = charge.metadata?.diagnosis_id;
  const userId = charge.metadata?.user_id || 'anonymous';
  
  if (!diagnosisId) {
    return;
  }

  console.log('[PAY.JP Webhook] Charge failed:', {
    chargeId: charge.id,
    diagnosisId,
    failureMessage: charge.failure_message
  });

  // 購入記録を失敗に更新
  const purchaseId = `payjp_${charge.id}`;
  
  await supabase
    .from('purchases')
    .update({
      status: 'failed',
      metadata: {
        failure_message: charge.failure_message,
        failure_code: charge.failure_code
      },
      updated_at: new Date().toISOString()
    })
    .eq('purchase_id', purchaseId);

  try {
    const { updateUserRichMenu } = require('./update-user-rich-menu');
    await updateUserRichMenu(userId, false);
  } catch (menuError) {
    console.error('[PAY.JP Webhook] Failed to reset rich menu after failure:', menuError);
  }
}

// 返金処理
async function handleChargeRefunded(charge) {
  const diagnosisId = charge.metadata?.diagnosis_id;
  const userId = charge.metadata?.user_id || 'anonymous';
  
  if (!diagnosisId) {
    return;
  }

  console.log('[PAY.JP Webhook] Charge refunded:', {
    chargeId: charge.id,
    diagnosisId,
    refunded: charge.refunded,
    amountRefunded: charge.amount_refunded
  });

  // 購入記録を返金済みに更新
  const purchaseId = `payjp_${charge.id}`;
  
  await supabase
    .from('purchases')
    .update({
      status: 'refunded',
      metadata: {
        refunded: true,
        amount_refunded: charge.amount_refunded,
        refunded_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    })
    .eq('purchase_id', purchaseId);

  try {
    const { updateUserRichMenu } = require('./update-user-rich-menu');
    await updateUserRichMenu(userId, false);
  } catch (menuError) {
    console.error('[PAY.JP Webhook] Failed to reset rich menu after refund:', menuError);
  }
}
