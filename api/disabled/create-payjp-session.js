/**
 * PAY.JP決済セッション作成API
 * クレジットカード決済用のセッションを作成してリダイレクトURLを返す
 */

import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PAY.JP設定
const PAYJP_SECRET_KEY = process.env.PAYJP_SECRET_KEY;
const PAYJP_PUBLIC_KEY = process.env.PAYJP_PUBLIC_KEY;
const BASE_URL = process.env.BASE_URL || 'https://shindan.love';

export default async function handler(req, res) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
      return res.status(400).json({ 
        success: false, 
        error: '診断IDが必要です' 
      });
    }

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
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('diagnosis_id', diagnosisId)
      .eq('status', 'completed')
      .single();

    if (purchase) {
      return res.status(400).json({ 
        success: false, 
        error: 'この診断は既に購入済みです' 
      });
    }

    // PAY.JP APIキーの確認
    if (!PAYJP_SECRET_KEY) {
      console.error('PAY.JP APIキーが設定されていません');
      return res.status(500).json({ 
        success: false, 
        error: 'PAY.JP設定エラー' 
      });
    }

    // TODO: PAY.JP APIを使用して決済セッションを作成
    // 現在は仮実装
    
    /**
     * PAY.JP実装時のフロー:
     * 1. PAY.JP SDKをインストール: npm install payjp
     * 2. チェックアウトセッションを作成
     * 3. 決済完了時のwebhook URLを設定
     * 4. リダイレクトURLを返す
     */

    /*
    // PAY.JP SDK使用例
    const payjp = require('payjp')(PAYJP_SECRET_KEY);
    
    // チャージ作成
    const charge = await payjp.charges.create({
      amount: 2980,
      currency: 'jpy',
      description: `おつきさま診断 完全版 - ${diagnosisId}`,
      metadata: {
        diagnosis_id: diagnosisId,
        user_id: userId || 'anonymous'
      },
      capture: true
    });
    
    // トークン化されたカード情報を使用する場合
    // リダイレクトURLを生成
    const redirectUrl = `${BASE_URL}/payjp-checkout.html?session=${charge.id}`;
    */

    // 暫定レスポンス
    return res.status(200).json({
      success: false,
      message: 'PAY.JP決済は準備中です',
      // 実装時は以下を返す
      // redirectUrl: redirectUrl
    });

  } catch (error) {
    console.error('PAY.JPセッション作成エラー:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || '決済セッションの作成に失敗しました' 
    });
  }
}