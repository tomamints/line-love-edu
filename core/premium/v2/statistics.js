/**
 * プレミアムレポートV2 統計分析モジュール
 * メッセージデータから各種統計を計算
 */

class StatisticsAnalyzer {
  /**
   * 全統計分析を実行
   * @param {Object} analysisContext - 分析コンテキスト
   */
  analyzeAll(analysisContext) {
    const { messages } = analysisContext;
    
    if (!messages || messages.length === 0) {
      console.warn('メッセージが存在しません');
      return;
    }
    
    // P.3: 日毎のメッセージ数と最も盛り上がった日
    this.analyzeDailyActivity(analysisContext);
    
    // P.4: 時間帯別の活動パターン
    this.analyzeHourlyActivity(analysisContext);
    
    // P.5: 会話の質の分析
    this.analyzeConversationQuality(analysisContext);
    
    // 追加の統計
    this.analyzeResponseTime(analysisContext);
    this.analyzeMessageLength(analysisContext);
  }
  
  /**
   * P.3: 日毎のメッセージ数を分析
   */
  analyzeDailyActivity(analysisContext) {
    const { messages } = analysisContext;
    const dailyCounts = {};
    
    // 日毎にメッセージをカウント
    messages.forEach(msg => {
      const date = msg.timestamp.split('T')[0]; // YYYY-MM-DD形式
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    // 配列形式に変換
    const dailyCountsArray = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 最も盛り上がった日を特定
    let peakDate = null;
    let maxCount = 0;
    dailyCountsArray.forEach(item => {
      if (item.count > maxCount) {
        maxCount = item.count;
        peakDate = item.date;
      }
    });
    
    // 結果を格納
    analysisContext.statistics.dailyMessageCounts = dailyCountsArray;
    analysisContext.statistics.peakDate = peakDate;
    analysisContext.statistics.peakDateCount = maxCount;
  }
  
  /**
   * P.4: 時間帯別の活動パターンを分析
   */
  analyzeHourlyActivity(analysisContext) {
    const { messages } = analysisContext;
    const hourlyCounts = new Array(24).fill(0);
    
    // 時間帯別にメッセージをカウント
    messages.forEach(msg => {
      const hour = new Date(msg.timestamp).getHours();
      hourlyCounts[hour]++;
    });
    
    // 配列形式に変換
    const hourlyCountsArray = hourlyCounts.map((count, hour) => ({
      hour,
      count
    }));
    
    // 最も活発な時間帯を特定
    let peakHour = 0;
    let maxCount = 0;
    hourlyCountsArray.forEach(item => {
      if (item.count > maxCount) {
        maxCount = item.count;
        peakHour = item.hour;
      }
    });
    
    // ピーク時間帯の割合を計算
    const totalMessages = messages.length;
    const peakHourRatio = Math.round((maxCount / totalMessages) * 100);
    
    // 結果を格納
    analysisContext.statistics.hourlyMessageCounts = hourlyCountsArray;
    analysisContext.statistics.peakHour = peakHour;
    analysisContext.statistics.peakHourCount = maxCount;
    analysisContext.statistics.peakHourRatio = peakHourRatio;
  }
  
  /**
   * P.5: 会話の質を分析
   */
  analyzeConversationQuality(analysisContext) {
    const { messages } = analysisContext;
    
    // ポジティブ率の計算（簡易版）
    const positiveKeywords = [
      '好き', 'すき', 'スキ', '愛', 'あい', 'アイ',
      '嬉しい', 'うれしい', '楽しい', 'たのしい',
      'ありがとう', 'ありがと', 'サンキュー', 'thanks',
      '素敵', 'すてき', 'ステキ', 'いいね', 'いいよ',
      '大好き', 'だいすき', '最高', 'さいこう',
      '幸せ', 'しあわせ', 'ハッピー', 'happy',
      '❤', '💕', '😊', '😄', '🥰', '😍'
    ];
    
    let positiveCount = 0;
    messages.forEach(msg => {
      const textLower = msg.text.toLowerCase();
      if (positiveKeywords.some(keyword => textLower.includes(keyword.toLowerCase()))) {
        positiveCount++;
      }
    });
    
    const positivityRate = Math.round((positiveCount / messages.length) * 100);
    
    // 絵文字数のカウント
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu;
    let totalEmojis = 0;
    messages.forEach(msg => {
      const emojis = msg.text.match(emojiRegex);
      if (emojis) {
        totalEmojis += emojis.length;
      }
    });
    
    // 質問比率の計算
    const userQuestions = messages.filter(msg => 
      msg.sender === 'user' && (msg.text.includes('？') || msg.text.includes('?'))
    ).length;
    
    const partnerQuestions = messages.filter(msg => 
      msg.sender === 'partner' && (msg.text.includes('？') || msg.text.includes('?'))
    ).length;
    
    const totalQuestions = userQuestions + partnerQuestions;
    const questionRatio = totalQuestions > 0 
      ? `${Math.round((userQuestions / totalQuestions) * 100)}:${Math.round((partnerQuestions / totalQuestions) * 100)}`
      : '50:50';
    
    // 結果を格納
    analysisContext.statistics.positivityRate = positivityRate;
    analysisContext.statistics.totalEmojis = totalEmojis;
    analysisContext.statistics.emojiPerMessage = (totalEmojis / messages.length).toFixed(2);
    analysisContext.statistics.userQuestions = userQuestions;
    analysisContext.statistics.partnerQuestions = partnerQuestions;
    analysisContext.statistics.questionRatio = questionRatio;
  }
  
  /**
   * 返信速度の分析
   */
  analyzeResponseTime(analysisContext) {
    const { messages } = analysisContext;
    const responseTimes = [];
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].sender !== messages[i-1].sender) {
        // 送信者が変わった = 返信
        const prevTime = new Date(messages[i-1].timestamp);
        const currTime = new Date(messages[i].timestamp);
        const diffMinutes = (currTime - prevTime) / (1000 * 60);
        
        // 24時間以内の返信のみを対象
        if (diffMinutes < 1440 && diffMinutes > 0) {
          responseTimes.push(diffMinutes);
        }
      }
    }
    
    if (responseTimes.length > 0) {
      // 中央値を計算
      responseTimes.sort((a, b) => a - b);
      const median = responseTimes[Math.floor(responseTimes.length / 2)];
      analysisContext.statistics.responseTimeMedian = Math.round(median);
      
      // 平均値も計算
      const average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      analysisContext.statistics.responseTimeAverage = Math.round(average);
    } else {
      analysisContext.statistics.responseTimeMedian = 30; // デフォルト値
      analysisContext.statistics.responseTimeAverage = 30;
    }
  }
  
  /**
   * メッセージ長の分析
   */
  analyzeMessageLength(analysisContext) {
    const { messages } = analysisContext;
    
    const userMessages = messages.filter(msg => msg.sender === 'user');
    const partnerMessages = messages.filter(msg => msg.sender === 'partner');
    
    // ユーザーのメッセージ長
    if (userMessages.length > 0) {
      const userTotal = userMessages.reduce((sum, msg) => sum + msg.text.length, 0);
      analysisContext.statistics.userAvgMessageLength = Math.round(userTotal / userMessages.length);
    } else {
      analysisContext.statistics.userAvgMessageLength = 0;
    }
    
    // 相手のメッセージ長
    if (partnerMessages.length > 0) {
      const partnerTotal = partnerMessages.reduce((sum, msg) => sum + msg.text.length, 0);
      analysisContext.statistics.partnerAvgMessageLength = Math.round(partnerTotal / partnerMessages.length);
    } else {
      analysisContext.statistics.partnerAvgMessageLength = 0;
    }
    
    // 全体の平均
    const totalLength = messages.reduce((sum, msg) => sum + msg.text.length, 0);
    analysisContext.statistics.overallAvgMessageLength = Math.round(totalLength / messages.length);
    
    // コミュニケーションバランス
    const userMessageCount = userMessages.length;
    const partnerMessageCount = partnerMessages.length;
    const total = userMessageCount + partnerMessageCount;
    
    if (total > 0) {
      const userRatio = Math.round((userMessageCount / total) * 100);
      const partnerRatio = Math.round((partnerMessageCount / total) * 100);
      analysisContext.statistics.communicationBalance = `${userRatio}:${partnerRatio}`;
    } else {
      analysisContext.statistics.communicationBalance = '50:50';
    }
  }
}

module.exports = StatisticsAnalyzer;