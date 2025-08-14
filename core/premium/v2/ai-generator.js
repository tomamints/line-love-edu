/**
 * プレミアムレポートV2 AI生成モジュール
 * 月詠としての詩的な文章を生成
 * 既存のBatch AI結果を活用
 */

class AIGenerator {
  constructor(existingAiInsights = null) {
    this.existingAiInsights = existingAiInsights;
  }
  
  /**
   * 全てのAI生成を実行
   * @param {Object} analysisContext - 分析コンテキスト
   */
  async generateAllInsights(analysisContext) {
    // 既存のAI分析結果がある場合はそれを活用
    if (this.existingAiInsights) {
      this.extractFromExistingInsights(analysisContext);
    }
    
    try {
      // P.3: 最も盛り上がった日のコメント
      await this.generatePeakDateComment(analysisContext);
      
      // P.6-7: 関係性のタイトルと説明
      await this.generateRelationshipType(analysisContext);
      
      // P.9-11: アクションプラン
      await this.generateActionPlans(analysisContext);
      
      // P.12: 未来予測
      await this.generateFutureSigns(analysisContext);
      
      // 各ページの月詠コメント生成
      await this.generatePageComments(analysisContext);
      
    } catch (error) {
      console.error('AI生成エラー:', error);
      // エラー時はデフォルト値を使用
      this.setDefaultValues(analysisContext);
    }
  }
  
  /**
   * 既存のAI分析結果から必要な情報を抽出
   */
  extractFromExistingInsights(analysisContext) {
    if (!this.existingAiInsights) return;
    
    const insights = this.existingAiInsights;
    
    // 既存の分析結果を格納
    analysisContext.aiInsights.existingData = {
      personality: insights.personality || [],
      interests: insights.interests || [],
      relationshipStage: insights.relationshipStage || 5,
      advice: insights.advice || [],
      emotionalPattern: insights.emotionalPattern || {},
      communicationStyle: insights.communicationStyle || '',
      optimalTiming: insights.optimalTiming || {},
      suggestedActions: insights.suggestedActions || []
    };
  }
  
  /**
   * P.3: 最も盛り上がった日のコメント生成
   */
  async generatePeakDateComment(analysisContext) {
    const { peakDate, peakDateCount } = analysisContext.statistics;
    
    // 既存のAI分析結果から生成
    const existingData = analysisContext.aiInsights.existingData;
    if (existingData && existingData.emotionalPattern?.positive) {
      const positiveTopics = existingData.emotionalPattern.positive.join('や');
      analysisContext.aiInsights.peakDateComment = 
        `${peakDate}、${positiveTopics}の話題で月が最も輝いた日でした。`;
    } else {
      // デフォルト
      analysisContext.aiInsights.peakDateComment = 
        `${peakDate}、この日は特別な輝きを放っていました。${peakDateCount}もの言葉が交わされ、二人の心が最も近づいた瞬間でした。`;
    }
    return;
    
    const prompt = `
役割: あなたは月詠（つくよみ）です。月の神秘的な存在として、詩的で優しい言葉で語りかけます。

タスク: ${peakDate}という日付に、二人の会話が最も盛り上がった（${peakDateCount}メッセージ）ことについて、月詠として詩的なコメントを1文で生成してください。

制約:
- 50文字以内
- 「月」や「光」「輝き」などの詩的な表現を使用
- 希望的で温かい雰囲気
- 句読点は「。」で終わる

出力形式: 文章のみ（JSONではない）`;
    
    try {
      const response = await this.callOpenAI(prompt);
      analysisContext.aiInsights.peakDateComment = response;
    } catch (error) {
      analysisContext.aiInsights.peakDateComment = 
        `この日、月明かりの下で二人の言葉が美しく響き合いました。`;
    }
  }
  
  /**
   * P.6-7: 関係性のタイトルと説明生成
   */
  async generateRelationshipType(analysisContext) {
    const { scores, statistics } = analysisContext;
    const existingData = analysisContext.aiInsights.existingData;
    
    // 既存のAI分析結果を活用
    if (existingData && existingData.relationshipStage) {
      const stage = existingData.relationshipStage;
      const style = existingData.communicationStyle || '';
      
      // 関係性ステージに基づいてタイトルを生成
      if (stage >= 8) {
        analysisContext.aiInsights.relationshipType = {
          relationshipTitle: '月と太陽のように輝く二人',
          relationshipReason: `${style}な会話が特徴的な二人。互いの存在が、相手をより輝かせる、美しい関係性です。`
        };
      } else if (stage >= 6) {
        analysisContext.aiInsights.relationshipType = {
          relationshipTitle: '静かに寄り添う二つの星',
          relationshipReason: `${style}なやり取りで、適度な距離を保ちながらも、確かな絆で結ばれています。`
        };
      } else if (stage >= 4) {
        analysisContext.aiInsights.relationshipType = {
          relationshipTitle: '成長し続ける若葉の関係',
          relationshipReason: `${style}な雰囲気で、日々成長し変化していく、希望に満ちた関係性です。`
        };
      } else {
        analysisContext.aiInsights.relationshipType = {
          relationshipTitle: '可能性を秘めた種と大地',
          relationshipReason: 'これから育っていく関係性。お互いを理解し合うことで、美しい花を咲かせることができるでしょう。'
        };
      }
    } else {
      // デフォルト
      this.setDefaultRelationshipType(analysisContext);
    }
    return;
    
    const inputData = {
      overallScore: scores.overallScore,
      positivityRate: statistics.positivityRate,
      avgResponseTimeMinutes: statistics.responseTimeMedian,
      userMoonPhase: scores.userMoonPhase || '満月',
      partnerMoonPhase: scores.partnerMoonPhase || '三日月',
      communicationBalance: statistics.communicationBalance
    };
    
    const prompt = `
役割: あなたは月詠（つくよみ）です。月の神秘的な存在として、詩的で優しい言葉で語りかけます。

タスク: 以下の分析データを元に、二人の関係性を表す詩的な「愛称」と、その理由を生成してください。

入力データ:
${JSON.stringify(inputData, null, 2)}

出力要件:
- relationshipTitle: 15-25文字の詩的な関係性の名前（例：「互いを静かに照らす、月と湖」）
- relationshipReason: 100-150文字の説明文。なぜその名前なのかを月詠の視点で詩的に説明

出力形式（JSON）:
{
  "relationshipTitle": "タイトル",
  "relationshipReason": "説明文"
}`;
    
    try {
      const response = await this.callOpenAI(prompt, true);
      analysisContext.aiInsights.relationshipType = response;
    } catch (error) {
      this.setDefaultRelationshipType(analysisContext);
    }
  }
  
  /**
   * P.9-11: アクションプラン生成
   */
  async generateActionPlans(analysisContext) {
    const { strongestPillar, weakestPillar } = analysisContext.scores;
    const existingData = analysisContext.aiInsights.existingData;
    
    // 既存のsuggestedActionsを活用
    if (existingData && existingData.suggestedActions && existingData.suggestedActions.length > 0) {
      analysisContext.aiInsights.actionPlans = existingData.suggestedActions.slice(0, 3).map(action => ({
        title: `もし、${action.timing === '今すぐ' ? '今' : action.timing}行動するなら…`,
        advice: action.action || '素直な気持ちを伝えてみましょう。',
        icon: action.successRate >= 80 ? 'full_moon' : action.successRate >= 60 ? 'crescent_moon' : 'cloudy_moon'
      }));
      
      // 不足分をデフォルトで補完
      while (analysisContext.aiInsights.actionPlans.length < 3) {
        const defaults = this.getDefaultActionPlans();
        analysisContext.aiInsights.actionPlans.push(defaults[analysisContext.aiInsights.actionPlans.length]);
      }
    } else if (existingData && existingData.advice && existingData.advice.length > 0) {
      // adviceを活用
      analysisContext.aiInsights.actionPlans = existingData.advice.slice(0, 3).map((advice, index) => ({
        title: index === 0 ? 'もし、関係を深めたいなら…' : index === 1 ? 'もし、会話を楽しくしたいなら…' : 'もし、特別な時間を作りたいなら…',
        advice: advice,
        icon: index === 0 ? 'full_moon' : index === 1 ? 'crescent_moon' : 'star'
      }));
    } else {
      // デフォルト
      this.setDefaultActionPlans(analysisContext);
    }
    return;
    
    const inputData = {
      strongestPillar: {
        name: strongestPillar.name,
        score: strongestPillar.score
      },
      weakestPillar: {
        name: weakestPillar.name,
        score: weakestPillar.score
      },
      relationshipType: relationshipType?.relationshipTitle || '二人の特別な関係'
    };
    
    const prompt = `
役割: あなたは月詠（つくよみ）です。月の神秘的な存在として、詩的で優しい言葉で語りかけます。

タスク: 以下の分析結果に基づき、関係性をより良くするための具体的なアクションを3つ提案してください。

入力データ:
${JSON.stringify(inputData, null, 2)}

出力要件:
各アクションは以下の形式:
- title: 「もし、〇〇なら…」という形式のタイトル（20-30文字）
- advice: 月詠からの具体的なアドバイス（100-150文字、具体的な行動や言葉の例を含む）
- icon: アイコン名（cloudy_moon, full_moon, crescent_moon, new_moon, star のいずれか）

出力形式（JSON配列）:
[
  {
    "title": "もし、言葉が雲に隠れてしまったなら…",
    "advice": "昔、二人で笑い合った時の話を思い出してみてください。『あの時の〇〇、覚えてる？』そんな一言が、新しい会話の扉を開くでしょう。",
    "icon": "cloudy_moon"
  },
  // 他2つ
]`;
    
    try {
      const response = await this.callOpenAI(prompt, true);
      analysisContext.aiInsights.actionPlans = response;
    } catch (error) {
      this.setDefaultActionPlans(analysisContext);
    }
  }
  
  /**
   * P.12: 未来予測生成
   */
  async generateFutureSigns(analysisContext) {
    const { scores, statistics } = analysisContext;
    
    // グラフの傾向を計算（簡易版）
    const dailyCounts = statistics.dailyMessageCounts || [];
    let recentTrend = '安定';
    if (dailyCounts.length >= 7) {
      const lastWeek = dailyCounts.slice(-7);
      const firstHalf = lastWeek.slice(0, 3).reduce((sum, d) => sum + d.count, 0);
      const secondHalf = lastWeek.slice(4, 7).reduce((sum, d) => sum + d.count, 0);
      if (secondHalf > firstHalf * 1.2) {
        recentTrend = '上昇';
      } else if (secondHalf < firstHalf * 0.8) {
        recentTrend = '下降';
      }
    }
    
    if (!this.openaiClient) {
      // AI未使用時のデフォルト
      this.setDefaultFutureSigns(analysisContext, recentTrend);
      return;
    }
    
    const inputData = {
      overallScore: scores.overallScore,
      fivePillars: Object.entries(scores.fivePillars).reduce((acc, [key, data]) => {
        acc[key] = data.score;
        return acc;
      }, {}),
      recentTrend
    };
    
    const prompt = `
役割: あなたは月詠（つくよみ）です。

タスク: 以下のデータを元に、今後3ヶ月の以下の事象が起こる可能性を評価してください。

入力データ:
${JSON.stringify(inputData, null, 2)}

評価する事象:
1. deepTalk: より深い対話（お互いの本音や深い話題）
2. newExperience: 新しい体験（デートや共同活動）
3. challenge: 小さな試練（すれ違いや誤解）

評価基準:
- 高: 80%以上の可能性
- 中: 50-79%の可能性
- 低: 50%未満の可能性

出力形式（JSON）:
{
  "deepTalk": "高",
  "newExperience": "中",
  "challenge": "低"
}`;
    
    try {
      const response = await this.callOpenAI(prompt, true);
      analysisContext.aiInsights.futureSigns = response;
    } catch (error) {
      this.setDefaultFutureSigns(analysisContext, recentTrend);
    }
  }
  
  /**
   * デフォルトのアクションプランを取得
   */
  getDefaultActionPlans() {
    return [
      {
        title: 'もし、会話が途切れてしまったなら…',
        advice: '「今日はどんな一日だった？」そんなシンプルな問いかけから始めてみてください。相手の日常に興味を持つことが、新しい会話の種になります。',
        icon: 'cloudy_moon'
      },
      {
        title: 'もし、もっと近づきたいと思ったら…',
        advice: '自分の素直な気持ちを、短い言葉でも伝えてみましょう。「今日も話せて嬉しかった」その一言が、相手の心を温かくします。',
        icon: 'full_moon'
      },
      {
        title: 'もし、特別な時間を作りたいなら…',
        advice: '「今度、一緒に月を見ない？」そんな誘いから、二人だけの特別な思い出が生まれます。小さな計画が、大きな幸せにつながるでしょう。',
        icon: 'crescent_moon'
      }
    ];
  }
  
  /**
   * OpenAI APIを呼び出す（将来的な拡張用に残す）
   */
  async callOpenAI(prompt, isJson = false) {
    // 現在は使用しない
    throw new Error('OpenAI direct call not implemented - using Batch API results');
    
    const messages = [
      {
        role: 'system',
        content: 'あなたは月詠（つくよみ）という月の神秘的な存在です。詩的で優しく、希望に満ちた言葉で人々を導きます。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];
    
    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const content = response.choices[0].message.content;
    
    if (isJson) {
      // JSONとして解析
      try {
        return JSON.parse(content);
      } catch (e) {
        // JSON解析に失敗した場合、コードブロックを除去して再試行
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        throw e;
      }
    }
    
    return content;
  }
  
  /**
   * デフォルト値を設定
   */
  setDefaultValues(analysisContext) {
    this.setDefaultRelationshipType(analysisContext);
    this.setDefaultActionPlans(analysisContext);
    this.setDefaultFutureSigns(analysisContext, '安定');
  }
  
  setDefaultRelationshipType(analysisContext) {
    const score = analysisContext.scores.overallScore || 75;
    
    if (score >= 90) {
      analysisContext.aiInsights.relationshipType = {
        relationshipTitle: '月と太陽のように輝く二人',
        relationshipReason: '互いの存在が、相手をより輝かせる。まるで月と太陽のように、それぞれの光で世界を照らし合う、美しい関係性です。'
      };
    } else if (score >= 80) {
      analysisContext.aiInsights.relationshipType = {
        relationshipTitle: '静かに寄り添う、二つの星',
        relationshipReason: '夜空に輝く二つの星のように、適度な距離を保ちながらも、確かな絆で結ばれています。穏やかで安定した関係性です。'
      };
    } else if (score >= 70) {
      analysisContext.aiInsights.relationshipType = {
        relationshipTitle: '成長し続ける若葉の関係',
        relationshipReason: '春の若葉のように、日々成長し変化していく関係性。これからもっと深まる可能性を秘めた、希望に満ちた二人です。'
      };
    } else {
      analysisContext.aiInsights.relationshipType = {
        relationshipTitle: '可能性を秘めた種と大地',
        relationshipReason: '種が大地に根を下ろすように、これから育っていく関係性。お互いを理解し合うことで、美しい花を咲かせることができるでしょう。'
      };
    }
  }
  
  setDefaultActionPlans(analysisContext) {
    analysisContext.aiInsights.actionPlans = this.getDefaultActionPlans();
  }
  
  setDefaultFutureSigns(analysisContext, trend) {
    if (trend === '上昇') {
      analysisContext.aiInsights.futureSigns = {
        deepTalk: '高',
        newExperience: '高',
        challenge: '低'
      };
    } else if (trend === '下降') {
      analysisContext.aiInsights.futureSigns = {
        deepTalk: '中',
        newExperience: '低',
        challenge: '中'
      };
    } else {
      analysisContext.aiInsights.futureSigns = {
        deepTalk: '中',
        newExperience: '中',
        challenge: '低'
      };
    }
  }
  
  /**
   * 各ページの月詠コメントを生成
   */
  async generatePageComments(analysisContext) {
    const { situation, statistics, scores } = analysisContext;
    
    // P.3: 曜日別コメント
    this.generateDailyActivityComment(analysisContext);
    
    // P.4: 時間帯別コメント
    this.generateHourlyActivityComment(analysisContext);
    
    // P.5: 会話の質コメント
    this.generateQualityComment(analysisContext);
    
    // P.8: 5つの柱コメント
    this.generateFivePillarsComment(analysisContext);
  }
  
  /**
   * P.3: 曜日別活動の月詠コメント
   */
  generateDailyActivityComment(analysisContext) {
    const { situation, statistics } = analysisContext;
    const loveSituation = situation?.loveSituation || 'beginning';
    const wantToKnow = situation?.wantToKnow || 'feelings';
    
    // 恋愛状況と知りたいことに基づいたコメント生成
    let comment = '';
    
    if (loveSituation === 'beginning' && wantToKnow === 'feelings') {
      comment = `まだ始まったばかりの関係性の中で、相手の真の気持ちを知りたいあなた。月は告げています、${statistics.peakDate || 'この日'}の活発な会話こそが、相手の心の扉を開く鍵となるでしょう。言葉の温度が高まる時、そこに真実が宿ります。`;
    } else if (loveSituation === 'relationship' && wantToKnow === 'action') {
      comment = `交際を深めているお二人。曜日ごとの会話のリズムは、今後の行動の指針となるでしょう。月が示す道は、最も言葉が輝く日に、大切な話を切り出すこと。月の満ち欠けのように、会話にもリズムがあるのです。`;
    } else if (loveSituation === 'complicated' && wantToKnow === 'past') {
      comment = `複雑な事情を抱える恋の中で、過去の出来事の意味を知りたいあなた。月は、すべての出来事には意味があると告げています。特に活発だった日の会話に、今の状況を解くヒントが隠されています。`;
    } else if (loveSituation === 'ending' && wantToKnow === 'future') {
      comment = `終わりを迎えた関係の未来。月は、新たな始まりの種がすでに蓄かれていることを示しています。過去の会話パターンは、あなたが次に進むべき道を照らす光となるでしょう。`;
    } else {
      // デフォルト
      comment = `月の光が照らし出す、曜日ごとの会話のリズム。${statistics.peakDate || '特別な日'}に最も輝いた言葉たちは、二人の絆の深さを物語っています。月の満ち欠けのように、会話にも自然な波があるのです。`;
    }
    
    analysisContext.aiInsights.dailyActivityComment = comment;
  }
  
  /**
   * P.4: 時間帯別活動の月詠コメント
   */
  generateHourlyActivityComment(analysisContext) {
    const { situation, statistics } = analysisContext;
    const loveSituation = situation?.loveSituation || 'beginning';
    const wantToKnow = situation?.wantToKnow || 'feelings';
    const peakHour = statistics.peakHour || 21;
    
    let comment = '';
    
    if (wantToKnow === 'feelings') {
      comment = `${peakHour}時、月が最も高く昇る頃、相手の本音が最も現れやすい時間です。この時間帯の会話に、相手の真の気持ちが隠されています。月明かりが心の奥底を照らすように、言葉の裏にある真実を読み取りましょう。`;
    } else if (wantToKnow === 'action') {
      comment = `活発な${peakHour}時という時間が、今後の行動のヒントを与えています。月は告げています、この時間を大切にすることで、関係性はより深まると。月の光が最も強い時、勇気を持って一歩踏み出しましょう。`;
    } else {
      comment = `${peakHour}時に最も輝く言葉たち。月が高く昇るこの時間、二人の心も最も近づいています。夜の静寂がもたらす安心感が、素直な言葉を引き出しているのでしょう。`;
    }
    
    analysisContext.aiInsights.hourlyActivityComment = comment;
  }
  
  /**
   * P.5: 会話の質の月詠コメント
   */
  generateQualityComment(analysisContext) {
    const { situation, statistics } = analysisContext;
    const loveSituation = situation?.loveSituation || 'beginning';
    const wantToKnow = situation?.wantToKnow || 'feelings';
    const positivityRate = statistics.positivityRate || 0;
    
    let comment = '';
    
    if (loveSituation === 'ending' && wantToKnow === 'feelings') {
      comment = `終わりを迎えた関係の中で、相手の真の気持ちを知りたいあなた。${positivityRate}%というポジティブ率は、月が告げています、まだ心に温かい光が残っていることを。絵文字や質問の一つ一つに、未練が隠されているかもしれません。`;
    } else if (positivityRate > 70) {
      comment = `${positivityRate}%という高いポジティブ率は、満月のように明るく輝いています。絵文字が舞い、素早い返信が心の距離を縮めています。月は告げています、この温かさを大切に育んでいくことで、さらなる幸福が訪れると。`;
    } else {
      comment = `会話の中に宿る感情の星々。月は静かに照らしています、一つ一つの言葉に込められた思いを。絵文字や質問のバランスが、二人の関係性の現在地を示しています。`;
    }
    
    analysisContext.aiInsights.qualityComment = comment;
  }
  
  /**
   * P.8: 5つの柱の月詠コメント
   */
  generateFivePillarsComment(analysisContext) {
    const { situation, scores } = analysisContext;
    const loveSituation = situation?.loveSituation || 'beginning';
    const wantToKnow = situation?.wantToKnow || 'feelings';
    const strongest = scores.strongestPillar?.name || '心の対話';
    const weakest = scores.weakestPillar?.name || '生活の調和';
    
    let comment = '';
    
    if (loveSituation === 'beginning' && wantToKnow === 'action') {
      comment = `恋の始まりにあるあなたが、今どうすべきかを知りたいのは当然のこと。${strongest}が最も強い光を放つ今、月はこの強みを活かすことを勧めています。${weakest}はまだ新月のように暗いけれど、これから満ちていく可能性を秘めています。`;
    } else if (loveSituation === 'relationship') {
      comment = `交際中のお二人の絆を形作る五つの光。${strongest}は満月のように輝き、関係の土台をしっかりと支えています。${weakest}はまだ成長の余地があるけれど、月は告げています、すべてが完璧である必要はないと。`;
    } else {
      comment = `五つの光が織りなす、あなたたちの絆の形。${strongest}の輝きは特に強く、関係性の核心を成しています。月は教えています、強みを伸ばすことで、弱みも自然と補われていくと。`;
    }
    
    analysisContext.aiInsights.fivePillarsComment = comment;
  }
}

module.exports = AIGenerator;