/**
 * 簡易キャッシュシステム
 * TTL管理とメモリ効率化を実装
 */
class SimpleCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 3600000; // デフォルト1時間
    this.maxSize = options.maxSize || 1000;
    this.enabled = options.enabled !== false;
    
    // 定期的なクリーンアップ
    if (this.enabled) {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, this.ttl / 4); // TTLの1/4ごとにクリーンアップ
    }
  }
  
  /**
   * キャッシュに値を設定
   * @param {string} key - キー
   * @param {any} value - 値
   * @param {number} customTtl - カスタムTTL（オプション）
   */
  set(key, value, customTtl = null) {
    if (!this.enabled) return;
    
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      // 最も古いエントリを削除
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const ttl = customTtl || this.ttl;
    const expireAt = Date.now() + ttl;
    
    this.cache.set(key, {
      value,
      expireAt,
      createdAt: Date.now()
    });
  }
  
  /**
   * キャッシュから値を取得
   * @param {string} key - キー
   * @returns {any|null} 値、または期限切れ/存在しない場合はnull
   */
  get(key) {
    if (!this.enabled) return null;
    
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 期限チェック
    if (Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  /**
   * キャッシュにキーが存在するかチェック
   * @param {string} key - キー
   * @returns {boolean} 存在し、期限切れでない場合true
   */
  has(key) {
    return this.get(key) !== null;
  }
  
  /**
   * 特定のキーを削除
   * @param {string} key - キー
   */
  delete(key) {
    this.cache.delete(key);
  }
  
  /**
   * 期限切れのキャッシュをクリーンアップ
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * キャッシュを完全にクリア
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * キャッシュの統計情報を取得
   * @returns {object} 統計情報
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    }
    
    return {
      totalSize: this.cache.size,
      validCount,
      expiredCount,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }
  
  /**
   * Get or Set パターンの便利メソッド
   * @param {string} key - キー
   * @param {function} factory - 値生成関数
   * @param {number} customTtl - カスタムTTL
   * @returns {any} キャッシュされた値または新規生成された値
   */
  async getOrSet(key, factory, customTtl = null) {
    let value = this.get(key);
    
    if (value === null) {
      value = await factory();
      this.set(key, value, customTtl);
    }
    
    return value;
  }
  
  /**
   * キャッシュキーを生成するヘルパー
   * @param {string} prefix - プレフィックス
   * @param {...any} parts - キーの構成要素
   * @returns {string} 生成されたキー
   */
  static generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
  
  /**
   * リソースのクリーンアップ
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// グローバルキャッシュインスタンス
const globalCache = new SimpleCache({
  ttl: 3600000,  // 1時間
  maxSize: 1000,
  enabled: true
});

module.exports = {
  SimpleCache,
  cache: globalCache
};