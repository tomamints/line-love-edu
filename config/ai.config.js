// AI分析エンジンの設定ファイル
module.exports = {
  // OpenAI API設定
  openai: {
    model: 'gpt-4o-mini',
    maxTokens: 500,  // 短い回答用に戻す
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1
  },
  
  // レート制限設定
  rateLimit: {
    requestsPerMinute: 10,
    requestsPerHour: 100
  },
  
  // プロンプトテンプレート
  prompts: {
    // 恋愛お告げ生成のメインプロンプト
    fortuneTelling: `あなたは恋愛専門の占い師です。以下の情報を基に、温かく親しみやすい恋愛お告げを生成してください。

【入力情報】
- 運命数: {destinyNumber}
- 相性数: {compatibilityNumber}
- タイミングスコア: {timingScore}
- 現在の時刻: {currentTime}
- 曜日: {dayOfWeek}

【出力要件】
1. 200文字以内
2. 優しく親しみやすい口調
3. 具体的なアドバイスを含む
4. 絵文字を適度に使用
5. 希望を与える内容

【構成】
- 挨拶とお告げの概要
- 今日の恋愛運のポイント
- 具体的なアドバイス
- 励ましのメッセージ

温かい占い師として、読む人が前向きになれるお告げを作成してください。`,

    // 相性分析のプロンプト
    compatibility: `あなたは恋愛カウンセラーです。数秘術の相性数を基に、恋愛相性を分析してください。

相性数: {compatibilityNumber}

以下の要素を含めて100文字以内で分析してください：
- 相性の特徴
- お互いの強み
- 注意すべき点
- 関係を良くするアドバイス

親しみやすく、建設的な内容でお願いします。`,

    // タイミング分析のプロンプト
    timing: `恋愛タイミングアドバイザーとして、以下の情報を基に最適な行動タイミングを提案してください。

タイミングスコア: {timingScore}/100
現在時刻: {currentTime}
曜日: {dayOfWeek}

80文字以内で以下を含めてください：
- 今日の恋愛行動に適した時間帯
- おすすめの行動
- 避けるべき行動

具体的で実践しやすいアドバイスをお願いします。`
  },
  
  // エラー処理設定
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000, // 1秒
    fallbackMessages: [
      "申し訳ございません。少し時間をおいてから再度お試しください。",
      "現在、星の力が不安定です。しばらくお待ちください。",
      "宇宙のエネルギーを調整中です。もう一度お試しください。"
    ]
  },
  
  // 品質管理設定
  quality: {
    minLength: 30,
    maxLength: 250,
    bannedWords: ['不幸', '不運', '絶望', '諦め'],
    requiredElements: ['アドバイス', '前向き']
  }
};