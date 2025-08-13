/**
 * プレミアムレポートV2 インテグレーション
 * 既存システムから新しいV2レポートを呼び出すためのラッパー
 */

const PremiumReportGeneratorV2 = require('./v2/report-generator-v2');

class ReportGeneratorV2Integration {
  constructor() {
    this.generatorV2 = new PremiumReportGeneratorV2();
  }
  
  /**
   * 既存のシステムから呼び出される互換メソッド
   * @param {Array} messages - メッセージ履歴
   * @param {string} userId - ユーザーID
   * @param {string} userName - ユーザー名
   * @param {Object} existingAiInsights - 既存のAI分析結果（Step 3で取得済み）
   * @returns {Object} 詳細レポートデータ
   */
  async generatePremiumReport(messages, userId, userName = 'あなた', existingAiInsights = null) {
    try {
      console.log('🚀 プレミアムレポートV2への移行開始');
      
      // プロフィール情報を取得（既存のデータベースから）
      let userProfile = {
        userId,
        displayName: userName,
        userName
      };
      
      // データベースから追加情報を取得
      try {
        const profileManager = require('../database/profiles-db');
        const savedProfile = await profileManager.getProfile(userId);
        
        if (savedProfile) {
          userProfile = {
            ...userProfile,
            ...savedProfile,
            displayName: userName || savedProfile.userName || savedProfile.displayName
          };
        }
      } catch (err) {
        console.log('プロフィール取得エラー（デフォルト使用）:', err.message);
      }
      
      // V2ジェネレーターを呼び出し
      const result = await this.generatorV2.generateReport(
        messages,
        userProfile,
        existingAiInsights,
        {
          generatePDF: true,
          reportId: this.generateReportId(userId)
        }
      );
      
      // 既存システムとの互換性のため、期待される形式に変換
      const legacyFormat = this.convertToLegacyFormat(result);
      
      console.log('✅ プレミアムレポートV2生成完了');
      
      return legacyFormat;
      
    } catch (error) {
      console.error('プレミアムレポートV2生成エラー:', error);
      
      // エラー時は既存のジェネレーターにフォールバック
      console.log('⚠️ V1ジェネレーターにフォールバック');
      const LegacyGenerator = require('./report-generator');
      const legacyGen = new LegacyGenerator();
      return await legacyGen.generatePremiumReport(messages, userId, userName, existingAiInsights);
    }
  }
  
  /**
   * AIプロンプトを作成（既存システムとの互換性のため）
   * @param {string} conversationSample - 会話サンプル
   * @param {Object} fortune - 基本分析結果
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
      "month": "3ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "6ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    }
  ],
  "actionPlan": {
    "immediate": [
      {
        "action": "今すぐやるべきアクション",
        "reason": "なぜこれが重要か（100文字以上）",
        "expectedResult": "期待される結果（100文字以上）"
      }
    ],
    "shortTerm": [
      {
        "action": "1ヶ月以内にやるべきアクション",
        "reason": "なぜこれが重要か（100文字以上）",
        "expectedResult": "期待される結果（100文字以上）"
      }
    ],
    "longTerm": [
      {
        "action": "3ヶ月以内にやるべきアクション",
        "reason": "なぜこれが重要か（100文字以上）",
        "expectedResult": "期待される結果（100文字以上）"
      }
    ]
  },
  "riskAnalysis": {
    "potentialRisks": [
      {
        "risk": "潜在的なリスク",
        "probability": "高/中/低",
        "impact": "影響度の説明（100文字以上）",
        "mitigation": "対策方法（100文字以上）"
      }
    ],
    "warningSignals": ["注意すべきサイン1", "注意すべきサイン2"]
  },
  "personality": ["性格特徴1", "性格特徴2", "性格特徴3"],
  "interests": ["興味1", "興味2", "興味3"],
  "relationshipStage": 5,
  "advice": ["具体的アドバイス1（100文字以上）", "具体的アドバイス2（100文字以上）"],
  "emotionalPattern": {
    "positive": ["ポジティブな話題1", "ポジティブな話題2"],
    "negative": ["ネガティブな話題1"]
  },
  "communicationStyleSummary": "全体的なコミュニケーションスタイル",
  "optimalTiming": {
    "timeOfDay": "夜",
    "frequency": "毎日"
  },
  "suggestedActions": [
    {
      "action": "送るべきメッセージの具体例",
      "expectedResponse": "予想される相手の反応",
      "timing": "今すぐ",
      "successRate": 85,
      "basedOn": "この提案の根拠"
    }
  ]
}`;
  }
  
  /**
   * V2の結果を既存システムの形式に変換
   */
  convertToLegacyFormat(v2Result) {
    const { analysisContext, pdfBuffer, summary } = v2Result;
    const { reportContent, statistics, scores, aiInsights, metadata } = analysisContext;
    
    return {
      // メタデータ
      metadata: {
        generatedAt: metadata.generatedDate,
        reportId: metadata.reportId,
        userName: analysisContext.user.name,
        reportType: 'premium',
        version: '2.0'
      },
      
      // エグゼクティブサマリー（既存形式）
      executiveSummary: {
        overallAssessment: {
          score: scores.overallScore,
          grade: this.getGrade(scores.overallScore),
          description: reportContent.page67.scoreInterpretation
        },
        keyInsights: [
          `関係性タイプ: ${aiInsights.relationshipType?.relationshipTitle}`,
          `最も強い絆: ${scores.strongestPillar?.name}`,
          `ポジティブ率: ${statistics.positivityRate}%`
        ],
        immediateActions: aiInsights.actionPlans?.slice(0, 3).map(plan => plan.advice) || []
      },
      
      // 詳細相性分析（V2の5つの柱を20項目に展開）
      compatibilityAnalysis: this.expandCompatibilityAnalysis(scores),
      
      // 会話パターン分析
      conversationAnalysis: {
        conversationStyle: {
          yourStyle: '積極的・親しみやすい',
          partnerStyle: '思慮深い・優しい',
          compatibility: `${scores.overallScore}%の調和`
        },
        communicationPatterns: {
          responseTimePattern: `平均${statistics.responseTimeMedian}分での返信`,
          messageLengthPattern: `平均${statistics.overallAvgMessageLength}文字`,
          initiationPattern: statistics.communicationBalance
        },
        topicAnalysis: {
          favoriteTopics: aiInsights.existingData?.interests || [],
          engagementByTopic: {}
        },
        improvements: {
          conversationTips: aiInsights.actionPlans?.map(p => p.advice) || []
        }
      },
      
      // 月別予測
      monthlyForecast: {
        months: this.generateMonthlyForecast(aiInsights.futureSigns)
      },
      
      // アクションプラン
      actionPlan: {
        priorities: aiInsights.actionPlans || [],
        timeline: 'すぐに実践可能'
      },
      
      // リスク分析
      riskAnalysis: {
        risks: [],
        mitigations: []
      },
      
      // 告白戦略
      confessionStrategy: {
        timing: aiInsights.futureSigns?.deepTalk === '高' ? '今がチャンス' : '様子を見て',
        approach: '自然な流れで',
        successRate: scores.overallScore
      },
      
      // ロードマップ
      relationshipRoadmap: {
        currentStage: aiInsights.existingData?.relationshipStage || 5,
        nextMilestones: [],
        timeline: []
      },
      
      // 付録
      appendix: {
        rawAnalysis: {
          statistics,
          scores,
          aiInsights
        }
      },
      
      // PDFバッファ
      pdfBuffer,
      
      // サマリー
      summary
    };
  }
  
  /**
   * スコアからグレードを算出
   */
  getGrade(score) {
    if (score >= 95) return 'S+';
    if (score >= 90) return 'S';
    if (score >= 85) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    return 'D';
  }
  
  /**
   * 5つの柱を20項目に展開
   */
  expandCompatibilityAnalysis(scores) {
    const items = [];
    const categories = ['コミュニケーション', '感情・性格', '興味・価値観', 'タイミング・行動', '関係性構築'];
    
    Object.values(scores.fivePillars).forEach((pillar, index) => {
      const category = categories[index];
      
      // 各柱を4項目に展開
      for (let i = 0; i < 4; i++) {
        items.push({
          category,
          item: `${pillar.name}${i + 1}`,
          score: Math.max(60, pillar.score + (Math.random() * 20 - 10))
        });
      }
    });
    
    return {
      overallCompatibilityScore: scores.overallScore,
      detailedItems: items,
      strengthAreas: items.filter(i => i.score >= 80).slice(0, 5),
      improvementAreas: items.filter(i => i.score < 70).slice(0, 3)
    };
  }
  
  /**
   * 月別予測を生成
   */
  generateMonthlyForecast(futureSigns) {
    const months = [];
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 3; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const monthName = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][monthIndex];
      
      months.push({
        month: monthName,
        overallScore: 75 + Math.random() * 20,
        keyEvents: i === 0 && futureSigns?.deepTalk === '高' ? ['深い対話の機会'] : [],
        advice: '月の導きに従って進みましょう'
      });
    }
    
    return months;
  }
  
  /**
   * レポートID生成
   */
  generateReportId(userId) {
    const timestamp = Date.now();
    const userPart = userId.substring(0, 4);
    return `PRV2-${userPart}-${timestamp}`.toUpperCase();
  }
}

// エクスポート
module.exports = ReportGeneratorV2Integration;