// api/profile-form.js
// プロフィール入力用Webフォーム

const ordersDB = require('../core/database/orders-db');
const ProfilesDB = require('../core/database/profiles-db');

module.exports = async (req, res) => {
  
  // GETリクエスト: フォーム表示
  if (req.method === 'GET') {
    const { userId, liffId } = req.query;
    
    if (!userId) {
      return res.status(400).send('User ID is required');
    }
    
    // 既存のプロフィールを取得
    const profile = await ProfilesDB.getProfile(userId);
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
      <h1>🔮 おつきさま診断</h1>
      <p>より正確な診断のためにプロフィールを入力してください</p>
    </div>
    
    <div class="form-container">
      <div class="success-message" id="successMessage">
        ✅ 保存しました！
      </div>
      
      <form id="profileForm" action="/api/profile-form" method="POST">
        <input type="hidden" name="userId" value="${userId}">
        
        <div class="section">
          <h2 class="section-title">👤 あなたの情報</h2>
          
          <div class="form-group">
            <label for="userBirthdate">生年月日</label>
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
            <label for="userGender">
              性別
              <span class="optional-tag">任意</span>
            </label>
            <select id="userGender" name="userGender">
              <option value="">選択してください</option>
              <option value="male" ${existing.userGender === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${existing.userGender === 'female' ? 'selected' : ''}>女性</option>
              <option value="other" ${existing.userGender === 'other' ? 'selected' : ''}>その他</option>
            </select>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">💕 お相手の情報</h2>
          
          <div class="form-group">
            <label for="partnerBirthdate">生年月日</label>
            <div style="display: flex; gap: 5px;">
              <select id="partnerYear" style="flex: 1;" required>
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
              <select id="partnerMonth" style="flex: 1;" required>
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
              <select id="partnerDay" style="flex: 1;" required>
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
            <label for="partnerGender">性別</label>
            <select id="partnerGender" name="partnerGender" required>
              <option value="">選択してください</option>
              <option value="male" ${existing.partnerGender === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${existing.partnerGender === 'female' ? 'selected' : ''}>女性</option>
              <option value="other" ${existing.partnerGender === 'other' ? 'selected' : ''}>その他</option>
            </select>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">💭 恋愛状況について</h2>
          
          <div class="form-group">
            <label for="loveSituation">Q1: あなたの恋の状況は、どれに近いですか？</label>
            <select id="loveSituation" name="loveSituation" required>
              <option value="">選択してください</option>
              <option value="beginning" ${existing.loveSituation === 'beginning' ? 'selected' : ''}>恋の始まり・相手との距離感（片想い、気になる人、恋人未満、マッチングアプリでの出会い など）</option>
              <option value="relationship" ${existing.loveSituation === 'relationship' ? 'selected' : ''}>交際中の相手とのこと（現在の恋人との今後、結婚、マンネリ、すれ違い など）</option>
              <option value="complicated" ${existing.loveSituation === 'complicated' ? 'selected' : ''}>複雑な事情を抱える恋（禁断の恋、遠距離、障害のある恋、公にできない関係 など）</option>
              <option value="ending" ${existing.loveSituation === 'ending' ? 'selected' : ''}>復縁・別れ・終わった恋（復縁したい、別れの危機、失恋を乗り越えたい など）</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="wantToKnow">Q2: 今、特に何を知りたいですか？</label>
            <select id="wantToKnow" name="wantToKnow" required>
              <option value="">選択してください</option>
              <option value="feelings" ${existing.wantToKnow === 'feelings' ? 'selected' : ''}>相手が今、どんな気持ちなのか</option>
              <option value="action" ${existing.wantToKnow === 'action' ? 'selected' : ''}>今、自分がどうしたらいいか</option>
              <option value="past" ${existing.wantToKnow === 'past' ? 'selected' : ''}>過去（出来事）の意味や理由</option>
              <option value="future" ${existing.wantToKnow === 'future' ? 'selected' : ''}>これからどうなっていくのか</option>
            </select>
          </div>
        </div>
        
        <button type="submit" class="submit-btn">
          保存する
        </button>
      </form>
      
      <div class="loading" id="loading">
        <div class="spinner"></div>
        <p style="margin-top: 10px;">保存中...</p>
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
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  // POSTリクエスト: データ保存
  } else if (req.method === 'POST') {
    // フォームデータをパース
    if (!req.body || !req.body.userId) {
      // URLエンコードされたフォームデータの場合
      await new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          const params = new URLSearchParams(body);
          req.body = Object.fromEntries(params);
          resolve();
        });
      });
    }
    
    const { userId, userBirthdate, userAge, userGender, partnerBirthdate, partnerAge, partnerGender, loveSituation, wantToKnow } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
      // プロフィールを保存
      const profile = await ProfilesDB.getProfile(userId) || {};
      
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
        updatedAt: new Date().toISOString()
      };
      
      // データベースのカラムに合わせたデータも設定
      profile.birthDate = userBirthdate;
      profile.gender = userGender;
      profile.partnerBirthDate = partnerBirthdate;
      profile.partnerGender = partnerGender;
      
      await ProfilesDB.saveProfile(userId, profile);
      
      console.log('✅ Profile saved for user:', userId);
      
      // 相性診断を実行
      console.log('📊 相性診断開始 for user:', userId);
      let fortuneResult = null;
      try {
        const MoonFortuneEngine = require('../core/moon-fortune');
        
        console.log('🌙 月の相性診断生成開始');
        // 月の相性診断を生成
        const moonEngine = new MoonFortuneEngine();
        
        // プロファイルオブジェクトを作成
        const userProfile = {
          birthDate: userBirthdate,
          gender: userGender
        };
        const partnerProfile = {
          birthDate: partnerBirthdate,
          gender: partnerGender
        };
        
        fortuneResult = moonEngine.generateFreeReport(userProfile, partnerProfile);
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
      
      // 成功ページにリダイレクト（診断結果をクエリパラメータで渡す）
      const successUrl = `/api/profile-form-success?userId=${userId}${fortuneResult ? '&fortune=1' : ''}`;
      res.redirect(successUrl);
      
    } catch (error) {
      console.error('Profile save error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};