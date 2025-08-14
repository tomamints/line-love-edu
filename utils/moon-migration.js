// 月占いV1からV2への移行ヘルパー
// 既存ユーザーのデータ互換性を保つ

class MoonMigration {
  constructor() {
    // 旧月タイプ名から新月タイプ名へのマッピング
    this.typeMapping = {
      '新月タイプ': '新月',
      '三日月タイプ': '三日月',
      '上弦の月タイプ': '上弦の月',
      '満ちゆく月タイプ': '十三夜',  // 旧「満ちゆく月」→「十三夜」
      '満月タイプ': '満月',
      '欠けゆく月タイプ': '十六夜',  // 旧「欠けゆく月」→「十六夜」
      '下弦の月タイプ': '下弦の月',
      '逆三日月タイプ': '暁'  // 旧「逆三日月」→「暁」
    };
    
    // 月相範囲のマッピング（角度ベース）
    this.phaseMapping = {
      'newMoon': '新月',
      'waxingCrescent': '三日月',
      'firstQuarter': '上弦の月',
      'waxingGibbous': '十三夜',
      'fullMoon': '満月',
      'waningGibbous': '十六夜',
      'lastQuarter': '下弦の月',
      'waningCrescent': '暁'
    };
  }
  
  // 旧形式の月タイプ名を新形式に変換
  migrateMoonTypeName(oldName) {
    // すでに新形式の場合はそのまま返す
    if (Object.values(this.typeMapping).includes(oldName)) {
      return oldName;
    }
    
    // マッピングテーブルから変換
    return this.typeMapping[oldName] || oldName;
  }
  
  // 旧形式のキーを新形式に変換
  migrateMoonPhaseKey(oldKey) {
    return this.phaseMapping[oldKey] || oldKey;
  }
  
  // 既存の診断結果を新形式に変換
  migrateFortuneResult(oldResult) {
    if (!oldResult) return null;
    
    const migrated = { ...oldResult };
    
    // ユーザーの月タイプを移行
    if (oldResult.user?.moonPhaseType) {
      const oldType = oldResult.user.moonPhaseType;
      migrated.user = {
        ...oldResult.user,
        moonType: this.migrateMoonTypeName(oldType.name || oldType),
        emoji: oldType.symbol || oldType.emoji || '🌙'
      };
    }
    
    // パートナーの月タイプを移行
    if (oldResult.partner?.moonPhaseType) {
      const oldType = oldResult.partner.moonPhaseType;
      migrated.partner = {
        ...oldResult.partner,
        moonType: this.migrateMoonTypeName(oldType.name || oldType),
        emoji: oldType.symbol || oldType.emoji || '🌙'
      };
    }
    
    return migrated;
  }
  
  // 既存プロファイルデータの互換性チェック
  checkCompatibility(profile) {
    if (!profile) return { isCompatible: false, needsMigration: false };
    
    // V2形式かチェック（moonTypeフィールドの存在で判定）
    const hasV2Format = profile.moonType !== undefined;
    
    // V1形式かチェック（moonPhaseTypeフィールドの存在で判定）
    const hasV1Format = profile.moonPhaseType !== undefined;
    
    return {
      isCompatible: hasV2Format || hasV1Format,
      needsMigration: hasV1Format && !hasV2Format,
      version: hasV2Format ? 'v2' : hasV1Format ? 'v1' : 'unknown'
    };
  }
  
  // バッチ移行処理（複数ユーザーのデータを一括変換）
  async batchMigrate(profiles) {
    const results = {
      total: profiles.length,
      migrated: 0,
      skipped: 0,
      errors: []
    };
    
    for (const profile of profiles) {
      try {
        const compatibility = this.checkCompatibility(profile);
        
        if (compatibility.needsMigration) {
          // 移行処理
          const migrated = this.migrateFortuneResult(profile.lastFortuneResult);
          profile.lastFortuneResult = migrated;
          results.migrated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        results.errors.push({
          userId: profile.userId,
          error: error.message
        });
      }
    }
    
    return results;
  }
}

module.exports = MoonMigration;