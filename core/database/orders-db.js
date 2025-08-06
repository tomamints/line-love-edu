// 注文データベース操作
const { isDatabaseConfigured } = require('./supabase');
const orderStorage = require('../premium/order-storage');

class OrdersDB {
  constructor() {
    // Vercel環境で毎回チェック
    this.checkDatabase();
  }
  
  checkDatabase() {
    this.useDatabase = isDatabaseConfigured();
    
    if (this.useDatabase) {
      // 毎回新しいクライアントを取得
      const { supabase } = require('./supabase');
      this.supabase = supabase;
      console.log('✅ Supabase設定検出 - 注文データベース');
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
      this.supabase = null;
    }
  }
  
  // Supabase接続テスト
  async testConnection() {
    try {
      console.log('🔌 Supabase接続テスト開始...');
      
      // タイムアウト付きで接続テスト
      const testPromise = this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('接続テストタイムアウト')), 2000);
      });
      
      const { count, error } = await Promise.race([testPromise, timeoutPromise]);
      
      if (error) {
        console.error('🔌 接続テストエラー:', error);
        console.error('🔌 テーブルが存在しない可能性があります');
        return false;
      } else {
        console.log('🔌 接続テスト成功 - ordersテーブル存在確認済み');
        console.log('🔌 現在の注文数:', count);
        return true;
      }
    } catch (err) {
      console.error('🔌 接続テスト失敗:', err.message);
      return false;
    }
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
      
      const { data, error } = await this.supabase
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
      // 毎回最新の接続状態を確認
      this.checkDatabase();
      
      if (!this.useDatabase || !this.supabase) {
        console.log('📊 Supabase未設定、ファイルストレージから取得');
        return orderStorage.getOrder(orderId);
      }
      
      console.log('📊 Supabaseから注文を取得中...');
      
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      console.log('📊 Supabase応答:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      if (error) {
        // PGRST116 = Row not found
        if (error.code === 'PGRST116') {
          console.log('📊 注文がDBに存在しない、ファイルストレージを確認');
        } else {
          console.error('📊 Supabaseエラー:', error);
        }
        
        // ファイルストレージから取得を試みる
        const fileOrder = await orderStorage.getOrder(orderId);
        if (fileOrder) {
          console.log('📊 ファイルストレージから注文取得成功');
          // DBが使える場合は保存を試みる（エラーは無視）
          try {
            await this.saveOrder(orderId, fileOrder);
            console.log('📊 注文をDBに移行成功');
          } catch (saveErr) {
            console.log('📊 DB移行失敗（続行）:', saveErr.message);
          }
        }
        return fileOrder;
      }
      
      if (!data) {
        console.log('📊 注文データなし');
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
      console.error('📊 予期しないエラー:', err.message);
      console.log('📊 フォールバック: ファイルストレージから取得');
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

      const { data, error } = await this.supabase
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
      const { data, error } = await this.supabase
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