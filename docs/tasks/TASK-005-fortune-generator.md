# TASK-005: お告げ生成エンジンの実装

## 概要
各種分析結果を統合し、神秘的で具体的な「お告げ」を生成するメインエンジンを実装。

## 受入条件
- [ ] 分析結果から一貫性のあるお告げを生成
- [ ] 3つの運命の瞬間を提示できる
- [ ] 警告事項とラッキーアイテムを含む
- [ ] 文章が自然で神秘的

## タスク詳細

### 1. core/fortune-engine/index.js の実装

#### 主要クラス
```javascript
class FortuneEngine {
  constructor(messages, aiAnalysis, basicAnalysis)
  async generateFortune()
  selectDestinyMoments(timings)
  generateWarnings(analysis)
  selectLuckyItems(numerology)
  composeMainMessage(analysis)
  calculateAccuracy(analysis)
}
```

### 2. お告げの構造
```javascript
{
  mainMessage: "星々からのメッセージ",
  destinyMoments: [
    {
      datetime: "2024-01-24 14:23",
      action: "軽やかなスタンプを送る",
      reason: "相手の心が最も開かれる瞬間",
      cosmicReason: "水星と金星が調和する時",
      successRate: 89
    }
  ],
  warnings: [
    {
      timing: "月曜日の朝",
      reason: "月のエネルギーが低下"
    }
  ],
  luckyItems: {
    color: "ラベンダー",
    number: 7,
    emoji: "🌙",
    word: "ありがとう"
  },
  overall: {
    score: 87,
    trend: "上昇",
    accuracy: "★★★★☆"
  }
}
```

### 3. 文章生成ロジック

#### テンプレートシステム
```javascript
const templates = {
  opening: [
    "{{name}}さん、宇宙からの特別なメッセージです...",
    "星々が{{name}}さんの恋愛に重要な啓示を...",
  ],
  timing: [
    "{{day}}の{{time}}、運命が動き出します",
    "{{planetary}}の力が最高潮に達する{{time}}"
  ]
}
```

### 4. 統合ロジック
1. AI分析 + 基本分析 + 数秘術を統合
2. 矛盾する結果の調整
3. スコアリングと優先順位付け
4. 自然な文章への変換

### 5. バリデーション
- 同じ時間帯の重複回避
- 現実的でない提案の除外
- 文章の一貫性チェック

## 技術メモ
- テンプレートエンジンは自作
- 乱数は固定シード対応（テスト用）
- 多言語対応を考慮した設計

## 見積時間
8時間

## 依存関係
- TASK-002, TASK-003, TASK-004が完了

## 完了後の成果物
- 統合されたお告げエンジン
- 自然な文章生成
- テストケース完備
- お告げサンプル集