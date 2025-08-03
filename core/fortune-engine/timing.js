const dayjs = require('dayjs');
const DateUtils = require('../../utils/date-utils');
const planetaryHours = require('../../data/planetary-hours.json');

/**
 * タイミング計算エンジン
 * 最適な恋愛タイミングを算出する
 */
class TimingCalculator {
  constructor() {
    this.fortuneNumbers = [14, 23, 32, 41, 50]; // 基本の分候補
  }
  
  /**
   * 最適タイミングを3つ計算
   * @param {object} analysis - ユーザー分析データ
   * @returns {array} タイミング提案配列
   */
  calculateOptimalTimings(analysis = {}) {
    const nextWeekDates = this.getNextWeekDates();
    const scoredTimings = [];
    
    // 各日の各時間をスコア計算
    nextWeekDates.forEach(date => {
      const dayName = this.getDayName(date);
      const planetaryData = planetaryHours[dayName];
      
      if (planetaryData) {
        // ベストアワーとグッドアワーを評価
        [...planetaryData.bestHours, ...planetaryData.goodHours].forEach(hour => {
          if (hour >= 7 && hour <= 23) { // 深夜早朝を除外
            const score = this.calculateScore(date, hour, analysis, planetaryData);
            const minute = this.calculateLuckyMinute(hour, analysis);
            
            scoredTimings.push({
              date: date.format('YYYY-MM-DD'),
              time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              datetime: date.hour(hour).minute(minute).toDate(),
              score,
              dayName,
              reason: this.generateReason(score, dayName, hour, planetaryData),
              action: this.suggestAction(score, dayName, planetaryData),
              planetaryData: {
                ruler: planetaryData.ruler,
                energy: planetaryData.energy,
                keywords: planetaryData.keywords
              }
            });
          }
        });
      }
    });
    
    // スコア順にソートして上位3つを選択
    return scoredTimings
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((timing, index) => ({
        ...timing,
        rank: index + 1,
        confidence: this.calculateConfidence(timing.score)
      }));
  }
  
  /**
   * 来週の日付配列を取得
   * @returns {array} dayjs日付オブジェクトの配列
   */
  getNextWeekDates() {
    const dates = [];
    const today = dayjs();
    
    // 明日から7日間
    for (let i = 1; i <= 7; i++) {
      dates.push(today.add(i, 'day'));
    }
    
    return dates;
  }
  
  /**
   * タイミングスコアを計算
   * @param {object} date - dayjs日付オブジェクト
   * @param {number} hour - 時間
   * @param {object} analysis - ユーザー分析データ
   * @param {object} planetaryData - 惑星データ
   * @returns {number} 0-100のスコア
   */
  calculateScore(date, hour, analysis, planetaryData) {
    let score = 0;
    
    // 1. 過去の返信率（40%）
    const replyRateScore = this.calculateReplyRateScore(hour, analysis) * 0.4;
    
    // 2. 惑星時間の適合度（30%）
    const planetaryScore = this.calculatePlanetaryScore(hour, planetaryData) * 0.3;
    
    // 3. 一般的な活動時間（20%）
    const activityScore = this.calculateActivityScore(hour, date.day()) * 0.2;
    
    // 4. ランダム要素（10%）
    const randomScore = (Math.random() * 20 + 80) * 0.1; // 80-100の範囲
    
    score = replyRateScore + planetaryScore + activityScore + randomScore;
    
    // ボーナス要素
    if (planetaryData.bestHours.includes(hour)) {
      score += 5; // ベストアワーボーナス
    }
    
    // ペナルティ要素
    if (hour < 8 || hour > 22) {
      score -= 10; // 早朝・深夜ペナルティ
    }
    
    return Math.min(Math.max(score, 0), 100);
  }
  
  /**
   * 返信率ベースのスコア計算
   * @param {number} hour - 時間
   * @param {object} analysis - 分析データ
   * @returns {number} スコア
   */
  calculateReplyRateScore(hour, analysis) {
    // 分析データがない場合はデフォルトパターンを使用
    const defaultPattern = {
      morning: 70,   // 6-12
      afternoon: 85, // 12-18
      evening: 90,   // 18-22
      night: 50      // 22-6
    };
    
    const patterns = (analysis && analysis.replyPatterns) ? analysis.replyPatterns : defaultPattern;
    
    if (hour >= 6 && hour < 12) return patterns.morning || 70;
    if (hour >= 12 && hour < 18) return patterns.afternoon || 85;
    if (hour >= 18 && hour < 22) return patterns.evening || 90;
    return patterns.night || 50;
  }
  
  /**
   * 惑星時間ベースのスコア計算
   * @param {number} hour - 時間
   * @param {object} planetaryData - 惑星データ
   * @returns {number} スコア
   */
  calculatePlanetaryScore(hour, planetaryData) {
    if (planetaryData.bestHours.includes(hour)) {
      return 95; // ベストアワーは高スコア
    }
    if (planetaryData.goodHours.includes(hour)) {
      return 80; // グッドアワーは中スコア
    }
    return 60; // その他の時間
  }
  
  /**
   * 一般的な活動時間ベースのスコア計算
   * @param {number} hour - 時間
   * @param {number} dayOfWeek - 曜日（0=日曜）
   * @returns {number} スコア
   */
  calculateActivityScore(hour, dayOfWeek) {
    // 平日と週末で異なるパターン
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      // 週末パターン
      if (hour >= 10 && hour <= 12) return 85; // 遅い朝
      if (hour >= 15 && hour <= 17) return 90; // 午後
      if (hour >= 19 && hour <= 21) return 95; // 夜
      return 70;
    } else {
      // 平日パターン
      if (hour >= 7 && hour <= 9) return 75;   // 朝
      if (hour >= 12 && hour <= 13) return 80; // 昼休み
      if (hour >= 18 && hour <= 20) return 90; // 夕方
      return 65;
    }
  }
  
  /**
   * 幸運の分を計算
   * @param {number} hour - 時間
   * @param {object} analysis - 分析データ
   * @returns {number} 分（0-59）
   */
  calculateLuckyMinute(hour, analysis = {}) {
    // 基本候補から選択
    let candidates = [...this.fortuneNumbers];
    
    // ユーザー固有の数値があれば考慮
    if (analysis && analysis.luckyNumber) {
      const userMinute = analysis.luckyNumber % 60;
      if (userMinute < 60) {
        candidates.push(userMinute);
      }
    }
    
    // 時間に基づく調整
    const timeBasedAdjustment = hour % candidates.length;
    
    // ゾロ目回避
    const selectedMinute = candidates[timeBasedAdjustment];
    if (hour === 11 && selectedMinute === 11) {
      return candidates[(timeBasedAdjustment + 1) % candidates.length];
    }
    
    return selectedMinute;
  }
  
  /**
   * タイミングの理由を生成
   * @param {number} score - スコア
   * @param {string} dayName - 曜日名
   * @param {number} hour - 時間
   * @param {object} planetaryData - 惑星データ
   * @returns {string} 理由
   */
  generateReason(score, dayName, hour, planetaryData) {
    const reasons = [];
    
    if (planetaryData.bestHours.includes(hour)) {
      reasons.push(`${planetaryData.ruler}の最適時間帯`);
    }
    
    if (score >= 90) {
      reasons.push('非常に良好なタイミング');
    } else if (score >= 80) {
      reasons.push('良好なタイミング');
    } else if (score >= 70) {
      reasons.push('まずまずのタイミング');
    }
    
    reasons.push(`${planetaryData.energy}のエネルギーが活発`);
    
    return reasons.join('、');
  }
  
  /**
   * 推奨アクションを提案
   * @param {number} score - スコア
   * @param {string} dayName - 曜日名
   * @param {object} planetaryData - 惑星データ
   * @returns {string} アクション提案
   */
  suggestAction(score, dayName, planetaryData) {
    if (score >= 90) {
      const actions = planetaryData.loveActions || ['積極的にアプローチ'];
      return actions[Math.floor(Math.random() * actions.length)];
    } else if (score >= 80) {
      return '穏やかにコミュニケーションを取る';
    } else if (score >= 70) {
      return 'さりげなく連絡を取る';
    } else {
      return '様子を見ながら慎重に行動';
    }
  }
  
  /**
   * 曜日名を取得
   * @param {object} date - dayjs日付オブジェクト
   * @returns {string} 日本語曜日名
   */
  getDayName(date) {
    const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    return days[date.day()];
  }
  
  /**
   * 信頼度を計算
   * @param {number} score - スコア
   * @returns {string} 信頼度レベル
   */
  calculateConfidence(score) {
    if (score >= 90) return 'とても高い';
    if (score >= 80) return '高い';
    if (score >= 70) return '普通';
    if (score >= 60) return 'やや低い';
    return '低い';
  }
  
  /**
   * 緊急度を判定
   * @param {object} timing - タイミングオブジェクト
   * @returns {string} 緊急度レベル
   */
  calculateUrgency(timing) {
    const now = dayjs();
    const targetTime = dayjs(timing.datetime);
    const hoursUntil = targetTime.diff(now, 'hour');
    
    if (hoursUntil <= 24) return '今日';
    if (hoursUntil <= 48) return '明日';
    if (hoursUntil <= 72) return '近日';
    return '今週中';
  }
  
  /**
   * 詳細分析データを取得
   * @param {object} timing - タイミングオブジェクト
   * @returns {object} 詳細分析
   */
  getDetailedAnalysis(timing) {
    return {
      timing,
      urgency: this.calculateUrgency(timing),
      advice: planetaryHours[timing.dayName].advice,
      keywords: planetaryHours[timing.dayName].keywords,
      colors: planetaryHours[timing.dayName].colors,
      avoidActions: planetaryHours[timing.dayName].avoidActions
    };
  }
}

module.exports = TimingCalculator;