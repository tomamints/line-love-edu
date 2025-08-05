const OpenAI = require('openai');
const aiConfig = require('../../config/ai.config');
const { cache } = require('../../utils/cache');
const ConversationPeaksAnalyzer = require('./conversation-peaks');

/**
 * AI分析エンジン
 * OpenAI APIを使用してトーク履歴を深層分析
 */
class AIAnalyzer {
  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    this.config = aiConfig;
    this.requestCount = new Map(); // レート制限管理
    this.lastRequestTime = new Map();
    this.peaksAnalyzer = new ConversationPeaksAnalyzer();
  }
  
  /**
   * 会話を包括的に分析
   * @param {array} messages - メッセージ配列
   * @param {string} userId - ユーザーID（キャッシュ用）
   * @returns {object} 分析結果
   */
  async analyzeConversation(messages, userId = null) {
    try {
      // レート制限チェック
      if (!this.checkRateLimit(userId)) {
        return this.getFallbackAnalysis('レート制限');
      }
      
      // キャッシュチェック
      const cacheKey = this.generateCacheKey(messages, userId);
      const cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
      
      // メッセージ前処理
      const processedMessages = this.preprocessMessages(messages);
      
      if (processedMessages.length === 0) {
        return this.getFallbackAnalysis('メッセージ不足');
      }
      
      // 会話の盛り上がり分析
      const peaksAnalysis = this.peaksAnalyzer.analyzeConversationPeaks(messages);
      
      // プロンプト構築（盛り上がり情報を含む）
      const prompt = this.buildAnalysisPrompt(processedMessages, peaksAnalysis);
      
      // OpenAI API呼び出し
      const response = await this.callOpenAI(prompt);
      
      // レスポンス処理
      const analysis = this.processResponse(response);
      
      // 盛り上がり分析結果を統合
      analysis.conversationPeaks = peaksAnalysis;
      
      // バリデーション
      const validatedAnalysis = this.validateResponse(analysis);
      
      // キャッシュに保存
      cache.set(cacheKey, validatedAnalysis, 3600000); // 1時間
      
      // 使用量記録
      this.recordUsage(userId);
      
      return validatedAnalysis;
      
    } catch (error) {
      console.error('AI分析エラー:', error);
      return this.getFallbackAnalysis('API エラー', error.message);
    }
  }
  
  /**
   * メッセージの前処理
   * @param {array} messages - 生メッセージ配列
   * @returns {array} 処理済みメッセージ配列
   */
  preprocessMessages(messages) {
    if (!Array.isArray(messages)) return [];
    
    return messages
      .filter(msg => msg.text && msg.text.trim().length > 0)
      .slice(-100) // 最新100件のみ
      .map(msg => ({
        text: msg.text.substring(0, 500), // 500文字制限
        timestamp: msg.timestamp || new Date().toISOString(),
        isUser: msg.isUser || false
      }));
  }
  
  /**
   * 分析用プロンプトを構築
   * @param {array} messages - 処理済みメッセージ
   * @param {object} peaksAnalysis - 盛り上がり分析結果
   * @returns {array} プロンプトメッセージ配列
   */
  buildAnalysisPrompt(messages, peaksAnalysis = null) {
    const conversationText = messages
      .map(msg => `${msg.isUser ? 'ユーザー' : '相手'}: ${msg.text}`)
      .join('\\n');
    
    const systemPrompt = `あなたは恋愛心理学と占星術の専門家です。
以下のLINEトーク履歴を詳細に分析し、必ずJSON形式で結果を返してください。

分析観点：
1. personality: 相手の性格特性（5つのキーワード配列）
2. emotionalPattern: 感情パターンオブジェクト
3. communicationStyle: コミュニケーションスタイル（文字列）
4. interests: 関心事トップ5（配列）
5. optimalTiming: 最適な連絡タイミング（オブジェクト）
6. avoidTopics: 避けるべき話題（配列）
7. relationshipStage: 関係性の段階1-10（数値）
8. advice: 具体的なアドバイス3つ（配列）
9. responsePatterns: 相手の反応パターン分析（オブジェクト）
10. suggestedActions: 具体的な推奨アクション（配列）

特に重要：
- responsePatterns では、どんなメッセージにどう反応するかを詳細に分析
- suggestedActions では、「こう送ると→こう返ってくる」という具体例を含める

JSON形式での回答を厳守してください。`;

    // 盛り上がり情報を含むコンテキスト
    let peaksContext = '';
    if (peaksAnalysis && peaksAnalysis.peaks.length > 0) {
      const topPeak = peaksAnalysis.peaks[0];
      peaksContext = `\n\n【会話の盛り上がり分析】
- 最も盛り上がった話題: ${topPeak.topics.map(t => t.topic).join(', ')}
- 盛り上がり度: ${topPeak.excitementScore}/100
- 感情トーン: ${topPeak.emotionalTone.dominant}
- パターン: ${peaksAnalysis.patterns.commonTopics.map(t => t.topic).join(', ')}
- 推奨時間帯: ${peaksAnalysis.patterns.bestTimeOfDay || '特定なし'}

この情報を考慮して、より具体的で実用的な分析を行ってください。`;
    }

    const userPrompt = `分析対象の会話:
${conversationText}${peaksContext}

上記の会話を分析し、以下のJSON形式で結果を返してください：
{
  "personality": ["優しい", "慎重", "知的", "ユーモラス", "誠実"],
  "emotionalPattern": {
    "positive": ["褒められたとき", "共通の話題"],
    "negative": ["批判的な発言", "プレッシャー"],
    "neutral": ["日常会話", "事務的な連絡"]
  },
  "communicationStyle": "丁寧で思いやりがある",
  "interests": ["映画", "旅行", "美食", "読書", "音楽"],
  "optimalTiming": {
    "timeOfDay": "夜",
    "frequency": "2-3日に1回",
    "mood": "リラックスしているとき"
  },
  "avoidTopics": ["過去の恋愛", "プライベートすぎる質問"],
  "relationshipStage": 5,
  "advice": [
    "共通の趣味の話題から始める",
    "相手のペースに合わせる",
    "自然な流れでデートに誘う"
  ],
  "responsePatterns": {
    "quickResponse": ["楽しい話題", "質問形式", "写真やスタンプ"],
    "thoughtfulResponse": ["深い話題", "将来の話", "悩み相談"],
    "shortResponse": ["朝の時間帯", "仕事中", "疲れているとき"],
    "enthusiasticResponse": ["趣味の話", "褒め言葉", "共感的な返事"]
  },
  "suggestedActions": [
    {
      "action": "おはよう！今日も一日頑張ろうね☀️",
      "expectedResponse": "おはよう！ありがとう、〇〇も頑張ってね！",
      "timing": "朝7-9時",
      "successRate": 85,
      "basedOn": "朝の挨拶への反応パターン"
    },
    {
      "action": "最近見た映画で面白いのある？",
      "expectedResponse": "〇〇って映画見たよ！すごく良かった！",
      "timing": "夜20-22時",
      "successRate": 90,
      "basedOn": "映画の話題での盛り上がり"
    },
    {
      "action": "今度一緒にカフェでも行かない？",
      "expectedResponse": "いいね！来週末とかどう？",
      "timing": "金曜日の夜",
      "successRate": 75,
      "basedOn": "デートの提案への前向きな反応"
    }
  ]
}`;

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
  }
  
  /**
   * OpenAI APIを呼び出し
   * @param {array} messages - プロンプトメッセージ
   * @returns {string} API レスポンス
   */
  async callOpenAI(messages) {
    const completion = await this.openai.chat.completions.create({
      model: this.config.openai.model,
      messages,
      max_tokens: this.config.openai.maxTokens,
      temperature: this.config.openai.temperature,
      top_p: this.config.openai.topP,
      frequency_penalty: this.config.openai.frequencyPenalty,
      presence_penalty: this.config.openai.presencePenalty,
      response_format: { type: 'json_object' }
    });
    
    return completion.choices[0].message.content;
  }
  
  /**
   * AIレスポンスを処理
   * @param {string} response - OpenAI レスポンス
   * @returns {object} 解析された分析結果
   */
  processResponse(response) {
    try {
      // レスポンスが空の場合のチェック
      if (!response || response.trim() === '') {
        console.warn('AI応答が空です');
        return this.getDefaultAnalysis();
      }
      
      const parsed = JSON.parse(response);
      
      return {
        personality: parsed.personality || [],
        emotionalPattern: parsed.emotionalPattern || {
          positive: [],
          negative: [],
          neutral: []
        },
        communicationStyle: parsed.communicationStyle || '分析不可',
        interests: parsed.interests || [],
        optimalTiming: parsed.optimalTiming || {
          timeOfDay: '夜',
          frequency: '数日に1回',
          mood: 'リラックス時'
        },
        avoidTopics: parsed.avoidTopics || [],
        relationshipStage: parsed.relationshipStage || 5,
        advice: parsed.advice || [],
        responsePatterns: parsed.responsePatterns || {
          quickResponse: [],
          thoughtfulResponse: [],
          shortResponse: [],
          enthusiasticResponse: []
        },
        suggestedActions: parsed.suggestedActions || [],
        confidence: this.calculateConfidence(parsed),
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('JSON解析エラー:', error);
      throw new Error('AI応答の解析に失敗');
    }
  }
  
  /**
   * デフォルトの分析結果を返す
   * @returns {object} デフォルト分析
   */
  getDefaultAnalysis() {
    return {
      personality: ['優しい', '思いやりがある', '真面目'],
      emotionalPattern: {
        positive: ['嬉しい', '楽しい', 'ありがとう'],
        negative: ['心配', '不安'],
        neutral: ['そうですね', 'わかりました']
      },
      communicationStyle: 'バランス型',
      interests: ['日常会話', '趣味', '食事'],
      optimalTiming: {
        timeOfDay: '夜',
        frequency: '毎日',
        mood: 'リラックス時'
      },
      avoidTopics: [],
      relationshipStage: 5,
      advice: [
        '相手のペースに合わせて会話を進めましょう',
        '共通の話題を見つけて深めていきましょう',
        '素直な気持ちを伝えることが大切です'
      ],
      responsePatterns: {
        quickResponse: ['楽しい話題'],
        thoughtfulResponse: ['将来の話'],
        shortResponse: ['忙しい時'],
        enthusiasticResponse: ['趣味の話']
      },
      suggestedActions: [
        {
          action: '今度の週末について聞いてみる',
          expectedResponse: '予定を確認して返事をくれるでしょう',
          basedOn: '週末の話題での反応',
          timing: '金曜日の夜',
          successRate: 80,
          isPersonalized: false
        }
      ],
      confidence: 50,
      exampleMessages: []
    };
  }
  
  /**
   * レスポンスの妥当性を検証
   * @param {object} analysis - 分析結果
   * @returns {object} 検証済み分析結果
   */
  validateResponse(analysis) {
    // 必須フィールドの補完
    const validated = {
      personality: Array.isArray(analysis.personality) ? 
        analysis.personality.slice(0, 5) : ['優しい', '思いやりがある'],
        
      emotionalPattern: {
        positive: Array.isArray(analysis.emotionalPattern?.positive) ? 
          analysis.emotionalPattern.positive.slice(0, 5) : ['褒められたとき'],
        negative: Array.isArray(analysis.emotionalPattern?.negative) ? 
          analysis.emotionalPattern.negative.slice(0, 5) : ['批判'],
        neutral: Array.isArray(analysis.emotionalPattern?.neutral) ? 
          analysis.emotionalPattern.neutral.slice(0, 5) : ['日常会話']
      },
      
      communicationStyle: typeof analysis.communicationStyle === 'string' ? 
        analysis.communicationStyle : '丁寧で親しみやすい',
        
      interests: Array.isArray(analysis.interests) ? 
        analysis.interests.slice(0, 5) : ['映画', '音楽'],
        
      optimalTiming: {
        timeOfDay: analysis.optimalTiming?.timeOfDay || '夜',
        frequency: analysis.optimalTiming?.frequency || '2-3日に1回',
        mood: analysis.optimalTiming?.mood || 'リラックス時'
      },
      
      avoidTopics: Array.isArray(analysis.avoidTopics) ? 
        analysis.avoidTopics.slice(0, 5) : ['プライベートな質問'],
        
      relationshipStage: typeof analysis.relationshipStage === 'number' ? 
        Math.max(1, Math.min(10, analysis.relationshipStage)) : 5,
        
      advice: Array.isArray(analysis.advice) ? 
        analysis.advice.slice(0, 3) : ['自然な会話を心がける'],
        
      responsePatterns: {
        quickResponse: Array.isArray(analysis.responsePatterns?.quickResponse) ?
          analysis.responsePatterns.quickResponse : ['楽しい話題'],
        thoughtfulResponse: Array.isArray(analysis.responsePatterns?.thoughtfulResponse) ?
          analysis.responsePatterns.thoughtfulResponse : ['深い話題'],
        shortResponse: Array.isArray(analysis.responsePatterns?.shortResponse) ?
          analysis.responsePatterns.shortResponse : ['忙しい時間帯'],
        enthusiasticResponse: Array.isArray(analysis.responsePatterns?.enthusiasticResponse) ?
          analysis.responsePatterns.enthusiasticResponse : ['趣味の話']
      },
      
      suggestedActions: Array.isArray(analysis.suggestedActions) ? 
        analysis.suggestedActions.slice(0, 5) : [{
          action: '気軽な挨拶から始める',
          expectedResponse: 'ポジティブな返事',
          timing: '夜の時間帯',
          successRate: 70,
          basedOn: '一般的なパターン'
        }],
        
      conversationPeaks: analysis.conversationPeaks || {
        peaks: [],
        patterns: {},
        recommendations: []
      },
        
      confidence: analysis.confidence || 0.7,
      analyzedAt: analysis.analyzedAt || new Date().toISOString()
    };
    
    return validated;
  }
  
  /**
   * フォールバック分析結果を生成
   * @param {string} reason - 理由
   * @param {string} details - 詳細（オプション）
   * @returns {object} デフォルト分析結果
   */
  getFallbackAnalysis(reason = 'unknown', details = '') {
    return {
      personality: ['優しい', '思いやりがある', '誠実', '控えめ', '温かい'],
      emotionalPattern: {
        positive: ['褒められたとき', '共感してもらったとき', '楽しい話題'],
        negative: ['批判的な発言', 'プレッシャー', '急かされること'],
        neutral: ['日常の報告', '事務的な連絡', '天気の話']
      },
      communicationStyle: '丁寧で親しみやすく、相手を思いやる',
      interests: ['映画', '音楽', '美食', '旅行', '読書'],
      optimalTiming: {
        timeOfDay: '夜',
        frequency: '2-3日に1回',
        mood: 'リラックスしているとき'
      },
      avoidTopics: ['過去の恋愛', 'プライベートすぎる質問', '重い話題'],
      relationshipStage: 5,
      advice: [
        '相手のペースに合わせて自然な会話を心がける',
        '共通の趣味や関心事を見つけて話題にする',
        '相手の気持ちを尊重し、押し付けがましくならない'
      ],
      confidence: 0.5,
      analyzedAt: new Date().toISOString(),
      fallbackReason: reason,
      fallbackDetails: details
    };
  }
  
  /**
   * 信頼度を計算
   * @param {object} analysis - 分析結果
   * @returns {number} 信頼度（0-100）
   */
  calculateConfidence(analysis) {
    let confidence = 50; // 基本値
    
    // 各要素の存在で信頼度を上げる
    if (analysis.personality && analysis.personality.length > 0) confidence += 10;
    if (analysis.interests && analysis.interests.length > 0) confidence += 10;
    if (analysis.advice && analysis.advice.length > 0) confidence += 10;
    if (analysis.suggestedActions && analysis.suggestedActions.length > 0) confidence += 10;
    if (analysis.responsePatterns) confidence += 10;
    
    return Math.min(100, confidence);
  }
  
  /**
   * レート制限をチェック
   * @param {string} userId - ユーザーID
   * @returns {boolean} リクエスト可能かどうか
   */
  checkRateLimit(userId) {
    if (!userId) return true;
    
    const now = Date.now();
    const lastRequest = this.lastRequestTime.get(userId) || 0;
    
    // 同一ユーザーは1時間に1回まで
    if (now - lastRequest < 3600000) {
      return false;
    }
    
    return true;
  }
  
  /**
   * キャッシュキーを生成
   * @param {array} messages - メッセージ配列
   * @param {string} userId - ユーザーID
   * @returns {string} キャッシュキー
   */
  generateCacheKey(messages, userId) {
    const messageHash = messages
      .slice(-10) // 最新10件をハッシュ計算に使用
      .map(msg => msg.text)
      .join('')
      .length; // 簡易ハッシュ
      
    return `ai_analysis:${userId}:${messageHash}`;
  }
  
  /**
   * 分析の信頼度を計算
   * @param {object} analysis - 分析結果
   * @returns {number} 信頼度（0-1）
   */
  calculateConfidence(analysis) {
    let confidence = 0.5; // ベース信頼度
    
    // データの充実度で加点
    if (analysis.personality?.length >= 3) confidence += 0.1;
    if (analysis.interests?.length >= 3) confidence += 0.1;
    if (analysis.advice?.length >= 2) confidence += 0.1;
    if (analysis.emotionalPattern?.positive?.length > 0) confidence += 0.1;
    if (typeof analysis.relationshipStage === 'number') confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * 使用量を記録
   * @param {string} userId - ユーザーID
   */
  recordUsage(userId) {
    const now = Date.now();
    this.lastRequestTime.set(userId, now);
    
    const count = this.requestCount.get(userId) || 0;
    this.requestCount.set(userId, count + 1);
  }
  
  /**
   * 使用統計を取得
   * @returns {object} 使用統計
   */
  getUsageStats() {
    return {
      totalUsers: this.requestCount.size,
      totalRequests: Array.from(this.requestCount.values()).reduce((sum, count) => sum + count, 0),
      cacheStats: cache.getStats()
    };
  }
  
  /**
   * 恋愛アドバイスを生成
   * @param {object} analysis - 分析結果
   * @returns {object} 恋愛アドバイス
   */
  generateLoveAdvice(analysis) {
    const stage = analysis.relationshipStage || 5;
    const personality = analysis.personality || [];
    const interests = analysis.interests || [];
    
    let stageAdvice = '';
    
    if (stage <= 3) {
      stageAdvice = '関係構築期：お互いを知る段階なので、焦らず自然な交流を心がけましょう';
    } else if (stage <= 6) {
      stageAdvice = '発展期：信頼関係が築かれてきています。より深い話題や体験を共有してみて';
    } else if (stage <= 8) {
      stageAdvice = '安定期：良好な関係が築けています。将来について話し合うのも良いでしょう';
    } else {
      stageAdvice = '成熟期：深い絆で結ばれています。お互いを支え合う関係を大切に';
    }
    
    return {
      stageAdvice,
      personalityTips: this.getPersonalityTips(personality),
      interestBasedSuggestions: this.getInterestSuggestions(interests),
      nextStepRecommendations: this.getNextStepRecommendations(stage)
    };
  }
  
  /**
   * 性格に基づくアドバイス
   * @param {array} personality - 性格特性
   * @returns {array} アドバイス配列
   */
  getPersonalityTips(personality) {
    const tips = [];
    
    if (personality.includes('慎重') || personality.includes('控えめ')) {
      tips.push('相手は慎重な性格なので、急がずゆっくりと関係を深めていきましょう');
    }
    
    if (personality.includes('優しい') || personality.includes('思いやり')) {
      tips.push('相手の優しさを受け止め、感謝の気持ちを伝えることが大切です');
    }
    
    if (personality.includes('ユーモラス') || personality.includes('明るい')) {
      tips.push('楽しい話題や笑えるエピソードを共有すると良い反応が期待できます');
    }
    
    return tips.length > 0 ? tips : ['相手の個性を大切にし、ありのままを受け入れましょう'];
  }
  
  /**
   * 興味に基づく提案
   * @param {array} interests - 興味配列
   * @returns {array} 提案配列
   */
  getInterestSuggestions(interests) {
    const suggestions = [];
    
    interests.forEach(interest => {
      switch (interest) {
        case '映画':
          suggestions.push('映画鑑賞デートや話題の映画について語り合う');
          break;
        case '音楽':
          suggestions.push('コンサートやライブに一緒に行く、好きなアーティストを紹介し合う');
          break;
        case '美食':
          suggestions.push('美味しいレストラン巡りや料理教室への参加');
          break;
        case '旅行':
          suggestions.push('週末の小旅行や旅行計画を一緒に立てる');
          break;
        case '読書':
          suggestions.push('おすすめの本を紹介し合う、本屋さんデート');
          break;
      }
    });
    
    return suggestions.length > 0 ? suggestions : ['共通の趣味を見つけて一緒に楽しんでみましょう'];
  }
  
  /**
   * 次のステップの推奨事項
   * @param {number} stage - 関係性の段階
   * @returns {array} 推奨事項配列
   */
  getNextStepRecommendations(stage) {
    if (stage <= 3) {
      return [
        '定期的な連絡を心がける',
        '相手の話をよく聞く',
        'グループでの集まりに誘ってみる'
      ];
    } else if (stage <= 6) {
      return [
        '二人だけのデートを提案する',
        '相手の価値観や夢について聞いてみる',
        '自分の気持ちを少しずつ伝える'
      ];
    } else if (stage <= 8) {
      return [
        '将来の話をしてみる',
        'お互いの家族や友人について話す',
        '特別な記念日を大切にする'
      ];
    } else {
      return [
        '関係をより深いものにする',
        'お互いの成長を支え合う',
        '長期的なパートナーシップを築く'
      ];
    }
  }
}

module.exports = AIAnalyzer;