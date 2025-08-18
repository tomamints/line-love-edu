// 相性データテスト
const { getCompatibilityData, getStarCount } = require('./core/fortune/compatibility-data');

// テストケース1: 三日月 × 十六夜（欠けゆく月）
console.log('テスト1: 三日月タイプ × 十六夜タイプ');
const result1 = getCompatibilityData('三日月タイプ', '十六夜タイプ');
console.log('  スコア:', result1.score);
console.log('  ランク:', result1.rank, '位');
console.log('  星の数:', getStarCount(result1.score));
console.log('  理由:', result1.reason);
console.log('  関係性:', result1.relationship);
console.log('  ユーザーへのアドバイス:', result1.userAdvice);
console.log('');

// テストケース2: 新月 × 満月（1位の組み合わせ）
console.log('テスト2: 新月 × 満月（1位）');
const result2 = getCompatibilityData('新月', '満月');
console.log('  スコア:', result2.score);
console.log('  ランク:', result2.rank, '位');
console.log('  星の数:', getStarCount(result2.score));
console.log('  理由:', result2.reason);
console.log('  ユーザーへのアドバイス:', result2.userAdvice);
console.log('');

// テストケース3: 満月 × 満月（36位）
console.log('テスト3: 満月 × 満月（36位）');
const result3 = getCompatibilityData('満月', '満月');
console.log('  スコア:', result3.score);
console.log('  ランク:', result3.rank, '位');
console.log('  星の数:', getStarCount(result3.score));
console.log('  理由:', result3.reason);
console.log('  ユーザーへのアドバイス:', result3.userAdvice);
