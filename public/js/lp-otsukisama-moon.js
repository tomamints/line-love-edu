/**
 * 月相計算関連の関数
 */

// 月齢を計算する関数
function calculateMoonAge(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 簡易的な月齢計算（実際の天文学的計算の簡略版）
    const baseDate = new Date(2000, 0, 6, 18, 14); // 2000年1月6日の新月時刻
    const diff = date - baseDate;
    const lunation = 29.530588861; // 朔望月（日数）
    const moonAge = ((diff / (1000 * 60 * 60 * 24)) % lunation + lunation) % lunation;
    
    return moonAge;
}

// 月齢から月相を判定する関数
function getMoonPhaseFromAge(moonAge) {
    // 8つの月相に分類（0-7）
    const phase = Math.floor((moonAge + 1.845) / 3.691);
    return phase % 8;
}

// 月相名を取得
function getMoonPhaseName(phase) {
    const phases = ['新月', '三日月', '上弦', '十三夜', '満月', '十六夜', '下弦', '暁'];
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
    const phases = ['新月', '三日月', '上弦', '十三夜', '満月', '十六夜', '下弦', '暁'];
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