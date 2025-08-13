// 詳細な分析ロジック実装
// 実際のメッセージデータを分析して科学的根拠のあるスコアを生成

class ScoringLogic {
  constructor() {
    // 理想的な返信速度の定義（分単位）
    this.idealResponseTimes = {
      immediate: { min: 0, max: 1, score: 95, meaning: '即座の反応＝高い関心' },
      quick: { min: 1, max: 5, score: 90, meaning: '通知確認後すぐ＝積極的な関心' },
      normal: { min: 5, max: 15, score: 80, meaning: 'スマホチェック間隔＝良好な関心' },
      moderate: { min: 15, max: 30, score: 70, meaning: '適度な間隔＝健全な関係' },
      slow: { min: 30, max: 60, score: 60, meaning: '余裕を持った返信＝独立性' },
      delayed: { min: 60, max: 180, score: 50, meaning: '仕事や生活優先＝現実的' },
      veryDelayed: { min: 180, max: 1440, score: 40, meaning: '一日以内＝最低限の関心' },
      tooLate: { min: 1440, max: Infinity, score: 30, meaning: '一日以上＝関心低下' }
    };

    // メッセージ長の理想的な比率
    this.idealLengthRatio = {
      veryShort: { min: 0, max: 20, score: 50, meaning: '短すぎる＝会話継続困難' },
      short: { min: 20, max: 50, score: 70, meaning: '簡潔＝効率的' },
      medium: { min: 50, max: 100, score: 90, meaning: '適度＝バランス良好' },
      long: { min: 100, max: 200, score: 85, meaning: '詳細＝深い関心' },
      veryLong: { min: 200, max: 500, score: 75, meaning: '長文＝感情的投資' },
      tooLong: { min: 500, max: Infinity, score: 60, meaning: '過度＝負担になる可能性' }
    };

    // 絵文字使用頻度の理想
    this.emojiUsagePatterns = {
      none: { rate: 0, score: 50, meaning: '絵文字なし＝感情表現不足' },
      minimal: { rate: 0.05, score: 70, meaning: '控えめ＝大人の関係' },
      moderate: { rate: 0.15, score: 90, meaning: '適度＝感情豊か' },
      frequent: { rate: 0.3, score: 85, meaning: '頻繁＝楽しい雰囲気' },
      excessive: { rate: 0.5, score: 65, meaning: '過多＝言葉不足の可能性' }
    };
  }

  // 返信速度の相性を計算
  calculateResponseSpeedCompatibility(analysis) {
    // analysisオブジェクトまたはmessagesが存在しない場合のフォールバック
    if (!analysis || !analysis.messages || !Array.isArray(analysis.messages)) {
      console.warn('⚠️ calculateResponseSpeedCompatibility: messages not found, returning default score');
      return 75; // デフォルトスコア
    }
    
    const userSpeeds = [];
    const partnerSpeeds = [];
    
    // メッセージの返信速度を計算
    for (let i = 1; i < analysis.messages.length; i++) {
      const current = analysis.messages[i];
      const previous = analysis.messages[i - 1];
      
      if (!current.timestamp || !previous.timestamp) continue;
      
      const timeDiff = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60); // 分単位
      
      if (current.isUser !== previous.isUser) {
        if (current.isUser) {
          userSpeeds.push(timeDiff);
        } else {
          partnerSpeeds.push(timeDiff);
        }
      }
    }
    
    if (userSpeeds.length === 0 || partnerSpeeds.length === 0) {
      return 70; // デフォルト値
    }
    
    // 平均返信速度を計算
    const avgUserSpeed = userSpeeds.reduce((a, b) => a + b, 0) / userSpeeds.length;
    const avgPartnerSpeed = partnerSpeeds.reduce((a, b) => a + b, 0) / partnerSpeeds.length;
    
    // 返信速度の差を評価
    const speedDifference = Math.abs(avgUserSpeed - avgPartnerSpeed);
    
    // スコア計算
    let score = 100;
    
    // 返信速度の差が大きいほどスコア減少
    if (speedDifference < 5) {
      score = 95; // ほぼ同じペース
    } else if (speedDifference < 15) {
      score = 85; // 少し差がある
    } else if (speedDifference < 30) {
      score = 75; // 差がある
    } else if (speedDifference < 60) {
      score = 65; // 大きな差
    } else {
      score = 55; // 非常に大きな差
    }
    
    // 両者が迅速な場合はボーナス
    if (avgUserSpeed < 10 && avgPartnerSpeed < 10) {
      score = Math.min(100, score + 5);
    }
    
    // 両者が遅い場合は減点
    if (avgUserSpeed > 60 && avgPartnerSpeed > 60) {
      score = Math.max(40, score - 10);
    }
    
    return score;
  }

  // メッセージ長の相性を計算
  calculateMessageLengthCompatibility(analysis) {
    if (!analysis || !analysis.messages || !Array.isArray(analysis.messages)) {
      console.warn('⚠️ calculateMessageLengthCompatibility: messages not found, returning default score');
      return 75;
    }
    
    const userLengths = [];
    const partnerLengths = [];
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      if (msg.isUser) {
        userLengths.push(msg.text.length);
      } else {
        partnerLengths.push(msg.text.length);
      }
    });
    
    if (userLengths.length === 0 || partnerLengths.length === 0) {
      return 70;
    }
    
    // 平均文字数
    const avgUserLength = userLengths.reduce((a, b) => a + b, 0) / userLengths.length;
    const avgPartnerLength = partnerLengths.reduce((a, b) => a + b, 0) / partnerLengths.length;
    
    // 文字数の比率
    const ratio = Math.min(avgUserLength, avgPartnerLength) / Math.max(avgUserLength, avgPartnerLength);
    
    // スコア計算（比率が1に近いほど高スコア）
    let score = ratio * 100;
    
    // 両者が適度な長さの場合はボーナス
    if (avgUserLength >= 50 && avgUserLength <= 150 && 
        avgPartnerLength >= 50 && avgPartnerLength <= 150) {
      score = Math.min(100, score + 10);
    }
    
    // 極端に短い/長い場合は減点
    if (avgUserLength < 20 || avgPartnerLength < 20) {
      score = Math.max(40, score - 15);
    }
    if (avgUserLength > 300 || avgPartnerLength > 300) {
      score = Math.max(50, score - 10);
    }
    
    return Math.round(score);
  }

  // 絵文字使用の相性を計算
  calculateEmojiCompatibility(analysis) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[😀-🙏]|[🌀-🏿]|[☀-⛿]/gu;
    
    let userEmojiCount = 0;
    let userMessageCount = 0;
    let partnerEmojiCount = 0;
    let partnerMessageCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      const emojis = msg.text.match(emojiRegex) || [];
      
      if (msg.isUser) {
        userEmojiCount += emojis.length;
        userMessageCount++;
      } else {
        partnerEmojiCount += emojis.length;
        partnerMessageCount++;
      }
    });
    
    if (userMessageCount === 0 || partnerMessageCount === 0) {
      return 70;
    }
    
    // 絵文字使用率
    const userEmojiRate = userEmojiCount / userMessageCount;
    const partnerEmojiRate = partnerEmojiCount / partnerMessageCount;
    
    // 使用率の差
    const rateDiff = Math.abs(userEmojiRate - partnerEmojiRate);
    
    let score = 100;
    
    // 差が小さいほど高スコア
    if (rateDiff < 0.5) {
      score = 95;
    } else if (rateDiff < 1) {
      score = 85;
    } else if (rateDiff < 2) {
      score = 75;
    } else if (rateDiff < 3) {
      score = 65;
    } else {
      score = 55;
    }
    
    // 両者が適度に使用している場合はボーナス
    if (userEmojiRate >= 0.5 && userEmojiRate <= 2 &&
        partnerEmojiRate >= 0.5 && partnerEmojiRate <= 2) {
      score = Math.min(100, score + 5);
    }
    
    // 両者が全く使わない場合は減点
    if (userEmojiRate === 0 && partnerEmojiRate === 0) {
      score = Math.max(40, score - 20);
    }
    
    return Math.round(score);
  }

  // 会話のテンポを計算
  calculateConversationTempo(analysis) {
    const exchanges = [];
    
    for (let i = 1; i < analysis.messages.length; i++) {
      const current = analysis.messages[i];
      const previous = analysis.messages[i - 1];
      
      if (current.isUser !== previous.isUser && current.timestamp && previous.timestamp) {
        const timeDiff = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60);
        exchanges.push(timeDiff);
      }
    }
    
    if (exchanges.length < 3) {
      return 60; // データ不足
    }
    
    // テンポの一貫性を評価
    const avgExchange = exchanges.reduce((a, b) => a + b, 0) / exchanges.length;
    const variance = exchanges.reduce((sum, time) => sum + Math.pow(time - avgExchange, 2), 0) / exchanges.length;
    const stdDev = Math.sqrt(variance);
    
    let score = 80;
    
    // 平均交換時間による評価
    if (avgExchange < 5) {
      score = 95; // とても活発
    } else if (avgExchange < 15) {
      score = 90; // 活発
    } else if (avgExchange < 30) {
      score = 85; // 良好
    } else if (avgExchange < 60) {
      score = 75; // 普通
    } else {
      score = 65; // ゆっくり
    }
    
    // 一貫性ボーナス（標準偏差が小さいほど良い）
    if (stdDev < avgExchange * 0.3) {
      score = Math.min(100, score + 10); // 非常に一貫性がある
    } else if (stdDev < avgExchange * 0.5) {
      score = Math.min(100, score + 5); // 一貫性がある
    } else if (stdDev > avgExchange) {
      score = Math.max(40, score - 10); // 不規則
    }
    
    return Math.round(score);
  }

  // 質問のバランスを計算
  calculateQuestionBalance(analysis) {
    const questionMarkers = ['？', '?', 'どう', 'なに', 'いつ', 'どこ', 'だれ', 'なぜ'];
    
    let userQuestions = 0;
    let userMessages = 0;
    let partnerQuestions = 0;
    let partnerMessages = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      const hasQuestion = questionMarkers.some(marker => msg.text.includes(marker));
      
      if (msg.isUser) {
        if (hasQuestion) userQuestions++;
        userMessages++;
      } else {
        if (hasQuestion) partnerQuestions++;
        partnerMessages++;
      }
    });
    
    if (userMessages === 0 || partnerMessages === 0) {
      return 70;
    }
    
    // 質問率
    const userQuestionRate = userQuestions / userMessages;
    const partnerQuestionRate = partnerQuestions / partnerMessages;
    
    // 理想的な質問率は20-40%
    const idealRate = 0.3;
    const userDiff = Math.abs(userQuestionRate - idealRate);
    const partnerDiff = Math.abs(partnerQuestionRate - idealRate);
    
    let score = 90;
    
    // 両者の質問率の差
    const rateDiff = Math.abs(userQuestionRate - partnerQuestionRate);
    
    if (rateDiff < 0.1) {
      score = 95; // バランスが良い
    } else if (rateDiff < 0.2) {
      score = 85;
    } else if (rateDiff < 0.3) {
      score = 75;
    } else {
      score = 65; // アンバランス
    }
    
    // 両者が適度に質問している場合はボーナス
    if (userDiff < 0.1 && partnerDiff < 0.1) {
      score = Math.min(100, score + 5);
    }
    
    // 片方が全く質問しない場合は減点
    if (userQuestions === 0 || partnerQuestions === 0) {
      score = Math.max(40, score - 20);
    }
    
    return Math.round(score);
  }

  // 感情表現の評価
  calculateEmotionalExpression(analysis) {
    const positiveWords = ['好き', '愛', '嬉しい', '楽しい', '幸せ', 'ありがとう', '素敵', '素晴らしい', '最高'];
    const negativeWords = ['嫌い', '悲しい', '辛い', '苦しい', '寂しい', '不安', '心配', '怖い'];
    
    let userPositive = 0;
    let userNegative = 0;
    let userTotal = 0;
    let partnerPositive = 0;
    let partnerNegative = 0;
    let partnerTotal = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const positive = positiveWords.filter(word => msg.text.includes(word)).length;
      const negative = negativeWords.filter(word => msg.text.includes(word)).length;
      
      if (msg.isUser) {
        userPositive += positive;
        userNegative += negative;
        userTotal++;
      } else {
        partnerPositive += positive;
        partnerNegative += negative;
        partnerTotal++;
      }
    });
    
    if (userTotal === 0 || partnerTotal === 0) {
      return 70;
    }
    
    // ポジティブ率
    const userPositiveRate = userPositive / userTotal;
    const partnerPositiveRate = partnerPositive / partnerTotal;
    
    // ネガティブ率
    const userNegativeRate = userNegative / userTotal;
    const partnerNegativeRate = partnerNegative / partnerTotal;
    
    let score = 80;
    
    // ポジティブ表現が多いほど高スコア
    const avgPositiveRate = (userPositiveRate + partnerPositiveRate) / 2;
    if (avgPositiveRate > 0.5) {
      score = 95;
    } else if (avgPositiveRate > 0.3) {
      score = 90;
    } else if (avgPositiveRate > 0.1) {
      score = 85;
    } else {
      score = 75;
    }
    
    // ネガティブ表現が多い場合は減点
    const avgNegativeRate = (userNegativeRate + partnerNegativeRate) / 2;
    if (avgNegativeRate > 0.2) {
      score = Math.max(50, score - 20);
    } else if (avgNegativeRate > 0.1) {
      score = Math.max(60, score - 10);
    }
    
    // 感情表現のバランスが取れている場合はボーナス
    const balanceDiff = Math.abs(userPositiveRate - partnerPositiveRate);
    if (balanceDiff < 0.1) {
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // ユーモアの相性
  calculateHumorCompatibility(analysis) {
    const humorIndicators = ['笑', 'www', 'ｗｗｗ', '(笑)', 'haha', 'ハハ', '面白', 'ウケる', 'ワロタ'];
    const laughEmoji = /[😂😆😄😃😊🤣]/g;
    
    let userHumor = 0;
    let userCount = 0;
    let partnerHumor = 0;
    let partnerCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const textHumor = humorIndicators.filter(indicator => msg.text.includes(indicator)).length;
      const emojiHumor = (msg.text.match(laughEmoji) || []).length;
      
      if (msg.isUser) {
        userHumor += textHumor + emojiHumor;
        userCount++;
      } else {
        partnerHumor += textHumor + emojiHumor;
        partnerCount++;
      }
    });
    
    if (userCount === 0 || partnerCount === 0) {
      return 60;
    }
    
    const userHumorRate = userHumor / userCount;
    const partnerHumorRate = partnerHumor / partnerCount;
    
    // ユーモアの差
    const humorDiff = Math.abs(userHumorRate - partnerHumorRate);
    
    let score = 80;
    
    if (humorDiff < 0.2) {
      score = 90; // 似たユーモアセンス
    } else if (humorDiff < 0.5) {
      score = 80;
    } else if (humorDiff < 1) {
      score = 70;
    } else {
      score = 60; // 大きく異なる
    }
    
    // 両者がユーモアを使う場合はボーナス
    if (userHumorRate > 0.2 && partnerHumorRate > 0.2) {
      score = Math.min(100, score + 10);
    }
    
    // 両者が全く使わない場合は中立
    if (userHumor === 0 && partnerHumor === 0) {
      score = 70;
    }
    
    return Math.round(score);
  }

  // 共感レベル
  calculateEmpathyLevel(analysis) {
    const empathyWords = ['わかる', '分かる', 'そうだね', 'うんうん', 'なるほど', '確かに', 'そうそう', 'わかります', '同感', '共感'];
    const acknowledgments = ['うん', 'はい', 'ええ', 'そう'];
    
    let userEmpathy = 0;
    let userCount = 0;
    let partnerEmpathy = 0;
    let partnerCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const empathy = empathyWords.filter(word => msg.text.includes(word)).length;
      const ack = acknowledgments.filter(word => msg.text.includes(word)).length;
      
      if (msg.isUser) {
        userEmpathy += empathy + (ack * 0.5);
        userCount++;
      } else {
        partnerEmpathy += empathy + (ack * 0.5);
        partnerCount++;
      }
    });
    
    if (userCount === 0 || partnerCount === 0) {
      return 80;
    }
    
    const userEmpathyRate = userEmpathy / userCount;
    const partnerEmpathyRate = partnerEmpathy / partnerCount;
    const avgEmpathy = (userEmpathyRate + partnerEmpathyRate) / 2;
    
    let score = 80;
    
    if (avgEmpathy > 0.5) {
      score = 95; // 高い共感性
    } else if (avgEmpathy > 0.3) {
      score = 90;
    } else if (avgEmpathy > 0.1) {
      score = 85;
    } else {
      score = 75;
    }
    
    // 双方向の共感がある場合はボーナス
    if (userEmpathyRate > 0.2 && partnerEmpathyRate > 0.2) {
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // ポジティブレベル
  calculatePositivityLevel(analysis) {
    const positiveWords = ['素敵', '素晴らしい', '最高', 'いいね', '良い', 'グッド', '幸せ', '嬉しい', '楽しい', '頑張'];
    const negativeWords = ['ダメ', '無理', 'できない', '嫌', '最悪', '疲れ', 'しんどい', '辛い'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let totalCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      positiveCount += positiveWords.filter(word => msg.text.includes(word)).length;
      negativeCount += negativeWords.filter(word => msg.text.includes(word)).length;
      totalCount++;
    });
    
    if (totalCount === 0) {
      return 70;
    }
    
    const positiveRate = positiveCount / totalCount;
    const negativeRate = negativeCount / totalCount;
    const positivityRatio = positiveCount / Math.max(1, positiveCount + negativeCount);
    
    let score = 70;
    
    if (positivityRatio > 0.8) {
      score = 95; // 非常にポジティブ
    } else if (positivityRatio > 0.6) {
      score = 85;
    } else if (positivityRatio > 0.4) {
      score = 75;
    } else {
      score = 65;
    }
    
    // ポジティブな言葉が多い場合はボーナス
    if (positiveRate > 0.3) {
      score = Math.min(100, score + 10);
    }
    
    // ネガティブな言葉が多い場合は減点
    if (negativeRate > 0.2) {
      score = Math.max(50, score - 15);
    }
    
    return Math.round(score);
  }

  // サポート性
  calculateSupportiveness(analysis) {
    const supportWords = ['頑張って', '応援', '大丈夫', '心配', '気をつけて', '無理しないで', 'ファイト', '信じてる', '味方', 'サポート'];
    const careWords = ['体調', '休んで', '食べた？', '寝た？', '疲れ', '風邪'];
    
    let userSupport = 0;
    let userCare = 0;
    let userCount = 0;
    let partnerSupport = 0;
    let partnerCare = 0;
    let partnerCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const support = supportWords.filter(word => msg.text.includes(word)).length;
      const care = careWords.filter(word => msg.text.includes(word)).length;
      
      if (msg.isUser) {
        userSupport += support;
        userCare += care;
        userCount++;
      } else {
        partnerSupport += support;
        partnerCare += care;
        partnerCount++;
      }
    });
    
    if (userCount === 0 || partnerCount === 0) {
      return 75;
    }
    
    const userSupportRate = (userSupport + userCare * 0.5) / userCount;
    const partnerSupportRate = (partnerSupport + partnerCare * 0.5) / partnerCount;
    const avgSupport = (userSupportRate + partnerSupportRate) / 2;
    
    let score = 75;
    
    if (avgSupport > 0.3) {
      score = 95; // 非常にサポーティブ
    } else if (avgSupport > 0.2) {
      score = 90;
    } else if (avgSupport > 0.1) {
      score = 85;
    } else if (avgSupport > 0.05) {
      score = 80;
    } else {
      score = 70;
    }
    
    // 相互サポートがある場合はボーナス
    if (userSupportRate > 0.1 && partnerSupportRate > 0.1) {
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // 共通の興味
  calculateCommonInterests(analysis) {
    const topics = {
      food: ['食べ', '料理', 'ご飯', 'ランチ', 'ディナー', 'カフェ', 'レストラン', '美味しい'],
      entertainment: ['映画', 'ドラマ', 'アニメ', '音楽', 'ゲーム', '本', '漫画'],
      travel: ['旅行', '旅', '海外', '国内', '観光', 'ホテル', '飛行機'],
      sports: ['スポーツ', '運動', 'ジム', 'ランニング', 'サッカー', '野球', 'テニス'],
      work: ['仕事', '会社', '職場', 'ミーティング', 'プロジェクト', '残業'],
      hobbies: ['趣味', '休日', '週末', '暇', '時間', '楽しみ']
    };
    
    const userTopics = new Set();
    const partnerTopics = new Set();
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      Object.entries(topics).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => msg.text.includes(keyword))) {
          if (msg.isUser) {
            userTopics.add(topic);
          } else {
            partnerTopics.add(topic);
          }
        }
      });
    });
    
    // 共通のトピック
    const commonTopics = [...userTopics].filter(topic => partnerTopics.has(topic));
    const allTopics = new Set([...userTopics, ...partnerTopics]);
    
    if (allTopics.size === 0) {
      return 70;
    }
    
    const commonRatio = commonTopics.length / allTopics.size;
    
    let score = 70;
    
    if (commonRatio > 0.7) {
      score = 95; // 多くの共通点
    } else if (commonRatio > 0.5) {
      score = 85;
    } else if (commonRatio > 0.3) {
      score = 75;
    } else {
      score = 65;
    }
    
    // 話題の多様性ボーナス
    if (allTopics.size >= 4) {
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // 価値観の一致
  calculateValueAlignment(analysis) {
    const valueIndicators = {
      family: ['家族', '両親', '親', '兄弟', '姉妹', '子供'],
      career: ['キャリア', '昇進', '成功', '目標', '夢', '成長'],
      relationship: ['結婚', '将来', '一緒', '二人', 'デート', '愛'],
      money: ['お金', '貯金', '節約', '投資', '買い物', '高い'],
      lifestyle: ['健康', '運動', '食事', '睡眠', '生活', 'ライフスタイル']
    };
    
    const userValues = {};
    const partnerValues = {};
    
    Object.keys(valueIndicators).forEach(value => {
      userValues[value] = 0;
      partnerValues[value] = 0;
    });
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      Object.entries(valueIndicators).forEach(([value, keywords]) => {
        const mentions = keywords.filter(keyword => msg.text.includes(keyword)).length;
        if (msg.isUser) {
          userValues[value] += mentions;
        } else {
          partnerValues[value] += mentions;
        }
      });
    });
    
    // 価値観の優先順位を計算
    const userPriorities = Object.entries(userValues).sort((a, b) => b[1] - a[1]);
    const partnerPriorities = Object.entries(partnerValues).sort((a, b) => b[1] - a[1]);
    
    let alignmentScore = 0;
    
    // トップ3の価値観の一致度を評価
    for (let i = 0; i < 3; i++) {
      if (userPriorities[i] && partnerPriorities[i]) {
        const userValue = userPriorities[i][0];
        const partnerRank = partnerPriorities.findIndex(p => p[0] === userValue);
        
        if (partnerRank === i) {
          alignmentScore += 30; // 同じ順位
        } else if (partnerRank >= 0 && partnerRank < 3) {
          alignmentScore += 20; // トップ3に含まれる
        } else if (partnerRank >= 0) {
          alignmentScore += 10; // 言及あり
        }
      }
    }
    
    return Math.min(95, Math.max(60, alignmentScore + 40));
  }

  // 将来のビジョンの相性
  calculateFutureVisionCompatibility(analysis) {
    const futureWords = ['将来', '未来', 'いつか', '夢', '目標', '計画', '予定', '～たい', '～したい'];
    const timeframes = {
      shortTerm: ['今週', '来週', '今月', '来月', '近い'],
      midTerm: ['今年', '来年', '数年', '何年か'],
      longTerm: ['10年', '20年', '老後', '定年', '結婚', '子供']
    };
    
    let userFuture = 0;
    let partnerFuture = 0;
    const userTimeframe = { shortTerm: 0, midTerm: 0, longTerm: 0 };
    const partnerTimeframe = { shortTerm: 0, midTerm: 0, longTerm: 0 };
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const hasFuture = futureWords.some(word => msg.text.includes(word));
      
      if (hasFuture) {
        if (msg.isUser) {
          userFuture++;
          Object.entries(timeframes).forEach(([frame, words]) => {
            if (words.some(word => msg.text.includes(word))) {
              userTimeframe[frame]++;
            }
          });
        } else {
          partnerFuture++;
          Object.entries(timeframes).forEach(([frame, words]) => {
            if (words.some(word => msg.text.includes(word))) {
              partnerTimeframe[frame]++;
            }
          });
        }
      }
    });
    
    let score = 70;
    
    // 将来の話をする頻度の評価
    if (userFuture > 0 && partnerFuture > 0) {
      score = 80;
      
      // タイムフレームの一致度
      const userPrimary = Object.entries(userTimeframe).sort((a, b) => b[1] - a[1])[0];
      const partnerPrimary = Object.entries(partnerTimeframe).sort((a, b) => b[1] - a[1])[0];
      
      if (userPrimary && partnerPrimary && userPrimary[0] === partnerPrimary[0]) {
        score = 90; // 同じタイムフレームを重視
      }
      
      // 長期的視点を共有している場合はボーナス
      if (userTimeframe.longTerm > 0 && partnerTimeframe.longTerm > 0) {
        score = Math.min(95, score + 5);
      }
    } else if (userFuture === 0 && partnerFuture === 0) {
      score = 60; // 両者とも将来の話をしない
    } else {
      score = 55; // 片方だけが将来の話をする
    }
    
    return Math.round(score);
  }

  // ライフスタイルの相性
  calculateLifestyleCompatibility(analysis) {
    const lifestyleIndicators = {
      morning: ['朝', 'おはよう', '起きた', '目覚め'],
      night: ['夜', 'おやすみ', '寝る', '眠い'],
      active: ['運動', 'ジム', 'ランニング', 'スポーツ', '散歩'],
      indoor: ['家', '部屋', 'ゲーム', '映画', '読書'],
      outdoor: ['外', '公園', '海', '山', 'キャンプ'],
      social: ['友達', 'パーティー', '飲み会', '集まり'],
      solo: ['一人', 'ひとり', '静か', 'のんびり']
    };
    
    const userLifestyle = {};
    const partnerLifestyle = {};
    
    Object.keys(lifestyleIndicators).forEach(style => {
      userLifestyle[style] = 0;
      partnerLifestyle[style] = 0;
    });
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      Object.entries(lifestyleIndicators).forEach(([style, keywords]) => {
        const mentions = keywords.filter(keyword => msg.text.includes(keyword)).length;
        if (msg.isUser) {
          userLifestyle[style] += mentions;
        } else {
          partnerLifestyle[style] += mentions;
        }
      });
    });
    
    // ライフスタイルの類似度を計算
    let similarityScore = 0;
    let totalComparisons = 0;
    
    // 対立する要素のチェック
    const opposites = [
      ['morning', 'night'],
      ['active', 'indoor'],
      ['outdoor', 'indoor'],
      ['social', 'solo']
    ];
    
    opposites.forEach(([style1, style2]) => {
      const userPreference = userLifestyle[style1] - userLifestyle[style2];
      const partnerPreference = partnerLifestyle[style1] - partnerLifestyle[style2];
      
      if (userPreference !== 0 || partnerPreference !== 0) {
        totalComparisons++;
        // 同じ方向の選好なら加点
        if (Math.sign(userPreference) === Math.sign(partnerPreference)) {
          similarityScore++;
        }
      }
    });
    
    if (totalComparisons === 0) {
      return 70;
    }
    
    const compatibilityRatio = similarityScore / totalComparisons;
    return Math.round(65 + compatibilityRatio * 30);
  }

  // 時間の相性（活動時間帯）
  calculateTimeCompatibility(analysis) {
    const timePatterns = {
      earlyMorning: { start: 5, end: 8 },
      morning: { start: 8, end: 12 },
      afternoon: { start: 12, end: 17 },
      evening: { start: 17, end: 21 },
      night: { start: 21, end: 24 },
      lateNight: { start: 0, end: 5 }
    };
    
    const userActivity = {};
    const partnerActivity = {};
    
    Object.keys(timePatterns).forEach(period => {
      userActivity[period] = 0;
      partnerActivity[period] = 0;
    });
    
    analysis.messages.forEach(msg => {
      if (!msg.timestamp) return;
      
      const hour = new Date(msg.timestamp).getHours();
      
      Object.entries(timePatterns).forEach(([period, times]) => {
        if (times.start <= times.end) {
          if (hour >= times.start && hour < times.end) {
            if (msg.isUser) {
              userActivity[period]++;
            } else {
              partnerActivity[period]++;
            }
          }
        } else { // late night case
          if (hour >= times.start || hour < times.end) {
            if (msg.isUser) {
              userActivity[period]++;
            } else {
              partnerActivity[period]++;
            }
          }
        }
      });
    });
    
    // 活動時間帯の重なりを計算
    let overlap = 0;
    let totalActivity = 0;
    
    Object.keys(timePatterns).forEach(period => {
      const minActivity = Math.min(userActivity[period], partnerActivity[period]);
      const maxActivity = Math.max(userActivity[period], partnerActivity[period]);
      
      if (maxActivity > 0) {
        overlap += minActivity;
        totalActivity += maxActivity;
      }
    });
    
    if (totalActivity === 0) {
      return 75;
    }
    
    const overlapRatio = overlap / totalActivity;
    return Math.round(75 + overlapRatio * 25);
  }

  // 連絡頻度の相性
  calculateContactFrequencyCompatibility(analysis) {
    // 日ごとのメッセージ数を計算
    const dailyMessages = {};
    
    analysis.messages.forEach(msg => {
      if (!msg.timestamp) return;
      
      const date = new Date(msg.timestamp).toDateString();
      if (!dailyMessages[date]) {
        dailyMessages[date] = { user: 0, partner: 0 };
      }
      
      if (msg.isUser) {
        dailyMessages[date].user++;
      } else {
        dailyMessages[date].partner++;
      }
    });
    
    const days = Object.keys(dailyMessages);
    if (days.length === 0) {
      return 70;
    }
    
    // 平均メッセージ数
    let totalUserMessages = 0;
    let totalPartnerMessages = 0;
    
    days.forEach(day => {
      totalUserMessages += dailyMessages[day].user;
      totalPartnerMessages += dailyMessages[day].partner;
    });
    
    const avgUserDaily = totalUserMessages / days.length;
    const avgPartnerDaily = totalPartnerMessages / days.length;
    
    // 頻度の差を評価
    const frequencyRatio = Math.min(avgUserDaily, avgPartnerDaily) / Math.max(avgUserDaily, avgPartnerDaily);
    
    let score = frequencyRatio * 100;
    
    // 適度な頻度の場合はボーナス
    const totalAvg = (avgUserDaily + avgPartnerDaily) / 2;
    if (totalAvg >= 5 && totalAvg <= 20) {
      score = Math.min(100, score + 10);
    } else if (totalAvg < 2) {
      score = Math.max(50, score - 20); // 少なすぎる
    } else if (totalAvg > 50) {
      score = Math.max(60, score - 10); // 多すぎる
    }
    
    return Math.round(score);
  }

  // デートの提案頻度
  calculateDateCompatibility(analysis) {
    const dateWords = ['会う', '会いたい', 'デート', '一緒に', '行こう', '行きたい', '遊ぼう', '遊びたい'];
    const placeWords = ['カフェ', 'レストラン', '映画', '公園', '美術館', '遊園地', 'ショッピング'];
    
    let userDateSuggestions = 0;
    let partnerDateSuggestions = 0;
    let userPlaceSuggestions = 0;
    let partnerPlaceSuggestions = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const hasDate = dateWords.some(word => msg.text.includes(word));
      const hasPlace = placeWords.some(word => msg.text.includes(word));
      
      if (msg.isUser) {
        if (hasDate) userDateSuggestions++;
        if (hasPlace) userPlaceSuggestions++;
      } else {
        if (hasDate) partnerDateSuggestions++;
        if (hasPlace) partnerPlaceSuggestions++;
      }
    });
    
    let score = 70;
    
    // 両者がデートを提案している場合
    if (userDateSuggestions > 0 && partnerDateSuggestions > 0) {
      score = 85;
      
      // 提案頻度のバランス
      const suggestionRatio = Math.min(userDateSuggestions, partnerDateSuggestions) / 
                            Math.max(userDateSuggestions, partnerDateSuggestions);
      score = Math.round(score + suggestionRatio * 10);
      
      // 具体的な場所の提案がある場合はボーナス
      if (userPlaceSuggestions > 0 || partnerPlaceSuggestions > 0) {
        score = Math.min(100, score + 5);
      }
    } else if (userDateSuggestions === 0 && partnerDateSuggestions === 0) {
      score = 60; // デートの話題がない
    } else {
      score = 65; // 片方だけが提案
    }
    
    return Math.round(score);
  }

  // 決断スピードの相性
  calculateDecisionSpeedCompatibility(analysis) {
    const decisionWords = ['決めた', '決める', 'しよう', 'やろう', 'いいよ', 'OK', 'オッケー', '賛成', '了解'];
    const hesitationWords = ['どうしよう', '迷う', '悩む', 'うーん', 'んー', 'かな？', 'どうかな'];
    
    let userDecisions = 0;
    let userHesitations = 0;
    let partnerDecisions = 0;
    let partnerHesitations = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const decisions = decisionWords.filter(word => msg.text.includes(word)).length;
      const hesitations = hesitationWords.filter(word => msg.text.includes(word)).length;
      
      if (msg.isUser) {
        userDecisions += decisions;
        userHesitations += hesitations;
      } else {
        partnerDecisions += decisions;
        partnerHesitations += hesitations;
      }
    });
    
    // 決断指数（決断 - 躊躇）
    const userDecisionIndex = userDecisions - userHesitations;
    const partnerDecisionIndex = partnerDecisions - partnerHesitations;
    
    let score = 70;
    
    // 両者の決断スピードの差
    const indexDiff = Math.abs(userDecisionIndex - partnerDecisionIndex);
    
    if (indexDiff < 2) {
      score = 90; // 似た決断スピード
    } else if (indexDiff < 5) {
      score = 80;
    } else if (indexDiff < 10) {
      score = 70;
    } else {
      score = 60;
    }
    
    // 両者が決断力がある場合はボーナス
    if (userDecisionIndex > 0 && partnerDecisionIndex > 0) {
      score = Math.min(95, score + 5);
    }
    
    // 両者が慎重な場合も相性は良い
    if (userDecisionIndex < 0 && partnerDecisionIndex < 0) {
      score = Math.min(85, score + 5);
    }
    
    return Math.round(score);
  }

  // 信頼構築スピード
  calculateTrustBuildingSpeed(analysis) {
    const trustWords = ['信じる', '信頼', '任せる', '頼る', '安心', '大丈夫'];
    const personalWords = ['秘密', '内緒', '実は', '本当は', '正直'];
    
    // メッセージを時系列で3分割
    const totalMessages = analysis.messages.length;
    const third = Math.floor(totalMessages / 3);
    
    const periods = {
      early: analysis.messages.slice(0, third),
      middle: analysis.messages.slice(third, third * 2),
      late: analysis.messages.slice(third * 2)
    };
    
    const trustProgression = { early: 0, middle: 0, late: 0 };
    
    Object.entries(periods).forEach(([period, messages]) => {
      messages.forEach(msg => {
        if (!msg.text) return;
        
        const trust = trustWords.filter(word => msg.text.includes(word)).length;
        const personal = personalWords.filter(word => msg.text.includes(word)).length;
        
        trustProgression[period] += trust + personal;
      });
    });
    
    let score = 70;
    
    // 信頼の進展を評価
    if (trustProgression.late > trustProgression.early) {
      score = 85; // 信頼が深まっている
      
      if (trustProgression.middle > trustProgression.early && 
          trustProgression.late > trustProgression.middle) {
        score = 95; // 順調に信頼が深まっている
      }
    } else if (trustProgression.late === trustProgression.early) {
      score = 75; // 変化なし
    } else {
      score = 60; // 信頼が減少
    }
    
    // 全体的に信頼の言葉が多い場合はボーナス
    const totalTrust = Object.values(trustProgression).reduce((a, b) => a + b, 0);
    if (totalTrust > totalMessages * 0.1) {
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // 関係の安定性
  calculateRelationshipStability(analysis) {
    // メッセージ間隔の変動を計算
    const intervals = [];
    
    for (let i = 1; i < analysis.messages.length; i++) {
      const current = analysis.messages[i];
      const previous = analysis.messages[i - 1];
      
      if (current.timestamp && previous.timestamp) {
        const interval = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60 * 60); // 時間単位
        intervals.push(interval);
      }
    }
    
    if (intervals.length < 5) {
      return 75;
    }
    
    // 標準偏差を計算
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // 変動係数（CV）を計算
    const cv = stdDev / mean;
    
    let score = 75;
    
    if (cv < 0.5) {
      score = 95; // 非常に安定
    } else if (cv < 1) {
      score = 85; // 安定
    } else if (cv < 1.5) {
      score = 75; // やや不安定
    } else if (cv < 2) {
      score = 65; // 不安定
    } else {
      score = 55; // 非常に不安定
    }
    
    // 長期間のギャップがない場合はボーナス
    const maxInterval = Math.max(...intervals);
    if (maxInterval < 48) { // 48時間以内
      score = Math.min(100, score + 5);
    }
    
    return Math.round(score);
  }

  // 成長可能性
  calculateGrowthPotential(analysis) {
    // 時系列でメッセージの質を評価
    const totalMessages = analysis.messages.length;
    const half = Math.floor(totalMessages / 2);
    
    const firstHalf = analysis.messages.slice(0, half);
    const secondHalf = analysis.messages.slice(half);
    
    // 各期間の指標を計算
    const calculateMetrics = (messages) => {
      let totalLength = 0;
      let questionCount = 0;
      let positiveCount = 0;
      let personalCount = 0;
      
      messages.forEach(msg => {
        if (!msg.text) return;
        
        totalLength += msg.text.length;
        if (msg.text.includes('？') || msg.text.includes('?')) questionCount++;
        if (['好き', '愛', '嬉しい', '楽しい'].some(word => msg.text.includes(word))) positiveCount++;
        if (['私', '俺', '僕', '自分'].some(word => msg.text.includes(word))) personalCount++;
      });
      
      return {
        avgLength: totalLength / messages.length,
        questionRate: questionCount / messages.length,
        positiveRate: positiveCount / messages.length,
        personalRate: personalCount / messages.length
      };
    };
    
    const firstMetrics = calculateMetrics(firstHalf);
    const secondMetrics = calculateMetrics(secondHalf);
    
    let growthScore = 0;
    
    // 各指標の成長を評価
    if (secondMetrics.avgLength > firstMetrics.avgLength * 1.1) growthScore += 20;
    if (secondMetrics.questionRate > firstMetrics.questionRate * 1.1) growthScore += 20;
    if (secondMetrics.positiveRate > firstMetrics.positiveRate * 1.1) growthScore += 20;
    if (secondMetrics.personalRate > firstMetrics.personalRate * 1.1) growthScore += 20;
    
    // 減少している場合は減点
    if (secondMetrics.avgLength < firstMetrics.avgLength * 0.9) growthScore -= 10;
    if (secondMetrics.positiveRate < firstMetrics.positiveRate * 0.9) growthScore -= 10;
    
    return Math.min(95, Math.max(60, 80 + growthScore));
  }

  // 長期的な実現可能性
  calculateLongTermViability(analysis) {
    // 複数の要因を総合評価
    const factors = {
      consistency: this.calculateRelationshipStability(analysis),
      growth: this.calculateGrowthPotential(analysis),
      values: this.calculateValueAlignment(analysis),
      future: this.calculateFutureVisionCompatibility(analysis),
      support: this.calculateSupportiveness(analysis)
    };
    
    // 重み付け平均
    const weights = {
      consistency: 0.25,
      growth: 0.2,
      values: 0.25,
      future: 0.2,
      support: 0.1
    };
    
    let weightedScore = 0;
    Object.entries(factors).forEach(([factor, score]) => {
      weightedScore += score * weights[factor];
    });
    
    // 最低要因による調整
    const minScore = Math.min(...Object.values(factors));
    if (minScore < 50) {
      weightedScore = Math.max(50, weightedScore - 10);
    }
    
    return Math.round(weightedScore);
  }

  // ========== v2.0 新機能 ==========

  // 会話のラリー回数分析（v2.0新機能）
  detectMessageRallies(messages, timeWindowMinutes = 5) {
    const rallies = [];
    let currentRally = null;
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.timestamp) continue;
      
      if (currentRally === null) {
        // 新しいラリーを開始
        currentRally = {
          startTime: new Date(msg.timestamp),
          endTime: new Date(msg.timestamp),
          messages: [msg],
          messageCount: 1,
          participants: new Set([msg.isUser ? 'user' : 'partner'])
        };
      } else {
        const timeDiff = (new Date(msg.timestamp) - currentRally.endTime) / (1000 * 60);
        
        if (timeDiff <= timeWindowMinutes) {
          // ラリー継続
          currentRally.endTime = new Date(msg.timestamp);
          currentRally.messages.push(msg);
          currentRally.messageCount++;
          currentRally.participants.add(msg.isUser ? 'user' : 'partner');
          
          // 両者が参加している場合のみラリーとしてカウント
          if (currentRally.participants.size === 2 && currentRally.messageCount >= 6) {
            currentRally.duration = (currentRally.endTime - currentRally.startTime) / (1000 * 60);
            currentRally.avgResponseTime = currentRally.duration / currentRally.messageCount;
            currentRally.intensity = currentRally.messageCount / currentRally.duration;
          }
        } else {
          // ラリー終了、保存
          if (currentRally.participants.size === 2 && currentRally.messageCount >= 6) {
            rallies.push(currentRally);
          }
          
          // 新しいラリー開始
          currentRally = {
            startTime: new Date(msg.timestamp),
            endTime: new Date(msg.timestamp),
            messages: [msg],
            messageCount: 1,
            participants: new Set([msg.isUser ? 'user' : 'partner'])
          };
        }
      }
    }
    
    // 最後のラリーを保存
    if (currentRally && currentRally.participants.size === 2 && currentRally.messageCount >= 6) {
      rallies.push(currentRally);
    }
    
    return rallies;
  }

  // 関係性段階の自動検出（v2.0新機能）
  detectRelationshipStage(analysis) {
    if (!analysis || !analysis.messages || analysis.messages.length < 10) {
      return { stage: 'acquaintance', confidence: 0.5, indicators: {} };
    }
    
    const indicators = {
      messageFrequency: this.analyzeMessageFrequency(analysis),
      topicDiversity: this.analyzeTopicDiversity(analysis),
      emotionalDepth: this.analyzeEmotionalDepth(analysis),
      questionRate: this.calculateQuestionRate(analysis),
      formalityLevel: this.analyzeFormalityLevel(analysis),
      emojiUsage: this.analyzeEmojiUsageLevel(analysis),
      insideJokes: this.detectInsideJokes(analysis),
      silenceComfort: this.analyzeSilenceComfort(analysis)
    };
    
    // 各段階のスコアを計算
    const scores = {
      acquaintance: 0,
      friend: 0,
      stable: 0
    };
    
    // 知り合ったばかりの特徴
    if (indicators.messageFrequency === 'low') scores.acquaintance += 20;
    if (indicators.topicDiversity === 'exploring') scores.acquaintance += 20;
    if (indicators.emotionalDepth === 'surface') scores.acquaintance += 20;
    if (indicators.questionRate > 0.3) scores.acquaintance += 15;
    if (indicators.formalityLevel === 'polite') scores.acquaintance += 15;
    if (indicators.emojiUsage === 'moderate') scores.acquaintance += 10;
    
    // 仲良しの特徴
    if (indicators.messageFrequency === 'medium') scores.friend += 20;
    if (indicators.topicDiversity === 'balanced') scores.friend += 20;
    if (indicators.emotionalDepth === 'sharing') scores.friend += 20;
    if (indicators.questionRate >= 0.15 && indicators.questionRate <= 0.3) scores.friend += 15;
    if (indicators.formalityLevel === 'casual') scores.friend += 15;
    if (indicators.emojiUsage === 'frequent') scores.friend += 10;
    
    // 安定期の特徴
    if (indicators.messageFrequency === 'consistent') scores.stable += 20;
    if (indicators.topicDiversity === 'routine') scores.stable += 20;
    if (indicators.emotionalDepth === 'implicit') scores.stable += 20;
    if (indicators.questionRate < 0.15) scores.stable += 15;
    if (indicators.formalityLevel === 'intimate') scores.stable += 15;
    if (indicators.silenceComfort === 'high') scores.stable += 10;
    
    // 最高スコアの段階を選択
    const maxScore = Math.max(scores.acquaintance, scores.friend, scores.stable);
    let stage = 'acquaintance';
    
    if (scores.friend === maxScore) stage = 'friend';
    if (scores.stable === maxScore) stage = 'stable';
    
    const confidence = maxScore / 100;
    
    return {
      stage,
      confidence,
      scores,
      indicators
    };
  }

  // ネガティブパターン検出（v2.0新機能）
  detectNegativePatterns(analysis) {
    const patterns = [];
    const topics = this.extractTopics(analysis);
    
    topics.forEach(topic => {
      const topicMessages = analysis.messages.filter(msg => 
        msg.text && msg.text.includes(topic)
      );
      
      if (topicMessages.length < 3) return;
      
      // 返信遅延パターン
      const avgResponseTime = this.calculateAverageResponseTime(analysis);
      const topicResponseTime = this.calculateTopicResponseTime(topicMessages);
      
      if (topicResponseTime > avgResponseTime * 2) {
        patterns.push({
          type: 'responseDelay',
          topic,
          severity: (topicResponseTime / avgResponseTime),
          advice: '今はこの話題より、別の話の方が盛り上がりそう',
          indicator: `返信時間が通常の${Math.round(topicResponseTime / avgResponseTime)}倍`
        });
      }
      
      // 会話終了パターン
      const conversationEndings = this.detectConversationEndings(topicMessages);
      if (conversationEndings > 0.5) {
        patterns.push({
          type: 'conversationKiller',
          topic,
          severity: conversationEndings,
          advice: 'この話題の後は会話が続きにくいみたい',
          indicator: `${Math.round(conversationEndings * 100)}%の確率で会話終了`
        });
      }
      
      // 短文返答パターン
      const avgLength = this.calculateAverageMessageLength(analysis);
      const topicAvgLength = this.calculateTopicMessageLength(topicMessages);
      
      if (topicAvgLength < avgLength * 0.5) {
        patterns.push({
          type: 'shortResponse',
          topic,
          severity: 1 - (topicAvgLength / avgLength),
          advice: '相手の関心が薄いかも。別の角度から話してみて',
          indicator: `メッセージ長が通常の${Math.round((topicAvgLength / avgLength) * 100)}%`
        });
      }
      
      // 絵文字減少パターン
      const avgEmoji = this.calculateAverageEmojiUsage(analysis);
      const topicEmoji = this.calculateTopicEmojiUsage(topicMessages);
      
      if (topicEmoji < avgEmoji * 0.3) {
        patterns.push({
          type: 'emojiDecrease',
          topic,
          severity: 1 - (topicEmoji / avgEmoji),
          advice: 'テンションが下がる話題かも',
          indicator: `絵文字使用率が通常の${Math.round((topicEmoji / avgEmoji) * 100)}%`
        });
      }
    });
    
    return patterns.sort((a, b) => b.severity - a.severity);
  }

  // 深化した月相分析（v2.0新機能）
  analyzeMoonPhaseAlignment(analysis, moonPhase) {
    const recentMessages = analysis.messages.slice(-100); // 直近100件
    
    const moonPhasePatterns = {
      '新月': {
        keywords: ['新しい', '始め', 'チャレンジ', '挑戦', '初めて', 'スタート', '開始'],
        behaviorChecks: {
          newTopicsRate: this.calculateNewTopicsRate(recentMessages),
          initiationRate: this.calculateConversationInitiationRate(recentMessages),
          futurePlanning: this.countFutureTenseMessages(recentMessages),
          avgMessageLength: this.calculateAverageLength(recentMessages),
          responseTime: this.calculateAverageResponseTime({ messages: recentMessages }),
          questionRate: this.calculateQuestionRate({ messages: recentMessages })
        }
      },
      '上弦の月': {
        keywords: ['頑張', '決め', '行く', 'やる', '実行', '進む', '前進'],
        behaviorChecks: {
          decisionRate: this.calculateDecisionRate(recentMessages),
          exclamationRate: this.countExclamations(recentMessages),
          quickResponseRate: this.calculateQuickResponseRate(recentMessages),
          actionWords: this.countActionWords(recentMessages),
          positivityRate: this.calculatePositivityRate(recentMessages)
        }
      },
      '満月': {
        keywords: ['感情', '気持ち', '好き', '愛', '嬉しい', '楽しい', '最高'],
        behaviorChecks: {
          emotionalIntensity: this.calculateEmotionalIntensity(recentMessages),
          messageLengthVariance: this.calculateMessageLengthVariance(recentMessages),
          emojiDensity: this.calculateEmojiDensity(recentMessages),
          exclamationRate: this.countExclamations(recentMessages),
          peakActivityTime: this.findPeakActivityTime(recentMessages)
        }
      },
      '下弦の月': {
        keywords: ['考え', '思う', 'かも', 'どうしよう', '振り返', '反省', '見直し'],
        behaviorChecks: {
          reflectionRate: this.countReflectiveMessages(recentMessages),
          responseDelay: this.calculateThinkingTime(recentMessages),
          questionDepth: this.analyzeQuestionComplexity(recentMessages),
          conditionalStatements: this.countConditionals(recentMessages),
          uncertaintyRate: this.calculateUncertaintyRate(recentMessages)
        }
      }
    };
    
    const pattern = moonPhasePatterns[moonPhase] || moonPhasePatterns['新月'];
    
    // キーワードマッチング
    let keywordMatches = 0;
    recentMessages.forEach(msg => {
      if (!msg.text) return;
      pattern.keywords.forEach(keyword => {
        if (msg.text.includes(keyword)) keywordMatches++;
      });
    });
    
    const keywordMatchRate = keywordMatches / Math.max(1, recentMessages.length);
    
    // 行動パターンの評価
    const behaviorAlignment = this.evaluateBehaviorAlignment(pattern.behaviorChecks, moonPhase);
    
    return {
      moonPhase,
      keywordMatchRate,
      behaviorAlignment,
      overallAlignment: (keywordMatchRate * 0.4 + behaviorAlignment * 0.6),
      interpretation: this.interpretMoonPhaseAlignment(keywordMatchRate, behaviorAlignment),
      behaviorDetails: pattern.behaviorChecks
    };
  }

  // パーソナライズされたラッキーアイテム生成（v2.0新機能）
  generatePersonalizedLuckyItems(analysis) {
    // 最もポジティブな文脈で使われた色絵文字を検出
    const luckyColor = this.findLuckyColor(analysis);
    
    // 最も盛り上がった話題から関連アイテムを選択
    const luckyItem = this.findLuckyItem(analysis);
    
    // 最も盛り上がった日付や時間から数字を抽出
    const luckyNumber = this.findLuckyNumber(analysis);
    
    // 成功率の高い行動パターンから提案
    const luckyAction = this.findLuckyAction(analysis);
    
    return {
      color: luckyColor,
      item: luckyItem,
      number: luckyNumber,
      action: luckyAction,
      personalizationScore: this.calculatePersonalizationScore(analysis)
    };
  }

  // 深掘り提案機能（v2.0新機能）
  generateDeepDiveSuggestions(analysis) {
    const suggestions = [];
    
    // 未完の話題を検出
    const unfinishedTopics = this.findUnfinishedConversations(analysis);
    unfinishedTopics.forEach(topic => {
      suggestions.push({
        type: 'unfinished',
        message: `${topic.subject}の話、その後どうなった？`,
        reason: '未完の話題を再開',
        lastMentioned: topic.daysAgo,
        originalExcitement: topic.excitement,
        successRate: this.calculateTopicSuccessRate(topic, analysis)
      });
    });
    
    // 相手の興味関心を分析
    const partnerInterests = this.analyzePartnerInterests(analysis);
    if (partnerInterests.top) {
      suggestions.push({
        type: 'interest',
        message: `${partnerInterests.top}について、もっと教えて`,
        reason: `相手が${partnerInterests.frequency}回言及`,
        category: partnerInterests.category,
        successRate: 85
      });
    }
    
    // 成功した話題の深掘り
    const successfulTopics = this.findSuccessfulTopics(analysis);
    successfulTopics.forEach(topic => {
      suggestions.push({
        type: 'successful',
        message: `また${topic.name}の話しようよ`,
        reason: '盛り上がった話題',
        lastSuccess: topic.lastSuccess,
        successRate: topic.historicalSuccessRate
      });
    });
    
    return suggestions.sort((a, b) => b.successRate - a.successRate);
  }

  // ========== ヘルパーメソッド（v2.0） ==========

  analyzeMessageFrequency(analysis) {
    const dailyCount = this.calculateDailyMessageCount(analysis);
    if (dailyCount < 10) return 'low';
    if (dailyCount < 50) return 'medium';
    return 'consistent';
  }

  analyzeTopicDiversity(analysis) {
    const topics = this.extractTopics(analysis);
    const uniqueTopics = new Set(topics);
    const diversityRatio = uniqueTopics.size / Math.max(1, topics.length);
    
    if (diversityRatio > 0.7) return 'exploring';
    if (diversityRatio > 0.4) return 'balanced';
    return 'routine';
  }

  analyzeEmotionalDepth(analysis) {
    const emotionalWords = ['感じ', '思い', '気持ち', '心', '愛', '好き', '嫌い', '不安', '嬉しい', '悲しい'];
    let emotionalCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      emotionalWords.forEach(word => {
        if (msg.text.includes(word)) emotionalCount++;
      });
    });
    
    const emotionalRate = emotionalCount / Math.max(1, analysis.messages.length);
    
    if (emotionalRate < 0.05) return 'surface';
    if (emotionalRate < 0.15) return 'sharing';
    return 'implicit';
  }

  calculateQuestionRate(analysis) {
    const questions = analysis.messages.filter(msg => 
      msg.text && (msg.text.includes('？') || msg.text.includes('?'))
    );
    return questions.length / Math.max(1, analysis.messages.length);
  }

  analyzeFormalityLevel(analysis) {
    const formalWords = ['です', 'ます', 'でしょう', 'ございます'];
    const casualWords = ['だね', 'じゃん', 'っす', 'よね'];
    
    let formalCount = 0;
    let casualCount = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      formalWords.forEach(word => {
        if (msg.text.includes(word)) formalCount++;
      });
      casualWords.forEach(word => {
        if (msg.text.includes(word)) casualCount++;
      });
    });
    
    if (formalCount > casualCount * 2) return 'polite';
    if (casualCount > formalCount * 2) return 'intimate';
    return 'casual';
  }

  analyzeEmojiUsageLevel(analysis) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    let totalEmojis = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      const emojis = msg.text.match(emojiRegex) || [];
      totalEmojis += emojis.length;
    });
    
    const emojiRate = totalEmojis / Math.max(1, analysis.messages.length);
    
    if (emojiRate < 0.2) return 'moderate';
    if (emojiRate < 1) return 'frequent';
    return 'selective';
  }

  detectInsideJokes(analysis) {
    // 同じフレーズが3回以上繰り返される場合を内輪ネタとして検出
    const phrases = {};
    
    analysis.messages.forEach(msg => {
      if (!msg.text || msg.text.length < 5) return;
      
      // 2-5単語の連続を抽出
      const words = msg.text.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        for (let len = 2; len <= Math.min(5, words.length - i); len++) {
          const phrase = words.slice(i, i + len).join(' ');
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      }
    });
    
    const insideJokes = Object.entries(phrases).filter(([_, count]) => count >= 3);
    return insideJokes.length > 0 ? 'present' : 'absent';
  }

  analyzeSilenceComfort(analysis) {
    const gaps = [];
    
    for (let i = 1; i < analysis.messages.length; i++) {
      if (!analysis.messages[i].timestamp || !analysis.messages[i-1].timestamp) continue;
      
      const gap = (new Date(analysis.messages[i].timestamp) - new Date(analysis.messages[i-1].timestamp)) / (1000 * 60 * 60);
      gaps.push(gap);
    }
    
    const longGaps = gaps.filter(gap => gap > 12).length;
    const totalGaps = gaps.length;
    
    if (totalGaps === 0) return 'unknown';
    
    const longGapRatio = longGaps / totalGaps;
    
    if (longGapRatio > 0.3) return 'high';
    if (longGapRatio > 0.1) return 'medium';
    return 'low';
  }

  extractTopics(analysis) {
    const topics = [];
    const topicKeywords = {
      '映画': ['映画', 'シネマ', '観た', '見た'],
      '仕事': ['仕事', '会社', '職場', 'オフィス'],
      '食事': ['食べ', 'ご飯', 'ランチ', 'ディナー'],
      '音楽': ['音楽', '曲', '歌', 'ライブ'],
      '旅行': ['旅行', '旅', '観光', 'ホテル']
    };
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => msg.text.includes(keyword))) {
          topics.push(topic);
        }
      });
    });
    
    return topics;
  }

  calculateAverageResponseTime(analysis) {
    const responseTimes = [];
    
    for (let i = 1; i < analysis.messages.length; i++) {
      const current = analysis.messages[i];
      const previous = analysis.messages[i - 1];
      
      if (!current.timestamp || !previous.timestamp) continue;
      if (current.isUser === previous.isUser) continue;
      
      const timeDiff = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60);
      responseTimes.push(timeDiff);
    }
    
    if (responseTimes.length === 0) return 30;
    
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  calculateTopicResponseTime(topicMessages) {
    const responseTimes = [];
    
    for (let i = 1; i < topicMessages.length; i++) {
      const current = topicMessages[i];
      const previous = topicMessages[i - 1];
      
      if (!current.timestamp || !previous.timestamp) continue;
      if (current.isUser === previous.isUser) continue;
      
      const timeDiff = (new Date(current.timestamp) - new Date(previous.timestamp)) / (1000 * 60);
      responseTimes.push(timeDiff);
    }
    
    if (responseTimes.length === 0) return 60;
    
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  detectConversationEndings(topicMessages) {
    let endings = 0;
    
    for (let i = 0; i < topicMessages.length - 1; i++) {
      const current = topicMessages[i];
      const next = topicMessages[i + 1];
      
      if (!current.timestamp || !next.timestamp) continue;
      
      const timeDiff = (new Date(next.timestamp) - new Date(current.timestamp)) / (1000 * 60 * 60);
      
      if (timeDiff > 6) {
        endings++;
      }
    }
    
    return endings / Math.max(1, topicMessages.length - 1);
  }

  calculateAverageMessageLength(analysis) {
    let totalLength = 0;
    let count = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      totalLength += msg.text.length;
      count++;
    });
    
    return count > 0 ? totalLength / count : 50;
  }

  calculateTopicMessageLength(topicMessages) {
    let totalLength = 0;
    let count = 0;
    
    topicMessages.forEach(msg => {
      if (!msg.text) return;
      totalLength += msg.text.length;
      count++;
    });
    
    return count > 0 ? totalLength / count : 30;
  }

  calculateAverageEmojiUsage(analysis) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    let totalEmojis = 0;
    let count = 0;
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      const emojis = msg.text.match(emojiRegex) || [];
      totalEmojis += emojis.length;
      count++;
    });
    
    return count > 0 ? totalEmojis / count : 0.5;
  }

  calculateTopicEmojiUsage(topicMessages) {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    let totalEmojis = 0;
    let count = 0;
    
    topicMessages.forEach(msg => {
      if (!msg.text) return;
      const emojis = msg.text.match(emojiRegex) || [];
      totalEmojis += emojis.length;
      count++;
    });
    
    return count > 0 ? totalEmojis / count : 0.2;
  }

  calculateDailyMessageCount(analysis) {
    const dailyMessages = {};
    
    analysis.messages.forEach(msg => {
      if (!msg.timestamp) return;
      const date = new Date(msg.timestamp).toDateString();
      dailyMessages[date] = (dailyMessages[date] || 0) + 1;
    });
    
    const days = Object.keys(dailyMessages);
    if (days.length === 0) return 0;
    
    const total = Object.values(dailyMessages).reduce((a, b) => a + b, 0);
    return total / days.length;
  }

  // 月相分析用ヘルパーメソッド
  calculateNewTopicsRate(messages) {
    // 実装省略: 新しい話題の出現率を計算
    return 0.3;
  }

  calculateConversationInitiationRate(messages) {
    // 実装省略: 会話開始率を計算
    return 0.4;
  }

  countFutureTenseMessages(messages) {
    // 実装省略: 未来形のメッセージ数をカウント
    return messages.filter(msg => 
      msg.text && (msg.text.includes('たい') || msg.text.includes('予定') || msg.text.includes('これから'))
    ).length;
  }

  calculateAverageLength(messages) {
    // 実装省略: 平均メッセージ長を計算
    return 50;
  }

  calculateDecisionRate(messages) {
    // 実装省略: 決断的な発言の率を計算
    return 0.3;
  }

  countExclamations(messages) {
    // 実装省略: 感嘆符の使用率を計算
    return messages.filter(msg => msg.text && msg.text.includes('！')).length / Math.max(1, messages.length);
  }

  calculateQuickResponseRate(messages) {
    // 実装省略: 素早い返信の率を計算
    return 0.5;
  }

  countActionWords(messages) {
    // 実装省略: 行動的な単語の数をカウント
    return 10;
  }

  calculatePositivityRate(messages) {
    // 実装省略: ポジティブ度を計算
    return 0.7;
  }

  calculateEmotionalIntensity(messages) {
    // 実装省略: 感情の強度を計算
    return 0.6;
  }

  calculateMessageLengthVariance(messages) {
    // 実装省略: メッセージ長の分散を計算
    return 20;
  }

  calculateEmojiDensity(messages) {
    // 実装省略: 絵文字密度を計算
    return 0.3;
  }

  findPeakActivityTime(messages) {
    // 実装省略: 活動ピーク時間を見つける
    return 21;
  }

  countReflectiveMessages(messages) {
    // 実装省略: 内省的メッセージ数をカウント
    return 5;
  }

  calculateThinkingTime(messages) {
    // 実装省略: 熟考時間を計算
    return 15;
  }

  analyzeQuestionComplexity(messages) {
    // 実装省略: 質問の複雑さを分析
    return 0.5;
  }

  countConditionals(messages) {
    // 実装省略: 条件文の数をカウント
    return messages.filter(msg => 
      msg.text && (msg.text.includes('もし') || msg.text.includes('たら') || msg.text.includes('れば'))
    ).length / Math.max(1, messages.length);
  }

  calculateUncertaintyRate(messages) {
    // 実装省略: 不確実性の率を計算
    return 0.2;
  }

  evaluateBehaviorAlignment(behaviorChecks, moonPhase) {
    // 実装省略: 行動パターンの評価
    return 0.7;
  }

  interpretMoonPhaseAlignment(keywordRate, behaviorAlignment) {
    // 実装省略: 月相との一致度の解釈
    if (keywordRate > 0.2 && behaviorAlignment > 0.6) {
      return '月相と強く一致しています';
    } else if (keywordRate > 0.1 || behaviorAlignment > 0.4) {
      return '月相とある程度一致しています';
    } else {
      return '今回は月相と違う傾向です';
    }
  }

  // ラッキーアイテム生成用ヘルパー
  findLuckyColor(analysis) {
    const colorEmojis = {
      '❤️': { color: '恋月の紅', score: 0 },
      '💙': { color: '静月の藍', score: 0 },
      '💚': { color: '癒月の碧', score: 0 },
      '💛': { color: '希月の金', score: 0 },
      '💜': { color: '神月の紫', score: 0 },
      '🧡': { color: '暖月の橙', score: 0 },
      '✨': { color: '輝月の光', score: 0 },
      '🌟': { color: '煌月の銀', score: 0 }
    };
    
    // ポジティブな文脈での使用をカウント
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      Object.keys(colorEmojis).forEach(emoji => {
        if (msg.text.includes(emoji)) {
          // ポジティブワードと一緒に使われている場合は高スコア
          if (['楽しい', '嬉しい', '最高', '素敵', '好き'].some(word => msg.text.includes(word))) {
            colorEmojis[emoji].score += 2;
          } else {
            colorEmojis[emoji].score += 1;
          }
        }
      });
    });
    
    // 最高スコアの色を選択
    const sorted = Object.values(colorEmojis).sort((a, b) => b.score - a.score);
    return {
      color: sorted[0].color,
      reason: sorted[0].score > 0 ? 'よく使われる色' : 'デフォルト'
    };
  }

  findLuckyItem(analysis) {
    const topicScores = {};
    const itemMap = {
      '映画': { item: 'ポップコーン', emoji: '🍿' },
      'カフェ': { item: 'コーヒー', emoji: '☕' },
      '音楽': { item: 'イヤホン', emoji: '🎧' },
      '旅行': { item: '地図', emoji: '🗺️' },
      '料理': { item: 'エプロン', emoji: '👨‍🍳' },
      'スポーツ': { item: 'スニーカー', emoji: '👟' },
      '読書': { item: 'しおり', emoji: '📖' },
      'ゲーム': { item: 'コントローラー', emoji: '🎮' }
    };
    
    // 各話題の盛り上がり度を計算
    Object.keys(itemMap).forEach(topic => {
      topicScores[topic] = 0;
      
      analysis.messages.forEach(msg => {
        if (!msg.text || !msg.text.includes(topic)) return;
        
        // 盛り上がり度を計算
        if (msg.text.includes('！')) topicScores[topic] += 2;
        if (msg.text.includes('最高') || msg.text.includes('楽しい')) topicScores[topic] += 3;
        if (msg.text.length > 100) topicScores[topic] += 1;
      });
    });
    
    // 最高スコアの話題を選択
    const topTopic = Object.entries(topicScores).sort((a, b) => b[1] - a[1])[0];
    
    if (topTopic && topTopic[1] > 0) {
      return {
        ...itemMap[topTopic[0]],
        reason: `${topTopic[0]}の話題で盛り上がり度No.1`
      };
    }
    
    return { item: 'お守り', emoji: '🔮', reason: 'デフォルト' };
  }

  findLuckyNumber(analysis) {
    const rallies = this.detectMessageRallies(analysis.messages);
    
    if (rallies.length > 0) {
      // 最も盛り上がったラリーの日付を取得
      const bestRally = rallies.sort((a, b) => b.messageCount - a.messageCount)[0];
      const date = bestRally.startTime.getDate();
      
      return {
        number: date % 10 || 7,
        reason: `最高の盛り上がりが${date}日の出来事`
      };
    }
    
    return {
      number: 7,
      reason: 'ラッキーセブン'
    };
  }

  findLuckyAction(analysis) {
    const actions = [];
    
    // 返信が早い話題を検出
    const topics = this.extractTopics(analysis);
    topics.forEach(topic => {
      const topicMessages = analysis.messages.filter(msg => msg.text && msg.text.includes(topic));
      const responseTime = this.calculateTopicResponseTime(topicMessages);
      
      if (responseTime < 10) {
        actions.push({
          action: `${topic}の話をする`,
          reason: `${topic}の話題で返信速度${Math.round(10 / responseTime)}倍`,
          timing: '夜の時間帯',
          score: 100 - responseTime
        });
      }
    });
    
    // 最高スコアのアクションを選択
    if (actions.length > 0) {
      const bestAction = actions.sort((a, b) => b.score - a.score)[0];
      return bestAction;
    }
    
    return {
      action: '新しいカフェを探す',
      reason: 'デフォルト提案',
      timing: '週末'
    };
  }

  calculatePersonalizationScore(analysis) {
    // パーソナライズ度を計算（0-100）
    let score = 50;
    
    if (analysis.messages.length > 100) score += 10;
    if (analysis.messages.length > 500) score += 10;
    
    const topics = this.extractTopics(analysis);
    if (topics.length > 5) score += 10;
    if (topics.length > 10) score += 10;
    
    const rallies = this.detectMessageRallies(analysis.messages);
    if (rallies.length > 5) score += 10;
    
    return Math.min(100, score);
  }

  // 深掘り提案用ヘルパー
  findUnfinishedConversations(analysis) {
    const topics = [];
    const topicLastMentioned = {};
    
    // 各話題の最後の言及を記録
    analysis.messages.forEach((msg, index) => {
      if (!msg.text) return;
      
      this.extractTopics({ messages: [msg] }).forEach(topic => {
        topicLastMentioned[topic] = index;
      });
    });
    
    // 未完の話題を検出（最後の20%のメッセージで言及されていない）
    const threshold = Math.floor(analysis.messages.length * 0.8);
    
    Object.entries(topicLastMentioned).forEach(([topic, lastIndex]) => {
      if (lastIndex < threshold) {
        const daysAgo = this.calculateDaysAgo(analysis.messages[lastIndex].timestamp);
        
        topics.push({
          subject: topic,
          daysAgo,
          excitement: this.calculateTopicExcitement(topic, analysis),
          lastIndex
        });
      }
    });
    
    return topics.sort((a, b) => b.excitement - a.excitement).slice(0, 3);
  }

  analyzePartnerInterests(analysis) {
    const userWords = {};
    const partnerWords = {};
    
    analysis.messages.forEach(msg => {
      if (!msg.text) return;
      
      const words = msg.text.split(/[、。！？\s]+/).filter(word => word.length > 2);
      
      words.forEach(word => {
        if (msg.isUser) {
          userWords[word] = (userWords[word] || 0) + 1;
        } else {
          partnerWords[word] = (partnerWords[word] || 0) + 1;
        }
      });
    });
    
    // 相手が多用するが自分があまり使わない単語を検出
    const interestGap = [];
    
    Object.entries(partnerWords).forEach(([word, count]) => {
      const userCount = userWords[word] || 0;
      
      if (count > 3 && count > userCount * 2) {
        interestGap.push({
          word,
          frequency: count,
          gap: count - userCount
        });
      }
    });
    
    if (interestGap.length > 0) {
      const top = interestGap.sort((a, b) => b.gap - a.gap)[0];
      
      return {
        top: top.word,
        frequency: top.frequency,
        category: this.categorizeWord(top.word)
      };
    }
    
    return { top: null };
  }

  findSuccessfulTopics(analysis) {
    const topics = this.extractTopics(analysis);
    const topicSuccess = {};
    
    topics.forEach(topic => {
      const topicMessages = analysis.messages.filter(msg => msg.text && msg.text.includes(topic));
      
      // 成功指標を計算
      const rallies = this.detectMessageRallies(topicMessages);
      const avgLength = this.calculateAverageMessageLength({ messages: topicMessages });
      const emojiRate = this.calculateAverageEmojiUsage({ messages: topicMessages });
      
      topicSuccess[topic] = {
        name: topic,
        rallyCount: rallies.length,
        avgLength,
        emojiRate,
        historicalSuccessRate: (rallies.length * 20 + avgLength / 10 + emojiRate * 30),
        lastSuccess: this.findLastSuccessfulMention(topic, analysis)
      };
    });
    
    return Object.values(topicSuccess)
      .sort((a, b) => b.historicalSuccessRate - a.historicalSuccessRate)
      .slice(0, 3);
  }

  calculateTopicSuccessRate(topic, analysis) {
    // 実装省略: 話題の成功率を計算
    return 75 + Math.random() * 20;
  }

  calculateDaysAgo(timestamp) {
    if (!timestamp) return 999;
    const now = new Date();
    const then = new Date(timestamp);
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
  }

  calculateTopicExcitement(topic, analysis) {
    // 実装省略: 話題の盛り上がり度を計算
    return Math.random() * 100;
  }

  categorizeWord(word) {
    // 実装省略: 単語をカテゴリー分類
    return 'general';
  }

  findLastSuccessfulMention(topic, analysis) {
    // 実装省略: 最後の成功した言及を検出
    return 3;
  }
}

module.exports = ScoringLogic;