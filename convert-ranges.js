// V1の角度範囲をV2の月齢範囲に変換

const v1Ranges = {
  newMoon: [0, 45],           // 新月タイプ
  waxingCrescent: [45, 90],    // 三日月タイプ
  firstQuarter: [90, 135],     // 上弦の月タイプ
  waxingGibbous: [135, 180],   // 満ちゆく月タイプ
  fullMoon: [180, 225],        // 満月タイプ
  waningGibbous: [225, 270],   // 欠けゆく月タイプ
  lastQuarter: [270, 315],     // 下弦の月タイプ
  waningCrescent: [315, 360]   // 逆三日月タイプ
};

const lunarCycle = 29.53059;

console.log('=== V1角度範囲 → V2月齢範囲への変換 ===\n');

for (const [key, [minDeg, maxDeg]] of Object.entries(v1Ranges)) {
  const minAge = (minDeg / 360) * lunarCycle;
  const maxAge = (maxDeg / 360) * lunarCycle;
  
  console.log(`${key}:`);
  console.log(`  角度: ${minDeg}° - ${maxDeg}°`);
  console.log(`  月齢: ${minAge.toFixed(1)}日 - ${maxAge.toFixed(1)}日`);
  console.log('');
}

console.log('\n=== V2で使用すべき月齢範囲 ===\n');
console.log(`{ type: '新月', emoji: '🌑', range: [0, 3.7] },`);
console.log(`{ type: '三日月', emoji: '🌒', range: [3.7, 7.4] },`);
console.log(`{ type: '上弦の月', emoji: '🌓', range: [7.4, 11.1] },`);
console.log(`{ type: '十三夜', emoji: '🌔', range: [11.1, 14.8] },`);
console.log(`{ type: '満月', emoji: '🌕', range: [14.8, 18.5] },`);
console.log(`{ type: '十六夜', emoji: '🌖', range: [18.5, 22.1] },`);
console.log(`{ type: '下弦の月', emoji: '🌗', range: [22.1, 25.8] },`);
console.log(`{ type: '暁', emoji: '🌘', range: [25.8, 29.53] },`);