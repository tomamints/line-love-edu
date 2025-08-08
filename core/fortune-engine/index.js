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
   * @param {object} personalInfo - プロフィール情報（オプション）
   * @returns {object} 完全なお告げ
   */
  async generateFortune(messages, userId, userName = null, personalInfo = null) {
    try {
      // ユーザープロフィール情報を取得
      if (!personalInfo) {
        const ProfilesDB = require('../database/profiles-db');
        const profile = await ProfilesDB.getProfile(userId);
        personalInfo = profile?.personalInfo || null;
      }
      
      // プロフィール情報をログ出力
      if (personalInfo) {
        console.log('📋 プロフィール情報を診断に使用:', {
          userAge: personalInfo.userAge,
          partnerAge: personalInfo.partnerAge,
          ageDiff: Math.abs((personalInfo.userAge || 0) - (personalInfo.partnerAge || 0)),
          userBirthdate: personalInfo.userBirthdate,
          partnerBirthdate: personalInfo.partnerBirthdate
        });
      }
      
      // 各種分析を並行実行（プロフィール情報を渡す）
      const [aiAnalysis, numerologyAnalysis] = await Promise.all([
        this.aiAnalyzer.analyzeConversation(messages, userId, personalInfo),
        Promise.resolve(this.numerology.performFullAnalysis(messages, userId, personalInfo))
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
      // AI分析に基づいてアクションを選択
      const actionDetail = this.selectActionBasedOnAnalysis(analysis, index);
      const reason = this.selectTemplate(this.templates.reasonTemplates);
      const cosmicReason = this.selectTemplate(this.templates.cosmicReasons);
      
      return {
        rank: index + 1,
        datetime: `${timing.date} ${timing.time}`,
        dayName: timing.dayName,
        action: actionDetail.action || actionDetail, // 後方互換性のため
        expectedResponse: actionDetail.expectedResponse,
        suggestedTiming: actionDetail.timing,
        basedOn: actionDetail.basedOn,
        isPersonalized: actionDetail.isPersonalized || false,
        reason,
        cosmicReason,
        successRate: actionDetail.successRate || Math.max(70, Math.min(95, timing.score + this.getRandomInt(-5, 5))),
        element: timing.planetaryData?.element || '火',
        energy: timing.planetaryData?.energy || '活力',
        description: this.generateMomentDescription(timing, actionDetail.action || actionDetail, analysis)
      };
    });
    
    return moments;
  }
  
  /**
   * AI分析に基づいてアクションを選択
   * @param {object} analysis - 統合分析
   * @param {number} index - アクションのインデックス（優先度）
   * @returns {object} 選択されたアクション詳細
   */
  selectActionBasedOnAnalysis(analysis, index) {
    // AI分析から得られた具体的な推奨アクションがあれば優先的に使用
    const suggestedActions = analysis.suggestedActions || [];
    if (suggestedActions.length > index && suggestedActions[index]) {
      const suggestion = suggestedActions[index];
      return {
        action: suggestion.action,
        expectedResponse: suggestion.expectedResponse,
        timing: suggestion.timing,
        successRate: suggestion.successRate || 75,
        basedOn: suggestion.basedOn || '会話パターン分析',
        isPersonalized: true
      };
    }
    
    // フォールバック: 関係性の段階に基づいた一般的なアクション
    const relationshipStage = analysis.relationshipStage || 5;
    const responsePatterns = analysis.responsePatterns || {};
    const interests = analysis.interests || [];
    
    // 相手の反応パターンを考慮したアクション生成
    const personalizedActions = this.generatePersonalizedActions(
      relationshipStage, 
      responsePatterns, 
      interests,
      analysis
    );
    
    if (personalizedActions.length > index) {
      return personalizedActions[index];
    }
    
    // デフォルトアクション
    return {
      action: '心からの感謝を伝える',
      expectedResponse: '温かい返事が期待できます',
      timing: '相手がリラックスしている時間',
      successRate: 70,
      isPersonalized: false
    };
  }
  
  /**
   * パーソナライズされたアクションを生成
   * @param {number} relationshipStage - 関係性の段階
   * @param {object} responsePatterns - 反応パターン
   * @param {array} interests - 興味関心
   * @param {object} analysis - 全体分析
   * @returns {array} アクション配列
   */
  generatePersonalizedActions(relationshipStage, responsePatterns, interests, analysis) {
    const actions = [];
    
    // 盛り上がり分析から得られた情報を優先的に使用
    const peaks = analysis.conversationPeaks?.peaks || [];
    const peakRecommendations = analysis.conversationPeaks?.recommendations || [];
    
    // 1. 最も盛り上がった話題に基づくアクション
    if (peaks.length > 0 && peaks[0].topics.length > 0) {
      const topPeak = peaks[0];
      const mainTopic = topPeak.topics[0];
      
      actions.push({
        action: `「${mainTopic.topic}」の話題を振る（例：最近${mainTopic.topic}はどう？）`,
        expectedResponse: `盛り上がり度${topPeak.excitementScore}%で反応してくれるでしょう`,
        timing: analysis.conversationPeaks?.patterns?.bestTimeOfDay || '夜',
        successRate: Math.min(95, topPeak.excitementScore + 10),
        basedOn: `過去の盛り上がり分析（${mainTopic.topic}で特に盛り上がった）`,
        isPersonalized: true
      });
    }
    
    // 2. 相手が素早く反応する話題に基づいたアクション
    if (responsePatterns.enthusiasticResponse && responsePatterns.enthusiasticResponse.length > 0) {
      const topic = responsePatterns.enthusiasticResponse[0];
      actions.push({
        action: `${topic}について「最近どう？」と聞いてみる`,
        expectedResponse: `${topic}について嬉しそうに詳しく話してくれるでしょう`,
        timing: analysis.optimalTiming?.timeOfDay || '夜',
        successRate: 90,
        basedOn: '熱心な反応パターン',
        isPersonalized: true
      });
    }
    
    // 2. 共通の興味に基づいたアクション
    if (interests.length > 0) {
      const interest = interests[0];
      if (relationshipStage <= 3) {
        actions.push({
          action: `「${interest}って興味ある？」と軽く聞いてみる`,
          expectedResponse: `「実は好きなんだ！」と会話が弾むでしょう`,
          timing: 'リラックスタイム',
          successRate: 85,
          isPersonalized: true
        });
      } else if (relationshipStage <= 6) {
        actions.push({
          action: `${interest}の新しい情報をシェアする`,
          expectedResponse: `「へー！知らなかった！」と興味を示してくれるでしょう`,
          timing: '夕方から夜',
          successRate: 87,
          isPersonalized: true
        });
      } else {
        actions.push({
          action: `「今度一緒に${interest}を楽しまない？」と誘う`,
          expectedResponse: `「いいね！いつにする？」と前向きな返事`,
          timing: '週末の夜',
          successRate: 82,
          isPersonalized: true
        });
      }
    }
    
    // 3. 感情パターンに基づいたアクション
    if (analysis.emotionalPattern?.positive && analysis.emotionalPattern.positive.length > 0) {
      const positiveTrigger = analysis.emotionalPattern.positive[0];
      actions.push({
        action: `${positiveTrigger}を意識したメッセージを送る`,
        expectedResponse: `嬉しそうな絵文字付きの返信が来るでしょう`,
        timing: analysis.optimalTiming?.mood || 'リラックス時',
        successRate: 88,
        basedOn: 'ポジティブな感情パターン',
        isPersonalized: true
      });
    }
    
    // 4. 関係性の段階に応じた定番アクション
    if (relationshipStage <= 3) {
      actions.push({
        action: '「今日はどんな一日だった？」と聞く',
        expectedResponse: '日常の出来事を気軽に話してくれるでしょう',
        timing: '夜20-22時',
        successRate: 75,
        basedOn: '関係性初期の定番パターン',
        isPersonalized: true
      });
    } else if (relationshipStage <= 6) {
      actions.push({
        action: '相手の最近の投稿や話題に触れて褒める',
        expectedResponse: '「気づいてくれて嬉しい！」と喜ばれるでしょう',
        timing: '相手の活動時間',
        successRate: 83,
        basedOn: '関係性中期の効果的パターン',
        isPersonalized: true
      });
    } else {
      actions.push({
        action: '「最近会えてないけど、元気にしてる？」と気遣う',
        expectedResponse: '「心配してくれてありがとう」と温かい返事',
        timing: '週末の午後',
        successRate: 86,
        basedOn: '関係性成熟期の信頼パターン',
        isPersonalized: true
      });
    }
    
    return actions;
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
    
    // パワーストーンを追加
    const powerStones = [
      { name: 'ローズクォーツ', meaning: '愛を引き寄せる', effect: '優しさとロマンスを増幅' },
      { name: 'アメジスト', meaning: '直感力を高める', effect: '真実の愛へ導く' },
      { name: 'ムーンストーン', meaning: '感情の安定', effect: '新しい出会いを呼び込む' },
      { name: 'アクアマリン', meaning: 'コミュニケーション促進', effect: '深い理解を生む' },
      { name: 'ターコイズ', meaning: '守護の石', effect: '恋愛関係を守る' },
      { name: 'ラピスラズリ', meaning: '真実の愛', effect: '魂のレベルでの絆' },
      { name: 'ガーネット', meaning: '情熱の石', effect: '愛情を深める' }
    ];
    const stoneIndex = luckyNumber % powerStones.length;
    
    // 幸運の数字を複数生成
    const luckyNumbers = [
      this.templates.luckyItems.numbers[numberIndex],
      { number: luckyNumber * 2, meaning: '倍増しのエネルギー', effect: '愛が倍増しする' },
      { number: luckyNumber + 16, meaning: '未来の約束', effect: '長期的な縁を結ぶ' }
    ];
    
    return {
      color: this.templates.luckyItems.colors[colorIndex],
      emoji: this.templates.luckyItems.emojis[emojiIndex],
      word: this.templates.luckyItems.words[wordIndex],
      number: this.templates.luckyItems.numbers[numberIndex], // 互換性のため残す
      numbers: luckyNumbers, // 新しい配列形式
      stone: powerStones[stoneIndex],
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
    
    // キーワードを生成
    const keywords = [
      '新たな扉', '愛の決断', '心の絆', '運命の出会い', '感謝の循環',
      '信頼の架け橋', '共感の波動', '理解の光', '二人の未来', '永遠の約束'
    ];
    const keyword = analysis.suggestedActions?.[0]?.keyword || 
                   keywords[Math.floor(Math.random() * keywords.length)];
    
    // コズミックメッセージを生成
    const cosmicMessages = [
      '金星と木星が調和し',
      '月のエネルギーが満ちて',
      '水星が逆行から順行へ転じ',
      '土星の試練を乗り越え',
      '太陽と月が美しく重なり',
      '天王星の変革のエネルギーが強まり',
      '海王星の直感力が高まり',
      '冥王星の再生力が働き'
    ];
    const cosmicMessage = cosmicMessages[Math.floor(Math.random() * cosmicMessages.length)];
    
    return {
      score,
      trend,
      trendText: this.selectTemplate(this.templates.trends[trend]),
      accuracy: this.templates.accuracyStars[Math.ceil(score / 20)] || '★★★☆☆',
      element: this.determineDominantElement(analysis),
      phase: this.determineLifePhase(analysis.relationshipStage),
      keyword,
      cosmicMessage
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
      '新しい出会い': `数字${destinyNum}のエネルギーが、お二人に新鮮な愛の扉を開こうとしています。`,
      '関係の発展': `${destinyNum}の波動が、二人の絆をより深いものへと導いています。`,
      '深い理解': `神秘的な${destinyNum}の力が、お二人の心と心の真のつながりを生み出します。`,
      '信頼の構築': `安定の数字${destinyNum}が、二人の確固たる信頼関係の礎を築きます。`,
      '愛の深化': `愛の数字${destinyNum}が、お二人のより深く豊かな愛情を育んでいます。`,
      '未来への歩み': `成長の数字${destinyNum}が、二人の明るい未来への道筋を照らします。`
    };
    
    return themeMessages[theme] || `数字${destinyNum}がお二人の恋愛を特別な方向へ導いています。`;
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