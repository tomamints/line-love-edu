// ユーザープロファイル管理
const fs = require('fs').promises;
const path = require('path');

class UserProfileManager {
  constructor() {
    this.profileDir = path.join(__dirname, '../data/profiles');
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.profileDir, { recursive: true });
    } catch (error) {
      console.error('プロファイルディレクトリ作成エラー:', error);
    }
  }

  // ユーザープロファイルのファイルパス取得
  getProfilePath(userId) {
    return path.join(this.profileDir, `${userId}.json`);
  }

  // プロファイル保存
  async saveProfile(userId, profileData) {
    try {
      const filePath = this.getProfilePath(userId);
      const data = {
        userId,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      // 既存のプロファイルがあれば読み込んでマージ
      const existingProfile = await this.getProfile(userId);
      if (existingProfile) {
        Object.assign(data, existingProfile, profileData);
      }
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`プロファイル保存完了: ${userId}`);
      return data;
    } catch (error) {
      console.error('プロファイル保存エラー:', error);
      throw error;
    }
  }

  // プロファイル取得
  async getProfile(userId) {
    try {
      const filePath = this.getProfilePath(userId);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // ファイルが存在しない
      }
      console.error('プロファイル読み込みエラー:', error);
      throw error;
    }
  }

  // プロファイルが存在するか確認
  async hasProfile(userId) {
    const profile = await this.getProfile(userId);
    return profile !== null;
  }

  // 基本プロファイルが完成しているか確認
  async hasCompleteProfile(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) return false;
    
    // 必須項目が揃っているか確認
    return !!(
      profile.userName &&
      profile.birthDate &&
      profile.gender &&
      profile.partnerBirthDate &&
      profile.partnerGender
    );
  }

  // 入力ステータス取得
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

  // 現在の入力ステップを判定
  getCurrentStep(profile) {
    if (!profile.userName) return 'userName';
    if (!profile.birthDate) return 'userBirthDate';
    if (!profile.gender) return 'userGender';
    if (!profile.partnerBirthDate) return 'partnerBirthDate';
    if (!profile.partnerGender) return 'partnerGender';
    return 'complete';
  }

  // 生年月日のパース
  parseBirthDate(text) {
    // 様々な形式に対応
    // 1998/4/30, 1998-04-30, 1998年4月30日, 19980430 など
    
    // 数字を抽出
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length < 3) return null;
    
    let year, month, day;
    
    // 8桁の数字の場合 (19980430)
    if (numbers.length === 1 && numbers[0].length === 8) {
      year = parseInt(numbers[0].substring(0, 4));
      month = parseInt(numbers[0].substring(4, 6));
      day = parseInt(numbers[0].substring(6, 8));
    } else {
      // 年月日が分かれている場合
      year = parseInt(numbers[0]);
      month = parseInt(numbers[1]);
      day = parseInt(numbers[2]);
      
      // 2桁の年を4桁に変換
      if (year < 100) {
        year = year < 50 ? 2000 + year : 1900 + year;
      }
    }
    
    // 妥当性チェック
    if (year < 1900 || year > 2024) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    // ISO形式で返す
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 性別のパース
  parseGender(text) {
    const lowerText = text.toLowerCase();
    
    // 男性パターン
    if (lowerText.includes('男') || 
        lowerText.includes('おとこ') || 
        lowerText === 'm' || 
        lowerText === 'male') {
      return 'male';
    }
    
    // 女性パターン
    if (lowerText.includes('女') || 
        lowerText.includes('おんな') || 
        lowerText === 'f' || 
        lowerText === 'female') {
      return 'female';
    }
    
    return null;
  }

  // プロファイル削除（リセット用）
  async deleteProfile(userId) {
    try {
      const filePath = this.getProfilePath(userId);
      await fs.unlink(filePath);
      console.log(`プロファイル削除完了: ${userId}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // ファイルが存在しない
      }
      console.error('プロファイル削除エラー:', error);
      throw error;
    }
  }
}

module.exports = UserProfileManager;