// 恋愛タイプ定義
const LOVE_TYPES = {
  emotional: {
    name: '感情表現',
    color: '#ff64b4',
    types: {
      straight: {
        id: 'straight',
        name: 'ストレート告白型',
        description: '気持ちは隠さず真っ直ぐ伝える',
        icon: '/images/love-types/emotional/straight.png'
      },
      physical: {
        id: 'physical', 
        name: 'スキンシップ型',
        description: '触れ合いや行動で愛を示す',
        icon: '/images/love-types/emotional/physical.png'
      },
      subtle: {
        id: 'subtle',
        name: 'さりげない気遣い型',
        description: '小さな優しさで伝える',
        icon: '/images/love-types/emotional/subtle.png'
      },
      shy: {
        id: 'shy',
        name: '奥手シャイ型',
        description: '心では大きいけど表現が控えめ',
        icon: '/images/love-types/emotional/shy.png'
      }
    }
  },
  
  distance: {
    name: '距離感',
    color: '#32ffb4',
    types: {
      close: {
        id: 'close',
        name: 'ベッタリ依存型',
        description: '常に繋がっていたい',
        icon: '/images/love-types/distance/close.png'
      },
      moderate: {
        id: 'moderate',
        name: '安心セーフ型',
        description: '適度な連絡で安心を求める',
        icon: '/images/love-types/distance/moderate.png'
      },
      independent: {
        id: 'independent',
        name: '自由マイペース型',
        description: '恋も自分の時間も大事にしたい',
        icon: '/images/love-types/distance/independent.png'
      },
      cautious: {
        id: 'cautious',
        name: '壁あり慎重型',
        description: 'すぐには心を開かず距離を保つ',
        icon: '/images/love-types/distance/cautious.png'
      }
    }
  },
  
  values: {
    name: '価値観',
    color: '#64c8ff',
    types: {
      romantic: {
        id: 'romantic',
        name: 'ロマンチスト型',
        description: '理想や物語性を大切にする',
        icon: '/images/love-types/values/romantic.png'
      },
      realistic: {
        id: 'realistic',
        name: 'リアリスト型',
        description: '現実的で堅実な関係を求める',
        icon: '/images/love-types/values/realistic.png'
      },
      excitement: {
        id: 'excitement',
        name: '刺激ハンター型',
        description: '新鮮さやドキドキを追い求める',
        icon: '/images/love-types/values/excitement.png'
      },
      growth: {
        id: 'growth',
        name: '成長パートナー型',
        description: '一緒に成長できる関係を重視',
        icon: '/images/love-types/values/growth.png'
      }
    }
  },
  
  energy: {
    name: 'エネルギー',
    color: '#ff7832',
    types: {
      intense: {
        id: 'intense',
        name: '燃え上がり型',
        description: '一気にのめり込む',
        icon: '/images/love-types/energy/intense.png'
      },
      stable: {
        id: 'stable',
        name: '持続型',
        description: '安定してずっと熱を注ぐ',
        icon: '/images/love-types/energy/stable.png'
      },
      fluctuating: {
        id: 'fluctuating',
        name: '波あり型',
        description: '気持ちの浮き沈みがある',
        icon: '/images/love-types/energy/fluctuating.png'
      },
      cool: {
        id: 'cool',
        name: 'クール型',
        description: '恋愛に全振りせず冷静',
        icon: '/images/love-types/energy/cool.png'
      }
    }
  }
};

// データベースの値とマッピング
const DATABASE_VALUES = {
  emotional: ['straight', 'physical', 'subtle', 'shy'],
  distance: ['close', 'moderate', 'independent', 'cautious'],
  values: ['romantic', 'realistic', 'excitement', 'growth'],
  energy: ['intense', 'stable', 'fluctuating', 'cool']
};

module.exports = {
  LOVE_TYPES,
  mapAnswerToType
};