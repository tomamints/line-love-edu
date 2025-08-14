// 月齢計算のテスト（名前マッピング対応版）
const MoonFortuneEngine = require('./core/moon-fortune');
const MoonFortuneEngineV2 = require('./core/moon-fortune-v2');

const v1 = new MoonFortuneEngine();
const v2 = new MoonFortuneEngineV2();

// V1名からV2名へのマッピング
const nameMapping = {
  '新月タイプ': '新月',
  '三日月タイプ': '三日月',
  '上弦の月タイプ': '上弦の月',
  '満ちゆく月タイプ': '十三夜',
  '満月タイプ': '満月',
  '欠けゆく月タイプ': '十六夜',
  '下弦の月タイプ': '下弦の月',
  '逆三日月タイプ': '暁'
};

// テスト用の誕生日
const testDates = [
  '1998-04-30',
  '1995-08-15',
  '2000-01-06',  // 基準日（新月）
  '2000-01-13',  // 約7日後（上弦の月付近）
  '2000-01-21',  // 約15日後（満月付近）
  '2000-01-28',  // 約22日後（下弦の月付近）
];

console.log('=== 月タイプ判定の比較（名前マッピング対応） ===\n');

let matchCount = 0;
let totalCount = 0;

testDates.forEach(dateStr => {
  const date = new Date(dateStr + ' 00:00');
  
  // V1の計算
  const v1Phase = v1.calculateMoonPhase(dateStr, '00:00');
  const v1Type = v1.getMoonPhaseType(v1Phase);
  const v1MoonAge = v1.calculateMoonAge(v1Phase);
  
  // V2の計算
  const v2MoonAge = v2.calculateMoonAge(date);
  const v2Type = v2.getMoonTypeFromAge(v2MoonAge);
  
  // 名前をマッピング
  const v1MappedName = nameMapping[v1Type.name];
  const isMatch = v1MappedName === v2Type.type;
  
  totalCount++;
  if (isMatch) matchCount++;
  
  console.log(`日付: ${dateStr}`);
  console.log(`  V1: ${v1Type.name} → ${v1MappedName} (月齢: ${v1MoonAge.toFixed(1)}日)`);
  console.log(`  V2: ${v2Type.type} (月齢: ${v2MoonAge}日)`);
  console.log(`  一致: ${isMatch ? '✅' : '❌'}`);
  console.log('');
});

console.log(`=== 結果: ${matchCount}/${totalCount} 一致 (${(matchCount/totalCount*100).toFixed(0)}%) ===`);