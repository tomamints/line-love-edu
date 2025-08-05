/**
 * 会話の盛り上がり分析モジュール
 * トーク履歴から盛り上がった瞬間を検出し分析
 */

class ConversationPeaksAnalyzer {
  /**
   * 会話の盛り上がりを分析
   * @param {array} messages - メッセージ配列
   * @returns {object} 盛り上がり分析結果
   */
  analyzeConversationPeaks(messages) {
    if (!messages || messages.length < 5) {
      return this.getDefaultPeaks();
    }
    
    // 会話のセグメントを作成（連続した会話のまとまり）
    const segments = this.createConversationSegments(messages);
    
    // 各セグメントの盛り上がり度を計算
    const peakSegments = segments.map(segment => ({
      ...segment,
      excitementScore: this.calculateExcitementScore(segment),
      topics: this.extractTopics(segment),
      emotionalTone: this.analyzeEmotionalTone(segment)
    }));
    
    // 盛り上がり度でソート
    const topPeaks = peakSegments
      .sort((a, b) => b.excitementScore - a.excitementScore)
      .slice(0, 5);
    
    return {
      peaks: topPeaks.map(peak => this.formatPeakData(peak)),
      patterns: this.analyzePatterns(topPeaks),
      recommendations: this.generateRecommendations(topPeaks)
    };
  }
  
  /**
   * 会話をセグメントに分割
   * @param {array} messages - メッセージ配列
   * @returns {array} セグメント配列
   */
  createConversationSegments(messages) {
    const segments = [];
    let currentSegment = [];
    let lastTimestamp = null;
    
    messages.forEach((msg, index) => {
      const timestamp = new Date(msg.timestamp || Date.now());
      
      // 30分以上の間隔があれば新しいセグメント
      if (lastTimestamp && (timestamp - lastTimestamp) > 30 * 60 * 1000) {
        if (currentSegment.length > 0) {
          segments.push({
            messages: currentSegment,
            startIndex: index - currentSegment.length,
            endIndex: index - 1
          });
          currentSegment = [];
        }
      }
      
      currentSegment.push(msg);
      lastTimestamp = timestamp;
    });
    
    // 最後のセグメントを追加
    if (currentSegment.length > 0) {
      segments.push({
        messages: currentSegment,
        startIndex: messages.length - currentSegment.length,
        endIndex: messages.length - 1
      });
    }
    
    return segments;
  }
  
  /**
   * セグメントの盛り上がり度を計算
   * @param {object} segment - セグメント
   * @returns {number} 盛り上がり度スコア（0-100）
   */
  calculateExcitementScore(segment) {
    const messages = segment.messages;
    let score = 50; // ベーススコア
    
    // 1. メッセージの頻度（高頻度 = 盛り上がり）
    const duration = this.getSegmentDuration(messages);
    const messageFrequency = messages.length / (duration / 60000); // メッセージ/分
    if (messageFrequency > 2) score += 15;
    else if (messageFrequency > 1) score += 10;
    else if (messageFrequency > 0.5) score += 5;
    
    // 2. 返信の速さ
    const avgResponseTime = this.calculateAverageResponseTime(messages);
    if (avgResponseTime < 60000) score += 15; // 1分以内
    else if (avgResponseTime < 300000) score += 10; // 5分以内
    else if (avgResponseTime < 600000) score += 5; // 10分以内
    
    // 3. 絵文字・感嘆符の使用
    const emotionIndicators = this.countEmotionIndicators(messages);
    score += Math.min(15, emotionIndicators * 3);
    
    // 4. 質問と回答の連鎖
    const questionAnswerChains = this.countQuestionAnswerChains(messages);
    score += Math.min(10, questionAnswerChains * 5);
    
    // 5. 長文メッセージの存在
    const longMessages = messages.filter(m => m.text.length > 50).length;
    score += Math.min(10, longMessages * 2);
    
    // 6. 相互のメッセージバランス
    const balance = this.calculateMessageBalance(messages);
    if (balance > 0.4 && balance < 0.6) score += 10; // バランスが良い
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * セグメントの継続時間を取得
   * @param {array} messages - メッセージ配列
   * @returns {number} ミリ秒単位の継続時間
   */
  getSegmentDuration(messages) {
    if (messages.length < 2) return 0;
    
    const firstTime = new Date(messages[0].timestamp || Date.now());
    const lastTime = new Date(messages[messages.length - 1].timestamp || Date.now());
    
    return lastTime - firstTime;
  }
  
  /**
   * 平均返信時間を計算
   * @param {array} messages - メッセージ配列
   * @returns {number} ミリ秒単位の平均返信時間
   */
  calculateAverageResponseTime(messages) {
    const responseTimes = [];
    let lastSender = null;
    let lastTime = null;
    
    messages.forEach(msg => {
      const currentTime = new Date(msg.timestamp || Date.now());
      const currentSender = msg.isUser ? 'user' : 'other';
      
      if (lastSender && lastSender !== currentSender) {
        responseTimes.push(currentTime - lastTime);
      }
      
      lastSender = currentSender;
      lastTime = currentTime;
    });
    
    if (responseTimes.length === 0) return 600000; // デフォルト10分
    
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }
  
  /**
   * 感情指標をカウント
   * @param {array} messages - メッセージ配列
   * @returns {number} 感情指標の数
   */
  countEmotionIndicators(messages) {
    let count = 0;
    
    messages.forEach(msg => {
      const text = msg.text || '';
      
      // 絵文字の数
      const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
      count += emojiCount;
      
      // 感嘆符・疑問符
      count += (text.match(/[！!？?]+/g) || []).length;
      
      // 笑いの表現
      count += (text.match(/[wｗ笑]+|[ははハハ]+|lol|haha/gi) || []).length;
    });
    
    return count;
  }
  
  /**
   * 質問と回答の連鎖をカウント
   * @param {array} messages - メッセージ配列
   * @returns {number} 連鎖の数
   */
  countQuestionAnswerChains(messages) {
    let chains = 0;
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i].text || '';
      const next = messages[i + 1].text || '';
      
      // 質問の後に回答があるパターン
      if (current.includes('？') || current.includes('?')) {
        if (next.length > 10 && messages[i].isUser !== messages[i + 1].isUser) {
          chains++;
        }
      }
    }
    
    return chains;
  }
  
  /**
   * メッセージバランスを計算
   * @param {array} messages - メッセージ配列
   * @returns {number} バランス率（0-1）
   */
  calculateMessageBalance(messages) {
    const userMessages = messages.filter(m => m.isUser).length;
    const otherMessages = messages.filter(m => !m.isUser).length;
    const total = messages.length;
    
    if (total === 0) return 0.5;
    
    return Math.min(userMessages, otherMessages) / total;
  }
  
  /**
   * トピックを抽出
   * @param {object} segment - セグメント
   * @returns {array} トピック配列
   */
  extractTopics(segment) {
    const topics = [];
    const text = segment.messages.map(m => m.text).join(' ');
    
    // 頻出する名詞や話題を簡易的に抽出
    const patterns = [
      { pattern: /映画|ドラマ|アニメ|番組/g, topic: '映像作品' },
      { pattern: /音楽|曲|歌|ライブ|コンサート/g, topic: '音楽' },
      { pattern: /食べ|飲み|レストラン|カフェ|料理/g, topic: '食事' },
      { pattern: /仕事|会社|職場|ビジネス/g, topic: '仕事' },
      { pattern: /旅行|旅|観光|温泉/g, topic: '旅行' },
      { pattern: /スポーツ|運動|ジム|ヨガ/g, topic: 'スポーツ' },
      { pattern: /ゲーム|プレイ|攻略/g, topic: 'ゲーム' },
      { pattern: /本|読書|小説|漫画/g, topic: '読書' },
      { pattern: /天気|晴れ|雨|寒い|暑い/g, topic: '天気' },
      { pattern: /週末|休日|休み|予定/g, topic: '予定' }
    ];
    
    patterns.forEach(({ pattern, topic }) => {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        topics.push({
          topic,
          count: matches.length,
          confidence: Math.min(0.9, matches.length * 0.2)
        });
      }
    });
    
    return topics.sort((a, b) => b.count - a.count).slice(0, 3);
  }
  
  /**
   * 感情トーンを分析
   * @param {object} segment - セグメント
   * @returns {object} 感情トーン
   */
  analyzeEmotionalTone(segment) {
    const messages = segment.messages;
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    messages.forEach(msg => {
      const text = msg.text || '';
      
      // ポジティブな表現
      if (text.match(/嬉しい|楽しい|面白い|素敵|いいね|最高|ありがとう|好き/)) {
        positive++;
      }
      // ネガティブな表現
      else if (text.match(/悲しい|辛い|大変|疲れ|無理|嫌|ごめん/)) {
        negative++;
      }
      // それ以外
      else {
        neutral++;
      }
    });
    
    const total = messages.length || 1;
    
    return {
      positive: positive / total,
      negative: negative / total,
      neutral: neutral / total,
      dominant: positive > negative ? (positive > neutral ? 'positive' : 'neutral') : 
                (negative > neutral ? 'negative' : 'neutral')
    };
  }
  
  /**
   * ピークデータをフォーマット
   * @param {object} peak - ピークセグメント
   * @returns {object} フォーマット済みピークデータ
   */
  formatPeakData(peak) {
    const firstMsg = peak.messages[0];
    const lastMsg = peak.messages[peak.messages.length - 1];
    
    return {
      excitementScore: peak.excitementScore,
      duration: this.getSegmentDuration(peak.messages),
      messageCount: peak.messages.length,
      startTime: firstMsg.timestamp,
      endTime: lastMsg.timestamp,
      topics: peak.topics,
      emotionalTone: peak.emotionalTone,
      keyMessages: this.extractKeyMessages(peak.messages),
      characteristics: this.identifyCharacteristics(peak)
    };
  }
  
  /**
   * キーメッセージを抽出
   * @param {array} messages - メッセージ配列
   * @returns {array} キーメッセージ
   */
  extractKeyMessages(messages) {
    // 長いメッセージや感情的なメッセージを優先
    return messages
      .filter(msg => 
        msg.text.length > 30 || 
        msg.text.includes('！') || 
        msg.text.includes('？') ||
        msg.text.match(/嬉しい|楽しい|面白い|素敵/)
      )
      .slice(0, 3)
      .map(msg => ({
        text: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
        isUser: msg.isUser
      }));
  }
  
  /**
   * 特徴を識別
   * @param {object} peak - ピークセグメント
   * @returns {array} 特徴配列
   */
  identifyCharacteristics(peak) {
    const characteristics = [];
    
    if (peak.excitementScore > 80) {
      characteristics.push('非常に盛り上がった会話');
    }
    
    if (peak.emotionalTone.positive > 0.7) {
      characteristics.push('ポジティブな雰囲気');
    }
    
    const avgResponseTime = this.calculateAverageResponseTime(peak.messages);
    if (avgResponseTime < 60000) {
      characteristics.push('即レスの応酬');
    }
    
    if (peak.topics.length > 0 && peak.topics[0].confidence > 0.7) {
      characteristics.push(`${peak.topics[0].topic}の話題で盛り上がり`);
    }
    
    return characteristics;
  }
  
  /**
   * パターンを分析
   * @param {array} peaks - トップピーク配列
   * @returns {object} パターン分析結果
   */
  analyzePatterns(peaks) {
    if (peaks.length === 0) {
      return {
        commonTopics: [],
        bestTimeOfDay: null,
        averageExcitement: 0
      };
    }
    
    // 共通トピックを抽出
    const allTopics = peaks.flatMap(p => p.topics);
    const topicCounts = {};
    
    allTopics.forEach(topic => {
      const key = topic.topic;
      topicCounts[key] = (topicCounts[key] || 0) + 1;
    });
    
    const commonTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic, count]) => ({ topic, frequency: count / peaks.length }));
    
    // 盛り上がりやすい時間帯を分析
    const timeOfDayStats = {};
    peaks.forEach(peak => {
      const hour = new Date(peak.startTime).getHours();
      const timeOfDay = hour < 12 ? '朝' : hour < 18 ? '昼' : '夜';
      timeOfDayStats[timeOfDay] = (timeOfDayStats[timeOfDay] || 0) + 1;
    });
    
    const bestTimeOfDay = Object.entries(timeOfDayStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;
    
    // 平均盛り上がり度
    const averageExcitement = peaks.reduce((sum, p) => sum + p.excitementScore, 0) / peaks.length;
    
    return {
      commonTopics,
      bestTimeOfDay,
      averageExcitement
    };
  }
  
  /**
   * 推奨事項を生成
   * @param {array} peaks - トップピーク配列
   * @returns {array} 推奨事項
   */
  generateRecommendations(peaks) {
    const recommendations = [];
    
    if (peaks.length === 0) {
      return [{
        type: 'general',
        text: 'もっと会話を楽しんでみましょう',
        reason: '盛り上がった会話の記録が少ないため'
      }];
    }
    
    // トピックベースの推奨
    const topPeak = peaks[0];
    if (topPeak.topics.length > 0) {
      const topTopic = topPeak.topics[0];
      recommendations.push({
        type: 'topic',
        text: `${topTopic.topic}の話題を振ってみる`,
        reason: `過去に${topTopic.topic}で盛り上がったことがあるため`,
        confidence: topTopic.confidence
      });
    }
    
    // 時間帯ベースの推奨
    const patterns = this.analyzePatterns(peaks);
    if (patterns.bestTimeOfDay) {
      recommendations.push({
        type: 'timing',
        text: `${patterns.bestTimeOfDay}の時間帯にメッセージを送る`,
        reason: `${patterns.bestTimeOfDay}に会話が盛り上がりやすい傾向があるため`,
        confidence: 0.8
      });
    }
    
    // 感情トーンベースの推奨
    const positiveCount = peaks.filter(p => p.emotionalTone.dominant === 'positive').length;
    if (positiveCount > peaks.length * 0.7) {
      recommendations.push({
        type: 'tone',
        text: '明るく楽しい話題を心がける',
        reason: 'ポジティブな会話で盛り上がることが多いため',
        confidence: 0.85
      });
    }
    
    return recommendations;
  }
  
  /**
   * デフォルトのピーク分析結果
   * @returns {object} デフォルト結果
   */
  getDefaultPeaks() {
    return {
      peaks: [],
      patterns: {
        commonTopics: [],
        bestTimeOfDay: null,
        averageExcitement: 0
      },
      recommendations: [{
        type: 'general',
        text: 'まずは気軽に会話を始めてみましょう',
        reason: '分析に必要な会話データが不足しているため'
      }]
    };
  }
}

module.exports = ConversationPeaksAnalyzer;