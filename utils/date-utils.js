const dayjs = require('dayjs');

/**
 * 日付・時間計算のヘルパー関数
 */
class DateUtils {
  /**
   * 現在の時刻から時間帯を判定
   * @returns {string} morning, afternoon, evening, night
   */
  static getTimeOfDay() {
    const hour = dayjs().hour();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }
  
  /**
   * 曜日を取得
   * @returns {string} sunday, monday, ...
   */
  static getDayOfWeek() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayjs().day()];
  }
  
  /**
   * 現在の日時情報を包括的に取得
   * @returns {object} 日時情報オブジェクト
   */
  static getCurrentTimeInfo() {
    const now = dayjs();
    return {
      date: now.format('YYYY-MM-DD'),
      time: now.format('HH:mm'),
      hour: now.hour(),
      minute: now.minute(),
      dayOfWeek: this.getDayOfWeek(),
      timeOfDay: this.getTimeOfDay(),
      timestamp: now.unix(),
      formatted: now.format('YYYY年MM月DD日 HH:mm')
    };
  }
  
  /**
   * 特定の日付の運命数を計算（誕生日ベース）
   * @param {string} birthDate - YYYY-MM-DD形式
   * @returns {number} 運命数（1-9）
   */
  static calculateDestinyNumber(birthDate) {
    if (!birthDate) return 1;
    
    // 日付から数字を抽出
    const digits = birthDate.replace(/\D/g, '');
    let sum = 0;
    
    for (let digit of digits) {
      sum += parseInt(digit);
    }
    
    // 数秘術的な還元（11, 22, 33は特別扱い）
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, num) => acc + parseInt(num), 0);
    }
    
    return sum > 9 ? sum % 10 || 9 : sum;
  }
  
  /**
   * 今日の日付ベースの運勢数値を計算
   * @returns {number} 1-100の運勢値
   */
  static getTodayFortuneNumber() {
    const today = dayjs();
    const year = today.year();
    const month = today.month() + 1;
    const date = today.date();
    
    // シンプルな運勢計算アルゴリズム
    const base = (year + month + date) % 100;
    return base === 0 ? 100 : base;
  }
  
  /**
   * 時間帯に基づく運勢修正値を取得
   * @returns {number} 0.8-1.3の修正係数
   */
  static getTimeModifier() {
    const timeWeights = {
      morning: 1.2,
      afternoon: 1.0,
      evening: 1.3,
      night: 0.8
    };
    
    return timeWeights[this.getTimeOfDay()] || 1.0;
  }
  
  /**
   * 曜日に基づく運勢修正値を取得
   * @returns {number} 0.9-1.3の修正係数
   */
  static getDayModifier() {
    const dayWeights = {
      sunday: 1.1,
      monday: 0.9,
      tuesday: 1.0,
      wednesday: 1.1,
      thursday: 1.0,
      friday: 1.3,
      saturday: 1.2
    };
    
    return dayWeights[this.getDayOfWeek()] || 1.0;
  }
  
  /**
   * 恋愛に適した時間かどうかを判定
   * @returns {boolean} 恋愛向きの時間かどうか
   */
  static isRomanticTime() {
    const hour = dayjs().hour();
    // 18-22時と10-12時は恋愛向き
    return (hour >= 18 && hour <= 22) || (hour >= 10 && hour <= 12);
  }
  
  /**
   * フォーマットされた現在時刻を取得
   * @param {string} format - dayjs形式の文字列
   * @returns {string} フォーマットされた時刻
   */
  static formatCurrentTime(format = 'HH:mm') {
    return dayjs().format(format);
  }
}

module.exports = DateUtils;