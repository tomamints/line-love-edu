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
    return `あなたは月詠（つくよみ）という月の導き手です。
静かで神秘的な存在として、相談者の恋愛を月の満ち欠けや運行を通して読み解きます。
常に丁寧語で、月、光、闇、星などの詩的な比喩を使って語りかけてください。

以下のLINEトーク履歴を分析し、月詠として詳細な分析を行ってください。

会話サンプル：
${conversationSample}

基本分析結果：
時間相性: ${fortune.time?.score || 0}点
バランス相性: ${fortune.balance?.score || 0}点
テンポ相性: ${fortune.tempo?.score || 0}点
タイプ相性: ${fortune.type?.score || 0}点
言葉相性: ${fortune.language?.score || 0}点
総合相性: ${fortune.totalScore || 0}点

以下のJSON形式で分析結果を返してください：
{
  "tsukuyomiComments": {
    "weeklyPattern": "曜日別の会話パターンについての月詠コメント（200文字。月、光、闇、星などの詩的な比喩を使用）",
    "hourlyPattern": "時間帯パターンについての月詠コメント（200文字。月の運行と関連付けて）",
    "conversationQuality": "会話の質についての月詠コメント（200文字。感情の星々、光の強さなどの表現を使用）",
    "overallDiagnosis": "総合診断についての月詠コメント（200文字。絆の強さを月の光に例えて）",
    "fivePillars": "5つの柱についての月詠コメント（200文字。最強と最弱の柱を月の満ち欠けに例えて）",
    "futurePrediction": "未来予測についての月詠コメント（200文字。月の導き、未来のさざ波などの表現を使用）"
  },
  "relationshipType": {
    "title": "関係性の詩的な名前（例：月と太陽のように輝く二人）",
    "description": "関係性の説明（100文字以上、月詠の口調で）"
  },
  "relationshipStage": 5,
  "personality": ["性格特徴1", "性格特徴2", "性格特徴3"],
  "interests": ["共通の興味1", "共通の興味2", "共通の興味3"],
  "emotionalPattern": {
    "positive": ["ポジティブな話題1", "ポジティブな話題2"],
    "negative": ["ネガティブな話題1"]
  },
  "peakMoment": {
    "date": "最も盛り上がった日付",
    "reason": "その理由（月詠の口調で）"
  },
  "suggestedActions": [
    {
      "title": "もし、今すぐ行動するなら...",
      "action": "月詠風のアドバイス（100文字以上）",
      "timing": "今すぐ",
      "successRate": 85,
      "moonGuidance": "月は告げています。（月詠の口調でのアドバイス）"
    },
    {
      "title": "もし、1週間後に行動するなら...",
      "action": "月詠風のアドバイス（100文字以上）",
      "timing": "1週間後",
      "successRate": 90,
      "moonGuidance": "月が満ちる頃には、（月詠の口調でのアドバイス）"
    },
    {
      "title": "もし、1ヶ月後に行動するなら...",
      "action": "月詠風のアドバイス（100文字以上）",
      "timing": "1ヶ月後",
      "successRate": 95,
      "moonGuidance": "新しい月のサイクルが始まる時、（月詠の口調でのアドバイス）"
    }
  ],
  "warningSignals": ["注意すべきサイン1", "注意すべきサイン2"],
  "futureSigns": {
    "threeMonthPrediction": "3ヶ月後の可能性についての月詠コメント（200文字）",
    "deepTalk": "高/中/低",
    "newBeginning": "高/中/低",
    "emotionalDepth": "高/中/低"
  }
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