/**
 * プレミアムレポートV2 スコアリングモジュール
 * 関係性のスコアと5つの柱を計算
 */

const MoonFortuneEngine = require('../../moon-fortune');

class ScoringEngine {
  constructor() {
    this.moonEngine = new MoonFortuneEngine();
  }
  
  /**
   * 全スコアリングを実行
   * @param {Object} analysisContext - 分析コンテキスト
   */
  calculateAllScores(analysisContext) {
    // P.6-7: 総合スコアの計算
    this.calculateOverallScore(analysisContext);
    
    // P.8: 5つの柱のスコア計算
    this.calculateFivePillars(analysisContext);
  }
  
  /**
   * P.6-7: 総合スコアの計算
   */
  calculateOverallScore(analysisContext) {
    const { statistics, user, partner } = analysisContext;
    
    // 各指標を0-100に正規化してスコア化
    const scores = {
      responseSpeed: 0,
      positivity: 0,
      balance: 0,
      messageLength: 0,
      moonCompatibility: 0
    };
    
    // 1. 返信速度スコア（短いほど高得点）
    const medianMinutes = statistics.responseTimeMedian || 30;
    if (medianMinutes <= 5) {
      scores.responseSpeed = 100;
    } else if (medianMinutes <= 15) {
      scores.responseSpeed = 90;
    } else if (medianMinutes <= 30) {
      scores.responseSpeed = 80;
    } else if (medianMinutes <= 60) {
      scores.responseSpeed = 70;
    } else if (medianMinutes <= 120) {
      scores.responseSpeed = 60;
    } else {
      scores.responseSpeed = 50;
    }
    
    // 2. ポジティブ率スコア
    scores.positivity = Math.min(100, statistics.positivityRate || 50);
    
    // 3. 会話の双方向性スコア（50:50に近いほど高得点）
    const balance = statistics.communicationBalance || '50:50';
    const [userRatio, partnerRatio] = balance.split(':').map(Number);
    const diff = Math.abs(userRatio - partnerRatio);
    scores.balance = Math.max(0, 100 - (diff * 2));
    
    // 4. メッセージ長スコア（適度な長さが高得点）
    const avgLength = statistics.overallAvgMessageLength || 20;
    if (avgLength >= 30 && avgLength <= 100) {
      scores.messageLength = 100;
    } else if (avgLength >= 20 && avgLength < 30) {
      scores.messageLength = 80;
    } else if (avgLength >= 10 && avgLength < 20) {
      scores.messageLength = 60;
    } else if (avgLength > 100) {
      scores.messageLength = 70;
    } else {
      scores.messageLength = 40;
    }
    
    // 5. 月相の相性スコア
    if (user.birthDate && partner.birthDate) {
      const userMoonPhase = this.moonEngine.calculateMoonPhase(user.birthDate);
      const partnerMoonPhase = this.moonEngine.calculateMoonPhase(partner.birthDate);
      const userType = this.moonEngine.getMoonPhaseType(userMoonPhase);
      const partnerType = this.moonEngine.getMoonPhaseType(partnerMoonPhase);
      scores.moonCompatibility = this.moonEngine.calculateCompatibility(userType, partnerType);
    } else {
      scores.moonCompatibility = 75; // デフォルト値
    }
    
    // 重み付けして総合スコアを計算
    const weights = {
      responseSpeed: 0.3,
      positivity: 0.3,
      balance: 0.2,
      messageLength: 0.1,
      moonCompatibility: 0.1
    };
    
    let overallScore = 0;
    for (const [key, score] of Object.entries(scores)) {
      overallScore += score * weights[key];
    }
    
    // 結果を格納
    analysisContext.scores.overallScore = Math.round(overallScore);
    analysisContext.scores.components = scores;
    analysisContext.scores.weights = weights;
    
    // 月相情報も保存
    if (user.birthDate && partner.birthDate) {
      const userMoonPhase = this.moonEngine.calculateMoonPhase(user.birthDate);
      const partnerMoonPhase = this.moonEngine.calculateMoonPhase(partner.birthDate);
      const userType = this.moonEngine.getMoonPhaseType(userMoonPhase);
      const partnerType = this.moonEngine.getMoonPhaseType(partnerMoonPhase);
      
      analysisContext.scores.userMoonPhase = userType.name;
      analysisContext.scores.partnerMoonPhase = partnerType.name;
    }
  }
  
  /**
   * P.8: 5つの柱のスコア計算
   */
  calculateFivePillars(analysisContext) {
    const { statistics, messages } = analysisContext;
    
    const pillars = {
      dialogue: 0,      // 心の対話
      values: 0,        // 価値観の一致
      emotion: 0,       // 感情の共鳴
      lifestyle: 0,     // 生活の調和
      future: 0         // 未来への視線
    };
    
    // 1. 心の対話スコア（メッセージ長と質問比率から）
    const avgLength = statistics.overallAvgMessageLength || 20;
    const lengthScore = Math.min(100, (avgLength / 50) * 100);
    
    const questionBalance = statistics.questionRatio || '50:50';
    const [userQ, partnerQ] = questionBalance.split(':').map(Number);
    const balanceScore = Math.max(0, 100 - Math.abs(userQ - partnerQ));
    
    pillars.dialogue = Math.round((lengthScore + balanceScore) / 2);
    
    // 2. 価値観の一致スコア（共通の話題から推定）
    // 簡易版：ポジティブな会話が多いほど価値観が合っていると推定
    pillars.values = Math.min(100, Math.round(statistics.positivityRate * 1.1));
    
    // 3. 感情の共鳴スコア（ポジティブ率と絵文字使用から）
    const positivityScore = statistics.positivityRate || 50;
    const emojiScore = Math.min(100, (statistics.emojiPerMessage || 0) * 50);
    pillars.emotion = Math.round((positivityScore + emojiScore) / 2);
    
    // 4. 生活の調和スコア（活動時間の重なりから）
    // P.4のデータを使用
    const peakHour = statistics.peakHour;
    if (peakHour >= 20 || peakHour <= 1) {
      // 夜型で一致
      pillars.lifestyle = 90;
    } else if (peakHour >= 6 && peakHour <= 9) {
      // 朝型で一致
      pillars.lifestyle = 85;
    } else if (peakHour >= 12 && peakHour <= 14) {
      // 昼型で一致
      pillars.lifestyle = 80;
    } else {
      // その他
      pillars.lifestyle = 75;
    }
    
    // 5. 未来への視線スコア（未来に関する話題から推定）
    const futureKeywords = [
      '今度', '次', '来週', '来月', '来年',
      '予定', '計画', '約束', '楽しみ',
      '将来', '未来', 'いつか', 'そのうち',
      '一緒に', 'ふたりで', '会いたい', '行きたい'
    ];
    
    let futureCount = 0;
    messages.forEach(msg => {
      if (futureKeywords.some(keyword => msg.text.includes(keyword))) {
        futureCount++;
      }
    });
    
    const futureRatio = (futureCount / messages.length) * 100;
    pillars.future = Math.min(100, Math.round(futureRatio * 10));
    
    // 最小値を60に調整（あまりに低いスコアは避ける）
    for (const key in pillars) {
      if (pillars[key] < 60) {
        pillars[key] = 60 + Math.round(Math.random() * 15);
      }
    }
    
    // 結果を格納
    analysisContext.scores.fivePillars = {
      dialogue: {
        name: '心の対話',
        score: pillars.dialogue,
        description: '言葉を通じて心を通わせる力'
      },
      values: {
        name: '価値観の一致',
        score: pillars.values,
        description: '大切にしているものの共有度'
      },
      emotion: {
        name: '感情の共鳴',
        score: pillars.emotion,
        description: '喜びや楽しさを分かち合う力'
      },
      lifestyle: {
        name: '生活の調和',
        score: pillars.lifestyle,
        description: '日々のリズムの重なり'
      },
      future: {
        name: '未来への視線',
        score: pillars.future,
        description: '共に歩む未来への期待'
      }
    };
    
    // 最も強い柱と弱い柱を特定
    let strongest = null;
    let weakest = null;
    let maxScore = 0;
    let minScore = 100;
    
    for (const [key, data] of Object.entries(analysisContext.scores.fivePillars)) {
      if (data.score > maxScore) {
        maxScore = data.score;
        strongest = { key, ...data };
      }
      if (data.score < minScore) {
        minScore = data.score;
        weakest = { key, ...data };
      }
    }
    
    analysisContext.scores.strongestPillar = strongest;
    analysisContext.scores.weakestPillar = weakest;
  }
}

module.exports = ScoringEngine;