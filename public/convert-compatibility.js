#!/usr/bin/env node

// Node.js用のデータをブラウザ用に変換
const fs = require('fs');
const path = require('path');

// compatibility-data.jsを読み込み
const { compatibilityRankings, getCompatibilityData, getStarCount } = require('../core/fortune/compatibility-data');

// ブラウザ用のJavaScriptファイルを生成
const output = `// 自動生成: compatibility-data.jsから変換
// 生成日時: ${new Date().toISOString()}

const compatibilityRankings = ${JSON.stringify(compatibilityRankings, null, 2)};

const defaultCompatibility = {
  score: 70,
  rank: 20,
  reason: '異なる月のリズムを持つ二人。理解し合うことで素敵な関係を築けます。',
  relationship: 'お互いの違いを認め合い、新しい発見がある関係です。',
  advice: {
    default: '相手のペースを尊重しながら、自分らしさも大切にしてください。'
  }
};

const moonTypeMapping = {
  '新月': '新月',
  '三日月': '三日月',
  '上弦の月': '上弦の月',
  '十三夜': '十三夜',
  '満月': '満月',
  '十六夜': '十六夜',
  '下弦の月': '下弦の月',
  '暁': '暁'
};

function getCompatibilityDataWeb(userType, partnerType) {
  const normalizedUserType = moonTypeMapping[userType] || userType;
  const normalizedPartnerType = moonTypeMapping[partnerType] || partnerType;
  
  const key = \`\${normalizedUserType}-\${normalizedPartnerType}\`;
  const data = compatibilityRankings[key];
  
  if (data) {
    return {
      score: data.score,
      rank: data.rank,
      reason: data.reason,
      relationship: data.relationship,
      userAdvice: data.advice[normalizedUserType] || defaultCompatibility.advice.default
    };
  }
  
  // 同じタイプ同士の場合の特別処理
  if (normalizedUserType === normalizedPartnerType) {
    const sameTypeKey = \`\${normalizedUserType}-\${normalizedPartnerType}\`;
    const sameTypeData = compatibilityRankings[sameTypeKey];
    if (sameTypeData) {
      return {
        score: sameTypeData.score,
        rank: sameTypeData.rank,
        reason: sameTypeData.reason,
        relationship: sameTypeData.relationship,
        userAdvice: sameTypeData.advice[normalizedUserType] || defaultCompatibility.advice.default
      };
    }
  }
  
  return {
    score: defaultCompatibility.score,
    rank: defaultCompatibility.rank,
    reason: defaultCompatibility.reason,
    relationship: defaultCompatibility.relationship,
    userAdvice: defaultCompatibility.advice.default
  };
}

function getStarCount(score) {
  if (score >= 95) return 5;
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 55) return 2;
  return 1;
}
`;

// ファイルを書き込み
fs.writeFileSync(path.join(__dirname, 'compatibility-data-web.js'), output);
console.log('✅ compatibility-data-web.js を生成しました');
