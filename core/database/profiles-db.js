// プロファイルデータベース操作
const { isDatabaseConfigured } = require('./supabase');
const UserProfileManager = require('../user-profile');

class ProfilesDB {
  constructor() {
    console.log('🔧 ProfilesDB初期化開始');
    this.fileManager = new UserProfileManager();
    this.checkDatabase();
  }
  
  checkDatabase() {
    this.useDatabase = isDatabaseConfigured();
    
    console.log('🔍 isDatabaseConfigured():', this.useDatabase);
    
    if (this.useDatabase) {
      const { supabase } = require('./supabase');
      this.supabase = supabase;
      console.log('🔍 supabase client exists:', !!this.supabase);
      console.log('✅ Supabase接続成功 - プロファイルデータベース');
    } else {
      console.log('⚠️ Supabaseが設定されていません - ファイルストレージを使用');
      this.supabase = null;
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
    console.log('📝 saveProfile呼び出し:', { userId, profileData });
    
    // 毎回最新の接続状態を確認
    this.checkDatabase();
    console.log('🔍 useDatabase:', this.useDatabase);
    
    if (!this.useDatabase || !this.supabase) {
      console.log('⚠️ データベース未設定、ファイルストレージを使用');
      return this.fileManager.saveProfile(userId, profileData);
    }

    try {
      // 既存のプロファイルを取得してマージ
      const existingProfile = await this.getProfile(userId) || {};
      const mergedData = { ...existingProfile, ...profileData };
      
      // personalInfoがある場合は個別フィールドにマップ（新しいデータを優先）
      if (profileData.personalInfo) {
        const info = profileData.personalInfo;
        // 新しいデータで上書き
        mergedData.birthDate = info.userBirthdate;
        mergedData.gender = info.userGender;
        mergedData.partnerBirthDate = info.partnerBirthdate;
        mergedData.partnerGender = info.partnerGender;
        mergedData.loveSituation = info.loveSituation;
        mergedData.wantToKnow = info.wantToKnow;
      }
      
      const upsertData = {
        user_id: userId,
        user_name: mergedData.userName || null,
        birth_date: mergedData.birthDate || null,
        gender: mergedData.gender || null,
        partner_name: mergedData.partnerName || null,
        partner_birth_date: mergedData.partnerBirthDate || null,
        partner_gender: mergedData.partnerGender || null,
        love_situation: mergedData.loveSituation || null,
        want_to_know: mergedData.wantToKnow || null,
        updated_at: new Date().toISOString()
      };
      
      console.log('📤 Supabaseに送信するデータ:', upsertData);
      
      const { data, error } = await this.supabase
        .from('profiles')
        .upsert(upsertData)
        .select()
        .single();

      if (error) {
        console.error('❌ プロファイル保存エラー:', error);
        console.error('❌ エラー詳細:', JSON.stringify(error));
        return this.fileManager.saveProfile(userId, profileData);
      }

      console.log('✅ プロファイルをデータベースに保存成功:', data);
      return this.formatProfile(data);
    } catch (err) {
      console.error('❌ データベースエラー:', err);
      console.error('❌ エラースタック:', err.stack);
      return this.fileManager.saveProfile(userId, profileData);
    }
  }

  // プロファイルを取得
  async getProfile(userId) {
    if (!this.useDatabase) {
      return this.fileManager.getProfile(userId);
    }

    try {
      const { data, error } = await this.supabase
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
      const { error } = await this.supabase
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
    
    // データベースの形式をアプリケーションの形式に変換
    const profile = {
      userId: data.user_id,
      userName: data.user_name,
      birthDate: data.birth_date,
      gender: data.gender,
      partnerName: data.partner_name,
      partnerBirthDate: data.partner_birth_date,
      partnerGender: data.partner_gender,
      loveSituation: data.love_situation,
      wantToKnow: data.want_to_know,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // lastFortuneResultなどの追加データは元のprofileDataから継承
      ...data.profile_data
    };
    
    // personalInfo形式も追加（FortuneEngineで使用）
    if (data.birth_date || data.partner_birth_date || data.love_situation) {
      profile.personalInfo = {
        userBirthdate: data.birth_date,
        userAge: data.birth_date ? this.calculateAge(data.birth_date) : null,
        userGender: data.gender,
        partnerBirthdate: data.partner_birth_date,
        partnerAge: data.partner_birth_date ? this.calculateAge(data.partner_birth_date) : null,
        partnerGender: data.partner_gender,
        loveSituation: data.love_situation,
        wantToKnow: data.want_to_know
      };
    }
    
    return profile;
  }
  
  // 生年月日から年齢を計算
  calculateAge(birthDate) {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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