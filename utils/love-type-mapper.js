// utils/love-type-mapper.js
// Maps quiz answers to love personality types

const LOVE_TYPES = {
  emotionalExpression: {
    straight: 'ストレート告白型',
    physical: 'スキンシップ型',
    subtle: 'さりげない気遣い型',
    shy: '奥手シャイ型'
  },
  distanceStyle: {
    close: 'ベッタリ依存型',
    moderate: '安心セーフ型',
    independent: '自由マイペース型',
    cautious: '壁あり慎重型'
  },
  loveValues: {
    romantic: 'ロマンチスト型',
    realistic: 'リアリスト型',
    excitement: '刺激ハンター型',
    growth: '成長パートナー型'
  },
  loveEnergy: {
    intense: '燃え上がり型',
    stable: '持続型',
    fluctuating: '波あり型',
    cool: 'クール型'
  }
};

/**
 * Map user's quiz answers to personality type labels
 * @param {Object} answers - User's quiz answers
 * @returns {Object} Mapped personality types
 */
function mapToLoveTypes(answers) {
  return {
    emotionalExpression: LOVE_TYPES.emotionalExpression[answers.emotionalExpression] || '未診断',
    distanceStyle: LOVE_TYPES.distanceStyle[answers.distanceStyle] || '未診断',
    loveValues: LOVE_TYPES.loveValues[answers.loveValues] || '未診断',
    loveEnergy: LOVE_TYPES.loveEnergy[answers.loveEnergy] || '未診断'
  };
}

/**
 * Get user's love profile from database
 * @param {string} userId - User ID
 * @returns {Object} User's love profile
 */
async function getUserLoveProfile(userId) {
  const ProfilesDB = require('../core/database/profiles-db');
  const profile = await ProfilesDB.getProfile(userId);
  
  if (!profile || !profile.personalInfo) {
    return null;
  }
  
  const { emotionalExpression, distanceStyle, loveValues, loveEnergy } = profile.personalInfo;
  
  if (!emotionalExpression || !distanceStyle || !loveValues || !loveEnergy) {
    return null;
  }
  
  // 4軸のタイプに加えて、生年月日と名前も返す
  return {
    ...mapToLoveTypes({
      emotionalExpression,
      distanceStyle,
      loveValues,
      loveEnergy
    }),
    birthdate: profile.birthDate || profile.personalInfo.userBirthdate,
    name: profile.userName
  };
}

module.exports = {
  LOVE_TYPES,
  mapToLoveTypes,
  getUserLoveProfile
};