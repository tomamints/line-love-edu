/**
 * プレミアム恋愛レポート生成器
 * 超詳細な恋愛診断書をPDF形式で生成
 */

const FortuneEngine = require('../fortune-engine');
const ConversationPeaksAnalyzer = require('../ai-analyzer/conversation-peaks');
const ScoringLogic = require('./scoring-logic');

class PremiumReportGenerator {
  constructor() {
    this.fortuneEngine = new FortuneEngine();
    this.peaksAnalyzer = new ConversationPeaksAnalyzer();
    this.scoringLogic = new ScoringLogic();
  }
  
  /**
   * プレミアムレポートを生成
   * @param {array} messages - メッセージ履歴
   * @param {string} userId - ユーザーID
   * @param {string} userName - ユーザー名
   * @param {object} existingAiInsights - 既存のAI分析結果（Step 3で取得済み）
   * @returns {object} 詳細レポートデータ
   */
  async generatePremiumReport(messages, userId, userName = 'あなた', existingAiInsights = null) {
    try {
      // 基本分析を実行
      const fortune = await this.fortuneEngine.generateFortune(messages, userId, userName);
      
      // AIによる深い洞察を取得（既存のものがあればそれを使用）
      const aiInsights = existingAiInsights || await this.getAIInsights(messages, fortune);
      
      // 追加の詳細分析（AI洞察を含む）
      const detailedAnalysis = await this.performDetailedAnalysis(messages, fortune, aiInsights);
      
      // レポート構成
      const report = {
        // 基本情報
        metadata: {
          generatedAt: new Date().toISOString(),
          reportId: this.generateReportId(userId),
          userName,
          reportType: 'premium',
          version: '1.0'
        },
        
        // 1. エグゼクティブサマリー
        executiveSummary: this.generateExecutiveSummary(fortune, detailedAnalysis),
        
        // 2. 詳細相性分析（20項目以上）
        compatibilityAnalysis: this.generateCompatibilityAnalysis(detailedAnalysis),
        
        // 3. 会話パターン分析
        conversationAnalysis: this.generateConversationAnalysis(detailedAnalysis),
        
        // 4. 月別恋愛運勢カレンダー
        monthlyForecast: this.generateMonthlyForecast(fortune, detailedAnalysis),
        
        // 5. パーソナライズされたアクションプラン（40項目）
        actionPlan: this.generateExtendedActionPlan(fortune, detailedAnalysis),
        
        // 6. 危険信号とその対策
        riskAnalysis: this.generateRiskAnalysis(detailedAnalysis),
        
        // 7. 告白成功の最適戦略
        confessionStrategy: this.generateConfessionStrategy(fortune, detailedAnalysis),
        
        // 8. 長期的な関係構築ロードマップ
        relationshipRoadmap: this.generateRelationshipRoadmap(detailedAnalysis),
        
        // 9. 付録：詳細データ
        appendix: {
          rawAnalysis: fortune,
          peaksData: detailedAnalysis.conversationPeaks,
          statisticalData: detailedAnalysis.statistics
        }
      };
      
      return report;
      
    } catch (error) {
      console.error('プレミアムレポート生成エラー:', error);
      throw new Error('レポート生成に失敗しました');
    }
  }
  
  /**
   * 詳細分析を実行
   * @param {array} messages - メッセージ履歴
   * @param {object} fortune - 基本運勢データ
   * @returns {object} 詳細分析結果
   */
  async performDetailedAnalysis(messages, fortune, aiInsights) {
    // 会話統計の詳細分析
    const statistics = this.calculateDetailedStatistics(messages);
    
    // 時間帯別分析
    const timePatterns = this.analyzeTimePatterns(messages);
    
    // 感情の変遷分析
    const emotionTimeline = this.analyzeEmotionTimeline(messages);
    
    // 話題の多様性分析
    const topicDiversity = this.analyzeTopicDiversity(messages);
    
    // 関係性の進展度分析
    const relationshipProgression = this.analyzeRelationshipProgression(messages);
    
    return {
      ...fortune,
      statistics,
      timePatterns,
      emotionTimeline,
      topicDiversity,
      relationshipProgression,
      aiInsights // AI洞察を含める
    };
  }
  
  /**
   * エグゼクティブサマリーを生成
   * @param {object} fortune - 基本運勢
   * @param {object} analysis - 詳細分析
   * @returns {object} サマリー
   */
  generateExecutiveSummary(fortune, analysis) {
    const overallScore = fortune.overall?.score || 75;
    const relationshipStage = analysis.relationshipStage || 5;
    const peaksCount = analysis.conversationPeaks?.peaks?.length || 0;
    
    return {
      overallAssessment: {
        score: overallScore,
        grade: this.getGradeFromScore(overallScore),
        description: analysis.aiInsights?.emotionalInsights?.futureProspects || this.getScoreDescription(overallScore)
      },
      keyFindings: analysis.aiInsights?.detailedStrengths?.slice(0, 4).map(s => s.title) || [
        `現在の関係性レベル: ${relationshipStage}/10 (${this.getRelationshipStageText(relationshipStage)})`,
        `会話の盛り上がりポイント: ${peaksCount}個発見`,
        `推定成功率: ${this.calculateSuccessRate(analysis)}%`,
        `最適なアプローチ方法: ${this.getOptimalApproach(analysis)}`
      ],
      recommendations: analysis.aiInsights?.actionPlan?.slice(0, 3).map(a => a.action) || [
        '最も効果的な3つのアクション',
        '避けるべき2つのNG行動',
        `最適な告白タイミング: ${this.calculateOptimalConfessionTiming(analysis)}`
      ]
    };
  }
  
  /**
   * 詳細相性分析を生成（20項目以上）
   * @param {object} analysis - 詳細分析
   * @returns {object} 相性分析
   */
  generateCompatibilityAnalysis(analysis) {
    const compatibilityItems = [
      // コミュニケーション系
      { category: 'コミュニケーション', item: '返信速度の相性', score: this.calculateResponseSpeedCompatibility(analysis) },
      { category: 'コミュニケーション', item: 'メッセージ長度の相性', score: this.calculateMessageLengthCompatibility(analysis) },
      { category: 'コミュニケーション', item: '絵文字使用の相性', score: this.calculateEmojiCompatibility(analysis) },
      { category: 'コミュニケーション', item: '会話のテンポ', score: this.calculateConversationTempo(analysis) },
      { category: 'コミュニケーション', item: '質問頻度バランス', score: this.calculateQuestionBalance(analysis) },
      
      // 感情・性格系
      { category: '感情・性格', item: '感情表現の相性', score: this.calculateEmotionalExpression(analysis) },
      { category: '感情・性格', item: 'ユーモアセンス', score: this.calculateHumorCompatibility(analysis) },
      { category: '感情・性格', item: '共感力レベル', score: this.calculateEmpathyLevel(analysis) },
      { category: '感情・性格', item: 'ポジティブ度合い', score: this.calculatePositivityLevel(analysis) },
      { category: '感情・性格', item: 'サポート姿勢', score: this.calculateSupportiveness(analysis) },
      
      // 興味・価値観系
      { category: '興味・価値観', item: '共通の趣味・関心', score: this.calculateCommonInterests(analysis) },
      { category: '興味・価値観', item: '価値観の一致度', score: this.calculateValueAlignment(analysis) },
      { category: '興味・価値観', item: '将来観の相性', score: this.calculateFutureVisionCompatibility(analysis) },
      { category: '興味・価値観', item: 'ライフスタイル', score: this.calculateLifestyleCompatibility(analysis) },
      
      // タイミング・行動系
      { category: 'タイミング・行動', item: '活動時間帯の相性', score: this.calculateTimeCompatibility(analysis) },
      { category: 'タイミング・行動', item: '連絡頻度の相性', score: this.calculateContactFrequencyCompatibility(analysis) },
      { category: 'タイミング・行動', item: 'デートプラン相性', score: this.calculateDateCompatibility(analysis) },
      { category: 'タイミング・行動', item: '決断スピード', score: this.calculateDecisionSpeedCompatibility(analysis) },
      
      // 関係性構築系
      { category: '関係性構築', item: '信頼構築スピード', score: this.calculateTrustBuildingSpeed(analysis) },
      { category: '関係性構築', item: '関係性の安定度', score: this.calculateRelationshipStability(analysis) },
      { category: '関係性構築', item: '成長ポテンシャル', score: this.calculateGrowthPotential(analysis) },
      { category: '関係性構築', item: '長期的継続性', score: this.calculateLongTermViability(analysis) }
    ];
    
    // カテゴリー別の平均スコアを計算
    const categoryAverages = this.calculateCategoryAverages(compatibilityItems);
    
    return {
      overallCompatibilityScore: this.calculateOverallCompatibility(compatibilityItems),
      categoryBreakdown: categoryAverages,
      detailedItems: compatibilityItems,
      strengthAreas: compatibilityItems.filter(item => item.score >= 80).slice(0, 5),
      improvementAreas: compatibilityItems.filter(item => item.score < 60).slice(0, 3)
    };
  }
  
  /**
   * 会話パターン分析を生成
   * @param {object} analysis - 詳細分析
   * @returns {object} 会話分析
   */
  generateConversationAnalysis(analysis) {
    return {
      conversationStyle: {
        yourStyle: analysis.aiInsights?.communicationAnalysis?.userStyle || this.analyzeYourConversationStyle(analysis),
        partnerStyle: analysis.aiInsights?.communicationAnalysis?.partnerStyle || this.analyzePartnerConversationStyle(analysis),
        compatibility: analysis.aiInsights?.communicationAnalysis?.dynamics || this.calculateStyleCompatibility(analysis)
      },
      
      communicationPatterns: {
        responseTimePattern: this.analyzeResponseTimePattern(analysis),
        messageLengthPattern: this.analyzeMessageLengthPattern(analysis),
        initiationPattern: this.analyzeInitiationPattern(analysis)
      },
      
      topicAnalysis: {
        favoriteTopics: this.identifyFavoriteTopics(analysis),
        avoidedTopics: this.identifyAvoidedTopics(analysis),
        engagementByTopic: this.calculateTopicEngagement(analysis)
      },
      
      improvements: {
        conversationTips: this.generateConversationTips(analysis),
        topicSuggestions: this.suggestNewTopics(analysis),
        timingAdvice: this.generateTimingAdvice(analysis)
      }
    };
  }
  
  /**
   * 月別恋愛運勢カレンダーを生成
   * @param {object} fortune - 基本運勢
   * @param {object} analysis - 詳細分析
   * @returns {object} 月別予測
   */
  generateMonthlyForecast(fortune, analysis) {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      
      months.push({
        month: `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月`,
        loveScore: this.calculateMonthlyScore(fortune, i),
        theme: this.generateMonthlyTheme(fortune, i),
        opportunities: this.generateMonthlyOpportunities(analysis, i),
        cautions: this.generateMonthlyCautions(analysis, i),
        bestDates: this.generateBestDates(fortune, targetDate),
        recommendedActions: this.generateMonthlyActions(analysis, i)
      });
    }
    
    // AI洞察の月別予測があれば優先的に使用
    const aiMonthlyPredictions = analysis.aiInsights?.monthlyPredictions;
    if (aiMonthlyPredictions && aiMonthlyPredictions.length > 0) {
      const enrichedMonths = months.map((month, index) => {
        const aiPrediction = aiMonthlyPredictions[index];
        if (aiPrediction) {
          return {
            ...month,
            theme: aiPrediction.prediction?.substring(0, 50) + '...' || month.theme,
            detailedPrediction: aiPrediction.prediction,
            keyEvents: aiPrediction.keyEvents || []
          };
        }
        return month;
      });
      
      return {
        yearlyOverview: analysis.aiInsights?.uniqueInsights || this.generateYearlyOverview(enrichedMonths),
        monthlyDetails: enrichedMonths,
        seasonalHighlights: this.generateSeasonalTrends(enrichedMonths),
        yearEndPrediction: analysis.aiInsights?.confessionStrategy?.optimalTiming || this.generateYearEndPrediction(enrichedMonths)
      };
    }
    
    return {
      yearlyOverview: this.generateYearlyOverview(months),
      monthlyDetails: months,
      seasonalTrends: this.generateSeasonalTrends(months)
    };
  }
  
  /**
   * 拡張アクションプランを生成（40項目）
   * @param {object} fortune - 基本運勢
   * @param {object} analysis - 詳細分析
   * @returns {object} アクションプラン
   */
  generateExtendedActionPlan(fortune, analysis) {
    // AI洞察のアクションプランがあれば優先的に使用
    if (analysis.aiInsights?.actionPlan && analysis.aiInsights.actionPlan.length > 0) {
      const aiActions = analysis.aiInsights.actionPlan.map((action, index) => ({
        id: index + 1,
        category: '総合的なアプローチ',
        title: action.action,
        description: action.details || action.expectedResult,
        priority: action.priority.toLowerCase(),
        difficulty: action.priority === 'HIGH' ? 'medium' : 'easy',
        expectedImpact: action.expectedResult,
        implementationTiming: action.timing,
        successRate: 85 + Math.floor(Math.random() * 10)
      }));
      
      // 追加のアクションを生成
      const additionalActions = [];
      const categories = [
        { name: '日常会話の改善', count: 5 },
        { name: 'デート・お出かけ', count: 4 },
        { name: '感情的なつながり', count: 4 },
        { name: '信頼関係の構築', count: 3 },
        { name: '将来への発展', count: 3 }
      ];
      
      let actionId = aiActions.length + 1;
      categories.forEach(category => {
        const categoryActions = this.generateCategoryActions(category.name, category.count, analysis);
        categoryActions.forEach(action => {
          action.id = actionId++;
        });
        additionalActions.push(...categoryActions);
      });
      
      const allActions = [...aiActions, ...additionalActions];
      
      return {
        totalActions: allActions.length,
        categories: ['総合的なアプローチ', ...categories.map(cat => cat.name)],
        priorityActions: allActions.filter(action => action.priority === 'high').slice(0, 15),
        allActions: allActions,
        implementationGuide: this.generateImplementationGuide(allActions)
      };
    }
    
    // フォールバック：従来の方法でアクションを生成
    const actions = [];
    const categories = [
      { name: '日常会話の改善', count: 8 },
      { name: 'デート・お出かけ', count: 6 },
      { name: '感情的なつながり', count: 6 },
      { name: '信頼関係の構築', count: 5 },
      { name: '将来への発展', count: 5 },
      { name: '困った時の対処法', count: 4 },
      { name: '特別な記念日', count: 3 },
      { name: '長期的な関係維持', count: 3 }
    ];
    
    categories.forEach(category => {
      const categoryActions = this.generateCategoryActions(category.name, category.count, analysis);
      actions.push(...categoryActions);
    });
    
    return {
      totalActions: actions.length,
      categories: categories.map(cat => cat.name),
      priorityActions: actions.filter(action => action.priority === 'high').slice(0, 10),
      allActions: actions,
      implementationGuide: this.generateImplementationGuide(actions)
    };
  }
  
  /**
   * リスク分析を生成
   * @param {object} analysis - 詳細分析
   * @returns {object} リスク分析
   */
  generateRiskAnalysis(analysis) {
    const risks = this.identifyPotentialRisks(analysis);
    const dangerousPeriods = this.identifyDangerousPeriods(analysis);
    
    return {
      riskLevel: this.calculateOverallRiskLevel(risks),
      identifiedRisks: risks,
      dangerousPeriods,
      preventionStrategies: this.generatePreventionStrategies(risks),
      emergencyPlan: this.generateEmergencyPlan(analysis)
    };
  }
  
  /**
   * 告白戦略を生成
   * @param {object} fortune - 基本運勢
   * @param {object} analysis - 詳細分析
   * @returns {object} 告白戦略
   */
  generateConfessionStrategy(fortune, analysis) {
    return {
      readinessAssessment: {
        currentReadiness: this.assessConfessionReadiness(analysis),
        requiredSteps: this.identifyRequiredSteps(analysis),
        timeframe: this.calculateOptimalTimeframe(analysis)
      },
      
      strategyPlan: {
        approach: this.determineOptimalApproach(analysis),
        timing: this.calculateOptimalConfessionTiming(analysis),
        location: this.suggestOptimalLocation(analysis),
        method: this.suggestConfessionMethod(analysis)
      },
      
      preparation: {
        mentalPreparation: this.generateMentalPreparation(analysis),
        conversationFlow: this.generateConfessionScript(analysis),
        backupPlans: this.generateBackupPlans(analysis)
      },
      
      aftercare: {
        positiveResponsePlan: this.generatePositiveResponsePlan(analysis),
        negativeResponsePlan: this.generateNegativeResponsePlan(analysis),
        relationshipNext: this.generateRelationshipNextSteps(analysis)
      }
    };
  }
  
  /**
   * 関係構築ロードマップを生成
   * @param {object} analysis - 詳細分析
   * @returns {object} ロードマップ
   */
  generateRelationshipRoadmap(analysis) {
    const currentStage = analysis.relationshipStage || 5;
    const milestones = [];
    
    // 現在のステージから10まで、各段階のマイルストーンを生成
    for (let stage = currentStage + 1; stage <= 10; stage++) {
      milestones.push({
        stage,
        title: this.getStageTitle(stage),
        description: this.getStageDescription(stage),
        objectives: this.getStageObjectives(stage),
        actions: this.getStageActions(stage, analysis),
        indicators: this.getStageIndicators(stage),
        estimatedTimeframe: this.getStageTimeframe(stage),
        challenges: this.getStageChallenges(stage),
        successMetrics: this.getStageSuccessMetrics(stage)
      });
    }
    
    return {
      currentStage: {
        level: currentStage,
        title: this.getStageTitle(currentStage),
        assessment: this.assessCurrentStage(analysis)
      },
      roadmap: milestones,
      overallTimeline: this.calculateOverallTimeline(milestones),
      keyMilestones: this.identifyKeyMilestones(milestones)
    };
  }
  
  // ヘルパーメソッド群（実装の詳細は省略、実際には各種計算ロジックを実装）
  generateReportId(userId) {
    return `RPT_${userId}_${Date.now()}`;
  }
  
  getGradeFromScore(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }
  
  getScoreDescription(score) {
    if (score >= 90) return '非常に良好な関係性です';
    if (score >= 80) return '良好な関係性が築けています';
    if (score >= 70) return '安定した関係性です';
    if (score >= 60) return '改善の余地があります';
    return '注意深いアプローチが必要です';
  }
  
  getRelationshipStageText(stage) {
    const stages = {
      1: '出会い・認知段階',
      2: '興味・関心段階', 
      3: '友好関係段階',
      4: '親密度向上段階',
      5: '信頼関係構築段階',
      6: '特別な関係段階',
      7: '相互理解深化段階',
      8: '恋愛感情醸成段階',
      9: '告白準備段階',
      10: '恋人関係段階'
    };
    return stages[stage] || '関係性発展中';
  }
  
  calculateSuccessRate(analysis) {
    // 複数の要素から成功率を計算
    const baseRate = 70;
    let bonus = 0;
    
    if (analysis.conversationPeaks?.peaks?.length > 0) bonus += 10;
    if (analysis.relationshipStage >= 6) bonus += 15;
    if (analysis.overall?.score >= 80) bonus += 10;
    
    return Math.min(95, baseRate + bonus);
  }
  
  getOptimalApproach(analysis) {
    const stage = analysis.relationshipStage || 5;
    if (stage <= 3) return '友好関係の構築';
    if (stage <= 6) return '信頼関係の深化';
    return '恋愛関係への発展';
  }
  
  calculateOptimalConfessionTiming(analysis) {
    // 現在の関係性レベルと分析結果から最適タイミングを算出
    const stage = analysis.relationshipStage || 5;
    const score = analysis.overall?.score || 75;
    
    if (stage >= 8 && score >= 85) return '今すぐ〜1ヶ月以内';
    if (stage >= 7 && score >= 75) return '2〜3ヶ月以内';
    if (stage >= 6) return '3〜6ヶ月以内';
    return '6ヶ月以上の関係構築が必要';
  }
  
  // 簡易実装（実際はより詳細な分析ロジックを実装）
  calculateDetailedStatistics(messages) {
    // メッセージが空またはtextがない場合のデフォルト値
    if (!messages || messages.length === 0) {
      return {
        totalMessages: 0,
        averageLength: 0,
        responseRate: 0,
        averageResponseTime: '不明'
      };
    }
    
    const totalLength = messages.reduce((sum, msg) => sum + (msg.text ? msg.text.length : 0), 0);
    return {
      totalMessages: messages.length,
      averageLength: messages.length > 0 ? totalLength / messages.length : 0,
      responseRate: 0.85, // 実際は計算
      averageResponseTime: '15分' // 実際は計算
    };
  }
  
  analyzeTimePatterns(messages) {
    return {
      mostActiveHours: ['20:00-22:00', '12:00-13:00'],
      weekdayVsWeekend: '平日70%, 週末30%',
      peakDays: ['水曜日', '金曜日']
    };
  }
  
  analyzeEmotionTimeline(messages) {
    return {
      trend: '上昇傾向',
      recentScore: 85,
      improvement: '+15pt (過去1ヶ月)'
    };
  }
  
  analyzeTopicDiversity(messages) {
    return {
      totalTopics: 12,
      dominantTopics: ['日常', '仕事', '趣味'],
      diversityScore: 78
    };
  }
  
  analyzeRelationshipProgression(messages) {
    return {
      progressionRate: 'やや早い',
      milestonesPassed: 5,
      nextMilestone: '深い個人的な話の共有'
    };
  }
  
  // 詳細な分析ロジックを使用したヘルパーメソッド
  calculateResponseSpeedCompatibility(analysis) { 
    return this.scoringLogic.calculateResponseSpeedCompatibility(analysis);
  }
  
  calculateMessageLengthCompatibility(analysis) { 
    return this.scoringLogic.calculateMessageLengthCompatibility(analysis);
  }
  
  calculateEmojiCompatibility(analysis) { 
    return this.scoringLogic.calculateEmojiCompatibility(analysis);
  }
  
  calculateConversationTempo(analysis) { 
    return this.scoringLogic.calculateConversationTempo(analysis);
  }
  
  calculateQuestionBalance(analysis) { 
    return this.scoringLogic.calculateQuestionBalance(analysis);
  }
  
  calculateEmotionalExpression(analysis) { 
    return this.scoringLogic.calculateEmotionalExpression(analysis);
  }
  
  calculateHumorCompatibility(analysis) { 
    return this.scoringLogic.calculateHumorCompatibility(analysis);
  }
  
  calculateEmpathyLevel(analysis) { 
    return this.scoringLogic.calculateEmpathyLevel(analysis);
  }
  
  calculatePositivityLevel(analysis) { 
    return this.scoringLogic.calculatePositivityLevel(analysis);
  }
  
  calculateSupportiveness(analysis) { 
    return this.scoringLogic.calculateSupportiveness(analysis);
  }
  
  calculateCommonInterests(analysis) { 
    return this.scoringLogic.calculateCommonInterests(analysis);
  }
  
  calculateValueAlignment(analysis) { 
    return this.scoringLogic.calculateValueAlignment(analysis);
  }
  
  calculateFutureVisionCompatibility(analysis) { 
    return this.scoringLogic.calculateFutureVisionCompatibility(analysis);
  }
  
  calculateLifestyleCompatibility(analysis) { 
    return this.scoringLogic.calculateLifestyleCompatibility(analysis);
  }
  
  calculateTimeCompatibility(analysis) { 
    return this.scoringLogic.calculateTimeCompatibility(analysis);
  }
  
  calculateContactFrequencyCompatibility(analysis) { 
    return this.scoringLogic.calculateContactFrequencyCompatibility(analysis);
  }
  
  calculateDateCompatibility(analysis) { 
    return this.scoringLogic.calculateDateCompatibility(analysis);
  }
  
  calculateDecisionSpeedCompatibility(analysis) { 
    return this.scoringLogic.calculateDecisionSpeedCompatibility(analysis);
  }
  
  calculateTrustBuildingSpeed(analysis) { 
    return this.scoringLogic.calculateTrustBuildingSpeed(analysis);
  }
  
  calculateRelationshipStability(analysis) { 
    return this.scoringLogic.calculateRelationshipStability(analysis);
  }
  
  calculateGrowthPotential(analysis) { 
    return this.scoringLogic.calculateGrowthPotential(analysis);
  }
  
  calculateLongTermViability(analysis) { 
    return this.scoringLogic.calculateLongTermViability(analysis);
  }
  
  calculateCategoryAverages(items) {
    const categories = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item.score);
    });
    
    const averages = {};
    Object.entries(categories).forEach(([category, scores]) => {
      averages[category] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });
    
    return averages;
  }
  
  calculateOverallCompatibility(items) {
    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    return Math.round(totalScore / items.length);
  }
  
  analyzeYourConversationStyle(analysis) {
    return '積極的で思いやりのあるコミュニケーションスタイル。相手のことを気にかけ、会話を盛り上げようとする姿勢が見られます。';
  }
  
  analyzePartnerConversationStyle(analysis) {
    return '丁寧で協調的なコミュニケーションスタイル。相手の話をよく聞き、適切な反応を示してくれます。';
  }
  
  calculateStyleCompatibility(analysis) {
    return '相互補完的で良好な関係性。お互いの良さを引き出し合える関係です。';
  }
  
  generateYearlyOverview(months) {
    return '全体的に上昇傾向で、特に春から夏にかけて恋愛運が高まります。';
  }
  
  generateSeasonalTrends(months) {
    return {
      spring: '新しい始まりの季節。関係性に新展開が期待できます。',
      summer: '情熱的な時期。積極的なアプローチが効果的です。',
      autumn: '深まりの季節。お互いをより深く理解し合える時期です。',
      winter: '安定の時期。将来について話し合うのに適しています。'
    };
  }
  
  generateMonthlyTheme(fortune, monthIndex) {
    const themes = [
      '新しい始まり', '信頼の構築', '感情の深化', '積極的なアプローチ',
      '安定した関係', '情熱的な時期', '理解の深化', '将来への展望',
      '成熟の時期', '決断の時', '絆の強化', '新年への準備'
    ];
    return themes[monthIndex % themes.length];
  }
  
  calculateMonthlyScore(fortune, monthIndex) {
    const baseScore = fortune.overall?.score || 75;
    const variation = Math.sin(monthIndex * 0.5) * 10 + Math.random() * 10 - 5;
    return Math.max(40, Math.min(95, Math.round(baseScore + variation)));
  }
  
  generateMonthlyOpportunities(analysis, monthIndex) {
    const opportunities = [
      ['新しい場所でのデート', '共通の趣味を始める'],
      ['深い話をする機会', '相手の家族との接点'],
      ['特別なイベント参加', '旅行計画を立てる'],
      ['記念日の設定', 'プレゼント交換'],
      ['将来の話し合い', '同棲の検討']
    ];
    return opportunities[monthIndex % opportunities.length];
  }
  
  generateMonthlyCautions(analysis, monthIndex) {
    const cautions = [
      ['急激な変化を求めすぎない'],
      ['相手のペースを尊重する'],
      ['忙しい時期の配慮が必要'],
      ['金銭面での注意が必要'],
      ['家族や友人との関係性に注意']
    ];
    return cautions[monthIndex % cautions.length];
  }
  
  generateBestDates(fortune, targetDate) {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(targetDate.getTime() + i * 6 * 24 * 60 * 60 * 1000);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    return dates;
  }
  
  generateMonthlyActions(analysis, monthIndex) {
    const actions = [
      ['新しい場所を提案する', '相手の話をより深く聞く'],
      ['感謝の気持ちを伝える', '小さなサプライズをする'],
      ['将来について話し合う', '家族の話をする'],
      ['記念日を作る', '特別な時間を過ごす'],
      ['お互いの目標を共有する', '来年の計画を立てる']
    ];
    return actions[monthIndex % actions.length];
  }
  
  generateCategoryActions(categoryName, count, analysis) {
    const actionTemplates = {
      '日常会話の改善': [
        { title: '朝の挨拶をより温かく', description: '「おはよう」に一言プラスしてみる', successRate: 85, timing: '朝の時間帯', priority: 'high', category: '日常会話の改善' },
        { title: '相手の話への反応を豊かに', description: '「へー」だけでなく具体的な感想を', successRate: 80, timing: '会話中', priority: 'high', category: '日常会話の改善' }
      ],
      'デート・お出かけ': [
        { title: '新しい場所の提案', description: '二人で行ったことのない場所を提案', successRate: 75, timing: '週末前', priority: 'medium', category: 'デート・お出かけ' }
      ],
      '感情的なつながり': [
        { title: '感謝の気持ちを具体的に', description: '「ありがとう」の理由を詳しく伝える', successRate: 90, timing: '自然な流れで', priority: 'high', category: '感情的なつながり' }
      ]
    };
    
    const defaultActions = Array(count).fill().map((_, i) => ({
      title: `${categoryName}のアクション${i + 1}`,
      description: `${categoryName}に関する具体的な改善提案`,
      successRate: Math.floor(Math.random() * 30) + 70,
      timing: '適切なタイミングで',
      priority: i < count / 3 ? 'high' : i < count * 2 / 3 ? 'medium' : 'low',
      category: categoryName
    }));
    
    return actionTemplates[categoryName] || defaultActions;
  }
  
  generateImplementationGuide(actions) {
    return {
      step1: '優先度の高いアクションから実行してください',
      step2: '1週間に2-3個のペースで実践することをお勧めします',
      step3: '効果が見られたアクションは継続してください',
      step4: '相手の反応を見ながら調整していきましょう'
    };
  }
  
  identifyPotentialRisks(analysis) {
    return [
      {
        title: '連絡頻度の不均衡',
        description: 'あなたからの連絡が多すぎる可能性があります',
        level: 'medium',
        prevention: '相手からの連絡も待つ時間を作りましょう'
      },
      {
        title: '関係性の進展速度',
        description: '相手のペースを上回っている可能性があります',
        level: 'low',
        prevention: '相手の反応を注意深く観察しましょう'
      }
    ];
  }
  
  identifyDangerousPeriods(analysis) {
    return [
      { period: '平日の深夜', reason: '相手が疲れている可能性が高い' },
      { period: '月曜日の朝', reason: '週初めで忙しい可能性がある' }
    ];
  }
  
  calculateOverallRiskLevel(risks) {
    const highRisks = risks.filter(r => r.level === 'high').length;
    if (highRisks > 0) return 'high';
    
    const mediumRisks = risks.filter(r => r.level === 'medium').length;
    if (mediumRisks > 1) return 'medium';
    
    return 'low';
  }
  
  generatePreventionStrategies(risks) {
    return risks.map(risk => ({
      risk: risk.title,
      strategy: risk.prevention
    }));
  }
  
  generateEmergencyPlan(analysis) {
    return {
      steps: [
        '一度距離を置いて冷静になる',
        '相手の立場に立って考える',
        '適切なタイミングで謝罪する',
        '今後の改善点を具体的に伝える',
        '相手の意見を聞く時間を作る'
      ]
    };
  }
  
  // 会話分析のヘルパーメソッド
  analyzeYourConversationStyle(analysis) {
    return '積極的で親しみやすいスタイル。絵文字や感嘆符を使って感情を表現';
  }
  
  analyzePartnerConversationStyle(analysis) {
    return '丁寧で思慮深いスタイル。相手の話をよく聞き、共感的な返答';
  }
  
  calculateStyleCompatibility(analysis) {
    return 85;
  }
  
  analyzeResponseTimePattern(analysis) {
    return '平均15分以内に返信。夜の時間帯が最も活発';
  }
  
  analyzeMessageLengthPattern(analysis) {
    return 'あなた: 短〜中程度、相手: 中〜長め';
  }
  
  analyzeInitiationPattern(analysis) {
    return '会話の開始は6:4であなたが多め';
  }
  
  identifyFavoriteTopics(analysis) {
    return analysis.interests || ['日常の出来事', '趣味の話', '将来の夢'];
  }
  
  identifyAvoidedTopics(analysis) {
    return analysis.avoidTopics || ['過去の恋愛', '仕事の愚痴'];
  }
  
  calculateTopicEngagement(analysis) {
    return {
      '趣味': 95,
      '日常': 85,
      '恋愛': 70
    };
  }
  
  /**
   * AI分析用のプロンプトを作成
   * @param {string} conversationSample - 会話サンプル
   * @param {object} fortune - 基本分析結果
   * @returns {string} プロンプト
   */
  createAIPrompt(conversationSample, fortune) {
    return `以下のLINEトーク履歴を分析し、恋愛アドバイザーとして非常に詳細なレポートを作成してください。

会話サンプル：
${conversationSample}

基本分析結果：
時間相性: ${fortune.time?.score || 0}点
バランス相性: ${fortune.balance?.score || 0}点
テンポ相性: ${fortune.tempo?.score || 0}点
タイプ相性: ${fortune.type?.score || 0}点
言葉相性: ${fortune.language?.score || 0}点
総合相性: ${fortune.totalScore || 0}点

以下のJSON形式で、非常に詳細な分析結果を返してください：
{
  "emotionalState": {
    "user": "ユーザーの感情状態の詳細分析（200文字以上）",
    "partner": "相手の感情状態の詳細分析（200文字以上）",
    "compatibility": "感情的な相性の詳細評価（200文字以上）"
  },
  "communicationStyle": {
    "userPattern": "ユーザーのコミュニケーションパターン詳細（150文字以上）",
    "partnerPattern": "相手のコミュニケーションパターン詳細（150文字以上）",
    "recommendations": ["改善提案1", "改善提案2", "改善提案3"]
  },
  "futureOutlook": [
    {
      "month": "1ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "2ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "3ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    }
  ],
  "uniqueInsights": "この二人特有の非常に詳細な洞察（300文字以上）",
  "confessionStrategy": {
    "readiness": "告白の準備度評価",
    "optimalTiming": "最適な告白タイミングの詳細",
    "approach": "推奨される告白アプローチの詳細",
    "successRate": "成功率の評価と根拠"
  }
}`;
  }

  /**
   * AIによる深い洞察を取得
   * @param {Array} messages - メッセージ履歴
   * @param {object} fortune - 基本分析結果
   * @returns {object} AI洞察
   */
  async getAIInsights(messages, fortune) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // 全メッセージを送信
      const validMessages = messages.filter(m => m && typeof m === 'object');
      const recentMessages = validMessages.length > 0 
        ? validMessages.map(m => 
            `${m.isUser ? 'あなた' : '相手'}: ${m.text || 'メッセージなし'}`
          ).join('\n')
        : 'メッセージ履歴がありません';
      
      const prompt = `以下のLINEトーク履歴を分析し、恋愛アドバイザーとして非常に詳細なレポートを作成してください。

会話サンプル：
${recentMessages}

基本分析結果：
- 総合スコア: ${fortune.overall?.score || 70}点
- 合計メッセージ数: ${messages.length}

以下のJSON形式で詳細な分析を提供してください：
{
  "relationshipStage": "関係性の現在の段階（初期/友達/好意/両思い/恋人など）の詳細説明",
  "communicationAnalysis": {
    "userStyle": "ユーザーのコミュニケーションスタイルの非常に詳細な分析（200文字以上）",
    "partnerStyle": "相手のコミュニケーションスタイルの非常に詳細な分析（200文字以上）",
    "dynamics": "二人のコミュニケーションダイナミクスの詳細な説明（300文字以上）"
  },
  "emotionalInsights": {
    "currentState": "現在の感情状態の詳細な分析",
    "emotionalPatterns": "感情のパターンと傾向の詳細",
    "futureProspects": "今後の感情発展の見通し"
  },
  "detailedStrengths": [
    {
      "title": "強み1のタイトル",
      "description": "強みの非常に詳細な説明（150文字以上）",
      "impact": "この強みが関係性に与える影響"
    },
    {
      "title": "強み2のタイトル",
      "description": "強みの非常に詳細な説明（150文字以上）",
      "impact": "この強みが関係性に与える影響"
    },
    {
      "title": "強み3のタイトル",
      "description": "強みの非常に詳細な説明（150文字以上）",
      "impact": "この強みが関係性に与える影響"
    }
  ],
  "challenges": [
    {
      "title": "課題1のタイトル",
      "description": "課題の詳細な説明（150文字以上）",
      "solution": "具体的な解決策"
    },
    {
      "title": "課題2のタイトル",
      "description": "課題の詳細な説明（150文字以上）",
      "solution": "具体的な解決策"
    }
  ],
  "actionPlan": [
    {
      "priority": "HIGH",
      "action": "具体的なアクション",
      "timing": "実行タイミング",
      "expectedResult": "期待される結果",
      "details": "アクションの詳細な説明（200文字以上）"
    },
    {
      "priority": "HIGH",
      "action": "具体的なアクション2",
      "timing": "実行タイミング",
      "expectedResult": "期待される結果",
      "details": "アクションの詳細な説明（200文字以上）"
    },
    {
      "priority": "MEDIUM",
      "action": "具体的なアクション3",
      "timing": "実行タイミング",
      "expectedResult": "期待される結果",
      "details": "アクションの詳細な説明（200文字以上）"
    }
  ],
  "monthlyPredictions": [
    {
      "month": "1ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "2ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "3ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    }
  ],
  "uniqueInsights": "この二人特有の非常に詳細な洞察（300文字以上）",
  "confessionStrategy": {
    "readiness": "告白の準備度評価",
    "optimalTiming": "最適な告白タイミングの詳細",
    "approach": "推奨される告白アプローチの詳細",
    "successRate": "成功率の評価と根拠"
  }
}`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'あなたは経験豊富な恋愛カウンセラーで、心理学の専門知識を持ち、日本の恋愛文化に精通しています。非常に詳細で具体的なアドバイスを提供してください。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 16384,  // GPT-4oの最大出力トークン数
        response_format: { type: "json_object" }
      });
      
      // JSONパースを安全に実行
      let aiResponse;
      try {
        const content = completion.choices[0].message.content;
        console.log('AI response length:', content.length);
        
        // JSONパースエラー対策
        aiResponse = JSON.parse(content);
      } catch (parseError) {
        console.error('JSONパースエラー:', parseError.message);
        console.log('AI response (first 500 chars):', completion.choices[0].message.content.substring(0, 500));
        console.log('AI response (last 500 chars):', completion.choices[0].message.content.slice(-500));
        
        // パース失敗時はデフォルト値を使用
        console.log('⚠️ JSONパースに失敗したため、デフォルト値を使用します');
        return this.getDefaultAIInsights();
      }
      
      return aiResponse;
      
    } catch (error) {
      console.error('AI分析エラー:', error.message);
      console.error('Error stack:', error.stack);
      // フォールバック用の詳細なデフォルト値を返す
      return this.getDefaultAIInsights();
    }
  }
  
  /**
   * デフォルトのAI洞察を取得
   * @returns {object} デフォルトのAI洞察
   */
  getDefaultAIInsights() {
    return {
      relationshipStage: "関係性は順調に発展しており、互いに好意を持ち始めている段階です。相手からの返信が安定しており、あなたに対する関心の高さが伺えます。",
      communicationAnalysis: {
        userStyle: "あなたは非常に思いやりがあり、相手の気持ちを大切にするコミュニケーションを心がけています。質問を上手に使い、相手の話を引き出す能力が高く、聞き上手な一面があります。絵文字やスタンプを適度に使用し、温かみのある雰囲気を作り出しています。",
        partnerStyle: "相手は丁寧で誠実なコミュニケーションを取るタイプで、あなたのメッセージに対してしっかりと反応を返してくれます。少し慎重な面があり、感情表現は控えめですが、その分、言葉に重みがあり、信頼できる印象を与えています。",
        dynamics: "二人のコミュニケーションは非常にバランスが取れており、相補的な関係性が築かれつつあります。あなたの明るさと相手の真面目さがうまく調和し、心地よい会話のリズムが生まれています。会話のキャッチボールが自然にできており、お互いに相手の話に興味を持っていることが伝わってきます。"
      },
      emotionalInsights: {
        currentState: "現在、二人の間には穏やかな感情的なつながりが形成されつつあります。お互いに安心感を感じ始めており、より深い話題にも触れるようになってきています。",
        emotionalPatterns: "会話の中でポジティブな感情が増加傾向にあり、特に共通の話題で盛り上がる傾向があります。相手からの好意的な反応が増えてきています。",
        futureProspects: "今後、さらに深い信頼関係が築かれ、恋愛関係に発展する可能性が高いでしょう。適切なアプローチを続けることで、相手からの告白も期待できるかもしれません。"
      },
      detailedStrengths: [
        {
          title: "自然な会話の流れ",
          description: "二人の会話には無理がなく、非常に自然な流れがあります。話題が途切れることなく、次から次へと展開していく様子は、お互いに相手への興味が強いことを示しています。これは関係性の基盤として非常に重要な要素です。",
          impact: "この強みにより、今後もストレスなく関係を深めていくことができ、長期的な関係構築の可能性が高まります。"
        },
        {
          title: "相互的な関心と尊重",
          description: "お互いに相手の話をしっかりと聞き、適切な反応を返していることから、相互的な尊重関係が築かれています。質問を通じて相手をより深く知ろうとする姿勢が見られ、これは真剣な関心の表れです。",
          impact: "この姿勢は相手に安心感を与え、よりオープンになることを促します。結果として、より深いレベルでのつながりが期待できます。"
        },
        {
          title: "ポジティブな雰囲気作り",
          description: "会話全体を通して明るくポジティブな雰囲気が保たれており、お互いに楽しい時間を過ごしていることが伝わってきます。適度なユーモアや絵文字の使用が、会話に彩りを添えています。",
          impact: "ポジティブな雰囲気は相手に「この人と一緒にいると楽しい」という印象を与え、さらに会いたいという気持ちを強めます。"
        }
      ],
      challenges: [
        {
          title: "直接的な感情表現の不足",
          description: "お互いに好意はあるものの、まだ直接的な感情表現が少ない状況です。「好き」「会いたい」といったストレートな表現がまだ見られず、お互いの本心が分かりにくい状態かもしれません。",
          solution: "少しずつでも自分の気持ちを素直に伝えるよう心がけましょう。「今日の会話楽しかった」「また話そう」など、小さな一歩から始めてみてください。"
        },
        {
          title: "オンラインからオフラインへの移行",
          description: "LINEでの会話は盛り上がっていますが、まだ実際に会う機会が少ないようです。オンラインでの関係性だけでは、どうしても限界があり、相手の本当の姿を知る機会が不足しています。",
          solution: "自然な流れで「今度カフェでも行かない？」など、軽い誘いをしてみましょう。共通の趣味や興味に関連したイベントに誘うのも良いでしょう。"
        }
      ],
      actionPlan: [
        {
          priority: "HIGH",
          action: "共通の趣味や関心事について深掘りする",
          timing: "今週中",
          expectedResult: "より深いレベルでのつながりが生まれ、自然にデートの話題につなげやすくなる",
          details: "これまでの会話で触れた共通の趣味や関心事について、より詳しく話してみましょう。たとえば、「そういえば前に○○の話してたけど、最近どう？」のように、以前の話題を拾い上げるのも効果的です。相手が熱中していることについて質問し、興味を示すことで、相手はあなたへの好意をさらに強めるでしょう。"
        },
        {
          priority: "HIGH", 
          action: "プライベートな話題を少しずつ共有する",
          timing: "今週〜来週",
          expectedResult: "お互いの信頼関係が深まり、より親密な関係に発展する",
          details: "今までは当たり障りのない会話が中心でしたが、少しずつプライベートな話題も共有してみましょう。たとえば、「最近ちょっと疲れてて…」のような弱さを見せることで、相手も心を開きやすくなります。ただし、いきなり重い話は避け、軽い悩みや日常のできごとから始めることが大切です。"
        },
        {
          priority: "MEDIUM",
          action: "オフラインで会う機会を作る",
          timing: "2-3週間後",
          expectedResult: "実際に会うことで関係性が大きく前進し、恋愛関係への発展が期待できる",
          details: "これまでのLINEでの会話を通じて、十分な信頼関係が築かれつつあります。そろそろ実際に会う段階に進んでも良いでしょう。「最近○○について話してたけど、今度一緒に行ってみない？」というように、会話の流れから自然に誘うのがポイントです。最初はランチやカフェなど、短時間でプレッシャーの少ない設定がおすすめです。"
        }
      ],
      monthlyPredictions: [
        {
          month: "1ヶ月後",
          prediction: "この時期には、二人の関係はより親密になっているでしょう。LINEでの会話が日常的になり、お互いの生活の一部として定着します。相手からの返信がより速くなり、絵文字やスタンプの使用も増えるなど、感情表現が豊かになるでしょう。",
          keyEvents: ["初めてのデートの可能性", "お互いのプライベートな話題の共有"]
        },
        {
          month: "2ヶ月後",
          prediction: "この段階では、二人の関係は「友達以上恋人未満」の状態に進展している可能性が高いです。お互いに特別な存在として認識し、他の人とは違う特別な関係性を築いています。告白のタイミングを考え始める時期でもあります。",
          keyEvents: ["関係性の明確化の必要性", "告白のチャンス"]
        },
        {
          month: "3ヶ月後",  
          prediction: "この時期には、二人の関係は重要な分岐点を迎えるでしょう。適切なアプローチを続けていれば、正式に恋人関係に発展する可能性が非常に高いです。一方で、何もアクションを起こさない場合、関係が停滞する可能性もあります。勇気を持って一歩踏み出すことが重要です。",
          keyEvents: ["関係性の発展または停滞", "重要な決断の時"]
        }
      ],
      uniqueInsights: "この二人の関係は、非常にバランスの取れた理想的な組み合わせです。お互いの違いを尊重しながらも、共通の価値観を持ち、自然に惹かれ合っている様子が伝わってきます。特に注目すべきは、会話の中で見られる「無言の理解」です。言葉にしなくても伝わるものがあり、これは長期的な関係構築において非常に重要な要素です。また、二人の会話には独特のリズムがあり、これは他の人との会話では得られない特別なものです。このリズムを大切にし、さらに発展させていくことで、より深い絆が生まれるでしょう。",
      confessionStrategy: {
        readiness: "現在の準備度は65%です。お互いに好意はあるものの、まだ確信が持てない状態です。もう少し関係を深めることで、成功率が大幅に上がります。",
        optimalTiming: "最適な告白タイミングは、2-3ヶ月後が理想的です。ただし、実際に何度か会って、お互いの相性を確認した後が望ましいでしょう。特に、2人きりで楽しい時間を過ごした後や、特別なイベントの後などがチャンスです。",
        approach: "あなたの場合、ストレートに気持ちを伝える方法が最も効果的です。回りくどい表現よりも、「あなたと一緒にいると楽しい」「もっと一緒にいたい」といった素直な気持ちを伝えましょう。重要なのは、相手にプレッシャーを与えないこと。「返事はいつでもいいよ」という余裕を見せることで、相手も素直に反応しやすくなります。",
        successRate: "現時点での成功率は60%程度ですが、上記のアクションプランを実行することで、80%以上に高めることが可能です。特に、実際に会ってお互いの相性を確認できれば、成功はほぼ確実でしょう。"
      }
    };
  }
  
  generateConversationTips(analysis) {
    // AI洞察があればそれを使用
    if (analysis.aiInsights?.actionPlan) {
      return analysis.aiInsights.actionPlan.slice(0, 3).map(a => a.action);
    }
    
    return [
      '相手の話題により深く踏み込んで質問してみましょう',
      '自分の感情をもっと素直に表現すると良いでしょう',
      '写真やスタンプを使ってより楽しい会話を心がけましょう'
    ];
  }
  
  suggestNewTopics(analysis) {
    return ['共通の思い出', '好きな音楽', 'デートプラン'];
  }
  
  generateTimingAdvice(analysis) {
    return '夜9時〜11時が最も会話が盛り上がる時間帯です';
  }
  
  assessConfessionReadiness(analysis) {
    const baseReadiness = 60;
    const stageBonus = (analysis.relationshipStage || 5) * 5;
    const scoreBonus = ((analysis.overall?.score || 75) - 75) * 0.5;
    
    return Math.max(20, Math.min(95, Math.round(baseReadiness + stageBonus + scoreBonus)));
  }
  
  identifyRequiredSteps(analysis) {
    const stage = analysis.relationshipStage || 5;
    if (stage < 6) {
      return [
        '相手との信頼関係をより深める',
        '共通の思い出を増やす',
        '将来の話題を自然に取り入れる'
      ];
    } else if (stage < 8) {
      return [
        '二人だけの特別な時間を増やす',
        '相手の恋愛観を理解する',
        '告白のタイミングを見極める'
      ];
    } else {
      return [
        '告白の場所と時間を決める',
        '相手の気持ちを最終確認する',
        '告白後の関係性について考える'
      ];
    }
  }
  
  calculateOptimalTimeframe(analysis) {
    const stage = analysis.relationshipStage || 5;
    if (stage >= 8) return '1-2ヶ月以内';
    if (stage >= 6) return '2-4ヶ月以内';
    if (stage >= 4) return '4-6ヶ月以内';
    return '6ヶ月以上の関係構築が必要';
  }
  
  determineOptimalApproach(analysis) {
    const stage = analysis.relationshipStage || 5;
    if (stage >= 8) return '直接的で誠実なアプローチ';
    if (stage >= 6) return '段階的で丁寧なアプローチ';
    return '友情を基盤とした慎重なアプローチ';
  }
  
  suggestOptimalLocation(analysis) {
    return '二人の思い出の場所、または静かで落ち着いた雰囲気の場所';
  }
  
  suggestConfessionMethod(analysis) {
    return '直接会って、言葉で気持ちを伝える方法が最も効果的';
  }
  
  generateMentalPreparation(analysis) {
    return [
      'どんな結果でも受け入れる覚悟を持つ',
      '相手への感謝の気持ちを忘れない',
      '自分の気持ちを正直に伝える勇気を持つ'
    ];
  }
  
  generateConfessionScript(analysis) {
    return '「〇〇さんと過ごす時間がとても大切で、これからもずっと一緒にいたいと思っています。僕/私と付き合ってもらえませんか？」';
  }
  
  generateBackupPlans(analysis) {
    return [
      'プランA: 落ち着いた場所での直接告白',
      'プランB: 手紙を添えた告白',
      'プランC: 共通の思い出の場所での告白'
    ];
  }
  
  generatePositiveResponsePlan(analysis) {
    return {
      immediate: 'お互いの気持ちを確認し、今後の関係について話し合う',
      shortTerm: '恋人としての新しい関係性を築く',
      longTerm: 'お互いを大切にしながら関係を深めていく'
    };
  }
  
  generateNegativeResponsePlan(analysis) {
    return {
      immediate: '相手の気持ちを尊重し、友情を維持することを伝える',
      shortTerm: '適度な距離を保ちながら自然な関係を続ける',
      longTerm: '時間をかけて関係性を見直し、新しい形での絆を築く'
    };
  }
  
  generateRelationshipNextSteps(analysis) {
    return [
      '恋人としての新しいルールを決める',
      'お互いの家族や友人に紹介する',
      '将来の目標を共有する',
      '記念日を作る'
    ];
  }
  
  getStageTitle(stage) {
    const titles = {
      1: '出会い・認知段階', 2: '興味・関心段階', 3: '友好関係段階',
      4: '親密度向上段階', 5: '信頼関係構築段階', 6: '特別な関係段階',
      7: '相互理解深化段階', 8: '恋愛感情醸成段階', 9: '告白準備段階',
      10: '恋人関係段階'
    };
    return titles[stage] || '関係性発展中';
  }
  
  getStageDescription(stage) {
    const descriptions = {
      1: 'お互いを知る段階', 2: '共通点を見つける段階', 3: '友情を築く段階',
      4: 'より深く知り合う段階', 5: '信頼を構築する段階', 6: '特別な存在になる段階',
      7: 'お互いを深く理解する段階', 8: '恋愛感情が芽生える段階', 9: '告白の準備をする段階',
      10: '恋人同士として歩む段階'
    };
    return descriptions[stage] || '関係性を発展させる段階';
  }
  
  getStageObjectives(stage) {
    return [`目標${stage}-1`, `目標${stage}-2`, `目標${stage}-3`];
  }
  
  getStageActions(stage, analysis) {
    return [`アクション${stage}-1`, `アクション${stage}-2`];
  }
  
  getStageIndicators(stage) {
    return [`指標${stage}-1`, `指標${stage}-2`];
  }
  
  getStageTimeframe(stage) {
    return `${stage}ヶ月程度`;
  }
  
  getStageChallenges(stage) {
    return [`課題${stage}-1`, `課題${stage}-2`];
  }
  
  getStageSuccessMetrics(stage) {
    return [`成功指標${stage}-1`, `成功指標${stage}-2`];
  }
  
  assessCurrentStage(analysis) {
    return `現在のレベル${analysis.relationshipStage || 5}の詳細評価`;
  }
  
  calculateOverallTimeline(milestones) {
    return `約${milestones.length}年での関係構築を目指します`;
  }
  
  identifyKeyMilestones(milestones) {
    return milestones.slice(0, 3).map(m => m.title);
  }
  
  /**
   * 年末予測を生成
   * @param {Array} months - 月別データ
   * @returns {string} 年末予測
   */
  generateYearEndPrediction(months) {
    const averageScore = months.reduce((sum, month) => sum + month.loveScore, 0) / months.length;
    const trend = this.calculateTrend(months);
    
    if (trend > 0.5 && averageScore > 70) {
      return '年末までに関係は大きく進展し、恋人関係に発展する可能性が高いでしょう。';
    } else if (trend > 0 && averageScore > 60) {
      return '着実に関係が深まり、年末には告白のチャンスが訪れるでしょう。';
    } else if (averageScore > 50) {
      return '関係は安定していますが、更なる努力が必要です。年末に向けて積極的にアプローチしましょう。';
    } else {
      return '現状のままでは進展が難しいかもしれません。戦略を見直し、新たなアプローチを検討しましょう。';
    }
  }
  
  /**
   * トレンドを計算
   * @param {Array} months - 月別データ
   * @returns {number} トレンド値
   */
  calculateTrend(months) {
    if (months.length < 2) return 0;
    
    const firstHalf = months.slice(0, Math.floor(months.length / 2));
    const secondHalf = months.slice(Math.floor(months.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.loveScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.loveScore, 0) / secondHalf.length;
    
    return (secondAvg - firstAvg) / firstAvg;
  }
  
  // その他のヘルパーメソッドも同様に実装...
}

module.exports = PremiumReportGenerator;