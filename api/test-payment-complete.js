/**
 * テスト決済完了API
 * テスト環境でのみ使用する決済完了処理
 */

import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // テスト環境チェック
  const isTestEnvironment = 
    req.headers.host?.includes('localhost') ||
    req.headers.host?.includes('127.0.0.1') ||
    process.env.NODE_ENV === 'development';

  if (!isTestEnvironment && !req.query.test) {
    return res.status(403).json({ 
      success: false, 
      error: 'This endpoint is only available in test environment' 
    });
  }

  try {
    const { diagnosisId, userId, paymentMethod, amount } = req.body;

    if (!diagnosisId) {
      return res.status(400).json({ 
        success: false, 
        error: '診断IDが必要です' 
      });
    }

    console.log('[TEST] Processing test payment:', {
      diagnosisId,
      userId,
      paymentMethod,
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
      console.log('[TEST] Already purchased:', existingPurchase.purchase_id);
      return res.status(200).json({ 
        success: true,
        message: 'Already purchased',
        purchaseId: existingPurchase.purchase_id
      });
    }

    // テスト用の購入記録を作成
    const purchaseId = `test_pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        purchase_id: purchaseId,
        user_id: userId || 'test_user',
        diagnosis_id: diagnosisId,
        product_type: 'diagnosis',
        product_id: 'otsukisama',
        product_name: 'おつきさま診断（テスト）',
        amount: amount || 2980,
        currency: 'jpy',
        payment_method: paymentMethod || 'test_credit_card',
        status: 'completed',
        metadata: {
          test_payment: true,
          test_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('[TEST] Failed to create purchase record:', purchaseError);
      return res.status(500).json({ 
        success: false, 
        error: '購入記録の作成に失敗しました' 
      });
    }

    console.log('[TEST] Purchase record created:', purchase.purchase_id);

    return res.status(200).json({
      success: true,
      message: 'Test payment completed successfully',
      purchaseId: purchaseId,
      accessGranted: true
    });

  } catch (error) {
    console.error('[TEST] Payment processing error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'テスト決済の処理に失敗しました' 
    });
  }
}
