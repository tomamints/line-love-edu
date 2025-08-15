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
  createAIPrompt(conversationSample, fortune, userProfile) {
    // ユーザーの恋愛状況と悩みを抽出
    const loveSituation = userProfile?.loveSituation || 'beginning';
    const wantToKnow = userProfile?.wantToKnow || 'feelings';
    
    // 悩みに応じた共感メッセージ
    const empathyMessages = {
      beginning: {
        feelings: "相手の本当の気持ちが分からなくて、不安になることがありますよね。",
        action: "どう行動すればいいか迷って、一歩を踏み出せない気持ち、よく分かります。",
        past: "これまでの出来事の意味を理解したいという気持ち、大切ですね。",
        future: "この関係がどこに向かっているのか、知りたくなるのは自然なことです。"
      },
      relationship: {
        feelings: "付き合っていても、相手の本心が見えない時がありますよね。",
        action: "関係を深めるための次の一歩、慎重になるのも当然です。",
        past: "過去の出来事が今にどう影響しているか、気になりますよね。",
        future: "二人の未来について考えることは、とても大切なことです。"
      },
      complicated: {
        feelings: "複雑な状況だからこそ、相手の気持ちを知りたいですよね。",
        action: "難しい状況での行動選択、本当に悩ましいと思います。",
        past: "過去の出来事を整理することで、前に進めることがあります。",
        future: "不確かな未来だからこそ、指針が欲しくなりますよね。"
      },
      ending: {
        feelings: "終わった関係でも、相手の本当の気持ちは気になるものです。",
        action: "次にどう進むべきか、迷うのは当然のことです。",
        past: "なぜこうなったのか、理解したい気持ちを大切にしてください。",
        future: "新しい始まりへの不安と期待、両方あって当然です。"
      }
    };
    
    const empathy = empathyMessages[loveSituation]?.[wantToKnow] || "あなたの気持ちに寄り添いたいと思います。";
    
    // 会話サンプルから具体的な内容を抽出
    const messages = conversationSample.split('\n').slice(0, 20); // 最初の20件を分析
    const hasQuestions = messages.some(m => m.includes('？') || m.includes('?'));
    const hasEmojis = messages.some(m => /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(m));
    const hasLongMessages = messages.some(m => m.length > 50);
    const hasShortReplies = messages.filter(m => m.includes('相手:') && m.length < 20).length > 5;
    
    return `あなたは月詠（つくよみ）という恋愛カウンセラーです。
相談者の実際のトーク履歴を分析し、具体的な会話内容に基づいた個別化されたアドバイスを提供してください。

重要な指針：
1. 実際の会話内容を引用しながら、具体的な分析を行う
2. 「〜というメッセージから」「〜という言葉に」など、実際のメッセージを参照する
3. 相談者の悩み（${wantToKnow}）に直接答える内容にする
4. 汎用的な言葉ではなく、この二人だけの特別な分析にする
5. 会話の特徴（質問の有無: ${hasQuestions}, 絵文字使用: ${hasEmojis}, メッセージ長: ${hasLongMessages ? '長い' : '短い'}）を踏まえる

相談者の状況：
- 恋愛状況: ${loveSituation === 'beginning' ? '恋の始まり' : loveSituation === 'relationship' ? '交際中' : loveSituation === 'complicated' ? '複雑な事情' : '終わり・復縁'}
- 知りたいこと: ${wantToKnow === 'feelings' ? '相手の気持ち' : wantToKnow === 'action' ? 'どう行動すべきか' : wantToKnow === 'past' ? '過去の意味' : 'これからどうなるか'}
- 共感ポイント: ${empathy}

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
  "personalizedLetter": "相談者への個別化された手紙（1000文字以上。実際の会話内容を3つ以上引用し、その会話から読み取れる二人の関係性、相手の性格、今後の可能性について具体的に分析。相談者の悩み'${wantToKnow === 'feelings' ? '相手の気持ち' : wantToKnow === 'action' ? 'どう行動すべきか' : wantToKnow === 'past' ? '過去の意味' : 'これからどうなるか'}'に対する明確な答えを含める）",
  "empathyMessage": "相談者への共感メッセージ（150文字。「〜ですよね」「お気持ちよく分かります」など共感を示す）",
  "tsukuyomiComments": {
    "weeklyPattern": "曜日別パターンの分析（200文字。実際の会話内容を引用し、その曜日特有の話題や雰囲気を分析）",
    "hourlyPattern": "時間帯パターンの分析（200文字。実際のメッセージ例を挙げて、なぜその時間帯に盛り上がるのか分析）",
    "conversationQuality": "会話の質の分析（200文字。具体的なメッセージを引用し、どんな時に盛り上がり、どんな時に沈黙するか）",
    "overallDiagnosis": "総合診断（200文字。実際の会話から読み取れる二人だけの特別な関係性を説明）",
    "fivePillars": "5つの柱の分析（200文字。実際の会話例から見える強みと、具体的な改善提案）",
    "futurePrediction": "未来予測（200文字。過去の会話パターンから予測される具体的な未来）"
  },
  "relationshipType": {
    "title": "関係性を表す分かりやすい名前（例：お互いを大切に思う二人）",
    "description": "関係性の詳しい説明（150文字以上。良い点、課題、可能性を含める）",
    "strengths": ["関係の強み1", "関係の強み2", "関係の強み3"],
    "challenges": ["改善できる点1", "改善できる点2"],
    "compatibility": "相性の詳細な説明（100文字。なぜこの相性なのか具体的に）"
  },
  "relationshipStage": 1-10の数値,
  "personality": ["相手の性格特徴1", "相手の性格特徴2", "相手の性格特徴3"],
  "interests": ["共通の話題1", "共通の話題2", "共通の話題3"],
  "emotionalPattern": {
    "positive": ["盛り上がる話題1", "盛り上がる話題2"],
    "negative": ["避けた方がいい話題1"],
    "triggers": ["相手が喜ぶポイント", "相手が引くポイント"]
  },
  "communicationStyle": {
    "userStyle": "あなたの会話スタイル（50文字）",
    "partnerStyle": "相手の会話スタイル（50文字）",
    "compatibility": "スタイルの相性（100文字）"
  },
  "peakMoment": {
    "date": "最も盛り上がった日付",
    "reason": "なぜ盛り上がったか具体的な理由（100文字）",
    "lesson": "この経験から学べること（50文字）"
  },
  "conversationExamples": {
    "bestMoment": "最も盛り上がった会話の実例（実際のメッセージを引用）",
    "typicalPattern": "典型的な会話パターンの実例（実際のメッセージを引用）",
    "concernPoint": "改善が必要な会話の実例（実際のメッセージを引用）"
  },
  "suggestedActions": [
    {
      "title": "今すぐできること",
      "action": "実際の会話履歴に基づく具体的な行動提案（150文字。過去に盛り上がった話題の続きなど）",
      "timing": "今すぐ",
      "successRate": 85,
      "reason": "なぜこの行動が効果的か（100文字）",
      "example": "メッセージの具体例や行動の詳細"
    },
    {
      "title": "1週間後の行動",
      "action": "1週間準備してからの行動提案（150文字。準備内容も含める）",
      "timing": "1週間後",
      "successRate": 90,
      "reason": "なぜこのタイミングが良いか（100文字）",
      "example": "具体的な準備と実行方法"
    },
    {
      "title": "長期的な目標",
      "action": "1ヶ月かけて実現する提案（150文字。段階的なステップを含む）",
      "timing": "1ヶ月後",
      "successRate": 95,
      "reason": "じっくり取り組む価値（100文字）",
      "example": "週ごとの具体的なステップ"
    }
  ],
  "warningSignals": ["注意すべきサイン1（具体的に）", "注意すべきサイン2（具体的に）"],
  "futureSigns": {
    "threeMonthPrediction": "3ヶ月後の具体的な予測（200文字。良い変化の可能性を中心に）",
    "deepTalk": "高/中/低",
    "newBeginning": "高/中/低",
    "emotionalDepth": "高/中/低",
    "recommendations": ["3ヶ月以内にすべきこと1", "3ヶ月以内にすべきこと2"]
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