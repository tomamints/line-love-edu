// 月齢計算のテスト
const MoonFortuneEngine = require('./core/moon-fortune');
const MoonFortuneEngineV2 = require('./core/moon-fortune-v2');

const v1 = new MoonFortuneEngine();
const v2 = new MoonFortuneEngineV2();

// テスト用の誕生日
const testDates = [
  '1998-04-30',
  '1995-08-15',
  '2000-01-06',  // 基準日（新月）
  '2000-01-13',  // 約7日後（上弦の月付近）
  '2000-01-21',  // 約15日後（満月付近）
  '2000-01-28',  // 約22日後（下弦の月付近）
];

console.log('=== 月タイプ判定の比較 ===\n');

testDates.forEach(dateStr => {
  const date = new Date(dateStr + ' 00:00');
  
  // V1の計算
  const v1Phase = v1.calculateMoonPhase(dateStr, '00:00');
  const v1Type = v1.getMoonPhaseType(v1Phase);
  const v1MoonAge = v1.calculateMoonAge(v1Phase);
  
  // V2の計算
  const v2MoonAge = v2.calculateMoonAge(date);
  const v2Type = v2.getMoonTypeFromAge(v2MoonAge);
  
  console.log(`日付: ${dateStr}`);
  console.log(`  V1: ${v1Type.name} (月齢: ${v1MoonAge.toFixed(1)}日, 角度: ${v1Phase.toFixed(1)}°)`);
  console.log(`  V2: ${v2Type.type} (月齢: ${v2MoonAge}日)`);
  console.log(`  一致: ${v1Type.name.replace('タイプ', '') === v2Type.type ? '✅' : '❌'}`);
  console.log('');
});

// 月齢と角度の対応関係
console.log('=== 月齢と角度の対応 ===');
console.log('月齢0日 = 0° (新月)');
console.log('月齢7.4日 = 90° (上弦の月)');
console.log('月齢14.8日 = 180° (満月)');
console.log('月齢22.1日 = 270° (下弦の月)');
console.log('月齢29.5日 = 360° (新月に戻る)');