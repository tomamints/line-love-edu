/**
 * 注文データの永続化ストレージ
 * 本番環境ではデータベースを使用すべきだが、
 * デモ用にファイルベースのストレージを実装
 */

const fs = require('fs').promises;
const path = require('path');

class OrderStorage {
  constructor() {
    // Vercel環境では/tmpを使用、ローカルではordersディレクトリを使用
    this.ordersDir = process.env.VERCEL 
      ? '/tmp/orders'
      : path.join(process.cwd(), 'orders');
    this.initStorage();
  }
  
  async initStorage() {
    try {
      await fs.access(this.ordersDir);
    } catch {
      await fs.mkdir(this.ordersDir, { recursive: true });
    }
  }
  
  /**
   * 注文を保存
   * @param {string} orderId - 注文ID
   * @param {object} orderData - 注文データ
   */
  async saveOrder(orderId, orderData) {
    try {
      const filePath = path.join(this.ordersDir, `${orderId}.json`);
      await fs.writeFile(filePath, JSON.stringify(orderData, null, 2));
      console.log(`📁 注文を保存: ${orderId}`);
      return true;
    } catch (error) {
      console.error('注文保存エラー:', error);
      return false;
    }
  }
  
  /**
   * 注文を取得
   * @param {string} orderId - 注文ID
   * @returns {object|null} 注文データ
   */
  async getOrder(orderId) {
    try {
      const filePath = path.join(this.ordersDir, `${orderId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      console.log(`📁 注文を読込: ${orderId}`);
      return JSON.parse(data);
    } catch (error) {
      console.error(`注文取得エラー (${orderId}):`, error.message);
      return null;
    }
  }
  
  /**
   * 注文を更新
   * @param {string} orderId - 注文ID
   * @param {object} updates - 更新データ
   */
  async updateOrder(orderId, updates) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) {
        console.error(`注文が見つかりません: ${orderId}`);
        return false;
      }
      
      const updatedOrder = { ...order, ...updates };
      await this.saveOrder(orderId, updatedOrder);
      console.log(`📁 注文を更新: ${orderId}`);
      return true;
    } catch (error) {
      console.error('注文更新エラー:', error);
      return false;
    }
  }
  
  /**
   * 注文を削除
   * @param {string} orderId - 注文ID
   */
  async deleteOrder(orderId) {
    try {
      const filePath = path.join(this.ordersDir, `${orderId}.json`);
      await fs.unlink(filePath);
      console.log(`📁 注文を削除: ${orderId}`);
      return true;
    } catch (error) {
      console.error('注文削除エラー:', error);
      return false;
    }
  }
  
  /**
   * すべての注文IDを取得
   * @returns {array} 注文IDの配列
   */
  async getAllOrderIds() {
    try {
      const files = await fs.readdir(this.ordersDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      console.error('注文ID取得エラー:', error);
      return [];
    }
  }
  
  /**
   * 期限切れの注文をクリーンアップ
   */
  async cleanupExpiredOrders() {
    try {
      const orderIds = await this.getAllOrderIds();
      const now = new Date();
      let cleanedCount = 0;
      
      for (const orderId of orderIds) {
        const order = await this.getOrder(orderId);
        if (order && order.expiresAt) {
          const expiresAt = new Date(order.expiresAt);
          if (now > expiresAt && order.status === 'pending') {
            await this.deleteOrder(orderId);
            cleanedCount++;
          }
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 期限切れ注文を削除: ${cleanedCount}件`);
      }
    } catch (error) {
      console.error('クリーンアップエラー:', error);
    }
  }
}

// シングルトンインスタンスをエクスポート
module.exports = new OrderStorage();