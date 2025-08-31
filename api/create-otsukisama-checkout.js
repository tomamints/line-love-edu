// api/create-otsukisama-checkout.js
// おつきさま診断用のStripe決済セッション作成API

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { diagnosisId, userId } = req.body;
    
    if (!diagnosisId) {
      return res.status(400).json({ error: '診断IDが必要です' });
    }
    
    // 診断データを取得
    const { data: diagnosis, error: diagError } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', diagnosisId)
      .single();
    
    if (diagError || !diagnosis) {
      console.error('診断データ取得エラー:', diagError);
      return res.status(404).json({ error: '診断データが見つかりません' });
    }
    
    // 既に支払い済みか確認
    if (diagnosis.is_paid) {
      // 支払い済みの場合は結果ページへ直接リダイレクト
      return res.json({
        success: true,
        isPaid: true,
        redirectUrl: `/lp-otsukisama.html?id=${diagnosisId}&paid=true`
      });
    }
    
    // Stripe Checkoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: 'おつきさま診断 - 完全版',
              description: 'あなただけの月相診断結果と詳細な運勢分析',
              images: ['https://honkaku-ccln.com/images/banner/1-title.png']
            },
            unit_amount: 980, // 980円
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        diagnosisId: diagnosisId,
        userId: userId || '',
        diagnosisType: 'otsukisama'
      },
      success_url: `${process.env.BASE_URL}/api/otsukisama-payment-success?session_id={CHECKOUT_SESSION_ID}&diagnosis_id=${diagnosisId}`,
      cancel_url: `${process.env.BASE_URL}/lp-otsukisama-preview.html?id=${diagnosisId}&userId=${userId || ''}`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30分後に期限切れ
    });
    
    // セッションIDを診断データに保存
    await supabase
      .from('diagnoses')
      .update({ 
        stripe_session_id: session.id,
        checkout_created_at: new Date().toISOString()
      })
      .eq('id', diagnosisId);
    
    return res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Checkout作成エラー:', error);
    return res.status(500).json({ 
      error: '決済セッションの作成に失敗しました',
      details: error.message 
    });
  }
};