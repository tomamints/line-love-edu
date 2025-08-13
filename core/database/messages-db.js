// メッセージデータベース操作
const { isDatabaseConfigured } = require('./supabase');
const fs = require('fs').promises;
const path = require('path');

class MessagesDB {
  constructor() {
    console.log('🔧 MessagesDB初期化開始');
    this.checkDatabase();
    // ファイルストレージのディレクトリ
    this.messagesDir = process.env.VERCEL 
      ? '/tmp/messages'
      : path.join(__dirname, '../../data/messages');
    this.ensureDirectoryExists();
  }
  
  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.messagesDir, { recursive: true });
    } catch (error) {
      console.error('メッセージディレクトリ作成エラー:', error);
    }
  }
  
  checkDatabase() {
    this.useDatabase = isDatabaseConfigured();
    
    if (this.useDatabase) {
      const { supabase } = require('./supabase');
      this.supabase = supabase;
      console.log('✅ Supabase接続成功 - メッセージデータベース');
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
      this.supabase = null;
    }
  }

  // メッセージを保存
  async saveMessages(userId, messages) {
    console.log(`📝 Saving ${messages.length} messages for user ${userId}`);
    
    // 毎回最新の接続状態を確認
    this.checkDatabase();
    
    if (!this.useDatabase || !this.supabase) {
      // ファイルストレージを使用
      return this.saveMessagesToFile(userId, messages);
    }

    try {
      // Supabaseに保存
      const { data, error } = await this.supabase
        .from('user_messages')
        .upsert({
          user_id: userId,
          messages: messages,
          message_count: messages.length,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ メッセージ保存エラー:', error);
        // フォールバック：ファイルストレージを使用
        return this.saveMessagesToFile(userId, messages);
      }

      console.log(`✅ ${messages.length} messages saved to database`);
      return data;
    } catch (err) {
      console.error('❌ データベースエラー:', err);
      // フォールバック：ファイルストレージを使用
      return this.saveMessagesToFile(userId, messages);
    }
  }

  // メッセージを取得
  async getMessages(userId) {
    console.log(`📖 Getting messages for user ${userId}`);
    
    if (!this.useDatabase) {
      return this.getMessagesFromFile(userId);
    }

    try {
      const { data, error } = await this.supabase
        .from('user_messages')
        .select('messages')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが見つからない場合、ファイルストレージを確認
          const fileMessages = await this.getMessagesFromFile(userId);
          if (fileMessages && fileMessages.length > 0) {
            // ファイルにある場合はデータベースに移行
            await this.saveMessages(userId, fileMessages);
            return fileMessages;
          }
          console.log('⚠️ No messages found for user');
          return null;
        }
        console.error('メッセージ取得エラー:', error);
        return this.getMessagesFromFile(userId);
      }

      console.log(`✅ Retrieved ${data.messages?.length || 0} messages from database`);
      
      // デバッグ: メッセージの詳細を確認
      if (data.messages && data.messages.length > 0) {
        console.log('📨 First 3 messages from DB:', data.messages.slice(0, 3).map(m => ({
          text: m.text?.substring(0, 50),
          hasText: !!m.text,
          textType: typeof m.text,
          isUser: m.isUser,
          createdAt: m.createdAt
        })));
        console.log('📨 Message fields:', Object.keys(data.messages[0] || {}));
      }
      
      return data.messages;
    } catch (err) {
      console.error('データベースエラー:', err);
      return this.getMessagesFromFile(userId);
    }
  }

  // ファイルストレージにメッセージを保存
  async saveMessagesToFile(userId, messages) {
    try {
      const filePath = path.join(this.messagesDir, `${userId}.json`);
      const data = {
        userId,
        messages,
        messageCount: messages.length,
        updatedAt: new Date().toISOString()
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ ${messages.length} messages saved to file`);
      return data;
    } catch (error) {
      console.error('ファイル保存エラー:', error);
      throw error;
    }
  }

  // ファイルストレージからメッセージを取得
  async getMessagesFromFile(userId) {
    try {
      const filePath = path.join(this.messagesDir, `${userId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      console.log(`✅ Retrieved ${parsed.messages?.length || 0} messages from file`);
      return parsed.messages;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // ファイルが存在しない
      }
      console.error('ファイル読み込みエラー:', error);
      return null;
    }
  }

  // メッセージが存在するか確認
  async hasMessages(userId) {
    const messages = await this.getMessages(userId);
    return messages !== null && messages.length > 0;
  }

  // メッセージを削除
  async deleteMessages(userId) {
    console.log(`🗑️ Deleting messages for user ${userId}`);
    
    if (!this.useDatabase) {
      return this.deleteMessagesFile(userId);
    }

    try {
      const { error } = await this.supabase
        .from('user_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('メッセージ削除エラー:', error);
        return this.deleteMessagesFile(userId);
      }

      console.log('✅ メッセージを削除:', userId);
      
      // ファイルストレージからも削除
      await this.deleteMessagesFile(userId);
      
      return true;
    } catch (err) {
      console.error('データベースエラー:', err);
      return this.deleteMessagesFile(userId);
    }
  }

  // ファイルストレージからメッセージを削除
  async deleteMessagesFile(userId) {
    try {
      const filePath = path.join(this.messagesDir, `${userId}.json`);
      await fs.unlink(filePath);
      console.log(`✅ メッセージファイル削除完了: ${userId}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // ファイルが存在しない
      }
      console.error('ファイル削除エラー:', error);
      throw error;
    }
  }

  // テーブルの初期化（Supabaseダッシュボードで実行）
  async initTable() {
    // Supabaseのダッシュボードで以下のSQLを実行してください：
    /*
    CREATE TABLE IF NOT EXISTS user_messages (
      user_id TEXT PRIMARY KEY,
      messages JSONB NOT NULL,
      message_count INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    */
  }
}

module.exports = new MessagesDB();