/**
 * 性格タイプマッピングユーティリティ
 * APIの英語キーと日本語表示名をマッピング
 */

window.PersonalityTypeMapper = {
    // 感情表現タイプのマッピング
    emotionalExpression: {
        'straight': 'ストレート告白型',
        'physical': 'スキンシップ型',
        'subtle': 'さりげない気遣い型',
        'shy': '奥手シャイ型',
        // 逆引き用
        'ストレート告白型': 'straight',
        'スキンシップ型': 'physical',
        'さりげない気遣い型': 'subtle',
        '奥手シャイ型': 'shy'
    },
    
    // 距離感タイプのマッピング
    distanceStyle: {
        'close': 'ベッタリ依存型',
        'moderate': '安心セーフ型',
        'independent': '自由マイペース型',
        'cautious': '壁あり慎重型',
        // 逆引き用
        'ベッタリ依存型': 'close',
        '安心セーフ型': 'moderate',
        '自由マイペース型': 'independent',
        '壁あり慎重型': 'cautious',
        // 旧名称との互換性
        'ベッタリ型': 'close',
        'ちょうどいい距離型': 'moderate',
        'じっくり型': 'cautious',
        'マイペース型': 'independent',
        '超慎重型': 'cautious'
    },
    
    // 価値観タイプのマッピング
    loveValues: {
        'romantic': 'ロマンチスト型',
        'realistic': 'リアリスト型',
        'excitement': '刺激ハンター型',
        'growth': '成長パートナー型',
        // 逆引き用
        'ロマンチスト型': 'romantic',
        'リアリスト型': 'realistic',
        '刺激ハンター型': 'excitement',
        '成長パートナー型': 'growth',
        // 旧名称との互換性
        'ロマンス重視': 'romantic',
        '安心感重視': 'realistic',
        '刺激重視': 'excitement',
        '成長重視': 'growth'
    },
    
    // エネルギータイプのマッピング
    energyType: {
        'intense': '燃え上がり型',
        'stable': '持続型',
        'fluctuating': '波あり型',
        'cool': 'クール型',
        // 逆引き用
        '燃え上がり型': 'intense',
        '持続型': 'stable',
        '波あり型': 'fluctuating',
        'クール型': 'cool',
        // 旧名称との互換性
        '情熱的': 'intense',
        '安定的': 'stable',
        '変動的': 'fluctuating',
        '冷静': 'cool'
    },
    
    /**
     * 英語キーから日本語表示名を取得
     * @param {string} category - カテゴリ名
     * @param {string} key - 英語キー
     * @returns {string} - 日本語表示名
     */
    getJapaneseName: function(category, key) {
        if (!this[category] || !key) return key;
        return this[category][key] || key;
    },
    
    /**
     * 日本語表示名から英語キーを取得
     * @param {string} category - カテゴリ名
     * @param {string} name - 日本語表示名
     * @returns {string} - 英語キー
     */
    getEnglishKey: function(category, name) {
        if (!this[category] || !name) return name;
        
        // すでに英語キーの場合はそのまま返す
        if (['straight', 'physical', 'subtle', 'shy', 'close', 'moderate', 'independent', 'cautious',
              'romantic', 'realistic', 'excitement', 'growth', 'intense', 'stable', 'fluctuating', 'cool'].includes(name)) {
            return name;
        }
        
        return this[category][name] || name;
    },
    
    /**
     * プロフィールの値を日本語名に変換
     * @param {object} profile - プロフィールオブジェクト
     * @returns {object} - 変換済みプロフィール
     */
    convertProfileToJapanese: function(profile) {
        const converted = { ...profile };
        
        if (profile.emotionalExpression) {
            converted.emotionalExpression = this.getJapaneseName('emotionalExpression', profile.emotionalExpression);
        }
        if (profile.distanceStyle) {
            converted.distanceStyle = this.getJapaneseName('distanceStyle', profile.distanceStyle);
        }
        if (profile.loveValues) {
            converted.loveValues = this.getJapaneseName('loveValues', profile.loveValues);
        }
        if (profile.loveEnergy) {
            converted.loveEnergy = this.getJapaneseName('energyType', profile.loveEnergy);
        }
        
        return converted;
    }
};