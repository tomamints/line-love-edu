/**
 * プレミアムレポートV2 前処理モジュール
 * LINEトーク履歴を正規化し、analysisContextオブジェクトを初期化
 */

class PreProcessor {
  /**
   * メッセージの正規化とanalysisContext初期化
   * @param {Array} rawMessages - 生のメッセージ配列
   * @param {Object} userProfile - ユーザープロフィール
   * @param {Object} systemParams - システムパラメータ
   * @returns {Object} analysisContext
   */
  processMessages(rawMessages, userProfile, systemParams) {
    // メッセージを正規化
    const cleanedMessages = this.normalizeMessages(rawMessages);
    
    // analysisContextオブジェクトを初期化
    const analysisContext = {
      // [INPUT] - 入力データ
      user: {
        name: userProfile.displayName || userProfile.userName || 'あなた',
        gender: userProfile.gender || 'unknown',
        birthDate: userProfile.birthDate || null
      },
      partner: {
        name: userProfile.partnerName || 'お相手様', // 名前があれば使用
        gender: userProfile.partnerGender || 'unknown',
        birthDate: userProfile.partnerBirthDate || null
      },
      situation: {
        loveSituation: userProfile?.love_situation || userProfile?.loveSituation || 'beginning',
        wantToKnow: userProfile?.want_to_know || userProfile?.wantToKnow || 'feelings'
      },
      messages: cleanedMessages,
      
      // [METADATA] - メタデータ
      metadata: {
        reportId: systemParams.reportId || this.generateReportId(),
        generatedDate: systemParams.generatedDate || new Date().toISOString(),
        version: '2.0'
      },
      
      // [CALCULATED] - 後続プロセスで格納されるデータ
      statistics: {},
      scores: {},
      aiInsights: {},
      reportContent: {}
    };
    
    return analysisContext;
  }
  
  /**
   * メッセージの正規化
   * @param {Array} rawMessages - 生のメッセージ配列
   * @returns {Array} 正規化されたメッセージ配列
   */
  normalizeMessages(rawMessages) {
    if (!rawMessages || !Array.isArray(rawMessages)) {
      return [];
    }
    
    // 最新200件を取得
    const recentMessages = rawMessages.slice(-200);
    
    return recentMessages
      .filter(msg => {
        // テキストメッセージのみを対象
        return msg && msg.text && typeof msg.text === 'string';
      })
      .map(msg => {
        // タイムスタンプの正規化
        let timestamp;
        if (msg.timestamp) {
          timestamp = this.normalizeTimestamp(msg.timestamp);
        } else if (msg.date) {
          timestamp = this.normalizeTimestamp(msg.date);
        } else {
          timestamp = new Date().toISOString();
        }
        
        // 送信者の正規化
        const sender = this.normalizeSender(msg.sender || msg.from || 'unknown');
        
        // テキストの処理（最大200文字）
        const text = msg.text.substring(0, 200);
        
        return {
          timestamp,
          sender,
          text,
          originalLength: msg.text.length
        };
      })
      .filter(msg => msg.text.length > 0); // 空のメッセージを除外
  }
  
  /**
   * タイムスタンプの正規化
   * @param {string|Date|number} timestamp - 様々な形式のタイムスタンプ
   * @returns {string} ISO 8601形式のタイムスタンプ
   */
  normalizeTimestamp(timestamp) {
    try {
      if (typeof timestamp === 'string') {
        // 既にISO形式の場合
        if (timestamp.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return timestamp;
        }
        // 日本語形式の場合（例：2024年7月15日 21:30）
        const jpMatch = timestamp.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
        if (jpMatch) {
          const [_, year, month, day, hour, minute] = jpMatch;
          return new Date(year, month - 1, day, hour, minute).toISOString();
        }
      }
      
      // Date オブジェクトまたは数値として処理
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    } catch (e) {
      console.warn('タイムスタンプ変換エラー:', e);
    }
    
    // 変換できない場合は現在時刻
    return new Date().toISOString();
  }
  
  /**
   * 送信者名の正規化
   * @param {string} sender - 送信者名
   * @returns {string} 'user' または 'partner'
   */
  normalizeSender(sender) {
    if (!sender || typeof sender !== 'string') {
      return 'unknown';
    }
    
    // ユーザーを示す可能性のあるキーワード
    const userKeywords = ['自分', 'me', 'user', '送信者'];
    const senderLower = sender.toLowerCase();
    
    for (const keyword of userKeywords) {
      if (senderLower.includes(keyword)) {
        return 'user';
      }
    }
    
    // それ以外は相手として扱う
    return 'partner';
  }
  
  /**
   * レポートIDの生成
   * @returns {string} レポートID
   */
  generateReportId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PR-${timestamp}-${random}`.toUpperCase();
  }
}

module.exports = PreProcessor;