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
   * @param {object} personalInfo - プロフィール情報（オプション）
   * @returns {object} 分析結果
   */
  async analyzeConversation(messages, userId = null, personalInfo = null) {
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
      
      // プロンプト構築（盛り上がり情報とプロフィール情報を含む）
      const prompt = this.buildAnalysisPrompt(processedMessages, peaksAnalysis, personalInfo);
      
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
      .slice(-200) // 最新200件に増加
      .map(msg => ({
        text: msg.text.substring(0, 200), // 200文字制限（通常のLINEメッセージには十分）
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
  buildAnalysisPrompt(messages, peaksAnalysis = null, personalInfo = null) {
    // 会話履歴を3000文字まで拡張
    const conversationText = messages
      .map(msg => `${msg.isUser ? '👤' : '💬'}: ${msg.text}`)
      .join('\n');
    
    const systemPrompt = `あなたは恋愛心理の専門家です。LINEの会話履歴から相手の性格、感情パターン、関係性を分析します。
分析は具体的で実用的なものにし、必ずJSON形式で返答してください。`;

    // より構造化されたプロンプト
    const userPrompt = `以下のLINE会話を分析して、恋愛アドバイスを生成してください。

## 会話履歴（👤=ユーザー、💬=相手）
${conversationText.substring(0, 3000)}

${peaksAnalysis && peaksAnalysis.peaks.length > 0 ? `
## 会話分析データ
- 盛り上がった話題: ${peaksAnalysis.peaks[0].topics.map(t => t.topic).join(', ')}
- 盛り上がり度: ${peaksAnalysis.peaks[0].excitementScore}%
- 感情: ${peaksAnalysis.peaks[0].emotionalTone.dominant}
` : ''}

${personalInfo ? `
## プロフィール
- ユーザー: ${personalInfo.userAge}歳
- 相手: ${personalInfo.partnerAge}歳 ${personalInfo.partnerGender === 'male' ? '男性' : '女性'}
` : ''}

## タスク：会話分析と恋愛アドバイスの生成

あなたのタスクは、上記の会話履歴を分析して、以下の項目について具体的な分析結果をJSON形式で返すことです。

### 分析項目の説明：

1. **personality** (配列・必須): 相手の性格特徴を3つ挙げてください
   - 例: ["優しい", "マイペース", "好奇心旺盛"]

2. **interests** (配列・必須): 会話から読み取れる相手の興味・関心事を3つ
   - 例: ["映画", "カフェ巡り", "音楽"]

3. **relationshipStage** (数値・必須): 現在の関係性を1-10で評価
   - 1-3: 知り合い程度
   - 4-6: 友達
   - 7-9: 好意がある関係
   - 10: 恋人

4. **advice** (配列・必須): ユーザーへの具体的な恋愛アドバイスを2つ
   - 実行可能で具体的な内容にしてください

5. **emotionalPattern** (オブジェクト・必須): 相手の感情パターン
   - positive: ポジティブな反応を示す話題（2つ）
   - negative: ネガティブまたは冷たい反応を示す話題（1つ）

6. **communicationStyle** (文字列・必須): 相手のコミュニケーションスタイル
   - 例: "絵文字多め・フレンドリー" や "丁寧・慎重" など

7. **optimalTiming** (オブジェクト・必須): 連絡のベストタイミング
   - timeOfDay: "朝", "昼", "夕方", "夜", "深夜" のいずれか
   - frequency: "毎日", "2-3日に1回", "週1-2回" など

8. **avoidTopics** (配列・必須): 避けるべき話題のリスト

9. **responsePatterns** (オブジェクト・必須): 相手の返信パターン分析
   - quickResponse: すぐ返信が来る時の特徴
   - thoughtfulResponse: 時間をかけて返信する時の特徴
   - shortResponse: 短い返信の時の特徴
   - enthusiasticResponse: 盛り上がっている時の特徴

10. **suggestedActions** (配列・必須): 具体的なアクション提案（最低1つ、最大3つ）
    各アクションには以下を含める：
    - action: 送るべきメッセージの具体例
    - expectedResponse: 予想される相手の反応
    - timing: いつ送るべきか（"今すぐ", "明日の朝", "週末" など）
    - successRate: 成功確率（0-100の数値）
    - basedOn: この提案の根拠（会話のどの部分から判断したか）

### 出力形式：
以下の形式で、JSONのみを返してください。説明文や追加のテキストは不要です。

\`\`\`json
{
  "personality": ["優しい", "思いやりがある", "少し慎重"],
  "interests": ["カフェ巡り", "映画鑑賞", "音楽"],
  "relationshipStage": 6,
  "advice": [
    "相手は慎重なタイプなので、焦らずゆっくり関係を深めましょう",
    "映画の話題で盛り上がることが多いので、新作映画の情報を共有すると良いでしょう"
  ],
  "emotionalPattern": {
    "positive": ["趣味の話", "日常の出来事"],
    "negative": ["仕事の愚痴"]
  },
  "communicationStyle": "絵文字多め・親しみやすい",
  "optimalTiming": {
    "timeOfDay": "夜",
    "frequency": "毎日"
  },
  "avoidTopics": ["過去の恋愛", "収入の話"],
  "responsePatterns": {
    "quickResponse": ["挨拶", "簡単な質問"],
    "thoughtfulResponse": ["相談事", "将来の話"],
    "shortResponse": ["朝の時間帯", "仕事中"],
    "enthusiasticResponse": ["週末の予定", "趣味の話"]
  },
  "suggestedActions": [
    {
      "action": "今度の週末、気になってたカフェに行ってみない？",
      "expectedResponse": "いいね！どこのカフェ？",
      "timing": "金曜日の夜",
      "successRate": 85,
      "basedOn": "カフェの話題での高い反応率"
    }
  ]
}
\`\`\`

重要：
- 上記の例と同じ構造で返してください
- すべての値は実際の会話内容に基づいて具体的に記載
- relationshipStageは1-10の整数値
- successRateは0-100の整数値
- JSON以外のテキストは含めないでください`;

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
    // デバッグ: 実際に送信するデータをログ出力
    console.log('🚀 OpenAI APIに送信するデータ:');
    console.log('📊 メッセージ数:', messages.length);
    messages.forEach((msg, idx) => {
      console.log(`📝 Message ${idx + 1} (${msg.role}):`);
      console.log(`   文字数: ${msg.content.length}文字`);
      console.log(`   内容プレビュー: ${msg.content.substring(0, 200)}...`);
    });
    console.log('📊 推定トークン数:', Math.ceil(messages.reduce((sum, m) => sum + m.content.length, 0) / 2.5));
    
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
      
      let cleanedResponse = response.trim();
      
      // ```json と ``` を削除（ChatGPTがコードブロックで返す場合の対処）
      if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
      }
      
      // JSONの前後に余計なテキストがある場合の対処
      // 最初の { から最後の } までを抽出
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      // 文字列が途中で切れている場合の処理
      // 未終了の文字列を検出して閉じる
      const stringMatches = cleanedResponse.match(/"[^"]*$/);
      if (stringMatches) {
        console.warn('未終了の文字列を検出、修正を試みます');
        cleanedResponse += '"}';
      }
      
      // 末尾に}が不足している場合の対応
      const openBraces = (cleanedResponse.match(/{/g) || []).length;
      const closeBraces = (cleanedResponse.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        cleanedResponse += '}'.repeat(openBraces - closeBraces);
      }
      
      // 末尾に]が不足している場合の対応
      const openBrackets = (cleanedResponse.match(/\[/g) || []).length;
      const closeBrackets = (cleanedResponse.match(/\]/g) || []).length;
      if (openBrackets > closeBrackets) {
        cleanedResponse += ']'.repeat(openBrackets - closeBrackets);
      }
      
      console.log('🔍 JSON解析前のレスポンス長:', cleanedResponse.length, '文字');
      const parsed = JSON.parse(cleanedResponse);
      
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
      console.log('デフォルト分析を使用します');
      return this.getDefaultAnalysis();
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