// 注文データベース操作
const { supabase, isDatabaseConfigured } = require('./supabase');
const orderStorage = require('../premium/order-storage');

class OrdersDB {
  constructor() {
    this.useDatabase = isDatabaseConfigured();
    if (this.useDatabase) {
      console.log('✅ Supabase接続成功 - 注文データベース');
      this.initTable();
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
    }
  }

  // テーブルの初期化（存在しない場合は作成）
  async initTable() {
    // Supabaseのダッシュボードで以下のSQLを実行してください：
    /*
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      stripe_session_id TEXT,
      paid_at TIMESTAMP,
      report_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    */
  }

  // 注文を保存
  async saveOrder(orderId, orderData) {
    if (!this.useDatabase) {
      // データベースが設定されていない場合はファイルストレージを使用
      return orderStorage.saveOrder(orderId, orderData);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .upsert({
          id: orderId,
          user_id: orderData.userId,
          amount: orderData.amount,
          status: orderData.status || 'pending',
          stripe_session_id: orderData.stripeSessionId,
          paid_at: orderData.paidAt,
          report_url: orderData.reportUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('注文保存エラー:', error);
        // フォールバック：ファイルストレージを使用
        return orderStorage.saveOrder(orderId, orderData);
      }

      console.log('✅ 注文をデータベースに保存:', orderId);
      return data;
    } catch (err) {
      console.error('データベースエラー:', err);
      // フォールバック：ファイルストレージを使用
      return orderStorage.saveOrder(orderId, orderData);
    }
  }

  // 注文を取得
  async getOrder(orderId) {
    if (!this.useDatabase) {
      return orderStorage.getOrder(orderId);
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('注文取得エラー:', error);
        // フォールバック：ファイルストレージを試す
        return orderStorage.getOrder(orderId);
      }

      if (!data) {
        // データベースにない場合、ファイルストレージを確認
        const fileOrder = await orderStorage.getOrder(orderId);
        if (fileOrder) {
          // ファイルにある場合はデータベースに移行
          await this.saveOrder(orderId, fileOrder);
          return fileOrder;
        }
        return null;
      }

      // データベースの形式をアプリケーションの形式に変換
      return {
        orderId: data.id,
        userId: data.user_id,
        amount: data.amount,
        status: data.status,
        stripeSessionId: data.stripe_session_id,
        paidAt: data.paid_at,
        reportUrl: data.report_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('データベースエラー:', err);
      return orderStorage.getOrder(orderId);
    }
  }

  // 注文を更新
  async updateOrder(orderId, updates) {
    if (!this.useDatabase) {
      return orderStorage.updateOrder(orderId, updates);
    }

    try {
      // まず既存の注文を取得
      const existingOrder = await this.getOrder(orderId);
      if (!existingOrder) {
        throw new Error(`注文が見つかりません: ${orderId}`);
      }

      // 更新データを準備
      const updateData = {
        id: orderId,
        updated_at: new Date().toISOString()
      };

      // 更新可能なフィールドをマップ
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.stripeSessionId !== undefined) updateData.stripe_session_id = updates.stripeSessionId;
      if (updates.paidAt !== undefined) updateData.paid_at = updates.paidAt;
      if (updates.reportUrl !== undefined) updateData.report_url = updates.reportUrl;

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('注文更新エラー:', error);
        return orderStorage.updateOrder(orderId, updates);
      }

      console.log('✅ 注文を更新:', orderId);
      return data;
    } catch (err) {
      console.error('データベースエラー:', err);
      return orderStorage.updateOrder(orderId, updates);
    }
  }

  // ユーザーの注文一覧を取得
  async getUserOrders(userId) {
    if (!this.useDatabase) {
      // ファイルストレージでは実装が複雑なので空配列を返す
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('注文一覧取得エラー:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('データベースエラー:', err);
      return [];
    }
  }
}

module.exports = new OrdersDB();