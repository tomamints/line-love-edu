// api/get-love-profile.js
// Get user's love profile data for LP display

const { getUserLoveProfile } = require('../utils/love-type-mapper');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { userId, checkOnly } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // checkOnlyパラメータがある場合は存在チェックのみ行う
    if (checkOnly === 'true') {
      // LINE User IDのパターンをチェック（Uで始まる33文字のID）
      const isValidLineUserId = /^U[0-9a-f]{32}$/i.test(userId);
      
      if (isValidLineUserId) {
        // 有効なLINE User IDの場合は、自動的に簡易プロファイルを作成
        console.log('Valid LINE User ID detected:', userId);
        
        try {
          const profilesDB = require('../core/database/profiles-db');
          let profile = await profilesDB.getProfile(userId);
          
          if (!profile) {
            // プロファイルが存在しない場合、最小限のプロファイルを作成
            console.log('Creating minimal profile for LINE user:', userId);
            await profilesDB.saveProfile(userId, {
              userId: userId,
              createdAt: new Date().toISOString(),
              source: 'line_tarot',
              isMinimalProfile: true
            });
          }
        } catch (e) {
          console.log('Profile creation error (non-critical):', e.message);
        }
        
        // 有効なLINE User IDは常に存在するとみなす
        return res.status(200).json({
          success: true,
          exists: true,
          hasProfile: true
        });
      }
      
      // LINE User IDではない場合は、既存のプロファイルをチェック
      let profile = null;
      try {
        const profilesDB = require('../core/database/profiles-db');
        profile = await profilesDB.getProfile(userId);
      } catch (e) {
        console.log('profilesDB check error:', e.message);
      }
      
      const exists = profile !== null && profile !== undefined;
      
      return res.status(200).json({
        success: true,
        exists: exists,
        hasProfile: exists
      });
    }
    // まずおつきさま診断のデータをチェック
    const profilesDB = require('../core/database/profiles-db');
    const profile = await profilesDB.getProfile(userId);
    
    console.log('Profile fetched for user:', userId);
    console.log('Profile data:', profile);
    console.log('Diagnosis type:', profile?.diagnosisType);
    
    if (profile && profile.diagnosisType === 'otsukisama') {
      const normalizedName = profile.userName || profile.name || null;
      const normalizedBirthDate = profile.birthDate || profile.birthdate || null;
      // おつきさま診断のデータを返す（4つの軸データを含む）
      console.log('Returning otsukisama data with 4 axes:', {
        emotionalExpression: profile.emotionalExpression,
        distanceStyle: profile.distanceStyle,
        loveValues: profile.loveValues,
        loveEnergy: profile.loveEnergy
      });
      
      return res.status(200).json({
        success: true,
        profile: {
          userName: normalizedName,
          name: normalizedName,
          birthDate: normalizedBirthDate,
          birthdate: normalizedBirthDate,
          moonPatternId: profile.moonPatternId,
          diagnosisType: 'otsukisama',
          emotionalExpression: profile.emotionalExpression,
          distanceStyle: profile.distanceStyle,
          loveValues: profile.loveValues,
          loveEnergy: profile.loveEnergy
        },
        userId: userId
      });
    }
    
    // 恋愛占いのデータをチェック
    const loveProfile = await getUserLoveProfile(userId);
    
    if (!loveProfile) {
      return res.status(404).json({ 
        error: 'Profile not found or incomplete',
        message: 'Please complete the questionnaire first' 
      });
    }
    
    // loveProfileに4つの軸データを追加
    const completeProfile = {
      ...loveProfile,
      emotionalExpression: profile.emotionalExpression,
      distanceStyle: profile.distanceStyle,
      loveValues: profile.loveValues,
      loveEnergy: profile.loveEnergy
    };
    
    const normalizedName = loveProfile.name || profile?.userName || null;
    const normalizedBirthDate = loveProfile.birthdate || profile?.birthDate || null;

    return res.status(200).json({
      success: true,
      profile: {
        ...completeProfile,
        name: normalizedName,
        userName: normalizedName,
        birthdate: normalizedBirthDate,
        birthDate: normalizedBirthDate
      },
      userId: userId
    });
    
  } catch (error) {
    console.error('Error fetching love profile:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
};
