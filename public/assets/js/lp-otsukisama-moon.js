/**
 * 月相計算関連の関数
 */

// 月齢を計算する関数（LINEバックエンドと完全一致）
function calculateMoonAge(date) {
    // 基準日（新月）: 2000年1月6日 18:14:00（LINEと同じ）
    const referenceDate = new Date('2000-01-06 18:14:00');
    const lunarCycle = 29.53059; // 朔望月（日）- LINEと同じ値
    
    // 経過日数を計算
    const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
    
    // 月齢を計算（0-29.53日）
    let moonAge = daysDiff % lunarCycle;
    if (moonAge < 0) moonAge += lunarCycle;
    
    return moonAge;
}

// 月齢から月相を判定する関数（LINEバックエンドと完全一致）
function getMoonPhaseFromAge(moonAge) {
    // LINEと同じ範囲で判定
    const ranges = [
        { index: 0, min: 0, max: 3.7 },      // 新月
        { index: 1, min: 3.7, max: 7.4 },    // 三日月
        { index: 2, min: 7.4, max: 11.1 },   // 上弦
        { index: 3, min: 11.1, max: 14.8 },  // 十三夜
        { index: 4, min: 14.8, max: 18.5 },  // 満月
        { index: 5, min: 18.5, max: 22.1 },  // 十六夜
        { index: 6, min: 22.1, max: 25.8 },  // 下弦
        { index: 7, min: 25.8, max: 29.53 }  // 暁
    ];
    
    for (const range of ranges) {
        if (moonAge >= range.min && moonAge < range.max) {
            return range.index;
        }
    }
    
    // デフォルト（新月）
    return 0;
}

// 月相名を取得（LINEバックエンドと完全一致）
function getMoonPhaseName(phase) {
    const phases = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
    return phases[phase];
}

// 生年月日から月相を計算
function calculateMoonPhaseType(year, month, day) {
    const birthDate = new Date(year, month - 1, day);
    const moonAge = calculateMoonAge(birthDate);
    const moonPhase = getMoonPhaseFromAge(moonAge);
    return getMoonPhaseName(moonPhase);
}

// 月相インデックスを取得
function getMoonPhaseIndex(year, month, day) {
    const birthDate = new Date(year, month - 1, day);
    const moonAge = calculateMoonAge(birthDate);
    return getMoonPhaseFromAge(moonAge);
}

// 隠れ月相（裏月相）のインデックスを計算
function calculateHiddenMoonIndex(moonPhase, month, day) {
    // 月と日の組み合わせから裏月相を決定（独自のロジック）
    const seed = (month * 31 + day) % 8;
    return (moonPhase + seed + 4) % 8;
}

// 隠れ月相の名前を取得
function getHiddenMoonPhaseName(year, month, day) {
    const moonPhaseIndex = getMoonPhaseIndex(year, month, day);
    const hiddenIndex = calculateHiddenMoonIndex(moonPhaseIndex, month, day);
    const phases = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
    return phases[hiddenIndex];
}

// パターンIDを生成（0-63の数値）
function generatePatternId(year, month, day) {
    const moonPhaseIndex = getMoonPhaseIndex(year, month, day);
    const hiddenIndex = calculateHiddenMoonIndex(moonPhaseIndex, month, day);
    return moonPhaseIndex * 8 + hiddenIndex;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateMoonAge,
        getMoonPhaseFromAge,
        getMoonPhaseName,
        calculateMoonPhaseType,
        getMoonPhaseIndex,
        calculateHiddenMoonIndex,
        getHiddenMoonPhaseName,
        generatePatternId
    };
}