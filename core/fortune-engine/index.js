const TimingCalculator = require('./timing');
const Numerology = require('./numerology');
const AIAnalyzer = require('../ai-analyzer');
const fortuneConfig = require('../../config/fortune.config');
const fortuneTemplates = require('../../data/fortune-templates.json');
const DateUtils = require('../../utils/date-utils');

/**
 * お告げ生成エンジン
 * 各種分析結果を統合して神秘的なお告げを生成
 */
class FortuneEngine {
  constructor() {
    this.timingCalculator = new TimingCalculator();
    this.numerology = new Numerology();
    this.aiAnalyzer = new AIAnalyzer();
    this.config = fortuneConfig;
    this.templates = fortuneTemplates;
  }
  
  /**
   * 包括的なお告げを生成
   * @param {array} messages - メッセージ履歴
   * @param {string} userId - ユーザーID
   * @param {string} userName - ユーザー名（オプション）
   * @returns {object} 完全なお告げ
   */
  async generateFortune(messages, userId, userName = null) {
    try {
      // 各種分析を並行実行
      const [aiAnalysis, numerologyAnalysis] = await Promise.all([
        this.aiAnalyzer.analyzeConversation(messages, userId),
        Promise.resolve(this.numerology.performFullAnalysis(messages, userId))
      ]);
      
      // タイミング分析はAI分析後に実行
      const timingAnalysis = this.timingCalculator.calculateOptimalTimings(aiAnalysis);
      
      // 総合分析を統合
      const integratedAnalysis = this.integrateAnalyses({
        ai: aiAnalysis,
        numerology: numerologyAnalysis,
        timing: timingAnalysis
      });
      
      // お告げの各要素を生成
      const fortune = {
        mainMessage: this.composeMainMessage(integratedAnalysis, userName),
        destinyMoments: this.selectDestinyMoments(timingAnalysis, integratedAnalysis),
        warnings: this.generateWarnings(integratedAnalysis),
        luckyItems: this.selectLuckyItems(numerologyAnalysis, integratedAnalysis),
        overall: this.calculateOverallFortune(integratedAnalysis),
        metadata: {
          generatedAt: new Date().toISOString(),
          accuracy: this.calculateAccuracy(integratedAnalysis),
          confidence: this.calculateConfidence(integratedAnalysis),
          analysisSource: {
            ai: !!aiAnalysis && !aiAnalysis.fallbackReason,
            numerology: true,
            timing: true
          }
        }
      };
      
      return this.validateFortune(fortune);
      
    } catch (error) {
      console.error('お告げ生成エラー:', error);
      return this.generateFallbackFortune(userName);
    }
  }
  
  /**
   * 各分析結果を統合
   * @param {object} analyses - 分析結果オブジェクト
   * @returns {object} 統合された分析
   */
  integrateAnalyses(analyses) {
    const { ai, numerology, timing } = analyses;
    
    return {
      // AI分析から
      personality: ai.personality || [],
      emotionalPattern: ai.emotionalPattern || {},
      communicationStyle: ai.communicationStyle || '',
      interests: ai.interests || [],
      relationshipStage: ai.relationshipStage || 5,
      advice: ai.advice || [],
      
      // 数秘術から
      destinyNumber: numerology.destinyNumber?.number || 1,
      compatibilityNumber: numerology.compatibilityNumber?.number || 1,
      personalYearNumber: numerology.personalYearNumber?.number || 1,
      luckyNumbers: numerology.luckyNumbers || {},
      
      // タイミング分析から
      optimalTimings: timing || [],
      
      // 統合スコア
      overallScore: this.calculateIntegratedScore(ai, numerology, timing),
      
      // 主要テーマ
      primaryTheme: this.determinePrimaryTheme(ai, numerology),
      
      // 注意点
      cautionAreas: this.identifyCautionAreas(ai, numerology)
    };
  }
  
  /**
   * メインメッセージを作成
   * @param {object} analysis - 統合分析
   * @param {string} userName - ユーザー名
   * @returns {string} メインメッセージ
   */
  composeMainMessage(analysis, userName = 'あなた') {
    const template = this.selectTemplate(this.templates.openings);
    const message = this.replaceVariables(template, { name: userName });
    
    const themeMessage = this.generateThemeMessage(analysis);
    const encouragement = this.generateEncouragement(analysis);
    
    return `${message}\n\n${themeMessage}\n\n${encouragement}`;
  }
  
  /**
   * 運命の瞬間を選定
   * @param {array} timings - タイミング分析結果
   * @param {object} analysis - 統合分析
   * @returns {array} 運命の瞬間配列
   */
  selectDestinyMoments(timings, analysis) {
    const moments = timings.slice(0, 3).map((timing, index) => {
      const action = this.selectTemplate(this.templates.actionTemplates);
      const reason = this.selectTemplate(this.templates.reasonTemplates);
      const cosmicReason = this.selectTemplate(this.templates.cosmicReasons);
      
      return {
        rank: index + 1,
        datetime: `${timing.date} ${timing.time}`,
        dayName: timing.dayName,
        action,
        reason,
        cosmicReason,
        successRate: Math.max(70, Math.min(95, timing.score + this.getRandomInt(-5, 5))),
        element: timing.planetaryData?.element || '火',
        energy: timing.planetaryData?.energy || '活力',
        description: this.generateMomentDescription(timing, action, analysis)
      };
    });
    
    return moments;
  }
  
  /**
   * 警告事項を生成
   * @param {object} analysis - 統合分析
   * @returns {array} 警告配列
   */
  generateWarnings(analysis) {
    const warnings = [];
    const cautionAreas = analysis.cautionAreas || [];
    
    // 数秘術に基づく警告
    if (analysis.destinyNumber === 7) {
      warnings.push({
        type: 'timing',
        message: '直感を信じすぎて現実を見失わないよう注意',
        reason: '7の数字の影響で神秘的になりがち'
      });
    }
    
    // AI分析に基づく警告
    if (analysis.emotionalPattern?.negative?.length > 0) {
      const avoidTopics = analysis.emotionalPattern.negative.slice(0, 2);
      warnings.push({
        type: 'communication',
        message: `${avoidTopics.join('や')}の話題は避けて`,
        reason: '相手の感情が不安定になる可能性'
      });
    }
    
    // 一般的な警告をランダムに追加
    const generalWarnings = this.templates.warnings;
    if (warnings.length < 2) {
      const randomWarning = generalWarnings[Math.floor(Math.random() * generalWarnings.length)];
      warnings.push({
        type: 'general',
        message: `${randomWarning.condition}は${randomWarning.advice}`,
        reason: randomWarning.reason
      });
    }
    
    return warnings.slice(0, 2); // 最大2つまで
  }
  
  /**
   * ラッキーアイテムを選定
   * @param {object} numerologyAnalysis - 数秘術分析
   * @param {object} analysis - 統合分析
   * @returns {object} ラッキーアイテム
   */
  selectLuckyItems(numerologyAnalysis, analysis) {
    const luckyNumber = numerologyAnalysis.luckyNumbers?.primary?.number || 
                       analysis.destinyNumber || 1;
    
    // 数字に基づいてアイテムを選択
    const colorIndex = luckyNumber % this.templates.luckyItems.colors.length;
    const emojiIndex = luckyNumber % this.templates.luckyItems.emojis.length;
    const wordIndex = luckyNumber % this.templates.luckyItems.words.length;
    const numberIndex = luckyNumber % this.templates.luckyItems.numbers.length;
    
    return {
      color: this.templates.luckyItems.colors[colorIndex],
      emoji: this.templates.luckyItems.emojis[emojiIndex],
      word: this.templates.luckyItems.words[wordIndex],
      number: this.templates.luckyItems.numbers[numberIndex],
      combination: this.generateLuckyCombination(luckyNumber)
    };
  }
  
  /**
   * 総合運勢を計算
   * @param {object} analysis - 統合分析
   * @returns {object} 総合運勢
   */
  calculateOverallFortune(analysis) {
    const score = analysis.overallScore || 75;
    let trend = 'stable';
    
    if (score >= 80) trend = 'rising';
    else if (score < 60) trend = 'declining';
    
    return {
      score,
      trend,
      trendText: this.selectTemplate(this.templates.trends[trend]),
      accuracy: this.templates.accuracyStars[Math.ceil(score / 20)] || '★★★☆☆',
      element: this.determineDominantElement(analysis),
      phase: this.determineLifePhase(analysis.relationshipStage)
    };
  }
  
  /**
   * 統合スコアを計算
   * @param {object} ai - AI分析
   * @param {object} numerology - 数秘術分析
   * @param {array} timing - タイミング分析
   * @returns {number} 統合スコア
   */
  calculateIntegratedScore(ai, numerology, timing) {
    let score = 75; // ベーススコア
    
    // AI分析の信頼度
    if (ai.confidence) {
      score += (ai.confidence - 0.5) * 20;
    }
    
    // 関係性の段階
    if (ai.relationshipStage) {
      score += (ai.relationshipStage - 5) * 2;
    }
    
    // タイミングの最高スコア
    if (timing && timing.length > 0) {
      score += (timing[0].score - 75) * 0.3;
    }
    
    // 数秘術のマスターナンバーボーナス
    if ([11, 22, 33].includes(numerology.destinyNumber?.number)) {
      score += 5;
    }
    
    return Math.max(40, Math.min(95, Math.round(score)));
  }
  
  /**
   * 主要テーマを決定
   * @param {object} ai - AI分析
   * @param {object} numerology - 数秘術分析
   * @returns {string} 主要テーマ
   */
  determinePrimaryTheme(ai, numerology) {
    const stage = ai.relationshipStage || 5;
    const destinyNum = numerology.destinyNumber?.number || 1;
    
    if (stage <= 3) {
      return destinyNum <= 3 ? '新しい出会い' : '関係の発展';
    } else if (stage <= 6) {
      return destinyNum >= 7 ? '深い理解' : '信頼の構築';
    } else {
      return destinyNum === 6 ? '愛の深化' : '未来への歩み';
    }
  }
  
  /**
   * 注意領域を特定
   * @param {object} ai - AI分析
   * @param {object} numerology - 数秘術分析
   * @returns {array} 注意領域配列
   */
  identifyCautionAreas(ai, numerology) {
    const areas = [];
    
    if (ai.emotionalPattern?.negative?.length > 0) {
      areas.push('コミュニケーション');
    }
    
    if (numerology.destinyNumber?.number === 7) {
      areas.push('現実逃避');
    }
    
    if (ai.relationshipStage > 8) {
      areas.push('マンネリ化');
    }
    
    return areas;
  }
  
  /**
   * テンプレートから選択
   * @param {array} templates - テンプレート配列
   * @returns {string} 選択されたテンプレート
   */
  selectTemplate(templates) {
    if (!Array.isArray(templates) || templates.length === 0) {
      return 'デフォルトメッセージ';
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  /**
   * 変数を置換
   * @param {string} template - テンプレート文字列
   * @param {object} variables - 変数オブジェクト
   * @returns {string} 置換後の文字列
   */
  replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }
  
  /**
   * テーマメッセージを生成
   * @param {object} analysis - 分析結果
   * @returns {string} テーマメッセージ
   */
  generateThemeMessage(analysis) {
    const theme = analysis.primaryTheme;
    const destinyNum = analysis.destinyNumber;
    
    const themeMessages = {
      '新しい出会い': `数字${destinyNum}のエネルギーが、新鮮な愛の扉を開こうとしています。`,
      '関係の発展': `${destinyNum}の波動が、二人の絆をより深いものへと導いています。`,
      '深い理解': `神秘的な${destinyNum}の力が、心と心の真のつながりを生み出します。`,
      '信頼の構築': `安定の数字${destinyNum}が、確固たる信頼関係の礎を築きます。`,
      '愛の深化': `愛の数字${destinyNum}が、より深く豊かな愛情を育んでいます。`,
      '未来への歩み': `成長の数字${destinyNum}が、明るい未来への道筋を照らします。`
    };
    
    return themeMessages[theme] || `数字${destinyNum}があなたの恋愛を特別な方向へ導いています。`;
  }
  
  /**
   * 励ましメッセージを生成
   * @param {object} analysis - 分析結果
   * @returns {string} 励ましメッセージ
   */
  generateEncouragement(analysis) {
    const score = analysis.overallScore || 75;
    
    if (score >= 85) {
      return '今は絶好のタイミング！自信を持って行動してください。';
    } else if (score >= 70) {
      return '良い流れが来ています。焦らず自然体で進んでいきましょう。';
    } else if (score >= 55) {
      return '少し慎重に、でも希望を持って歩んでください。';
    } else {
      return '今は準備の時。内面を磨いて次のチャンスに備えましょう。';
    }
  }
  
  /**
   * 瞬間の説明を生成
   * @param {object} timing - タイミング情報
   * @param {string} action - アクション
   * @param {object} analysis - 分析結果
   * @returns {string} 説明文
   */
  generateMomentDescription(timing, action, analysis) {
    const template = this.selectTemplate(this.templates.timingTemplates);
    
    return this.replaceVariables(template, {
      day: timing.dayName,
      time: timing.time,
      action,
      planetary: timing.planetaryData?.ruler || '星'
    });
  }
  
  /**
   * ラッキーコンビネーションを生成
   * @param {number} baseNumber - ベース数字
   * @returns {string} コンビネーション
   */
  generateLuckyCombination(baseNumber) {
    const combinations = [
      `${baseNumber}時${baseNumber}分の時刻`,
      `${baseNumber}の倍数の日`,
      `月日の合計が${baseNumber}になる日`,
      `${baseNumber}回の深呼吸`,
      `${baseNumber}秒間の瞑想`
    ];
    
    return combinations[baseNumber % combinations.length];
  }
  
  /**
   * 支配的元素を決定
   * @param {object} analysis - 分析結果
   * @returns {string} 元素
   */
  determineDominantElement(analysis) {
    const destinyNum = analysis.destinyNumber;
    
    if ([1, 9].includes(destinyNum)) return '火';
    if ([2, 6].includes(destinyNum)) return '水';
    if ([3, 7].includes(destinyNum)) return '風';
    if ([4, 8].includes(destinyNum)) return '土';
    
    return '火'; // デフォルト
  }
  
  /**
   * 人生の段階を決定
   * @param {number} relationshipStage - 関係性の段階
   * @returns {string} 人生の段階
   */
  determineLifePhase(relationshipStage) {
    if (relationshipStage <= 3) return '萌芽期';
    if (relationshipStage <= 6) return '成長期';
    if (relationshipStage <= 8) return '開花期';
    return '成熟期';
  }
  
  /**
   * 精度を計算
   * @param {object} analysis - 分析結果
   * @returns {number} 精度（1-5）
   */
  calculateAccuracy(analysis) {
    let accuracy = 3; // ベース精度
    
    if (analysis.overallScore >= 80) accuracy++;
    if (analysis.cautionAreas.length === 0) accuracy++;
    if (analysis.personality.length >= 3) accuracy++;
    
    return Math.max(1, Math.min(5, accuracy));
  }
  
  /**
   * 信頼度を計算
   * @param {object} analysis - 分析結果
   * @returns {number} 信頼度（0-1）
   */
  calculateConfidence(analysis) {
    let confidence = 0.7; // ベース信頼度
    
    if (analysis.optimalTimings.length === 3) confidence += 0.1;
    if (analysis.personality.length >= 3) confidence += 0.1;
    if (analysis.overallScore >= 75) confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }
  
  /**
   * ランダム整数を生成
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {number} ランダム整数
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * お告げの妥当性を検証
   * @param {object} fortune - お告げオブジェクト
   * @returns {object} 検証済みお告げ
   */
  validateFortune(fortune) {
    // 必須フィールドの確認
    if (!fortune.mainMessage) {
      fortune.mainMessage = 'あなたに愛の祝福がありますように✨';
    }
    
    if (!fortune.destinyMoments || fortune.destinyMoments.length === 0) {
      fortune.destinyMoments = [{
        rank: 1,
        datetime: DateUtils.formatCurrentTime('YYYY-MM-DD HH:mm'),
        action: '心からの感謝を伝える',
        reason: '愛のエネルギーが高まる時',
        successRate: 75
      }];
    }
    
    if (!fortune.warnings) {
      fortune.warnings = [];
    }
    
    if (!fortune.luckyItems) {
      fortune.luckyItems = {
        color: { name: 'ピンク', meaning: '愛情', effect: '心が温かくなる' },
        emoji: { emoji: '💕', meaning: '愛', effect: '幸せな気持ちになる' },
        word: { word: 'ありがとう', meaning: '感謝', effect: '関係が深まる' },
        number: { number: 7, meaning: '神秘', effect: '直感が冴える' }
      };
    }
    
    return fortune;
  }
  
  /**
   * フォールバック用のお告げを生成
   * @param {string} userName - ユーザー名
   * @returns {object} フォールバックお告げ
   */
  generateFallbackFortune(userName = 'あなた') {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return {
      mainMessage: `${userName}さん、星々があなたの恋愛を温かく見守っています✨\n\n愛のエネルギーが徐々に高まっています。\n\n今は自分自身を大切にし、心の準備を整える時期です。`,
      
      destinyMoments: [{
        rank: 1,
        datetime: DateUtils.formatCurrentTime('YYYY-MM-DD HH:mm'),
        dayName: DateUtils.getDayOfWeek(),
        action: '心からの感謝を伝える',
        reason: '愛のエネルギーが高まる時',
        cosmicReason: '宇宙の愛が降り注ぐ瞬間',
        successRate: 75,
        description: '今この瞬間、愛の扉が静かに開かれています'
      }],
      
      warnings: [{
        type: 'general',
        message: '焦らず自然な流れに身を任せて',
        reason: '急ぎすぎると大切なものを見失いがち'
      }],
      
      luckyItems: {
        color: { name: 'ラベンダー', meaning: '心の平和', effect: '穏やかな気持ちになる' },
        emoji: { emoji: '🌙', meaning: '神秘', effect: '直感力が高まる' },
        word: { word: 'ありがとう', meaning: '感謝', effect: '心が温かくなる' },
        number: { number: 7, meaning: '完璧', effect: '調和がもたらされる' }
      },
      
      overall: {
        score: 70,
        trend: 'stable',
        trendText: '安定',
        accuracy: '★★★☆☆',
        element: '水',
        phase: '成長期'
      },
      
      metadata: {
        generatedAt: new Date().toISOString(),
        accuracy: 3,
        confidence: 0.6,
        analysisSource: {
          ai: false,
          numerology: true,
          timing: true
        },
        fallback: true
      }
    };
  }
}

module.exports = FortuneEngine;