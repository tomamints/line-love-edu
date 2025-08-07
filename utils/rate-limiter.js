// LINE APIレート制限対策ユーティリティ

class RateLimiter {
  constructor() {
    this.messageQueue = new Map(); // ユーザーごとのメッセージキュー
    this.lastSentTime = new Map(); // ユーザーごとの最後の送信時刻
    this.minInterval = 1000; // 最小送信間隔（1秒）
  }

  // メッセージ送信を制御
  async sendMessage(client, userId, message, options = {}) {
    const now = Date.now();
    const lastSent = this.lastSentTime.get(userId) || 0;
    const timeSinceLastSend = now - lastSent;
    
    // 前回の送信から十分な時間が経過していない場合は待機
    if (timeSinceLastSend < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastSend;
      console.log(`⏳ ${waitTime}ms 待機中...`);
      await this.sleep(waitTime);
    }
    
    try {
      // メッセージ送信
      const result = await client.pushMessage(userId, message);
      
      // 送信時刻を記録
      this.lastSentTime.set(userId, Date.now());
      
      return result;
    } catch (error) {
      if (error.statusCode === 429) {
        console.log('⚠️ レート制限検出。リトライします...');
        
        // リトライ待機時間（Retry-Afterヘッダーを確認、なければ5秒）
        const retryAfter = error.response?.headers?.['retry-after'] || 5;
        const waitTime = parseInt(retryAfter) * 1000;
        
        console.log(`⏳ ${waitTime}ms 後にリトライ...`);
        await this.sleep(waitTime);
        
        // リトライ（1回のみ）
        if (!options.isRetry) {
          return this.sendMessage(client, userId, message, { isRetry: true });
        }
      }
      
      throw error;
    }
  }

  // replyMessage用のラッパー
  async replyMessage(client, replyToken, message, options = {}) {
    try {
      const result = await client.replyMessage(replyToken, message);
      return result;
    } catch (error) {
      if (error.statusCode === 429) {
        console.log('⚠️ replyMessageでレート制限検出');
        // replyTokenは有効期限が短いため、リトライしない
        console.log('⚠️ replyTokenの有効期限のため、メッセージ送信をスキップ');
        return null;
      }
      throw error;
    }
  }

  // 待機用のユーティリティ
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // バッチ送信（複数メッセージを間隔を空けて送信）
  async sendBatch(client, userId, messages, interval = 1000) {
    const results = [];
    
    for (let i = 0; i < messages.length; i++) {
      if (i > 0) {
        await this.sleep(interval);
      }
      
      try {
        const result = await this.sendMessage(client, userId, messages[i]);
        results.push({ success: true, result });
      } catch (error) {
        console.error(`メッセージ ${i + 1} 送信失敗:`, error.message);
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// シングルトンインスタンス
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;