// api/profile-form.js
// プロフィール入力用Webフォーム

const ordersDB = require('../core/database/orders-db');
const profilesDB = require('../core/database/profiles-db');
// Stripe関連は削除（PayPayのみ使用）
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY
);

// 日本標準時（JST）のISO文字列を取得する関数
function getJSTDateTime() {
  // 現在時刻を取得
  const now = new Date();

  // JSTのオフセット（9時間 = 540分）
  const jstOffset = 9 * 60; // 分単位

  // 現在のUTC時刻にオフセットを追加
  const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);

  // YYYY-MM-DDTHH:mm:ss.sss+09:00 形式で返す
  const year = jstTime.getUTCFullYear();
  const month = String(jstTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(jstTime.getUTCDate()).padStart(2, '0');
  const hours = String(jstTime.getUTCHours()).padStart(2, '0');
  const minutes = String(jstTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(jstTime.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(jstTime.getUTCMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

module.exports = async (req, res) => {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETリクエストのアクション処理
  if (req.method === 'GET' && req.query.action) {
    const { action } = req.query;

    // 診断データ取得
    if (action === 'get-diagnosis') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: '診断IDが必要です' });
      }

      try {
        // まずdiagnosesテーブルから診断データを取得
        let diagnosisData = null;
        let isPaid = false;

        const { data: diagnosis, error: diagError } = await supabase
          .from('diagnoses')
          .select('*')
          .eq('id', id)
          .single();

        if (!diagError && diagnosis) {
          // diagnosesテーブルから取得成功
          diagnosisData = diagnosis;

          // purchasesテーブルで支払い状態をチェック
          const { data: purchase } = await supabase
            .from('purchases')
            .select('*')
            .eq('diagnosis_id', id)
            .eq('status', 'completed')
            .single();

          isPaid = !!purchase;
        } else {
          // 後方互換性: profilesテーブルから取得を試みる
          const { data: profileDiagnosis, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('diagnosis_id', id)
            .single();

          if (profileError || !profileDiagnosis) {
            console.log('診断データが見つかりません:', id);
            return res.status(404).json({
              success: false,
              error: '診断データが見つかりません'
            });
          }

          // profilesテーブルのデータをdiagnoses形式に変換
          diagnosisData = {
            id: profileDiagnosis.diagnosis_id,
            user_id: profileDiagnosis.user_id,
            user_name: profileDiagnosis.user_name,
            birth_date: profileDiagnosis.birth_date,
            diagnosis_type_id: profileDiagnosis.diagnosis_type || 'otsukisama',
            result_data: {
              moon_pattern_id: profileDiagnosis.moon_pattern_id,
              emotional_expression: profileDiagnosis.emotional_expression,
              distance_style: profileDiagnosis.distance_style,
              love_values: profileDiagnosis.love_values,
              love_energy: profileDiagnosis.love_energy
            },
            created_at: profileDiagnosis.diagnosis_date || profileDiagnosis.created_at
          };

          isPaid = profileDiagnosis.is_paid || false;
        }

        const data = diagnosisData;

          // 基本データ（プレビュー版でも表示）
          const basicDiagnosis = {
            id: data.id,
            user_id: data.user_id,
            user_name: data.user_name,
            birth_date: data.birth_date,
            moon_pattern_id: data.result_data?.moon_pattern_id,
            pattern_id: data.result_data?.moon_pattern_id,  // 互換性のため両方提供
            diagnosis_type: data.diagnosis_type_id || 'otsukisama',
            emotional_expression: data.result_data?.emotional_expression,
            distance_style: data.result_data?.distance_style,
            love_values: data.result_data?.love_values,
            love_energy: data.result_data?.love_energy,
            moon_phase: data.result_data?.moon_phase,
            hidden_moon_phase: data.result_data?.hidden_moon_phase,
            three_powers_keys: data.result_data?.three_powers_keys,
            is_paid: isPaid,
            created_at: data.created_at
          };

          // 支払い済みの場合は完全データを返す
          if (isPaid) {
            return res.json({
              success: true,
              diagnosis: basicDiagnosis,
              isPaid: true,
              accessLevel: 'full'
            });
          }

          // 未払いの場合は基本データのみ（プレビュー用）
          return res.json({
            success: true,
            diagnosis: basicDiagnosis,
            isPaid: false,
            accessLevel: 'preview'
          });
      } catch (error) {
        console.error('診断データ取得エラー:', error);
        return res.status(500).json({
          success: false,
          error: 'サーバーエラーが発生しました'
        });
      }
    }

    // Stripe決済成功処理は削除（PayPayのみ使用）
    if (false && action === 'payment-success') {
      const { session_id, diagnosis_id } = req.query;

      if (!session_id || !diagnosis_id) {
        return res.status(400).send('必要なパラメータが不足しています');
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
          return res.status(400).send('支払いが確認できません');
        }

        await supabase
          .from('diagnoses')
          .update({
            is_paid: true,
            paid_at: getJSTDateTime(),
            stripe_session_id: session_id,
            payment_amount: session.amount_total
          })
          .eq('id', diagnosis_id);

        const redirectUrl = `/lp-otsukisama-unified.html?id=${diagnosis_id}`;

        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>決済完了</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 40px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
              }
              h1 { margin-bottom: 20px; }
              p { margin-bottom: 30px; opacity: 0.9; }
              .spinner {
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
            <script>
              setTimeout(function() {
                window.location.href = '${redirectUrl}';
              }, 2000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1>✨ お支払いありがとうございます</h1>
              <p>診断結果ページへ移動しています...</p>
              <div class="spinner"></div>
            </div>
          </body>
          </html>
        `);
      } catch (error) {
        console.error('Payment success処理エラー:', error);
        res.status(500).send('エラーが発生しました');
      }
      return;
    }
  }

  // Stripe Checkout作成処理は削除（PayPayのみ使用）
  if (false && req.method === 'POST' && req.query.action === 'create-checkout') {
    const { diagnosisId, userId } = req.body;

    if (!diagnosisId) {
      return res.status(400).json({ error: '診断IDが必要です' });
    }

    try {
      const { data: diagnosis, error: diagError } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();

      if (diagError || !diagnosis) {
        return res.status(404).json({ error: '診断データが見つかりません' });
      }

      if (diagnosis.is_paid) {
        return res.json({
          success: true,
          isPaid: true,
          redirectUrl: `/lp-otsukisama-unified.html?id=${diagnosisId}`
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: 'おつきさま診断 - 完全版',
                description: 'あなただけの月相診断結果と詳細な運勢分析'
              },
              unit_amount: 980,
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
        success_url: `${process.env.BASE_URL}/api/profile-form?action=payment-success&session_id={CHECKOUT_SESSION_ID}&diagnosis_id=${diagnosisId}`,
        cancel_url: `${process.env.BASE_URL}/lp-otsukisama-unified.html?id=${diagnosisId}`,
        expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      });

      await supabase
        .from('diagnoses')
        .update({
          stripe_session_id: session.id,
          checkout_created_at: getJSTDateTime()
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
  }

  // POSTリクエスト: 診断データ保存（/api/save-diagnosisの代替）
  if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      const { action, userId, userName, name, birthDate, patternId, diagnosisType, resultData } = req.body;

      // save-diagnosisアクションの処理
      if (action === 'save-diagnosis') {
        const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 月相番号を取得するヘルパー関数
        function getMoonPhaseNumber(moonPhase) {
          const moonPhaseMap = {
            '新月': 1,
            '三日月': 2,
            '上弦の月': 3,
            '十三夜': 4,
            '満月': 5,
            '十六夜': 6,
            '下弦の月': 7,
            '暁': 8
          };
          return moonPhaseMap[moonPhase] || 1;
        }

        // 3つの力を計算（誕生日ベース）
        const [year, month, day] = birthDate.split('-').map(Number);
        const moonPhaseNumber = getMoonPhaseNumber(resultData?.moon_phase);
        const actionKey = (year + day + month) % 20;
        const emotionKey = (month + (moonPhaseNumber - 1)) % 20;
        const thinkingKey = year % 20;

        // 1. diagnosesテーブルに新規診断を保存（毎回新規）
        const { data: diagnosis, error: diagError } = await supabase
          .from('diagnoses')
          .insert({
            id: diagnosisId,
            user_id: userId || 'anonymous',
            user_name: userName || name,
            birth_date: birthDate,
            diagnosis_type_id: diagnosisType || 'otsukisama',
            result_data: {
              moon_pattern_id: resultData?.moon_pattern_id || patternId,
              moon_phase: resultData?.moon_phase,
              hidden_moon_phase: resultData?.hidden_moon_phase,
              emotional_expression: resultData?.emotional_expression || 'straight',
              distance_style: resultData?.distance_style || 'moderate',
              love_values: resultData?.love_values || 'romantic',
              love_energy: resultData?.love_energy || 'intense',
              moon_power_1: resultData?.moon_power_1,
              moon_power_2: resultData?.moon_power_2,
              moon_power_3: resultData?.moon_power_3,
              three_powers_keys: {
                action: actionKey,
                emotion: emotionKey,
                thinking: thinkingKey
              }
            },
            metadata: {},
            created_at: getJSTDateTime()
          })
          .select()
          .single();

        if (diagError) {
          console.error('診断データ保存エラー:', diagError);
          // エラーでもローカルストレージで続行
          return res.status(200).json({
            success: true,
            diagnosisId: diagnosisId,
            message: '診断データを保存しました（ローカル）'
          });
        }

        // 2. profilesテーブルの基本情報も更新（最新の名前・誕生日・恋愛4軸）
        if (userId) {
          const profileData = {
            userName: userName || name,
            birthDate: birthDate,
            emotionalExpression: resultData?.emotional_expression || 'straight',
            distanceStyle: resultData?.distance_style || 'moderate',
            loveValues: resultData?.love_values || 'romantic',
            loveEnergy: resultData?.love_energy || 'intense'
          };
          await profilesDB.saveProfile(userId, profileData);
        }

        return res.status(200).json({
          success: true,
          diagnosisId: diagnosisId,
          message: '診断データを保存しました'
        });
      }

      // おつきさま診断データの保存
      if (diagnosisType === 'otsukisama' || patternId !== undefined) {
        if (!name || !birthDate) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'birthDate']
          });
        }

        // 診断IDを生成
        const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // プロファイルデータとして保存
        const diagnosisData = {
          diagnosisId: diagnosisId,
          userName: name,
          birthDate: birthDate,
          moonPatternId: patternId,
          diagnosisDate: getJSTDateTime(),
          diagnosisType: 'otsukisama',
          isPaid: false
        };

        if (userId) {
          await profilesDB.saveProfile(userId, diagnosisData);
        }

        const diagnosis = {
          id: diagnosisId,
          user_id: userId || null,
          user_name: name,
          birth_date: birthDate,
          pattern_id: patternId,
          diagnosis_type: 'otsukisama',
          is_paid: false,
          created_at: getJSTDateTime()
        };

        // プロファイルもprofiles DBに保存（LINE連携用）
        if (userId) {
          const profileData = {
            userName: name,
            birthDate: birthDate,
            moonPatternId: patternId,
            diagnosisDate: getJSTDateTime(),
            diagnosisType: 'otsukisama'
          };
          await profilesDB.saveProfile(userId, profileData);
        }

        return res.status(200).json({
          success: true,
          diagnosisId: diagnosis.id,
          message: '診断データを保存しました'
        });
      }
    } catch (error) {
      console.error('診断データ保存エラー:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // GETリクエスト: フォーム表示
  if (req.method === 'GET') {
    const { userId, liffId } = req.query;

    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    // 既存のプロフィールを取得
    const profile = await profilesDB.getProfile(userId);
    const existing = profile?.personalInfo || {};

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <title>🔮 おつきさま診断 - プロフィール設定</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }


    .header {
      background: linear-gradient(135deg, #1a0033, #24243e);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .form-container {
      padding: 30px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 18px;
      color: #1a0033;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 4px solid #667eea;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    input, select {
      width: 100%;
      padding: 12px 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
    }

    select option {
      padding: 10px;
      line-height: 1.5;
    }

    /* ラジオボタンのスタイル */
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .radio-option {
      display: flex;
      align-items: flex-start;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .radio-option:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .radio-option input[type="radio"] {
      width: auto;
      margin: 0 10px 0 0;
      flex-shrink: 0;
      align-self: center;
    }

    .radio-option.selected {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .radio-label {
      flex: 1;
    }

    .radio-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
      font-size: 15px;
    }

    .radio-description {
      color: #666;
      font-size: 13px;
      line-height: 1.4;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input[type="date"] {
      font-family: inherit;
    }

    .age-calc {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .age-display {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 14px;
      color: #666;
    }

    .submit-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }

    .loading.show {
      display: block;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-message {
      display: none;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 40px 20px;
      border-radius: 20px;
      text-align: center;
      margin: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .success-message.show {
      display: block;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .optional-tag {
      display: inline-block;
      background: #ff9800;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>おつきさま診断</h1>
      <p>おつきさまにあなたとお相手のことを教えてください。</p>
    </div>

    <div class="form-container">
      <div class="success-message" id="successMessage">
        <div style="font-size: 24px; margin-bottom: 20px;">🌙</div>
        <div style="font-size: 20px; margin-bottom: 15px; font-weight: bold;">
          おつきさまに伝えています
        </div>
        <div style="line-height: 1.8;">
          あなたの想いを<br>
          月の光に託しています<br><br>

          まもなく月タロット占いへ<br>
          ご案内いたします<br><br>

          <span style="font-size: 14px; opacity: 0.9;">
            どうぞこのままお待ちください<br>
            月の導きがあなたに届きますように
          </span>
        </div>
      </div>

      <form id="profileForm" action="/api/profile-form" method="POST">
        <input type="hidden" name="userId" value="${userId}">

        <div class="section">
          <h2 class="section-title">👤 あなたのこと</h2>

          <div class="form-group">
            <label for="userBirthdate"><strong>生年月日</strong></label>
            <div style="display: flex; gap: 5px;">
              <select id="userYear" style="flex: 1;" required>
                <option value="">年</option>
                ${(() => {
                  let options = '';
                  const currentYear = new Date().getFullYear();
                  for (let y = currentYear - 15; y >= 1950; y--) {
                    const selected = existing.userBirthdate && new Date(existing.userBirthdate).getFullYear() === y ? 'selected' : '';
                    options += '<option value="' + y + '" ' + selected + '>' + y + '年</option>';
                  }
                  return options;
                })()}
              </select>
              <select id="userMonth" style="flex: 1;" required>
                <option value="">月</option>
                ${(() => {
                  let options = '';
                  for (let m = 1; m <= 12; m++) {
                    const selected = existing.userBirthdate && new Date(existing.userBirthdate).getMonth() + 1 === m ? 'selected' : '';
                    options += '<option value="' + m + '" ' + selected + '>' + m + '月</option>';
                  }
                  return options;
                })()}
              </select>
              <select id="userDay" style="flex: 1;" required>
                <option value="">日</option>
                ${(() => {
                  let options = '';
                  for (let d = 1; d <= 31; d++) {
                    const selected = existing.userBirthdate && new Date(existing.userBirthdate).getDate() === d ? 'selected' : '';
                    options += '<option value="' + d + '" ' + selected + '>' + d + '日</option>';
                  }
                  return options;
                })()}
              </select>
            </div>
            <input type="hidden" id="userBirthdate" name="userBirthdate" value="${existing.userBirthdate || ''}" required>
          </div>

          <input type="hidden" id="userAge" name="userAge" value="${existing.userAge || ''}">

          <div class="form-group">
            <label for="userGender"><strong>性別</strong></label>
            <select id="userGender" name="userGender" required>
              <option value="">選択してください</option>
              <option value="male" ${existing.userGender === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${existing.userGender === 'female' ? 'selected' : ''}>女性</option>
              <option value="other" ${existing.userGender === 'other' ? 'selected' : ''}>その他</option>
            </select>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">💖 お相手のこと（任意）</h2>
          <p style="font-size: 14px; color: #888; margin-bottom: 15px;"></p>

          <div class="form-group">
            <label for="partnerBirthdate"><strong>生年月日</strong></label>
            <div style="display: flex; gap: 5px;">
              <select id="partnerYear" style="flex: 1;">
                <option value="">年</option>
                ${(() => {
                  let options = '';
                  const currentYear = new Date().getFullYear();
                  for (let y = currentYear - 15; y >= 1950; y--) {
                    const selected = existing.partnerBirthdate && new Date(existing.partnerBirthdate).getFullYear() === y ? 'selected' : '';
                    options += `<option value="${y}" ${selected}>${y}年</option>`;
                  }
                  return options;
                })()}
              </select>
              <select id="partnerMonth" style="flex: 1;">
                <option value="">月</option>
                ${(() => {
                  let options = '';
                  for (let m = 1; m <= 12; m++) {
                    const selected = existing.partnerBirthdate && new Date(existing.partnerBirthdate).getMonth() + 1 === m ? 'selected' : '';
                    options += `<option value="${m}" ${selected}>${m}月</option>`;
                  }
                  return options;
                })()}
              </select>
              <select id="partnerDay" style="flex: 1;">
                <option value="">日</option>
                ${(() => {
                  let options = '';
                  for (let d = 1; d <= 31; d++) {
                    const selected = existing.partnerBirthdate && new Date(existing.partnerBirthdate).getDate() === d ? 'selected' : '';
                    options += `<option value="${d}" ${selected}>${d}日</option>`;
                  }
                  return options;
                })()}
              </select>
            </div>
            <input type="hidden" id="partnerBirthdate" name="partnerBirthdate" value="${existing.partnerBirthdate || ''}" required>
          </div>

          <input type="hidden" id="partnerAge" name="partnerAge" value="${existing.partnerAge || ''}">

          <div class="form-group">
            <label for="partnerGender"><strong>性別</strong></label>
            <select id="partnerGender" name="partnerGender">
              <option value="">選択してください</option>
              <option value="male" ${existing.partnerGender === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${existing.partnerGender === 'female' ? 'selected' : ''}>女性</option>
              <option value="other" ${existing.partnerGender === 'other' ? 'selected' : ''}>その他</option>
            </select>
          </div>
        </div>

        <div class="section">
        <p style="margin: 8px 0 18px;
            padding: 10px 16px;
            font-size: 20px;
            color: #c30000;
            background: #fff4f4;
            border-left: 4px solid #ff6a6a;
            border-radius: 6px;
            font-weight: 600;
            letter-spacing: 0.2px;">
           ⭐ ここから先はあなた直感で答えてください
          </p>
          <h2 class="section-title">🌙 恋愛状況について</h2>
          <div class="form-group">
            <label><strong>Q1：あなたは今何にお悩みですか？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.loveSituation === 'beginning' ? 'selected' : ''}">
                <input type="radio" name="loveSituation" value="beginning" ${existing.loveSituation === 'beginning' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">恋の始まり・相手との距離感</div>
                  <div class="radio-description">片想い、気になる人、恋人未満、マッチングアプリでの出会いなど</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveSituation === 'relationship' ? 'selected' : ''}">
                <input type="radio" name="loveSituation" value="relationship" ${existing.loveSituation === 'relationship' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">交際中の相手とのこと</div>
                  <div class="radio-description">現在の恋人との今後、結婚、マンネリ、すれ違いなど</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveSituation === 'marriage' ? 'selected' : ''}">
                <input type="radio" name="loveSituation" value="marriage" ${existing.loveSituation === 'marriage' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">夫婦関係</div>
                  <div class="radio-description">喧嘩、すれ違い、意見の相違、結婚後のギャップ</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveSituation === 'complicated' ? 'selected' : ''}">
                <input type="radio" name="loveSituation" value="complicated" ${existing.loveSituation === 'complicated' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">複雑な事情を抱える恋</div>
                  <div class="radio-description">禁断の恋、遠距離、障害のある恋、公にできない関係など</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveSituation === 'ending' ? 'selected' : ''}">
                <input type="radio" name="loveSituation" value="ending" ${existing.loveSituation === 'ending' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">復縁・終わってしまった恋</div>
                  <div class="radio-description">復縁したい、別れの危機、失恋を乗り越えたいなど</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><strong>Q2：今、特に何を知りたいですか？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.wantToKnow === 'feelings' ? 'selected' : ''}">
                <input type="radio" name="wantToKnow" value="feelings" ${existing.wantToKnow === 'feelings' ? 'checked' : ''} required>
                <div class="radio-label" style="display: flex; align-items: center; min-height: 40px;">
                  <div class="radio-title">相手が今、どんな気持ちなのか</div>
                </div>
              </label>
              <label class="radio-option ${existing.wantToKnow === 'action' ? 'selected' : ''}">
                <input type="radio" name="wantToKnow" value="action" ${existing.wantToKnow === 'action' ? 'checked' : ''} required>
                <div class="radio-label" style="display: flex; align-items: center; min-height: 40px;">
                  <div class="radio-title">今、自分がどうしたらいいか</div>
                </div>
              </label>
              <label class="radio-option ${existing.wantToKnow === 'past' ? 'selected' : ''}">
                <input type="radio" name="wantToKnow" value="past" ${existing.wantToKnow === 'past' ? 'checked' : ''} required>
                <div class="radio-label" style="display: flex; align-items: center; min-height: 40px;">
                  <div class="radio-title">過去（出来事）の意味や理由</div>
                </div>
              </label>
              <label class="radio-option ${existing.wantToKnow === 'future' ? 'selected' : ''}">
                <input type="radio" name="wantToKnow" value="future" ${existing.wantToKnow === 'future' ? 'checked' : ''} required>
                <div class="radio-label" style="display: flex; align-items: center; min-height: 40px;">
                  <div class="radio-title">これからどうなっていくのか</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><strong>Q3：想いを伝えるときのスタイルは？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.emotionalExpression === 'straight' ? 'selected' : ''}">
                <input type="radio" name="emotionalExpression" value="straight" ${existing.emotionalExpression === 'straight' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">「好き！」と真っ直ぐ伝える</div>
                </div>
              </label>
              <label class="radio-option ${existing.emotionalExpression === 'physical' ? 'selected' : ''}">
                <input type="radio" name="emotionalExpression" value="physical" ${existing.emotionalExpression === 'physical' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">手をつないだり会いに行く</div>
                </div>
              </label>
              <label class="radio-option ${existing.emotionalExpression === 'subtle' ? 'selected' : ''}">
                <input type="radio" name="emotionalExpression" value="subtle" ${existing.emotionalExpression === 'subtle' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">プチプレゼントやメッセージで匂わせ</div>
                </div>
              </label>
              <label class="radio-option ${existing.emotionalExpression === 'shy' ? 'selected' : ''}">
                <input type="radio" name="emotionalExpression" value="shy" ${existing.emotionalExpression === 'shy' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">気持ちはあるのになかなか伝えられない</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><strong>Q4：恋人との距離感で心地いいのは？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.distanceStyle === 'close' ? 'selected' : ''}">
                <input type="radio" name="distanceStyle" value="close" ${existing.distanceStyle === 'close' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">常に繋がっていたい</div>
                </div>
              </label>
              <label class="radio-option ${existing.distanceStyle === 'moderate' ? 'selected' : ''}">
                <input type="radio" name="distanceStyle" value="moderate" ${existing.distanceStyle === 'moderate' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">1日1回連絡くらいの安心ペースで行きたい</div>
                </div>
              </label>
              <label class="radio-option ${existing.distanceStyle === 'independent' ? 'selected' : ''}">
                <input type="radio" name="distanceStyle" value="independent" ${existing.distanceStyle === 'independent' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">自分1人の時間や友達、家族との時間も大事にしたい</div>
                </div>
              </label>
              <label class="radio-option ${existing.distanceStyle === 'cautious' ? 'selected' : ''}">
                <input type="radio" name="distanceStyle" value="cautious" ${existing.distanceStyle === 'cautious' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">慎重に距離を保ちながら少しずつ仲良くなりたい</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><strong>Q5：特に一番大事にしたいものは？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.loveValues === 'romantic' ? 'selected' : ''}">
                <input type="radio" name="loveValues" value="romantic" ${existing.loveValues === 'romantic' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">理想やドラマみたいな特別感</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveValues === 'realistic' ? 'selected' : ''}">
                <input type="radio" name="loveValues" value="realistic" ${existing.loveValues === 'realistic' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">安定や現実的な安心感</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveValues === 'excitement' ? 'selected' : ''}">
                <input type="radio" name="loveValues" value="excitement" ${existing.loveValues === 'excitement' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">新しい体験やドキドキ感</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveValues === 'growth' ? 'selected' : ''}">
                <input type="radio" name="loveValues" value="growth" ${existing.loveValues === 'growth' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">一緒に成長できる関係</div>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label><strong>Q6：あなたのこれまでの恋愛のペースは？</strong></label>
            <div class="radio-group">
              <label class="radio-option ${existing.loveEnergy === 'intense' ? 'selected' : ''}">
                <input type="radio" name="loveEnergy" value="intense" ${existing.loveEnergy === 'intense' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">一気に燃え上がるタイプ</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveEnergy === 'stable' ? 'selected' : ''}">
                <input type="radio" name="loveEnergy" value="stable" ${existing.loveEnergy === 'stable' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">安定してコツコツ続くタイプ</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveEnergy === 'fluctuating' ? 'selected' : ''}">
                <input type="radio" name="loveEnergy" value="fluctuating" ${existing.loveEnergy === 'fluctuating' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">浮き沈みがあるタイプ</div>
                </div>
              </label>
              <label class="radio-option ${existing.loveEnergy === 'cool' ? 'selected' : ''}">
                <input type="radio" name="loveEnergy" value="cool" ${existing.loveEnergy === 'cool' ? 'checked' : ''} required>
                <div class="radio-label">
                  <div class="radio-title">恋愛だけに全振りせず冷静なタイプ</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn">
          おつきさまにお伝えする
        </button>
      </form>

      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p style="margin-top: 10px;">お伝え中...</p>
      </div>
    </div>
  </div>

  <script>
    // 年齢を自動計算
    function calculateAge(type) {
      const birthdateInput = document.getElementById(type + 'Birthdate');
      const ageInput = document.getElementById(type + 'Age');

      if (birthdateInput.value) {
        const birthDate = new Date(birthdateInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        ageInput.value = age;
      }
    }

    // 初期表示時に年齢計算
    window.onload = function() {
      calculateAge('user');
      calculateAge('partner');
    };
  </script>
  <script>
    // 年月日セレクトから日付を組み立てる
    function updateBirthdate(type) {
      const year = document.getElementById(type + 'Year').value;
      const month = document.getElementById(type + 'Month').value;
      const day = document.getElementById(type + 'Day').value;

      if (year && month && day) {
        const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        document.getElementById(type + 'Birthdate').value = dateStr;
        calculateAge(type);
      }
    }

    // イベントリスナーを設定
    ['user', 'partner'].forEach(type => {
      ['Year', 'Month', 'Day'].forEach(part => {
        document.getElementById(type + part).addEventListener('change', () => updateBirthdate(type));
      });
    });
  </script>
  <script>
    // ラジオボタンの選択状態を管理
    document.addEventListener('DOMContentLoaded', function() {
      // すべてのラジオボタングループに対して処理
      ['loveSituation', 'wantToKnow', 'emotionalExpression', 'distanceStyle', 'loveValues', 'loveEnergy'].forEach(groupName => {
        const radios = document.querySelectorAll(\`input[name="\${groupName}"]\`);
        radios.forEach(radio => {
          radio.addEventListener('change', function() {
            // このグループ内のすべての選択状態をクリア
            const parentGroup = this.closest('.radio-group');
            if (parentGroup) {
              parentGroup.querySelectorAll('.radio-option').forEach(option => {
                option.classList.remove('selected');
              });
            }
            // 選択されたものにselectedクラスを追加
            if (this.checked) {
              this.closest('.radio-option').classList.add('selected');
            }
          });
        });
      });

      // ラベルクリック時の処理（ラベル全体をクリック可能に）
      document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function(e) {
          // ラジオボタン自体のクリックでない場合
          if (e.target.type !== 'radio') {
            const radio = this.querySelector('input[type="radio"]');
            if (radio && !radio.checked) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change'));
            }
          }
        });
      });
    });

    // フォーム送信をAJAX化
    document.getElementById('profileForm').addEventListener('submit', async function(e) {
      e.preventDefault(); // デフォルトの送信を防ぐ

      // ローディング表示
      document.getElementById('loading').classList.add('show');

      try {
        // FormDataを使用してデータを収集
        const formData = new FormData(this);
        const data = {};
        for (let [key, value] of formData.entries()) {
          data[key] = value;
        }

        // AJAXで送信
        const response = await fetch('/api/profile-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          // 成功したら直接ページ遷移（リダイレクトなし）
          const userId = '${userId}';
          window.location.href = '/pages/moon-message-sent.html?userId=' + userId;
        } else {
          // エラーハンドリング
          alert('エラーが発生しました。もう一度お試しください。');
          document.getElementById('loading').classList.remove('show');
        }
      } catch (error) {
        console.error('送信エラー:', error);
        alert('送信に失敗しました。もう一度お試しください。');
        document.getElementById('loading').classList.remove('show');
      }
    });
  </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  // POSTリクエスト: データ保存
  } else if (req.method === 'POST') {
    console.log('📮 POST request received');
    console.log('req.body:', req.body);

    // ボディが既にパースされていない場合のみパース
    if (!req.body) {
      await new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          console.log('Raw body:', body);
          try {
            // JSONパースを試みる
            req.body = JSON.parse(body);
            console.log('Parsed as JSON:', req.body);
          } catch (e) {
            // URLエンコードされたフォームデータの場合
            const params = new URLSearchParams(body);
            req.body = Object.fromEntries(params);
            console.log('Parsed as form data:', req.body);
          }
          resolve();
        });
      });
    }

    // save-otsuきsamaアクションの処理
    if (req.body.action === 'save-otsukisama') {
      console.log('📝 save-otsukisama action received:', req.body);
      const { userId, name, birthDate } = req.body;

      if (!userId || !name || !birthDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      try {
        // 月のパターンを計算（lp-otsukisama-moon.jsと同じロジック）
        const calculateMoonPattern = (birthDate) => {
          const date = new Date(birthDate);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();

          // 月齢を計算（LINEバックエンドと同じ）
          const referenceDate = new Date('2000-01-06 18:14:00');
          const lunarCycle = 29.53059;
          const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
          let moonAge = daysDiff % lunarCycle;
          if (moonAge < 0) moonAge += lunarCycle;

          // 月齢から月相を判定
          const ranges = [
            { index: 0, min: 0, max: 3.7 },      // 新月
            { index: 1, min: 3.7, max: 7.4 },    // 三日月
            { index: 2, min: 7.4, max: 11.1 },   // 上弦
            { index: 3, min: 11.1, max: 14.8 },  // 十三夜
            { index: 4, min: 14.8, max: 18.5 },  // 満月
            { index: 5, min: 18.5, max: 22.1 },  // 十六夜
            { index: 6, min: 22.1, max: 25.8 },  // 下弦
            { index: 7, min: 25.8, max: 29.53 }  // 暁
          ];

          let moonPhaseIndex = 0;
          for (const range of ranges) {
            if (moonAge >= range.min && moonAge < range.max) {
              moonPhaseIndex = range.index;
              break;
            }
          }

          // 隠れ月相のインデックスを計算（既存のロジック）
          const seed = (month * 31 + day) % 8;
          const hiddenIndex = (moonPhaseIndex + seed + 4) % 8;

          // パターンID計算（0-63）
          const patternId = moonPhaseIndex * 8 + hiddenIndex;
          return patternId;
        };

        const moonPatternId = calculateMoonPattern(birthDate);
        const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // プロファイルを保存
        const profileData = {
          userName: name,
          birthDate: birthDate,
          moonPatternId: moonPatternId,
          diagnosisType: 'otsukisama',
          diagnosisId: diagnosisId,
          diagnosisDate: getJSTDateTime()
        };

        await profilesDB.saveProfile(userId, profileData);

        console.log('✅ Profile saved successfully:', { userId, diagnosisId, moonPatternId });

        return res.json({
          success: true,
          diagnosisId: diagnosisId,
          moonPatternId: moonPatternId
        });
      } catch (error) {
        console.error('❌ Save profile error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ error: 'Failed to save profile' });
      }
    }

    // 既存の恋愛占いフォームデータ処理
    const {
      userId, userBirthdate, userAge, userGender,
      partnerBirthdate, partnerAge, partnerGender,
      loveSituation, wantToKnow,
      emotionalExpression, distanceStyle, loveValues, loveEnergy
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // プロフィールを保存
      const profile = await profilesDB.getProfile(userId) || {};

      profile.personalInfo = {
        ...profile.personalInfo,
        userBirthdate,
        userAge: parseInt(userAge),
        userGender,
        partnerBirthdate,
        partnerAge: parseInt(partnerAge),
        partnerGender,
        loveSituation,
        wantToKnow,
        emotionalExpression,
        distanceStyle,
        loveValues,
        loveEnergy,
        updatedAt: getJSTDateTime()
      };

      // データベースのカラムに合わせたデータも設定
      profile.birthDate = userBirthdate;
      profile.gender = userGender;
      profile.partnerBirthDate = partnerBirthdate;
      profile.partnerGender = partnerGender;

      await profilesDB.saveProfile(userId, profile);

      console.log('✅ Profile saved for user:', userId);

      // 相性診断を実行
      console.log('📊 相性診断開始 for user:', userId);
      let fortuneResult = null;
      try {
        const MoonFortuneEngineV2 = require('../core/moon-fortune-v2');

        console.log('🌙 月の相性診断生成開始');
        // 月の相性診断を生成
        const moonEngine = new MoonFortuneEngineV2();

        // プロファイルオブジェクトを作成
        const userProfile = {
          birthDate: userBirthdate,
          gender: userGender
        };
        const partnerProfile = {
          birthDate: partnerBirthdate,
          gender: partnerGender
        };

        fortuneResult = moonEngine.generateCompleteReading(userBirthdate, partnerBirthdate);
        console.log('🌙 診断結果生成完了');

        // 診断結果をファイルに保存（データベースには対応カラムがないため）
        // Vercel環境では/tmpに保存（一時的）
        try {
          const fs = require('fs').promises;
          const path = require('path');
          const dataDir = process.env.VERCEL
            ? '/tmp/profiles'
            : path.join(__dirname, '../data/profiles');

          await fs.mkdir(dataDir, { recursive: true });

          const profileData = {
            ...profile,
            lastFortuneResult: fortuneResult
          };

          await fs.writeFile(
            path.join(dataDir, `${userId}.json`),
            JSON.stringify(profileData, null, 2)
          );

          console.log('✅ 診断結果をファイルに保存:', path.join(dataDir, `${userId}.json`));
        } catch (fileError) {
          // ファイル保存エラーは無視（データベースに保存済み）
          console.log('⚠️ ファイル保存スキップ:', fileError.message);
        }

        // プッシュメッセージは送らない（レート制限回避）
        // 代わりに成功ページで診断結果を表示

        /* コメントアウト：レート制限対策
        const message = {
          type: 'flex',
          altText: '🌙 月の相性診断結果',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#764ba2',
              contents: [
                {
                  type: 'text',
                  text: '🌙 月の相性診断結果',
                  color: '#ffffff',
                  size: 'xl',
                  weight: 'bold'
                }
              ]
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: `あなた: ${result.user.moonPhaseType.symbol} ${result.user.moonPhaseType.name}`,
                      size: 'lg',
                      weight: 'bold',
                      color: '#667eea'
                    },
                    {
                      type: 'text',
                      text: `お相手: ${result.partner.moonPhaseType.symbol} ${result.partner.moonPhaseType.name}`,
                      size: 'lg',
                      weight: 'bold',
                      color: '#667eea'
                    }
                  ]
                },
                {
                  type: 'separator'
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '相性スコア',
                      size: 'sm',
                      color: '#aaaaaa'
                    },
                    {
                      type: 'text',
                      text: `${result.compatibility.score}%`,
                      size: 'xxl',
                      weight: 'bold',
                      align: 'center',
                      color: '#764ba2'
                    },
                    {
                      type: 'text',
                      text: result.compatibility.level,
                      size: 'md',
                      align: 'center',
                      color: '#667eea'
                    }
                  ]
                },
                {
                  type: 'separator'
                },
                {
                  type: 'text',
                  text: result.compatibility.description,
                  wrap: true,
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: '💫 アドバイス',
                  margin: 'lg',
                  size: 'md',
                  weight: 'bold',
                  color: '#667eea'
                },
                {
                  type: 'text',
                  text: Array.isArray(result.compatibility.advice)
                    ? result.compatibility.advice.join(' ')
                    : result.compatibility.advice,
                  wrap: true,
                  size: 'sm',
                  color: '#666666'
                }
              ]
            }
          }
        };

        */

      } catch (sendError) {
        console.error('❌ 診断生成エラー:', sendError);
        console.error('❌ エラー詳細:', sendError.stack);
        // エラーがあっても保存は成功として扱う
      }

      // Content-Typeをチェックして適切なレスポンスを返す
      const contentType = req.headers['content-type'] || '';
      const isAjaxRequest = contentType.includes('application/json');

      if (isAjaxRequest) {
        // AJAXリクエストの場合はJSONレスポンスを返す
        res.json({ success: true, userId: userId });
        return;
      }

      // 通常のフォーム送信の場合はHTMLリダイレクトページを返す
      const redirectUrl = `/pages/moon-message-sent.html?userId=${userId}`;
      const successHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="1; url=${redirectUrl}">
  <title>おつきさまにお伝えしています...</title>
  <script>
    // LINEブラウザ対策: 複数のリダイレクト方法を試す
    setTimeout(function() {
      try {
        // 方法1: location.hrefを使用
        window.location.href = '${redirectUrl}';
      } catch(e1) {
        try {
          // 方法2: location.replaceを使用
          window.location.replace('${redirectUrl}');
        } catch(e2) {
          // 方法3: locationを直接設定
          window.location = '${redirectUrl}';
        }
      }
    }, 1000);
  </script>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 40px 30px;
      max-width: 450px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 25px 20px;
      border-radius: 15px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
      white-space: nowrap;
    }
    .message {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 25px;
    }
    .moon-emoji {
      font-size: 24px;
      margin: 0 5px;
    }
    .instructions {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      text-align: left;
    }
    .instruction-title {
      font-size: 16px;
      font-weight: bold;
      color: #764ba2;
      margin-bottom: 15px;
      text-align: center;
    }
    .instruction-step {
      font-size: 14px;
      line-height: 1.8;
      color: #555;
      margin-bottom: 15px;
      text-align: left;
    }
    .step-number {
      font-weight: bold;
      color: #764ba2;
      margin-right: 5px;
    }
    .line-button {
      display: inline-block;
      background: #06c755;
      color: white;
      padding: 15px 30px;
      border-radius: 25px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      margin-top: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(6, 199, 85, 0.3);
    }
    .line-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(6, 199, 85, 0.4);
    }
    .fallback-link {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    .fallback-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">おつきさまに伝えています</h1>
    </div>
    <div class="message">
      <span class="moon-emoji">🌙</span>月詠があなたのメッセージを<br>
      月の光に託しています...
    </div>
    <div class="spinner"></div>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">
      自動的にページが切り替わります<br>
      切り替わらない場合は下のボタンをタップしてください
    </p>
    <a href="${redirectUrl}" class="fallback-link">
      次へ進む →
    </a>
  </div>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(successHtml);

    } catch (error) {
      console.error('Profile save error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
