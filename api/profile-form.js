// api/profile-form.js
// プロフィール入力用Webフォーム

const ordersDB = require('../core/database/orders-db');
const ProfilesDB = require('../core/database/profiles-db');

module.exports = async (req, res) => {
  
  // POSTリクエスト: 診断データ保存（/api/save-diagnosisの代替）
  if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const { userId, name, birthDate, patternId, diagnosisType } = req.body;
      
      // おつきさま診断データの保存
      if (diagnosisType === 'otsukisama' || patternId !== undefined) {
        if (!userId || !name || !birthDate) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['userId', 'name', 'birthDate']
          });
        }
        
        const profilesDB = new ProfilesDB();
        
        // 診断データを保存
        const diagnosisData = {
          userName: name,
          birthDate: birthDate,
          moonPatternId: patternId,
          diagnosisDate: new Date().toISOString(),
          diagnosisType: 'otsukisama'
        };
        
        await profilesDB.saveProfile(userId, diagnosisData);
        
        // 診断IDを生成
        const diagnosisId = `diag_${userId}_${Date.now()}`;
        
        return res.status(200).json({
          success: true,
          diagnosisId: diagnosisId,
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
          月への祈りが届きました
        </div>
        <div style="line-height: 1.8;">
          あなたとお相手の月の姿を<br>
          静かに視させていただいております<br><br>
          
          ふたりの月が織りなす物語を<br>
          まもなくお伝えいたします<br><br>
          
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
          <h2 class="section-title">💖 お相手のこと</h2>
          
          <div class="form-group">
            <label for="partnerBirthdate"><strong>生年月日</strong></label>
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
            <label for="partnerGender"><strong>性別</strong></label>
            <select id="partnerGender" name="partnerGender" required>
              <option value="">選択してください</option>
              <option value="male" ${existing.partnerGender === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${existing.partnerGender === 'female' ? 'selected' : ''}>女性</option>
              <option value="other" ${existing.partnerGender === 'other' ? 'selected' : ''}>その他</option>
            </select>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">🌙 恋愛状況について</h2>
          
          <div class="form-group">
            <label><strong>Q1：あなたの恋の状況は、どれに近いですか？</strong></label>
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
                  <div class="radio-title">復縁・終わった恋</div>
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
            <label><strong>Q5：恋愛で大事にしたいものは？</strong></label>
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
        emotionalExpression,
        distanceStyle,
        loveValues,
        loveEnergy,
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
      
      // 成功ページを直接表示（リダイレクトではなく）
      const successHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>保存完了</title>
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">【おつきさまからお返事です】</div>
    </div>
    
    <div class="message">
      あなたが真剣に書いてくれたおかげで<br>
      詳しく診断ができました<br>
      教えてくれてありがとう<span class="moon-emoji">🌙</span>
    </div>
    
    <div class="instructions">
      <div class="instruction-title">診断結果の見方を教えます</div>
      <div class="instruction-step">
        <span class="step-number">①</span>下のボタンを押して、LINEへ戻りなさい
      </div>
      <div class="instruction-step">
        <span class="step-number">②</span>先ほどの下部メニューの<span style="font-size: 18px; font-weight: bold; color: #764ba2; display: inline-block; margin: 0 3px;">「診断結果を見る」</span>を押してください<br>
        <span style="margin-left: 22px;">あなたとお相手の関係性をお告げします</span>
      </div>
    </div>
    
    <a href="https://lin.ee/Kk1OqSm" class="line-button">
      おつきさま診断LINEに戻る
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