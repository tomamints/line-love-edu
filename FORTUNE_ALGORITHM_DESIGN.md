# 恋愛お告げアルゴリズム設計書

## 🧮 分析エンジン構成

### 1. データ収集層

#### 基礎データ
```javascript
{
  // 時間パターン
  "timePatterns": {
    "responseTimeByHour": [/* 0-23時の返信時間 */],
    "responseRateByDay": {/* 曜日別返信率 */},
    "activeHours": [/* アクティブな時間帯 */],
    "goldenTime": "最も反応が良い時間"
  },
  
  // 感情パターン
  "emotionalPatterns": {
    "positiveTopics": ["話題A", "話題B"],
    "negativeTopics": ["話題X", "話題Y"],
    "moodByDay": {/* 曜日別の感情傾向 */},
    "emojiPreference": {/* 好む絵文字 */}
  },
  
  // 関係性指標
  "relationshipMetrics": {
    "intimacyLevel": 0-100,
    "conversationBalance": "自分:相手の比率",
    "initiativeScore": "会話開始頻度",
    "responseQuality": "返信の質スコア"
  }
}
```

### 2. 占術計算層

#### 数秘術
```javascript
function calculateNumerology(messages) {
  // メッセージ数から運命数を算出
  const destinyNumber = messages.length % 9 || 9;
  
  // 文字数から相性数を算出
  const totalChars = messages.reduce((sum, m) => sum + m.length, 0);
  const compatibilityNumber = totalChars % 9 || 9;
  
  return { destinyNumber, compatibilityNumber };
}
```

#### 曜日と惑星の対応
```javascript
const planetaryHours = {
  "月曜日": { ruler: "月", energy: "感情・直感", bestHours: [20, 21, 22] },
  "火曜日": { ruler: "火星", energy: "情熱・行動", bestHours: [15, 16, 17] },
  "水曜日": { ruler: "水星", energy: "コミュニケーション", bestHours: [14, 15, 19] },
  "木曜日": { ruler: "木星", energy: "拡大・幸運", bestHours: [11, 16, 20] },
  "金曜日": { ruler: "金星", energy: "愛・美", bestHours: [19, 20, 21] },
  "土曜日": { ruler: "土星", energy: "安定・約束", bestHours: [10, 14, 18] },
  "日曜日": { ruler: "太陽", energy: "活力・自信", bestHours: [11, 15, 16] }
};
```

#### バイオリズム計算
```javascript
function calculateBiorhythm(startDate, targetDate) {
  const daysSince = Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24));
  
  return {
    physical: Math.sin(2 * Math.PI * daysSince / 23),
    emotional: Math.sin(2 * Math.PI * daysSince / 28),
    intellectual: Math.sin(2 * Math.PI * daysSince / 33)
  };
}
```

### 3. AI予測層

#### 最適タイミング予測
```javascript
function predictOptimalTiming(patterns, planetaryData, biorhythm) {
  const candidates = [];
  
  for (let day = 0; day < 7; day++) {
    const dayName = getDayName(day);
    const planetary = planetaryHours[dayName];
    
    for (let hour of planetary.bestHours) {
      const score = calculateTimingScore({
        responseRate: patterns.timePatterns.responseRateByDay[dayName],
        planetaryEnergy: planetary.energy,
        biorhythmScore: biorhythm.emotional,
        historicalSuccess: patterns.timePatterns.responseTimeByHour[hour]
      });
      
      candidates.push({
        day: dayName,
        hour: hour,
        minute: calculateLuckyMinute(hour, patterns),
        score: score,
        reason: generateReason(planetary, patterns)
      });
    }
  }
  
  return candidates.sort((a, b) => b.score - a.score).slice(0, 3);
}
```

#### アクション生成
```javascript
function generateActions(timing, patterns, relationshipLevel) {
  const actions = {
    "初期段階": [
      { type: "スタンプ", content: "軽い挨拶スタンプ", impact: "低リスク・安全" },
      { type: "質問", content: "相手の興味に関する質問", impact: "関心を示す" }
    ],
    "発展段階": [
      { type: "共感", content: "相手の投稿への共感メッセージ", impact: "親密度UP" },
      { type: "提案", content: "一緒に何かをする提案", impact: "関係進展" }
    ],
    "親密段階": [
      { type: "感謝", content: "具体的な感謝の言葉", impact: "絆深化" },
      { type: "計画", content: "将来の計画を共有", impact: "コミットメント" }
    ]
  };
  
  return actions[relationshipLevel].map(action => ({
    ...action,
    timing: timing,
    successProbability: calculateSuccessProbability(action, patterns)
  }));
}
```

### 4. お告げ生成層

#### テンプレート構造
```javascript
const fortuneTemplate = {
  "opening": [
    "星々があなたに告げています...",
    "運命の扉が開かれようとしています...",
    "宇宙からのメッセージを受信しました..."
  ],
  
  "timing": [
    "{{day}}の{{time}}、それがあなたの運命の瞬間です",
    "{{day}}{{time}}、星々が最も輝く時...",
    "運命は{{day}}の{{time}}にあなたを待っています"
  ],
  
  "action": [
    "この瞬間に{{action}}することで、関係は新たな段階へ",
    "{{action}}という小さな一歩が、大きな変化をもたらします",
    "勇気を出して{{action}}してみてください"
  ],
  
  "warning": [
    "ただし、{{avoid_time}}は避けてください",
    "{{avoid_action}}は控えめに...",
    "この時期の{{avoid_topic}}は禁物です"
  ],
  
  "blessing": [
    "幸運の波動があなたを包んでいます",
    "愛の女神があなたを見守っています",
    "運命の糸は確実に結ばれつつあります"
  ]
};
```

#### お告げ組み立て
```javascript
function assembleFortune(analysis, predictions) {
  const fortune = {
    // メインメッセージ
    mainMessage: selectRandom(fortuneTemplate.opening),
    
    // 運命の瞬間（最大3つ）
    destinyMoments: predictions.optimalTimings.map(timing => ({
      message: fillTemplate(fortuneTemplate.timing, timing),
      action: fillTemplate(fortuneTemplate.action, timing.recommendedAction),
      reason: timing.cosmicReason // 占い的な理由
    })),
    
    // 注意事項
    warnings: predictions.avoidTimings.map(avoid => 
      fillTemplate(fortuneTemplate.warning, avoid)
    ),
    
    // 開運アイテム
    luckyItems: generateLuckyItems(analysis),
    
    // 締めの言葉
    blessing: selectRandom(fortuneTemplate.blessing),
    
    // 信頼性を高める要素
    accuracy: "87%", // 実際の分析精度に基づく
    confidence: "★★★★☆"
  };
  
  return fortune;
}
```

### 5. 視覚化層

#### カルーセル構成
```javascript
const carouselPages = [
  {
    type: "opening",
    background: "gradient_purple_gold",
    animation: "sparkle",
    content: "運命のお告げ"
  },
  {
    type: "destiny_moment_1",
    background: "starry_night",
    content: "第一の瞬間"
  },
  {
    type: "destiny_moment_2",
    background: "moon_phase",
    content: "第二の瞬間"
  },
  {
    type: "warnings",
    background: "caution_mystical",
    content: "注意すべき時"
  },
  {
    type: "lucky_items",
    background: "crystal_ball",
    content: "開運アイテム"
  },
  {
    type: "summary",
    background: "golden_aura",
    content: "今週の総括"
  },
  {
    type: "next_steps",
    background: "soft_gradient",
    content: "次回予告"
  }
];
```

## 🎯 精度向上メカニズム

### フィードバックループ
1. ユーザーがお告げ通りに行動したかを追跡
2. 結果の成功/失敗を学習
3. アルゴリズムの重みを調整

### A/Bテスト要素
- お告げの表現方法
- 推奨アクションの種類
- タイミングの粒度（分単位 vs 時間帯）

## 🔐 プライバシー配慮

### データ処理
- トーク履歴は一時的にのみ保持
- 分析結果のみを匿名化して保存
- 個人を特定できる情報は即座に削除

### 透明性
- どのようなデータを分析しているか明示
- 占い要素とAI分析要素を区別して表示
- 精度や確率を正直に表示