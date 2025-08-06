// 注文データベース操作
const { supabase, isDatabaseConfigured } = require('./supabase');
const orderStorage = require('../premium/order-storage');

class OrdersDB {
  constructor() {
    this.useDatabase = isDatabaseConfigured();
    if (this.useDatabase) {
      console.log('✅ Supabase接続成功 - 注文データベース');
      this.initTable();
      // 接続テスト
      this.testConnection();
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
    }
  }
  
  // Supabase接続テスト
  async testConnection() {
    try {
      console.log('🔌 Supabase接続テスト開始...');
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('🔌 接続テストエラー:', error);
        console.error('🔌 テーブルが存在しない可能性があります');
      } else {
        console.log('🔌 接続テスト成功 - ordersテーブル存在確認済み');
        console.log('🔌 現在の注文数:', count);
      }
    } catch (err) {
      console.error('🔌 接続テスト失敗:', err);
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
    console.log('💾 saveOrder開始:', { orderId, orderData });
    
    if (!this.useDatabase) {
      console.log('💾 ファイルストレージに保存');
      // データベースが設定されていない場合はファイルストレージを使用
      return orderStorage.saveOrder(orderId, orderData);
    }

    try {
      const upsertData = {
        id: orderId,
        user_id: orderData.userId,
        amount: orderData.amount,
        status: orderData.status || 'pending',
        stripe_session_id: orderData.stripeSessionId,
        paid_at: orderData.paidAt,
        report_url: orderData.reportUrl,
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Supabaseに保存するデータ:', upsertData);
      
      const { data, error } = await supabase
        .from('orders')
        .upsert(upsertData)
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
    console.log('📊 getOrder開始:', orderId);
    console.log('📊 useDatabase:', this.useDatabase);
    
    if (!this.useDatabase) {
      console.log('📊 ファイルストレージから取得');
      return orderStorage.getOrder(orderId);
    }

    try {
      console.log('📊 Supabaseから注文を取得中...');
      console.log('📊 対象ID:', orderId);
      
      // タイムアウト付きでSupabaseから取得
      const queryPromise = supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase取得タイムアウト (5秒)')), 5000);
      });
      
      let result;
      try {
        result = await Promise.race([queryPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('📊 Supabaseタイムアウト:', timeoutError.message);
        console.log('📊 フォールバック: ファイルストレージから取得');
        return orderStorage.getOrder(orderId);
      }
      
      const { data, error } = result;
      console.log('📊 Supabase応答:', { data: !!data, error: !!error });
      
      if (error) {
        console.error('注文取得エラー:', error);
        console.error('エラー詳細:', JSON.stringify(error));
        // フォールバック：ファイルストレージを試す
        console.log('📊 フォールバック: ファイルストレージから取得');
        return orderStorage.getOrder(orderId);
      }

      if (!data) {
        console.log('📊 データベースに注文なし、ファイルストレージを確認');
        // データベースにない場合、ファイルストレージを確認
        const fileOrder = await orderStorage.getOrder(orderId);
        if (fileOrder) {
          console.log('📊 ファイルストレージに注文あり、DBに移行');
          // ファイルにある場合はデータベースに移行
          await this.saveOrder(orderId, fileOrder);
          return fileOrder;
        }
        console.log('📊 注文が見つかりません');
        return null;
      }

      console.log('📊 注文データ取得成功:', data.id);
      // データベースの形式をアプリケーションの形式に変換
      const formattedOrder = {
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
      console.log('📊 フォーマット済み注文:', formattedOrder);
      return formattedOrder;
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