/**
 * プレミアムレポートV2 メインジェネレーター
 * 新仕様書に基づいたレポート生成の統合モジュール
 */

const PreProcessor = require('./pre-processing');
const StatisticsAnalyzer = require('./statistics');
const ScoringEngine = require('./scoring');
const AIGenerator = require('./ai-generator');
const PDFGeneratorV2 = require('./pdf-generator-v2');

class PremiumReportGeneratorV2 {
  constructor() {
    this.preProcessor = new PreProcessor();
    this.statisticsAnalyzer = new StatisticsAnalyzer();
    this.scoringEngine = new ScoringEngine();
    this.pdfGenerator = new PDFGeneratorV2();
  }
  
  /**
   * プレミアムレポートを生成
   * @param {Array} messages - メッセージ履歴
   * @param {Object} userProfile - ユーザープロフィール
   * @param {Object} existingAiInsights - 既存のAI分析結果（Batch APIから）
   * @param {Object} options - オプション設定
   * @returns {Object} レポート結果
   */
  async generateReport(messages, userProfile, existingAiInsights = null, options = {}) {
    console.log('🌙 プレミアムレポートV2生成開始');
    
    try {
      // 1. 前処理とanalysisContext初期化
      console.log('📝 Step 1: 前処理実行中...');
      const systemParams = {
        reportId: options.reportId || this.generateReportId(),
        generatedDate: new Date().toISOString()
      };
      
      const analysisContext = this.preProcessor.processMessages(
        messages,
        userProfile,
        systemParams
      );
      
      console.log(`  ✅ ${analysisContext.messages.length}件のメッセージを正規化`);
      console.log(`  ✅ ユーザー: ${analysisContext.user.name}`);
      
      // 2. 統計分析
      console.log('📊 Step 2: 統計分析中...');
      this.statisticsAnalyzer.analyzeAll(analysisContext);
      
      console.log(`  ✅ 最も盛り上がった日: ${analysisContext.statistics.peakDate}`);
      console.log(`  ✅ 最も活発な時間帯: ${analysisContext.statistics.peakHour}時`);
      console.log(`  ✅ ポジティブ率: ${analysisContext.statistics.positivityRate}%`);
      
      // 3. スコアリング
      console.log('💯 Step 3: スコア計算中...');
      this.scoringEngine.calculateAllScores(analysisContext);
      
      console.log(`  ✅ 総合スコア: ${analysisContext.scores.overallScore}点`);
      console.log(`  ✅ 最強の柱: ${analysisContext.scores.strongestPillar.name} (${analysisContext.scores.strongestPillar.score}点)`);
      console.log(`  ✅ 改善点: ${analysisContext.scores.weakestPillar.name} (${analysisContext.scores.weakestPillar.score}点)`);
      
      // 4. AI分析結果の活用
      console.log('🤖 Step 4: AI分析統合中...');
      const aiGenerator = new AIGenerator(existingAiInsights);
      await aiGenerator.generateAllInsights(analysisContext);
      
      console.log(`  ✅ 関係性タイプ: ${analysisContext.aiInsights.relationshipType?.relationshipTitle || 'デフォルト'}`);
      console.log(`  ✅ アクションプラン: ${analysisContext.aiInsights.actionPlans?.length || 0}個生成`);
      
      // 5. レポートコンテンツの準備
      console.log('📄 Step 5: レポートコンテンツ生成中...');
      this.prepareReportContent(analysisContext);
      
      // 6. PDF生成（必要に応じて）
      let pdfBuffer = null;
      if (options.generatePDF !== false) {
        console.log('📑 Step 6: PDF生成中...');
        pdfBuffer = await this.pdfGenerator.generatePDF(analysisContext);
        console.log('  ✅ PDF生成完了');
      }
      
      console.log('🎉 レポート生成完了！');
      
      return {
        success: true,
        analysisContext,
        pdfBuffer,
        summary: this.generateSummary(analysisContext)
      };
      
    } catch (error) {
      console.error('❌ レポート生成エラー:', error);
      throw error;
    }
  }
  
  /**
   * レポートコンテンツの準備
   */
  prepareReportContent(analysisContext) {
    const { user, partner, metadata, statistics, scores, aiInsights } = analysisContext;
    
    // P.1-2: 表紙・序章
    analysisContext.reportContent.page1 = {
      userName: `${user.name} 様`,
      partnerName: partner.name ? `${partner.name} 様との絆へ` : 'お相手様との絆へ',
      reportId: metadata.reportId,
      generatedDate: new Date(metadata.generatedDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    analysisContext.reportContent.page2 = {
      title: '序章 ～月夜の導き～',
      body: `${user.name}様。\n\n月詠（つくよみ）と申します。\n\n今宵、月が照らし出すのは、あなたと${partner.name ? partner.name + '様' : 'お相手様'}が紡いできた言葉の数々。\nそれぞれの言葉に込められた想いを、月の光で優しく包み込み、\nこれからの道筋を照らす羅針盤として、このレポートをお届けします。\n\nどうか、ゆっくりとページをめくりながら、\nあなたたち二人だけの物語を、心ゆくまでお楽しみください。`
    };
    
    // P.2.5: 個別化された手紙（新規追加）
    analysisContext.reportContent.personalLetter = {
      title: `${user.name}様への特別なメッセージ`,
      body: aiInsights.personalizedLetter || this.generateDefaultPersonalLetter(user, partner, statistics, scores, metadata)
    };
    
    // P.3: 時系列グラフデータ
    analysisContext.reportContent.page3 = {
      title: '二人の言葉の満ち欠け',
      data: statistics.dailyMessageCounts,
      peakDate: statistics.peakDate,
      peakComment: aiInsights.dailyActivityComment || aiInsights.peakDateComment || '特別な日の輝き'
    };
    
    // P.4: 時間帯グラフデータ
    analysisContext.reportContent.page4 = {
      title: '言葉がもっとも輝く時間',
      data: statistics.hourlyMessageCounts,
      peakHour: statistics.peakHour,
      peakHourRatio: statistics.peakHourRatio,
      comment: aiInsights.hourlyActivityComment || this.getTimeComment(statistics.peakHour)
    };
    
    // P.5: 会話の質
    analysisContext.reportContent.page5 = {
      title: '心に灯った感情の星々',
      positivityRate: statistics.positivityRate || 0,
      totalEmojis: statistics.totalEmojis || 0,
      questionRatio: statistics.questionRatio || '0%',
      responseTimeMedian: statistics.responseTimeMedian || 30,
      userAvgMessageLength: statistics.userAvgMessageLength || 0,
      partnerAvgMessageLength: statistics.partnerAvgMessageLength || 0,
      comment: aiInsights.qualityComment || (statistics.positivityRate > 70 
        ? '二人の会話は、温かい光に満ち溢れています。'
        : statistics.positivityRate > 40
        ? '二人の会話は、穏やかな光に包まれています。'
        : '二人の会話は、静かな光を宿しています。')
    };
    
    // P.6-7: 総合診断（関係性の分析を追加）
    analysisContext.reportContent.page67 = {
      overallScore: scores.overallScore,
      relationshipTitle: aiInsights.relationshipType?.title || aiInsights.relationshipType?.relationshipTitle || '二人の特別な関係',
      relationshipReason: aiInsights.relationshipType?.description || aiInsights.relationshipType?.relationshipReason || '素晴らしい関係性です。',
      scoreInterpretation: this.getScoreInterpretation(scores.overallScore),
      // 新しく追加: 関係性の詳細分析
      strengths: aiInsights.relationshipType?.strengths || ['信頼関係', '価値観の一致', '自然な会話'],
      challenges: aiInsights.relationshipType?.challenges || ['もう少し深い話題を', 'タイミングの調整'],
      compatibility: aiInsights.relationshipType?.compatibility || `総合相性${scores.overallScore}%は、お互いを大切に思う関係性を示しています。`,
      communicationStyle: aiInsights.communicationStyle || {
        userStyle: '積極的で親しみやすい',
        partnerStyle: '思慮深く優しい',
        compatibility: 'バランスの取れた良い組み合わせ'
      }
    };
    
    // P.8: レーダーチャート
    analysisContext.reportContent.page8 = {
      title: '絆をかたちづくる五つの光',
      fivePillars: scores.fivePillars,
      strongestPillar: scores.strongestPillar,
      weakestPillar: scores.weakestPillar,
      comment: aiInsights.fivePillarsComment || ''
    };
    
    // P.9-11: アクションプラン
    analysisContext.reportContent.page911 = {
      title: '月からのささやき',
      actionPlans: aiInsights.actionPlans || []
    };
    
    // P.12: 未来予測
    analysisContext.reportContent.page12 = {
      title: '未来のさざ波',
      futureSigns: aiInsights.futureSigns || {
        deepTalk: '中',
        newExperience: '中',
        challenge: '低'
      },
      comment: '月が示す未来は、希望に満ちています。'
    };
    
    // P.13: 締めくくり
    analysisContext.reportContent.page13 = {
      title: '終章 ～月の祝福～',
      body: `${user.name}様へ\n\nここまで読んでいただき、ありがとうございました。\n\n月は、いつも変わらず夜空にあります。\n満ちては欠け、欠けては満ちる。\nその繰り返しの中で、私たちに教えてくれるのは、\n「変化することの美しさ」と「続けることの尊さ」。\n\nお二人の関係も、月のように変化しながら、\nそれでも変わらない何かを大切に育んでいってください。\n\n月詠より、愛と祝福を込めて。`
    };
  }
  
  /**
   * 時間帯に応じたコメント生成
   */
  getTimeComment(hour) {
    if (hour >= 5 && hour < 9) {
      return '朝の光とともに始まる、爽やかな会話';
    } else if (hour >= 9 && hour < 12) {
      return '日中の活動的な時間に交わされる言葉';
    } else if (hour >= 12 && hour < 15) {
      return '昼下がりの穏やかな時間の語らい';
    } else if (hour >= 15 && hour < 18) {
      return '夕暮れ時の優しい言葉のやりとり';
    } else if (hour >= 18 && hour < 21) {
      return '一日の終わりに交わされる温かい会話';
    } else if (hour >= 21 && hour < 24) {
      return '月明かりの下で紡がれる、特別な時間';
    } else {
      return '静寂な深夜に交わされる、心の声';
    }
  }
  
  /**
   * スコアに応じた解釈
   */
  getScoreInterpretation(score) {
    if (score >= 90) {
      return '月が最も美しく輝く、運命的な関係';
    } else if (score >= 80) {
      return '月光が優しく照らす、素晴らしい関係';
    } else if (score >= 70) {
      return '月が静かに見守る、安定した関係';
    } else if (score >= 60) {
      return '月が導く、成長中の関係';
    } else {
      return '月が応援する、これからの関係';
    }
  }
  
  /**
   * サマリー生成
   */
  generateSummary(analysisContext) {
    const { scores, aiInsights, statistics } = analysisContext;
    
    return {
      overallScore: scores.overallScore,
      relationshipType: aiInsights.relationshipType?.relationshipTitle,
      strongestPoint: scores.strongestPillar?.name,
      improvementArea: scores.weakestPillar?.name,
      positivityRate: statistics.positivityRate,
      peakTime: statistics.peakHour,
      totalMessages: analysisContext.messages.length
    };
  }
  
  /**
   * デフォルトの個別メッセージを生成
   */
  generateDefaultPersonalLetter(user, partner, statistics, scores, metadata) {
    const userName = user.name || 'あなた';
    const partnerName = partner.name || 'お相手';
    const overallScore = scores.overallScore || 70;
    const positivityRate = statistics.positivityRate || 65;
    const responseTime = statistics.responseTimeMedian || 30;
    
    return `${userName}様へ

このレポートを手に取っていただき、ありがとうございます。

あなたと${partnerName}様の会話を分析させていただきました。${statistics.messages?.length || 0}件のメッセージの中から、お二人だけの特別な関係性が見えてきました。

まず、最も印象的だったのは、${statistics.peakHour || 20}時台に交わされる会話の温かさです。この時間帯のメッセージには、日中の忙しさから解放された安らぎと、相手への思いやりが感じられます。特に、${statistics.peakDate || '先週'}に交わされた会話は、お二人の関係の深まりを象徴するような内容でした。

あなたの会話スタイルは、平均${statistics.userAvgMessageLength || 20}文字という長さからも分かるように、相手に対して丁寧に想いを伝えようとする姿勢が表れています。一方、${partnerName}様は平均${statistics.partnerAvgMessageLength || 15}文字と、より簡潔な表現を好む傾向があります。この違いは決して悪いことではありません。むしろ、異なるコミュニケーションスタイルが互いを補完し合い、バランスの取れた関係を築いている証拠です。

総合相性${overallScore}%という数値は、単なる数字以上の意味を持っています。これは、お二人が${positivityRate}%というポジティブな会話率を保ちながら、平均${responseTime}分という適切な間隔でメッセージを交換していることの表れです。急ぎすぎず、かといって放置することもない。この絶妙な距離感が、お二人の関係を心地よいものにしているのです。

特に注目したいのは、${scores.strongestPillar?.name || 'コミュニケーション'}の相性が${scores.strongestPillar?.score || 85}点と高い点です。これは、お二人が自然に会話を楽しめる関係であることを示しています。言葉を選ばなくても、相手に伝わる。そんな安心感が、メッセージの端々から感じられました。

一方で、${scores.weakestPillar?.name || 'タイミング'}の相性が${scores.weakestPillar?.score || 60}点とやや低めなのは、改善の余地があることを示しています。しかし、これは決してネガティブな要素ではありません。むしろ、これから更に関係を深めていく可能性を秘めているということです。

あなたが今、相手の気持ちを知りたいと思っているなら、それは自然なことです。会話の中で相手が使う言葉、返信のタイミング、絵文字の選び方。これらすべてが、相手のあなたへの想いを物語っています。

これから先、お二人の関係がどのように発展していくか。それは、日々の小さな積み重ねによって決まります。今日の「おはよう」が、明日の「会いたい」につながり、いつか「ずっと一緒にいたい」という言葉に変わるかもしれません。

月が満ちては欠け、また満ちるように、関係にも波があるのは当然です。大切なのは、その波を二人で乗り越えていくこと。このレポートが、そのための羅針盤となれば幸いです。

最後に、あなたにお伝えしたいことがあります。
相手を想う気持ちは、必ず相手に伝わります。
たとえ今はまだ形になっていなくても、あなたの真摯な想いは、きっと${partnerName}様の心に届いているはずです。

これからも、お二人の物語が素敵なものになりますように。

月詠より、心を込めて`;
  }
  
  /**
   * レポートID生成
   */
  generateReportId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PRV2-${timestamp}-${random}`.toUpperCase();
  }
}

module.exports = PremiumReportGeneratorV2;