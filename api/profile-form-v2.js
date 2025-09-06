/**
 * プロファイル管理API - V2（新テーブル構造対応）
 * 診断の作成、取得、アクセス権限管理
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定 - 環境変数の確認とエラーハンドリング
// Vercel環境変数に合わせて修正
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxqxuebvhdpqyktxvofe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合のエラーメッセージ
if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_ANON_KEY environment variable');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

// Supabaseクライアントの作成（環境変数がある場合のみ）
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

module.exports = async function handler(req, res) {
    // Supabaseクライアントが初期化されていない場合はエラー
    if (!supabase) {
        return res.status(500).json({ 
            error: 'Database configuration error',
            details: 'Supabase environment variables are not properly configured'
        });
    }
    
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const action = req.query.action || req.body?.action;
    
    // actionがない場合、かつGETリクエストの場合はHTMLフォームを返す
    if (!action && req.method === 'GET') {
        const userId = req.query.userId;
        
        // 元のプロフィールフォーム（パートナーの誕生日と関係性の質問付き）を返す
        const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>恋愛診断プロフィール入力</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
            color: #333;
            font-size: 28px;
            text-align: center;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        input[type="text"],
        select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .date-inputs {
            display: flex;
            gap: 10px;
        }
        
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
        }
        
        .radio-option {
            display: flex;
            align-items: flex-start;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        
        .radio-option:hover {
            background: #e8e9ff;
        }
        
        .radio-option input[type="radio"] {
            margin-right: 12px;
            margin-top: 3px;
        }
        
        .radio-option input[type="radio"]:checked + .radio-content {
            font-weight: 600;
        }
        
        .radio-option:has(input:checked) {
            background: #e8e9ff;
            border-color: #667eea;
        }
        
        .radio-content {
            flex: 1;
        }
        
        .radio-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
        }
        
        .radio-description {
            font-size: 12px;
            color: #666;
            line-height: 1.4;
        }
        
        .submit-button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 30px;
        }
        
        .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }
        
        .submit-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .error {
            color: #d32f2f;
            font-size: 12px;
            margin-top: 5px;
        }

        .required {
            color: #d32f2f;
            font-size: 12px;
            margin-left: 4px;
        }
    </style>
    ${userId ? `
    <script>
        // LINEから渡されたユーザーID
        window.lineUserId = '${userId}';
        sessionStorage.setItem('moon_tarot_line_user_id', '${userId}');
        localStorage.setItem('moon_tarot_line_user_id', '${userId}');
    </script>
    ` : ''}
</head>
<body>
    <div class="container">
        <h1>💝 恋愛診断プロフィール</h1>
        <p class="subtitle">あなたと相手の情報を入力してください</p>
        
        <form id="profileForm">
            <!-- 名前 -->
            <div class="form-group">
                <label>あなたのお名前（ニックネーム可）<span class="required">*</span></label>
                <input type="text" id="userName" placeholder="例：ゆき" required>
            </div>
            
            <!-- 自分の誕生日 -->
            <div class="form-group">
                <label>あなたの生年月日<span class="required">*</span></label>
                <div class="date-inputs">
                    <select id="userYear" style="flex: 1;" required>
                        <option value="">年</option>
                    </select>
                    <select id="userMonth" style="flex: 1;" required>
                        <option value="">月</option>
                    </select>
                    <select id="userDay" style="flex: 1;" required>
                        <option value="">日</option>
                    </select>
                </div>
            </div>
            
            <!-- 相手の誕生日 -->
            <div class="form-group">
                <label>お相手の生年月日<span class="required">*</span></label>
                <div class="date-inputs">
                    <select id="partnerYear" style="flex: 1;" required>
                        <option value="">年</option>
                    </select>
                    <select id="partnerMonth" style="flex: 1;" required>
                        <option value="">月</option>
                    </select>
                    <select id="partnerDay" style="flex: 1;" required>
                        <option value="">日</option>
                    </select>
                </div>
            </div>
            
            <!-- Q1: 恋の状況 -->
            <div class="form-group">
                <label><strong>Q1：あなたの恋の状況は、どれに近いですか？</strong><span class="required">*</span></label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="loveSituation" value="beginning" required>
                        <div class="radio-content">
                            <div class="radio-title">恋の始まり・相手との距離感</div>
                            <div class="radio-description">これから関係を深めたい、相手の気持ちを知りたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="loveSituation" value="dating" required>
                        <div class="radio-content">
                            <div class="radio-title">交際中・結婚前の相性</div>
                            <div class="radio-description">今の関係をより良くしたい、将来について考えたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="loveSituation" value="marriage" required>
                        <div class="radio-content">
                            <div class="radio-title">夫婦関係・長期的な絆</div>
                            <div class="radio-description">パートナーシップを深めたい、お互いの理解を深めたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="loveSituation" value="reunion" required>
                        <div class="radio-content">
                            <div class="radio-title">復縁・再会の可能性</div>
                            <div class="radio-description">もう一度やり直したい、関係修復の可能性を知りたい</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <!-- Q2: 何を知りたいか -->
            <div class="form-group">
                <label><strong>Q2：何を知りたいですか？</strong><span class="required">*</span></label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="whatToKnow" value="feelings" required>
                        <div class="radio-content">
                            <div class="radio-title">相手の本音・気持ち</div>
                            <div class="radio-description">相手があなたをどう思っているか知りたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="whatToKnow" value="compatibility" required>
                        <div class="radio-content">
                            <div class="radio-title">二人の相性・運命</div>
                            <div class="radio-description">価値観や性格の相性を詳しく知りたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="whatToKnow" value="future" required>
                        <div class="radio-content">
                            <div class="radio-title">未来の展開・可能性</div>
                            <div class="radio-description">これからの関係がどうなるか知りたい</div>
                        </div>
                    </label>
                    
                    <label class="radio-option">
                        <input type="radio" name="whatToKnow" value="advice" required>
                        <div class="radio-content">
                            <div class="radio-title">関係改善のアドバイス</div>
                            <div class="radio-description">どうすれば良い関係になれるか知りたい</div>
                        </div>
                    </label>
                </div>
            </div>
            
            <button type="submit" class="submit-button" id="submitButton">
                診断を開始する
            </button>
        </form>
    </div>
    
    <script>
        // 年月日の選択肢を生成
        function populateDateSelects() {
            const currentYear = new Date().getFullYear();
            
            // 年の選択肢（自分用）
            const userYearSelect = document.getElementById('userYear');
            for (let year = currentYear; year >= 1920; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年';
                userYearSelect.appendChild(option);
            }
            
            // 年の選択肢（相手用）
            const partnerYearSelect = document.getElementById('partnerYear');
            for (let year = currentYear; year >= 1920; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年';
                partnerYearSelect.appendChild(option);
            }
            
            // 月の選択肢
            const monthSelects = ['userMonth', 'partnerMonth'];
            monthSelects.forEach(id => {
                const select = document.getElementById(id);
                for (let month = 1; month <= 12; month++) {
                    const option = document.createElement('option');
                    option.value = month;
                    option.textContent = month + '月';
                    select.appendChild(option);
                }
            });
            
            // 日の選択肢
            const daySelects = ['userDay', 'partnerDay'];
            daySelects.forEach(id => {
                const select = document.getElementById(id);
                for (let day = 1; day <= 31; day++) {
                    const option = document.createElement('option');
                    option.value = day;
                    option.textContent = day + '日';
                    select.appendChild(option);
                }
            });
        }
        
        // フォーム送信処理
        document.getElementById('profileForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = document.getElementById('submitButton');
            submitButton.disabled = true;
            submitButton.textContent = '処理中...';
            
            const formData = {
                userName: document.getElementById('userName').value,
                userBirthDate: document.getElementById('userYear').value + '-' + 
                               String(document.getElementById('userMonth').value).padStart(2, '0') + '-' + 
                               String(document.getElementById('userDay').value).padStart(2, '0'),
                partnerBirthDate: document.getElementById('partnerYear').value + '-' + 
                                  String(document.getElementById('partnerMonth').value).padStart(2, '0') + '-' + 
                                  String(document.getElementById('partnerDay').value).padStart(2, '0'),
                loveSituation: document.querySelector('input[name="loveSituation"]:checked').value,
                whatToKnow: document.querySelector('input[name="whatToKnow"]:checked').value
            };
            
            // userIdがあれば追加
            const userId = window.lineUserId || new URLSearchParams(window.location.search).get('userId');
            if (userId) {
                formData.userId = userId;
            }
            
            try {
                // プロフィールデータを保存
                const response = await fetch('/api/profile-form-v2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'save-profile',
                        ...formData
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // 診断結果ページへ遷移
                    window.location.href = '/moon-fortune-result.html?profileId=' + result.profileId;
                } else {
                    alert('エラーが発生しました: ' + (result.error || 'Unknown error'));
                    submitButton.disabled = false;
                    submitButton.textContent = '診断を開始する';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('エラーが発生しました。もう一度お試しください。');
                submitButton.disabled = false;
                submitButton.textContent = '診断を開始する';
            }
        });
        
        // ページ読み込み時に実行
        document.addEventListener('DOMContentLoaded', function() {
            populateDateSelects();
        });
    </script>
</body>
</html>
        `;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    }
    
    console.log(`[Profile Form V2] Action: ${action}`, req.method);

    try {
        switch (action) {
            case 'save-profile':
                return await saveProfile(req, res);
            case 'save-diagnosis':
                return await saveDiagnosis(req, res);
            case 'get-diagnosis':
                return await getDiagnosis(req, res);
            case 'check-access':
                return await checkAccess(req, res);
            case 'get-user-diagnoses':
                return await getUserDiagnoses(req, res);
            default:
                return res.status(400).json({ 
                    error: 'Invalid action',
                    validActions: ['save-profile', 'save-diagnosis', 'get-diagnosis', 'check-access', 'get-user-diagnoses']
                });
        }
    } catch (error) {
        console.error('[Profile Form V2] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * プロフィールを保存（関係性診断用）
 */
async function saveProfile(req, res) {
    const { 
        userId, 
        userName, 
        userBirthDate,
        partnerBirthDate,
        loveSituation,
        whatToKnow
    } = req.body;

    if (!userName || !userBirthDate || !partnerBirthDate) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['userName', 'userBirthDate', 'partnerBirthDate']
        });
    }

    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // プロフィールデータを保存
        const { data: profile, error: createError } = await supabase
            .from('relationship_profiles')
            .upsert({
                id: profileId,
                user_id: userId || null,
                user_name: userName,
                user_birth_date: userBirthDate,
                partner_birth_date: partnerBirthDate,
                love_situation: loveSituation,
                what_to_know: whatToKnow,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (createError) {
            // テーブルが存在しない場合は簡易的な保存
            console.log('[Save Profile] Table may not exist, using simple storage');
            
            // profilesテーブルを使用して保存
            const { data: simpleProfile, error: simpleError } = await supabase
                .from('profiles')
                .upsert({
                    userId: userId || profileId,
                    userName: userName,
                    birthDate: userBirthDate,
                    metadata: {
                        partnerBirthDate: partnerBirthDate,
                        loveSituation: loveSituation,
                        whatToKnow: whatToKnow,
                        profileType: 'relationship'
                    },
                    updatedAt: new Date().toISOString()
                }, {
                    onConflict: 'userId'
                })
                .select()
                .single();
            
            if (simpleError) {
                console.error('[Save Profile] Error:', simpleError);
                throw simpleError;
            }
            
            return res.json({
                success: true,
                profileId: userId || profileId,
                profile: simpleProfile
            });
        }
        
        console.log('[Save Profile] Success:', profileId);

        return res.json({
            success: true,
            profileId: profile.id,
            profile: profile
        });

    } catch (error) {
        console.error('[Save Profile] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to save profile',
            details: error.message 
        });
    }
}

/**
 * 診断を保存
 */
async function saveDiagnosis(req, res) {
    const { 
        userId, 
        userName, 
        birthDate, 
        diagnosisType = 'otsukisama',
        resultData 
    } = req.body;

    if (!userId || !birthDate || !resultData) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['userId', 'birthDate', 'resultData']
        });
    }

    // 診断IDを生成（常に新規）
    const diagnosisId = `diag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // 常に新規診断を作成（制約削除後）
        const { data: diagnosis, error: createError } = await supabase
            .from('diagnoses')
            .insert({
                id: diagnosisId,
                user_id: userId,
                diagnosis_type_id: diagnosisType,
                user_name: userName,
                birth_date: birthDate,
                result_data: resultData,
                metadata: {
                    source: 'line',
                    version: '2.0',
                    created_at: new Date().toISOString()
                }
            })
            .select()
            .single();
        
        if (createError) {
            // 制約がまだ存在する場合のフォールバック
            if (createError.code === '23505') {
                console.log('[Save Diagnosis] Constraint still exists, updating existing record');
                
                // 既存レコードを検索
                const { data: existing } = await supabase
                    .from('diagnoses')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('birth_date', birthDate)
                    .eq('diagnosis_type_id', diagnosisType)
                    .single();
                
                if (existing) {
                    // 既存を更新
                    const { data: updated, error: updateError } = await supabase
                        .from('diagnoses')
                        .update({
                            user_name: userName,
                            result_data: resultData,
                            metadata: {
                                source: 'line',
                                version: '2.0',
                                updated_at: new Date().toISOString()
                            }
                        })
                        .eq('id', existing.id)
                        .select()
                        .single();
                    
                    if (updateError) throw updateError;
                    
                    // 既存のIDを返す
                    return res.json({
                        success: true,
                        diagnosisId: existing.id,
                        isNew: false,
                        diagnosis: updated
                    });
                }
            }
            
            console.error('[Save Diagnosis] Create error:', createError);
            throw createError;
        }
        
        console.log('[Save Diagnosis] Created new diagnosis:', diagnosisId);

        // 2. プレビュー用のアクセス権限を付与（無料）
        await supabase
            .from('access_rights')
            .upsert({
                user_id: userId,
                resource_type: 'diagnosis',
                resource_id: diagnosis.id,
                access_level: 'preview'
            }, {
                onConflict: 'user_id,resource_type,resource_id'
            });

        console.log('[Save Diagnosis] Success:', diagnosis.id);

        return res.json({
            success: true,
            diagnosisId: diagnosis.id,
            isNew: true,  // 常に新規
            diagnosis: diagnosis
        });

    } catch (error) {
        console.error('[Save Diagnosis] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to save diagnosis',
            details: error.message 
        });
    }
}

/**
 * 診断を取得
 */
async function getDiagnosis(req, res) {
    const diagnosisId = req.query.id;
    const userId = req.query.userId;

    if (!diagnosisId) {
        return res.status(400).json({ error: 'Diagnosis ID is required' });
    }

    try {
        // 1. 診断データを取得
        const { data: diagnosis, error: diagnosisError } = await supabase
            .from('diagnoses')
            .select(`
                *,
                diagnosis_types (
                    name,
                    description,
                    price
                )
            `)
            .eq('id', diagnosisId)
            .single();

        if (diagnosisError || !diagnosis) {
            return res.status(404).json({ 
                success: false,
                error: '診断データが見つかりません' 
            });
        }

        // 2. アクセス権限を確認
        let accessLevel = 'none';
        if (userId) {
            const { data: accessRight } = await supabase
                .from('access_rights')
                .select('access_level, valid_until')
                .eq('user_id', userId)
                .eq('resource_type', 'diagnosis')
                .eq('resource_id', diagnosisId)
                .single();

            if (accessRight) {
                // 有効期限チェック
                if (!accessRight.valid_until || new Date(accessRight.valid_until) > new Date()) {
                    accessLevel = accessRight.access_level;
                }
            } else if (diagnosis.user_id === userId) {
                // 本人の診断の場合は最低限プレビューは見れる
                accessLevel = 'preview';
            }
        }

        // 3. アクセスレベルに応じてデータを返す
        const response = {
            success: true,
            accessLevel: accessLevel, // 実際のアクセスレベルを返す
            diagnosis: {
                id: diagnosis.id,
                user_id: diagnosis.user_id,
                user_name: diagnosis.user_name,
                birth_date: diagnosis.birth_date,
                diagnosis_type: diagnosis.diagnosis_type_id,
                diagnosis_name: diagnosis.diagnosis_types?.name,
                created_at: diagnosis.created_at
            }
        };

        // アクセスレベルに関わらず基本データは返す（表示側で制御）
        const resultData = diagnosis.result_data || {};
        response.diagnosis.moon_pattern_id = resultData.moon_pattern_id;
        response.diagnosis.moon_phase = resultData.moon_phase;
        response.diagnosis.hidden_moon_phase = resultData.hidden_moon_phase;
        response.diagnosis.emotional_expression = resultData.emotional_expression;
        response.diagnosis.distance_style = resultData.distance_style;
        response.diagnosis.love_values = resultData.love_values;
        response.diagnosis.love_energy = resultData.love_energy;
        response.diagnosis.moon_power_1 = resultData.moon_power_1;
        response.diagnosis.moon_power_2 = resultData.moon_power_2;
        response.diagnosis.moon_power_3 = resultData.moon_power_3;
        response.diagnosis.metadata = diagnosis.metadata;

        // 価格情報を追加（未購入の場合）
        if (accessLevel !== 'full') {
            response.price = diagnosis.diagnosis_types?.price || 980;
        }

        console.log('[Get Diagnosis] Success:', diagnosisId, 'Access:', accessLevel);
        return res.json(response);

    } catch (error) {
        console.error('[Get Diagnosis] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to get diagnosis',
            details: error.message 
        });
    }
}

/**
 * アクセス権限をチェック
 */
async function checkAccess(req, res) {
    const { userId, resourceType, resourceId } = req.query;

    if (!userId || !resourceType || !resourceId) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            required: ['userId', 'resourceType', 'resourceId']
        });
    }

    try {
        const { data: accessRight } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', userId)
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId)
            .single();

        if (!accessRight) {
            return res.json({
                hasAccess: false,
                accessLevel: 'none'
            });
        }

        // 有効期限チェック
        const isValid = !accessRight.valid_until || 
                       new Date(accessRight.valid_until) > new Date();

        return res.json({
            hasAccess: isValid && accessRight.access_level !== 'none',
            accessLevel: isValid ? accessRight.access_level : 'none',
            validUntil: accessRight.valid_until,
            purchaseId: accessRight.purchase_id
        });

    } catch (error) {
        console.error('[Check Access] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to check access',
            details: error.message 
        });
    }
}

/**
 * ユーザーの診断一覧を取得
 */
async function getUserDiagnoses(req, res) {
    const userId = req.query.userId;
    const diagnosisType = req.query.type;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        let query = supabase
            .from('diagnoses')
            .select(`
                id,
                diagnosis_type_id,
                user_name,
                birth_date,
                created_at,
                result_data,
                diagnosis_types (
                    name,
                    description
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (diagnosisType) {
            query = query.eq('diagnosis_type_id', diagnosisType);
        }

        const { data: diagnoses, error } = await query;

        if (error) throw error;

        // アクセスレベルを取得
        const diagnosisIds = diagnoses.map(d => d.id);
        const { data: accessRights } = await supabase
            .from('access_rights')
            .select('resource_id, access_level')
            .eq('user_id', userId)
            .eq('resource_type', 'diagnosis')
            .in('resource_id', diagnosisIds);
        
        const accessMap = {};
        if (accessRights) {
            accessRights.forEach(ar => {
                accessMap[ar.resource_id] = ar.access_level;
            });
        }
        
        // 診断データを整理
        const formattedDiagnoses = diagnoses.map(d => ({
            id: d.id,
            type: d.diagnosis_type_id,
            typeName: d.diagnosis_types?.name,
            userName: d.user_name,
            birthDate: d.birth_date,
            createdAt: d.created_at,
            resultData: d.result_data,
            accessLevel: accessMap[d.id] || 'none',
            isPaid: accessMap[d.id] === 'full'
        }));

        return res.json({
            success: true,
            diagnoses: formattedDiagnoses,
            count: formattedDiagnoses.length
        });

    } catch (error) {
        console.error('[Get User Diagnoses] Error:', error);
        return res.status(500).json({ 
            error: 'Failed to get user diagnoses',
            details: error.message 
        });
    }
}