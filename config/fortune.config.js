// 恋愛お告げボットの設定ファイル
module.exports = {
  // タイミング計算のパラメータ
  timing: {
    // 惑星の影響力スコア (1-10)
    planetInfluence: {
      venus: 8,    // 愛情運
      mars: 6,     // 行動力
      moon: 7,     // 感情運
      mercury: 5,  // コミュニケーション運
      jupiter: 4,  // 幸運度
      saturn: 3,   // 安定性
      sun: 9       // 全体運
    },
    
    // 時間帯の重み
    timeWeight: {
      morning: 1.2,   // 6-12時
      afternoon: 1.0, // 12-18時
      evening: 1.3,   // 18-22時
      night: 0.8      // 22-6時
    },
    
    // 曜日の重み
    dayWeight: {
      sunday: 1.1,
      monday: 0.9,
      tuesday: 1.0,
      wednesday: 1.1,
      thursday: 1.0,
      friday: 1.3,
      saturday: 1.2
    }
  },
  
  // スコアリングの重み付け
  scoring: {
    numerology: 0.3,    // 数秘術の重み
    timing: 0.4,        // タイミングの重み
    compatibility: 0.3   // 相性の重み
  },
  
  // お告げの生成設定
  generation: {
    maxLength: 200,        // 最大文字数
    minLength: 50,         // 最小文字数
    includeAdvice: true,   // アドバイス含める
    includeWarning: true,  // 注意点含める
    toneStyle: 'gentle',   // 語調（gentle, energetic, mystical）
    
    // テンプレート設定
    templates: {
      greeting: [
        "今日のあなたの恋愛運を見てみましょう✨",
        "愛の扉が開かれようとしています💕",
        "運命の糸が紡がれる時です💫"
      ],
      positive: [
        "素晴らしい出会いが待っています",
        "愛情運が高まっています",
        "恋愛成就の兆しが見えます"
      ],
      neutral: [
        "今は準備の時期です",
        "内面を磨く良い機会です",
        "慎重に進むことをお勧めします"
      ],
      negative: [
        "少し注意が必要な時期です",
        "冷静な判断を心がけましょう",
        "時間をかけて考えてみてください"
      ]
    }
  },
  
  // キャッシュ設定
  cache: {
    enabled: true,
    ttl: 3600000, // 1時間 (ミリ秒)
    maxSize: 1000 // 最大キャッシュ数
  }
};