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
  
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // まずおつきさま診断のデータをチェック
    const profilesDB = require('../core/database/profiles-db');
    const profile = await profilesDB.getProfile(userId);
    
    if (profile && profile.diagnosisType === 'otsukisama') {
      // おつきさま診断のデータを返す（4つの軸データを含む）
      return res.status(200).json({
        success: true,
        profile: {
          userName: profile.userName,
          birthDate: profile.birthDate,
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
    
    return res.status(200).json({
      success: true,
      profile: completeProfile,
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