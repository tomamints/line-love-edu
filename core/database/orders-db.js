// 注文データベース操作
const { isDatabaseConfigured } = require('./supabase');
const orderStorage = require('../premium/order-storage');

class OrdersDB {
  constructor() {
    // Vercel環境で毎回チェック
    this.checkDatabase();
  }
  
  checkDatabase() {
    // 環境変数で強制的にファイルストレージを使用
    if (process.env.FORCE_FILE_STORAGE === 'true') {
      console.log('⚠️ FORCE_FILE_STORAGE=true - ファイルストレージを強制使用');
      this.useDatabase = false;
      this.supabase = null;
      return;
    }
    
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
        setTimeout(() => reject(new Error('接続テストタイムアウト')), 5000);
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
    console.log('💾 useDatabase:', this.useDatabase);
    console.log('💾 SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('💾 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    // 環境変数が設定されている場合は再チェック
    if (!this.useDatabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      console.log('💾 環境変数が見つかったため、データベース設定を再チェック');
      this.checkDatabase();
      console.log('💾 再チェック後のuseDatabase:', this.useDatabase);
    }
    
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
        // user_profileはファイルストレージに保存
        updated_at: new Date().toISOString()
      };
      
      // userProfileはSupabaseには保存しない（LINE APIから取得）
      
      console.log('💾 Supabaseに保存するデータ:', upsertData);
      
      // タイムアウト付きで保存
      const savePromise = this.supabase
        .from('orders')
        .upsert(upsertData)
        .select()
        .single();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('保存タイムアウト')), 5000);
      });
      
      let data, error;
      try {
        const result = await Promise.race([savePromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (timeoutErr) {
        console.error('⚠️ Supabase保存タイムアウト:', timeoutErr.message);
        return orderStorage.saveOrder(orderId, orderData);
      }

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

  // 注文作成
  async createOrder(orderData) {
    console.log('📊 createOrder開始:', orderData.id || orderData.orderId);
    
    if (!this.useDatabase) {
      console.log('📊 ファイルストレージに保存');
      return orderStorage.saveOrder(orderData.id || orderData.orderId, orderData);
    }
    
    try {
      const insertData = {
        id: orderData.id || orderData.orderId,
        user_id: orderData.userId || orderData.user_id,
        amount: orderData.amount || 1980,
        status: orderData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📊 Supabaseに注文を作成:', insertData);
      const { data, error } = await this.supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('📊 注文作成エラー:', error);
        return orderStorage.saveOrder(orderData.id || orderData.orderId, orderData);
      }
      
      console.log('✅ 注文作成成功:', data.id);
      return data;
    } catch (err) {
      console.error('📊 データベースエラー:', err);
      return orderStorage.saveOrder(orderData.id || orderData.orderId, orderData);
    }
  }
  
  // 注文を取得
  async getOrder(orderId) {
    console.log('📊 getOrder開始:', orderId);
    console.log('📊 useDatabase:', this.useDatabase);
    console.log('📊 SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('📊 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('📊 supabase client:', this.supabase ? 'EXISTS' : 'NULL');
    
    // 環境変数が設定されている場合は再チェック
    if (!this.useDatabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      console.log('📊 環境変数が見つかったため、データベース設定を再チェック');
      this.checkDatabase();
      console.log('📊 再チェック後のuseDatabase:', this.useDatabase);
    }
    
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
      
      // タイムアウト付きでクエリを実行
      const queryPromise = this.supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .limit(1);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabaseクエリタイムアウト')), 5000);
      });
      
      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (timeoutErr) {
        console.log('📊 Supabaseタイムアウト、ファイルストレージを使用');
        return orderStorage.getOrder(orderId);
      }
      
      console.log('📊 Supabase応答:', { 
        hasData: !!data, 
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      if (error) {
        console.error('📊 Supabaseエラー:', error);
        return null;
      }
      
      // 配列の場合は最初の要素を取得
      if (Array.isArray(data)) {
        if (data.length === 0) {
          console.log('📊 注文がDBに存在しません');
          return null;
        }
        data = data[0];
      }
      
      if (!data) {
        console.log('📊 注文データなし');
        return null;
      }
      
      console.log('📊 注文データ取得成功:', data.id);
      
      // データベースの形式をアプリケーションの形式に変換
      let formattedOrder = {
        orderId: data.id,
        userId: data.user_id,
        amount: data.amount,
        status: data.status,
        stripeSessionId: data.stripe_session_id,
        paidAt: data.paid_at,
        reportUrl: data.report_url,
        userProfile: null,
        pdf_data: data.pdf_data,
        notified: data.notified,
        report_progress: data.report_progress,  // 重要: report_progressを追加
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // userProfileはLINE APIから取得するため、ここではnullのまま
      
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
    console.log('\n🔄 [OrdersDB.updateOrder] START');
    console.log('🔄 Order ID:', orderId);
    console.log('🔄 Updates:', JSON.stringify(updates, null, 2));
    console.log('🔄 useDatabase:', this.useDatabase);
    console.log('🔄 supabase client:', this.supabase ? 'EXISTS' : 'NULL');
    console.log('🔄 SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('🔄 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    
    if (!this.useDatabase) {
      console.log('🔄 Using file storage for update');
      return orderStorage.updateOrder(orderId, updates);
    }

    try {
      // まず既存の注文を取得
      console.log('🔄 Fetching existing order...');
      console.log('🔄 getOrder呼び出し前:', new Date().toISOString());
      const existingOrder = await this.getOrder(orderId);
      console.log('🔄 getOrder呼び出し後:', new Date().toISOString());
      console.log('🔄 Existing order:', existingOrder ? {
        id: existingOrder.id || existingOrder.orderId,
        status: existingOrder.status
      } : 'null');
      
      if (!existingOrder) {
        const errorMsg = `注文が見つかりません: ${orderId}`;
        console.error('🔄 ERROR:', errorMsg);
        throw new Error(errorMsg);
      }

      // 更新データを準備
      console.log('🔄 Preparing update data...');
      const updateData = {
        id: orderId,
        updated_at: new Date().toISOString()
      };

      // 更新可能なフィールドをマップ（Supabaseに存在するカラムのみ）
      if (updates.status !== undefined) {
        console.log('🔄 Updating status:', updates.status);
        updateData.status = updates.status;
      }
      if (updates.stripeSessionId !== undefined) {
        console.log('🔄 Updating stripe_session_id:', updates.stripeSessionId);
        updateData.stripe_session_id = updates.stripeSessionId;
      }
      if (updates.paidAt !== undefined) {
        console.log('🔄 Updating paid_at:', updates.paidAt);
        updateData.paid_at = updates.paidAt;
      }
      if (updates.reportUrl !== undefined) {
        console.log('🔄 Updating report_url (from reportUrl):', updates.reportUrl);
        updateData.report_url = updates.reportUrl;
      }
      if (updates.report_url !== undefined) {
        console.log('🔄 Updating report_url (direct):', updates.report_url);
        updateData.report_url = updates.report_url;
      }
      // pdf_dataカラムが追加されたので有効化
      if (updates.pdf_data !== undefined) {
        console.log('🔄 Updating pdf_data:', updates.pdf_data ? `${updates.pdf_data.length} bytes` : 'null');
        updateData.pdf_data = updates.pdf_data;
      }
      // notified, completed_atカラムは存在しないのでコメントアウト
      // if (updates.notified !== undefined) updateData.notified = updates.notified;
      // if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt;

      // タイムアウト付きで更新
      console.log('🔄 Final updateData:', JSON.stringify(updateData, null, 2));
      console.log('🔄 Executing Supabase update...');
      console.log('🔄 Update開始時刻:', new Date().toISOString());
      
      const updatePromise = this.supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
      
      console.log('🔄 Update query created, executing...');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('🔄 Update timeout triggered at:', new Date().toISOString());
          reject(new Error('更新タイムアウト'));
        }, 5000);
      });
      
      let data, error;
      try {
        const result = await Promise.race([updatePromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (timeoutErr) {
        console.error('⚠️ Supabase更新タイムアウト:', timeoutErr.message);
        return orderStorage.updateOrder(orderId, updates);
      }

      if (error) {
        console.error('🔄 注文更新エラー:', error);
        console.error('🔄 Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        console.log('🔄 Falling back to file storage');
        return orderStorage.updateOrder(orderId, updates);
      }

      console.log('✅ [OrdersDB.updateOrder] SUCCESS');
      console.log('✅ Updated order ID:', orderId);
      console.log('✅ Update result:', data);
      return data;
    } catch (err) {
      console.error('🔄 データベースエラー:', err.message);
      console.error('🔄 Stack:', err.stack);
      console.log('🔄 Falling back to file storage due to error');
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
  
  // 支払い済みでレポート未生成の注文を取得
  async getPaidOrders() {
    if (!this.useDatabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: true })
        .limit(10); // 一度に処理する最大数

      if (error) {
        console.error('支払い済み注文取得エラー:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('データベースエラー:', err);
      return [];
    }
  }
  
  // レポート生成の進捗を保存
  async saveReportProgress(orderId, progress) {
    console.log('📊 [saveReportProgress] 開始:', { orderId, progress });
    
    if (!this.useDatabase) {
      console.log('⚠️ データベース未設定のため進捗保存をスキップ');
      return true; // エラーにしない
    }
    
    try {
      // 進捗データを/tmpに一時保存（関数の実行中は保持される）
      const fs = require('fs').promises;
      const path = require('path');
      const tmpFile = path.join('/tmp', `progress_${orderId}.json`);
      
      try {
        await fs.writeFile(tmpFile, JSON.stringify(progress, null, 2));
        console.log('📝 進捗データを一時保存:', tmpFile);
      } catch (fsErr) {
        console.log('⚠️ 一時ファイル保存エラー（無視）:', fsErr.message);
      }
      
      // Supabaseにステータスと進捗データを保存
      // progressデータをJSONとして保存（messages以外）
      const progressToSave = {
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        attempts: progress.attempts,
        startedAt: progress.startedAt,
        data: {
          // messagesは大きすぎるので除外
          userProfile: progress.data?.userProfile,
          fortune: progress.data?.fortune,
          aiBatchId: progress.data?.aiBatchId,
          aiBatchStartTime: progress.data?.aiBatchStartTime,
          aiInsights: progress.data?.aiInsights,
          reportData: progress.data?.reportData,
          // messagesは件数だけ保存
          messageCount: progress.data?.messages?.length || 0
        }
      };
      
      const { error } = await this.supabase
        .from('orders')
        .update({
          status: `generating_step_${progress.currentStep}`,
          report_progress: progressToSave,  // 進捗データをJSONとして保存
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) {
        console.error('⚠️ 進捗保存エラー:', error.message);
        // エラーでも処理は続行
        return true;
      }
      
      console.log('✅ 進捗をDBに保存（ステップ', progress.currentStep, '）');
      return true;
    } catch (err) {
      console.error('❌ 進捗保存エラー:', err);
      // エラーでも処理は続行
      return true;
    }
  }
  
  // レポート生成の進捗を取得
  async getReportProgress(orderId) {
    console.log('📊 [getReportProgress] 開始:', orderId);
    
    if (!this.useDatabase) {
      console.log('⚠️ データベース未設定');
      return null;
    }
    
    try {
      // まず/tmpから完全な進捗データを取得を試みる
      const fs = require('fs').promises;
      const path = require('path');
      const tmpFile = path.join('/tmp', `progress_${orderId}.json`);
      
      try {
        const data = await fs.readFile(tmpFile, 'utf8');
        const progress = JSON.parse(data);
        console.log('📝 一時ファイルから進捗を復元:', {
          currentStep: progress.currentStep,
          hasData: !!progress.data,
          dataKeys: Object.keys(progress.data || {})
        });
        return progress;
      } catch (fsErr) {
        console.log('⚠️ 一時ファイルなし、DBから復元を試みる');
      }
      
      const order = await this.getOrder(orderId);
      
      if (!order) {
        console.log('⚠️ 注文が見つかりません');
        return null;
      }
      
      // report_progressフィールドがある場合（優先）
      if (order.report_progress) {
        console.log('✅ 進捗をDBから完全復元');
        console.log('   - Step:', order.report_progress.currentStep);
        console.log('   - Batch ID:', order.report_progress.data?.aiBatchId);
        console.log('   - Message count:', order.report_progress.data?.messageCount);
        
        // messagesだけは再取得が必要（DBには保存していない）
        const progress = order.report_progress;
        if (progress.data && progress.data.messageCount > 0 && !progress.data.messages) {
          console.log('   ⚠️ messagesは再取得が必要');
        }
        
        return progress;
      }
      
      // statusからステップ番号を取得（フォールバック）
      if (order.status && order.status.startsWith('generating_step_')) {
        const stepNumber = parseInt(order.status.replace('generating_step_', ''));
        console.log('✅ ステータスから進捗を復元: Step', stepNumber);
        
        // 簡易的な進捗オブジェクトを返す（データは失われる）
        return {
          currentStep: stepNumber,
          totalSteps: 5,
          data: {},  // データは復元できない
          attempts: 1,
          startedAt: order.updatedAt || order.createdAt
        };
      }
      
      console.log('⚠️ 進捗データなし（初回実行）');
      return null;
    } catch (err) {
      console.error('❌ 進捗取得エラー:', err.message);
      return null;
    }
  }
  
  // 進捗をクリア
  async clearReportProgress(orderId) {
    console.log('🧹 [clearReportProgress] 進捗をクリア:', orderId);
    
    if (!this.useDatabase) {
      console.log('⚠️ データベース未設定');
      return true;
    }
    
    try {
      // report_progressフィールドのみクリア（statusは変更しない）
      await this.supabase
        .from('orders')
        .update({
          report_progress: null,  // 進捗データのみクリア
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      console.log('✅ DB進捗をクリア（statusは変更せず）');
      return true;
    } catch (err) {
      console.error('❌ 進捗クリアエラー:', err.message);
      return true; // エラーでも続行
    }
  }

  // Batch API結果の保存（デバッグ用）
  async saveBatchResult(orderId, batchResult) {
    try {
      // Supabaseに直接保存（優先）
      if (this.useDatabase && this.supabase) {
        try {
          // ordersテーブルのbatch_debugフィールドに完全なデータを保存
          const { error } = await this.supabase
            .from('orders')
            .update({
              batch_debug: {
                batchId: batchResult.batchId,
                timestamp: batchResult.timestamp,
                status: batchResult.status,
                hasAiInsights: !!batchResult.aiInsights,
                parsedResultsCount: batchResult.parsedResults?.length || 0,
                rawContentLength: batchResult.rawContent?.length || 0,
                // 重要: rawContentも保存（最初の5000文字）
                rawContentPreview: batchResult.rawContent?.substring(0, 5000),
                parsedResults: batchResult.parsedResults,
                // AI Insightsの一部も保存
                aiInsightsPreview: batchResult.aiInsights ? {
                  hasPersonality: !!batchResult.aiInsights.personality,
                  hasInterests: !!batchResult.aiInsights.interests,
                  relationshipStage: batchResult.aiInsights.relationshipStage
                } : null
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
          
          if (!error) {
            console.log('✅ Batch result saved to database successfully');
            return true;
          } else {
            console.error('❌ Database save error:', error);
          }
        } catch (dbError) {
          console.error('❌ Failed to save to database:', dbError.message);
        }
      }
      
      // フォールバック: ローカルファイルに保存（開発環境用）
      if (!process.env.VERCEL) {
        const fs = require('fs').promises;
        const path = require('path');
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });
        const batchFile = path.join(tempDir, `batch_${orderId}.json`);
        await fs.writeFile(batchFile, JSON.stringify(batchResult, null, 2));
        console.log('💾 Batch result saved to local file:', batchFile);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error saving batch result:', error.message);
      return false;
    }
  }

  // Batch API結果の取得（デバッグ用）
  async getBatchResult(userId) {
    try {
      console.log('🔍 Getting batch result for user:', userId);
      
      // データベースから直接取得（優先）
      if (this.useDatabase && this.supabase) {
        try {
          // ユーザーの最新の注文を取得
          const { data: orders, error } = await this.supabase
            .from('orders')
            .select('id, batch_debug, created_at, status')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (error) {
            console.error('❌ Error fetching orders:', error);
            return null;
          }
          
          if (!orders || orders.length === 0) {
            console.log('⚠️ No orders found for user');
            return null;
          }
          
          const latestOrder = orders[0];
          console.log('📦 Latest order:', latestOrder.id, 'Status:', latestOrder.status);
          
          // batch_debugフィールドから取得
          if (latestOrder.batch_debug) {
            console.log('✅ Batch debug data found in database');
            return {
              batchId: latestOrder.batch_debug.batchId,
              orderId: latestOrder.id,
              timestamp: latestOrder.batch_debug.timestamp,
              status: latestOrder.batch_debug.status,
              parsedResultsCount: latestOrder.batch_debug.parsedResultsCount,
              rawContentLength: latestOrder.batch_debug.rawContentLength,
              hasAiInsights: latestOrder.batch_debug.hasAiInsights,
              rawContent: latestOrder.batch_debug.rawContentPreview || 'No preview available',
              parsedResults: latestOrder.batch_debug.parsedResults,
              aiInsights: latestOrder.batch_debug.aiInsightsPreview, // aiInsightsPreviewをaiInsightsとして返す
              aiInsightsPreview: latestOrder.batch_debug.aiInsightsPreview
            };
          } else {
            console.log('⚠️ No batch debug data in database');
          }
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
        }
      }
      
      // フォールバック: ローカルファイルから読み込み（開発環境用）
      if (!process.env.VERCEL) {
        const fs = require('fs').promises;
        const path = require('path');
        
        // getUserOrdersを使って注文IDを取得
        const orders = await this.getUserOrders(userId);
        if (orders && orders.length > 0) {
          const orderId = orders[0].id || orders[0].orderId;
          const tempDir = path.join(process.cwd(), 'temp');
          const batchFile = path.join(tempDir, `batch_${orderId}.json`);
          
          try {
            const content = await fs.readFile(batchFile, 'utf-8');
            const batchResult = JSON.parse(content);
            console.log('📄 Batch result loaded from local file');
            return batchResult;
          } catch (fileError) {
            console.log('⚠️ Local file not found');
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting batch result:', error.message);
      return null;
    }
  }
}

// シングルトンインスタンスを作成
const instance = new OrdersDB();

// 環境変数が後から設定される場合に備えて再初期化メソッドを追加
instance.reinitialize = function() {
  console.log('🔄 OrdersDB再初期化');
  this.checkDatabase();
  console.log('🔄 再初期化後のuseDatabase:', this.useDatabase);
};

module.exports = instance;