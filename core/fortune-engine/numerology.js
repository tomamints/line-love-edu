const dayjs = require('dayjs');
const numerologyData = require('../../data/numerology-meanings.json');

/**
 * 数秘術エンジン
 * メッセージや個人情報から各種数値を算出し、意味を解釈する
 */
class Numerology {
  constructor() {
    this.meanings = numerologyData.numbers;
    this.masterNumbers = numerologyData.masterNumbers;
    this.compatibility = numerologyData.compatibility;
  }
  
  /**
   * メッセージデータから運命数を計算
   * @param {array} messages - メッセージ配列
   * @returns {object} 運命数とその意味
   */
  calculateDestinyNumber(messages = []) {
    // メッセージ総数から計算
    const totalMessages = messages.length || 1;
    const destinyNumber = this.reduceToSingleDigit(totalMessages);
    
    return {
      number: destinyNumber,
      source: totalMessages,
      meaning: this.getNumberMeaning(destinyNumber),
      type: 'destiny'
    };
  }
  
  /**
   * メッセージデータから相性数を計算
   * @param {array} messages - メッセージ配列
   * @returns {object} 相性数とその意味
   */
  calculateCompatibilityNumber(messages = []) {
    // 総文字数から計算
    const totalChars = messages.reduce((sum, msg) => {
      const text = msg.text || msg.message || '';
      return sum + text.length;
    }, 0) || 1;
    
    const compatibilityNumber = this.reduceToSingleDigit(totalChars);
    
    return {
      number: compatibilityNumber,
      source: totalChars,
      meaning: this.getNumberMeaning(compatibilityNumber),
      type: 'compatibility'
    };
  }
  
  /**
   * 個人年数を計算
   * @param {string} userId - ユーザーID
   * @returns {object} 個人年数とその意味
   */
  calculatePersonalYearNumber(userId) {
    const currentYear = dayjs().year();
    
    // ユーザーIDから数値を抽出して合計
    const userIdSum = this.extractAndSumDigits(userId);
    const personalYear = this.reduceToSingleDigit(currentYear + userIdSum);
    
    return {
      number: personalYear,
      source: `${currentYear} + ${userIdSum}`,
      meaning: this.getNumberMeaning(personalYear),
      type: 'personalYear'
    };
  }
  
  /**
   * メッセージから最頻出数字を計算（パワー数）
   * @param {array} messages - メッセージ配列
   * @returns {object} パワー数とその意味
   */
  calculatePowerNumber(messages = []) {
    const digitCount = {};
    
    // 全メッセージから数字を抽出
    messages.forEach(msg => {
      const text = msg.text || msg.message || '';
      const digits = text.match(/\d/g) || [];
      
      digits.forEach(digit => {
        const num = parseInt(digit);
        digitCount[num] = (digitCount[num] || 0) + 1;
      });
    });
    
    // 最頻出数字を特定
    let powerNumber = 1; // デフォルト
    let maxCount = 0;
    
    for (const [digit, count] of Object.entries(digitCount)) {
      if (count > maxCount) {
        maxCount = count;
        powerNumber = parseInt(digit) || 9; // 0は9として扱う
      }
    }
    
    return {
      number: powerNumber,
      frequency: maxCount,
      meaning: this.getNumberMeaning(powerNumber),
      type: 'power'
    };
  }
  
  /**
   * 数字を単数に還元（マスターナンバー考慮）
   * @param {number} num - 対象数値
   * @returns {number} 還元された数値
   */
  reduceToSingleDigit(num) {
    // マスターナンバー（11, 22, 33）はそのまま返す
    if (num === 11 || num === 22 || num === 33) {
      return num;
    }
    
    while (num > 9) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
      
      // 途中でマスターナンバーになった場合
      if (num === 11 || num === 22 || num === 33) {
        return num;
      }
    }
    
    return num === 0 ? 9 : num; // 0は9として扱う
  }
  
  /**
   * 文字列から数字を抽出して合計
   * @param {string} str - 対象文字列
   * @returns {number} 数字の合計
   */
  extractAndSumDigits(str) {
    if (!str) return 1;
    
    // 数字を抽出
    const digits = str.toString().match(/\d/g) || [];
    
    if (digits.length === 0) {
      // 数字がない場合は文字のASCII値を使用
      return str.split('').reduce((sum, char) => {
        return sum + char.charCodeAt(0);
      }, 0);
    }
    
    return digits.reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  
  /**
   * 数字の意味を取得
   * @param {number} number - 対象数値
   * @returns {object} 数字の意味情報
   */
  getNumberMeaning(number) {
    // マスターナンバーをチェック
    if (this.masterNumbers[number]) {
      return {
        ...this.masterNumbers[number],
        isMasterNumber: true
      };
    }
    
    // 通常の数値
    return {
      ...this.meanings[number],
      isMasterNumber: false
    };
  }
  
  /**
   * ラッキーナンバーを提案
   * @param {object} analysis - 分析データ
   * @returns {object} ラッキーナンバー情報
   */
  getLuckyNumbers(analysis) {
    const destinyNum = analysis.destinyNumber?.number || 1;
    const compatibilityNum = analysis.compatibilityNumber?.number || 1;
    const personalYearNum = analysis.personalYearNumber?.number || 1;
    
    // 基本ラッキーナンバー
    const primary = destinyNum;
    const secondary = compatibilityNum;
    const tertiary = personalYearNum;
    
    // 組み合わせ数
    const combination = this.reduceToSingleDigit(primary + secondary + tertiary);
    
    return {
      primary: {
        number: primary,
        source: 'destiny',
        meaning: '最も強い影響力を持つ数字'
      },
      secondary: {
        number: secondary,
        source: 'compatibility',
        meaning: '相性運に影響する数字'
      },
      tertiary: {
        number: tertiary,
        source: 'personalYear',
        meaning: '今年の運勢を左右する数字'
      },
      combination: {
        number: combination,
        source: 'combined',
        meaning: '総合的なラッキーナンバー'
      },
      recommendations: this.getNumberRecommendations([primary, secondary, tertiary, combination])
    };
  }
  
  /**
   * 数字に基づく推奨事項を取得
   * @param {array} numbers - 数字配列
   * @returns {object} 推奨事項
   */
  getNumberRecommendations(numbers) {
    const colors = [];
    const luckyTimes = [];
    const actions = [];
    
    numbers.forEach(num => {
      const meaning = this.getNumberMeaning(num);
      if (meaning.color) colors.push(meaning.color);
      if (meaning.luckyTime) luckyTimes.push(...meaning.luckyTime);
      if (meaning.action) actions.push(meaning.action);
    });
    
    return {
      colors: [...new Set(colors)],
      luckyTimes: [...new Set(luckyTimes)].sort((a, b) => a - b),
      actions: [...new Set(actions)]
    };
  }
  
  /**
   * 二人の相性を判定
   * @param {number} number1 - 一人目の数字
   * @param {number} number2 - 二人目の数字
   * @returns {object} 相性判定結果
   */
  calculateRelationshipCompatibility(number1, number2) {
    const pair = [number1, number2].sort((a, b) => a - b);
    
    let compatibilityLevel = 'average';
    let score = 60; // デフォルトスコア
    
    // 優秀な組み合わせ
    if (this.compatibility.excellent.some(([a, b]) => a === pair[0] && b === pair[1])) {
      compatibilityLevel = 'excellent';
      score = 90;
    }
    // 良い組み合わせ
    else if (this.compatibility.good.some(([a, b]) => a === pair[0] && b === pair[1])) {
      compatibilityLevel = 'good';
      score = 75;
    }
    // 困難な組み合わせ
    else if (this.compatibility.challenging.some(([a, b]) => a === pair[0] && b === pair[1])) {
      compatibilityLevel = 'challenging';
      score = 40;
    }
    
    return {
      level: compatibilityLevel,
      score,
      advice: this.getCompatibilityAdvice(compatibilityLevel, number1, number2),
      strengths: this.getRelationshipStrengths(number1, number2),
      challenges: this.getRelationshipChallenges(number1, number2)
    };
  }
  
  /**
   * 相性アドバイスを取得
   * @param {string} level - 相性レベル
   * @param {number} num1 - 数字1
   * @param {number} num2 - 数字2
   * @returns {string} アドバイス
   */
  getCompatibilityAdvice(level, num1, num2) {
    const meaning1 = this.getNumberMeaning(num1);
    const meaning2 = this.getNumberMeaning(num2);
    
    switch (level) {
      case 'excellent':
        return `${meaning1.keyword}と${meaning2.keyword}が見事に調和します。お互いの長所を活かし合える最高の組み合わせです。`;
      case 'good':
        return `${meaning1.keyword}と${meaning2.keyword}は良い補完関係にあります。理解し合うことで素晴らしい関係を築けます。`;
      case 'challenging':
        return `${meaning1.keyword}と${meaning2.keyword}は対照的ですが、違いを受け入れることで成長できる関係です。`;
      default:
        return `${meaning1.keyword}と${meaning2.keyword}のバランスを取ることが大切です。`;
    }
  }
  
  /**
   * 関係の強みを取得
   * @param {number} num1 - 数字1
   * @param {number} num2 - 数字2
   * @returns {array} 強み配列
   */
  getRelationshipStrengths(num1, num2) {
    const meaning1 = this.getNumberMeaning(num1);
    const meaning2 = this.getNumberMeaning(num2);
    
    return [
      `${meaning1.keyword}の特性`,
      `${meaning2.keyword}の特性`,
      '互いの違いから学べること',
      '共通の価値観'
    ];
  }
  
  /**
   * 関係の課題を取得
   * @param {number} num1 - 数字1
   * @param {number} num2 - 数字2
   * @returns {array} 課題配列
   */
  getRelationshipChallenges(num1, num2) {
    const meaning1 = this.getNumberMeaning(num1);
    const meaning2 = this.getNumberMeaning(num2);
    
    return [
      `${meaning1.keyword}の極端さ`,
      `${meaning2.keyword}の極端さ`,
      'コミュニケーションの違い',
      '価値観の相違'
    ];
  }
  
  /**
   * 包括的な数秘術分析を実行
   * @param {array} messages - メッセージ配列
   * @param {string} userId - ユーザーID
   * @returns {object} 包括的分析結果
   */
  performFullAnalysis(messages, userId) {
    const destinyNumber = this.calculateDestinyNumber(messages);
    const compatibilityNumber = this.calculateCompatibilityNumber(messages);
    const personalYearNumber = this.calculatePersonalYearNumber(userId);
    const powerNumber = this.calculatePowerNumber(messages);
    const luckyNumbers = this.getLuckyNumbers({
      destinyNumber,
      compatibilityNumber,
      personalYearNumber
    });
    
    return {
      destinyNumber,
      compatibilityNumber,
      personalYearNumber,
      powerNumber,
      luckyNumbers,
      summary: this.generateNumerologySummary({
        destinyNumber,
        compatibilityNumber,
        personalYearNumber,
        powerNumber
      })
    };
  }
  
  /**
   * 数秘術分析のサマリーを生成
   * @param {object} analysis - 分析データ
   * @returns {object} サマリー
   */
  generateNumerologySummary(analysis) {
    const primaryNumber = analysis.destinyNumber.number;
    const primaryMeaning = this.getNumberMeaning(primaryNumber);
    
    return {
      primaryInfluence: primaryMeaning.keyword,
      loveStyle: primaryMeaning.loveStyle,
      strengths: primaryMeaning.traits,
      challenges: primaryMeaning.challenges,
      advice: primaryMeaning.advice,
      element: primaryMeaning.element,
      energy: primaryMeaning.energy
    };
  }
}

module.exports = Numerology;