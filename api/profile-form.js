// api/profile-form.js
// プロフィール入力用Webフォーム

const ordersDB = require('../core/database/orders-db');
const UserProfileManager = require('../core/user-profile');

module.exports = async (req, res) => {
  const profileManager = new UserProfileManager();
  
  // GETリクエスト: フォーム表示
  if (req.method === 'GET') {
    const { userId, liffId } = req.query;
    
    if (!userId) {
      return res.status(400).send('User ID is required');
    }
    
    // 既存のプロフィールを取得
    const profile = await profileManager.getProfile(userId);
    const existing = profile?.personalInfo || {};
    
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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
      background: #4caf50;
      color: white;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .success-message.show {
      display: block;
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
      
      <form id="profileForm">
        <input type="hidden" name="userId" value="${userId}">
        
        <div class="section">
          <h2 class="section-title">👤 あなたの情報</h2>
          
          <div class="form-group">
            <label for="userBirthdate">生年月日</label>
            <input 
              type="date" 
              id="userBirthdate" 
              name="userBirthdate" 
              value="${existing.userBirthdate || ''}"
              required
              max="${new Date().toISOString().split('T')[0]}"
              onchange="calculateAge('user')"
            >
          </div>
          
          <div class="form-group">
            <label for="userAge">年齢</label>
            <div class="age-calc">
              <input 
                type="number" 
                id="userAge" 
                name="userAge" 
                value="${existing.userAge || ''}"
                min="15" 
                max="100" 
                required
                readonly
              >
              <span class="age-display" id="userAgeDisplay">自動計算されます</span>
            </div>
          </div>
          
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
            <input 
              type="date" 
              id="partnerBirthdate" 
              name="partnerBirthdate" 
              value="${existing.partnerBirthdate || ''}"
              required
              max="${new Date().toISOString().split('T')[0]}"
              onchange="calculateAge('partner')"
            >
          </div>
          
          <div class="form-group">
            <label for="partnerAge">年齢</label>
            <div class="age-calc">
              <input 
                type="number" 
                id="partnerAge" 
                name="partnerAge" 
                value="${existing.partnerAge || ''}"
                min="15" 
                max="100" 
                required
                readonly
              >
              <span class="age-display" id="partnerAgeDisplay">自動計算されます</span>
            </div>
          </div>
          
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
        
        <button type="submit" class="submit-btn">
          保存してLINEに戻る
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
      const ageDisplay = document.getElementById(type + 'AgeDisplay');
      
      if (birthdateInput.value) {
        const birthDate = new Date(birthdateInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        ageInput.value = age;
        ageDisplay.textContent = age + '歳';
      }
    }
    
    // 初期表示時に年齢計算
    window.onload = function() {
      calculateAge('user');
      calculateAge('partner');
    };
    
    // フォーム送信処理
    document.getElementById('profileForm').onsubmit = async function(e) {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);
      
      // ローディング表示
      document.getElementById('profileForm').style.display = 'none';
      document.getElementById('loading').classList.add('show');
      
      try {
        // データを保存
        const response = await fetch('/api/profile-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // 成功メッセージ
          document.getElementById('loading').classList.remove('show');
          document.getElementById('successMessage').classList.add('show');
          
          // 2秒後にLINEに戻る
          setTimeout(() => {
            // LINEアプリに戻る
            if (window.liff && window.liff.isInClient()) {
              window.liff.closeWindow();
            } else {
              // 通常のブラウザの場合
              window.location.href = 'line://';
              // またはウィンドウを閉じる
              setTimeout(() => {
                window.close();
              }, 100);
            }
          }, 2000);
        } else {
          throw new Error('保存に失敗しました');
        }
      } catch (error) {
        alert('エラーが発生しました: ' + error.message);
        document.getElementById('loading').classList.remove('show');
        document.getElementById('profileForm').style.display = 'block';
      }
    };
  </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  // POSTリクエスト: データ保存
  } else if (req.method === 'POST') {
    const { userId, userBirthdate, userAge, userGender, partnerBirthdate, partnerAge, partnerGender } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    try {
      // プロフィールを保存
      const profile = await profileManager.getProfile(userId) || {};
      
      profile.personalInfo = {
        ...profile.personalInfo,
        userBirthdate,
        userAge: parseInt(userAge),
        userGender,
        partnerBirthdate,
        partnerAge: parseInt(partnerAge),
        partnerGender,
        updatedAt: new Date().toISOString()
      };
      
      await profileManager.saveProfile(userId, profile);
      
      console.log('✅ Profile saved for user:', userId);
      res.json({ success: true, message: 'Profile saved successfully' });
      
    } catch (error) {
      console.error('Profile save error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};