/**
 * PAY.JP決済処理API
 * クレジットカードトークンを受け取って決済を実行
 */

const { createClient } = require('@supabase/supabase-js');
const payjp = require('payjp')(process.env.PAYJP_SECRET_KEY);

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { token, diagnosisId, userId, amount = 2980 } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'カードトークンが必要です' 
      });
    }

    if (!diagnosisId) {
      return res.status(400).json({ 
        success: false, 
        error: '診断IDが必要です' 
      });
    }

    console.log('[PAY.JP] Processing payment:', {
      diagnosisId,
      userId,
      amount
    });

    // 診断データを取得
    const { data: diagnosis, error: diagError } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', diagnosisId)
      .single();

    if (diagError || !diagnosis) {
      console.error('診断データ取得エラー:', diagError);
      return res.status(404).json({ 
        success: false, 
        error: '診断データが見つかりません' 
      });
    }

    // 既に支払い済みかチェック
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('diagnosis_id', diagnosisId)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      console.log('[PAY.JP] Already purchased:', existingPurchase.purchase_id);
      return res.status(200).json({ 
        success: true,
        message: 'Already purchased',
        purchaseId: existingPurchase.purchase_id
      });
    }

    // PAY.JPで決済を作成
    const charge = await payjp.charges.create({
      amount: amount,
      currency: 'jpy',
      card: token,
      description: `おつきさま診断 完全版 - ${diagnosisId}`,
      metadata: {
        diagnosis_id: diagnosisId,
        user_id: userId || 'anonymous',
        product_name: 'おつきさま診断'
      },
      capture: true // 即時売上確定
    });

    console.log('[PAY.JP] Charge created:', charge.id);

    // 購入記録を作成
    const purchaseId = `payjp_${charge.id}`;
    
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        purchase_id: purchaseId,
        user_id: userId || 'anonymous',
        diagnosis_id: diagnosisId,
        product_type: 'diagnosis',
        product_id: 'otsukisama',
        product_name: 'おつきさま診断',
        amount: amount,
        currency: 'jpy',
        payment_method: 'credit_card',
        status: charge.paid ? 'completed' : 'pending',
        metadata: {
          payjp_charge_id: charge.id,
          card_brand: charge.card.brand,
          card_last4: charge.card.last4,
          created_at: new Date(charge.created * 1000).toISOString()
        }
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('[PAY.JP] Failed to create purchase record:', purchaseError);
      // 決済は成功しているので、エラーを返さない
    }

    if (charge.paid && userId) {
      try {
        const { updateUserRichMenu } = require('./update-user-rich-menu');
        await updateUserRichMenu(userId, true);
      } catch (menuError) {
        console.error('[PAY.JP] Failed to update rich menu after charge:', menuError);
      }
    }

    return res.status(200).json({
      success: true,
      chargeId: charge.id,
      purchaseId: purchaseId,
      paid: charge.paid,
      amount: charge.amount,
      card: {
        brand: charge.card.brand,
        last4: charge.card.last4
      }
    });

  } catch (error) {
    console.error('[PAY.JP] Payment processing error:', error);
    
    // PAY.JPのエラーをユーザーフレンドリーに変換
    let errorMessage = '決済の処理に失敗しました';
    
    if (error.status === 402) {
      errorMessage = 'カードが拒否されました。別のカードをお試しください。';
    } else if (error.status === 400) {
      errorMessage = 'カード情報に誤りがあります。';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return res.status(error.status || 500).json({ 
      success: false, 
      error: errorMessage
    });
  }
}

module.exports = handler;
