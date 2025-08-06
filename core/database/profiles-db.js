// プロファイルデータベース操作
const { supabase, isDatabaseConfigured } = require('./supabase');
const UserProfileManager = require('../user-profile');

class ProfilesDB {
  constructor() {
    this.useDatabase = isDatabaseConfigured();
    this.fileManager = new UserProfileManager();
    
    if (this.useDatabase) {
      console.log('✅ Supabase接続成功 - プロファイルデータベース');
      this.initTable();
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
    }
  }

  // テーブルの初期化
  async initTable() {
    // Supabaseのダッシュボードで以下のSQLを実行してください：
    /*
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      user_name TEXT,
      birth_date DATE,
      gender TEXT,
      partner_name TEXT,
      partner_birth_date DATE,
      partner_gender TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    */
  }

  // プロファイルを保存
  async saveProfile(userId, profileData) {
    if (!this.useDatabase) {
      return this.fileManager.saveProfile(userId, profileData);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          user_name: profileData.userName,
          birth_date: profileData.birthDate,
          gender: profileData.gender,
          partner_name: profileData.partnerName,
          partner_birth_date: profileData.partnerBirthDate,
          partner_gender: profileData.partnerGender,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('プロファイル保存エラー:', error);
        return this.fileManager.saveProfile(userId, profileData);
      }

      console.log('✅ プロファイルをデータベースに保存:', userId);
      return this.formatProfile(data);
    } catch (err) {
      console.error('データベースエラー:', err);
      return this.fileManager.saveProfile(userId, profileData);
    }
  }

  // プロファイルを取得
  async getProfile(userId) {
    if (!this.useDatabase) {
      return this.fileManager.getProfile(userId);
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // レコードが見つからない場合
          // ファイルストレージを確認
          const fileProfile = await this.fileManager.getProfile(userId);
          if (fileProfile) {
            // ファイルにある場合はデータベースに移行
            await this.saveProfile(userId, fileProfile);
            return fileProfile;
          }
          return null;
        }
        console.error('プロファイル取得エラー:', error);
        return this.fileManager.getProfile(userId);
      }

      return this.formatProfile(data);
    } catch (err) {
      console.error('データベースエラー:', err);
      return this.fileManager.getProfile(userId);
    }
  }

  // プロファイルの存在確認
  async hasProfile(userId) {
    const profile = await this.getProfile(userId);
    return profile !== null;
  }

  // 完全なプロファイルか確認
  async hasCompleteProfile(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) return false;
    
    return !!(
      profile.userName &&
      profile.birthDate &&
      profile.gender &&
      profile.partnerBirthDate &&
      profile.partnerGender
    );
  }

  // 入力ステータスを取得
  async getInputStatus(userId) {
    const profile = await this.getProfile(userId) || {};
    
    return {
      hasUserName: !!profile.userName,
      hasUserBirthDate: !!profile.birthDate,
      hasUserGender: !!profile.gender,
      hasPartnerBirthDate: !!profile.partnerBirthDate,
      hasPartnerGender: !!profile.partnerGender,
      hasPartnerName: !!profile.partnerName,
      currentStep: this.getCurrentStep(profile)
    };
  }

  // 現在のステップを判定
  getCurrentStep(profile) {
    if (!profile.userName) return 'userName';
    if (!profile.birthDate) return 'userBirthDate';
    if (!profile.gender) return 'userGender';
    if (!profile.partnerBirthDate) return 'partnerBirthDate';
    if (!profile.partnerGender) return 'partnerGender';
    return 'complete';
  }

  // プロファイルを削除
  async deleteProfile(userId) {
    if (!this.useDatabase) {
      return this.fileManager.deleteProfile(userId);
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('プロファイル削除エラー:', error);
        return this.fileManager.deleteProfile(userId);
      }

      console.log('✅ プロファイルを削除:', userId);
      
      // ファイルストレージからも削除
      await this.fileManager.deleteProfile(userId);
      
      return true;
    } catch (err) {
      console.error('データベースエラー:', err);
      return this.fileManager.deleteProfile(userId);
    }
  }

  // データベースの形式をアプリケーションの形式に変換
  formatProfile(data) {
    if (!data) return null;
    
    return {
      userId: data.user_id,
      userName: data.user_name,
      birthDate: data.birth_date,
      gender: data.gender,
      partnerName: data.partner_name,
      partnerBirthDate: data.partner_birth_date,
      partnerGender: data.partner_gender,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // ユーティリティメソッド（UserProfileManagerから継承）
  parseBirthDate(text) {
    return this.fileManager.parseBirthDate(text);
  }

  parseGender(text) {
    return this.fileManager.parseGender(text);
  }
}

module.exports = new ProfilesDB();