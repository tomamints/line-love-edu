# TASK-002: タイミング計算エンジンの実装

## 概要
お告げの核となる「最適なタイミング」を計算するエンジンを実装する。曜日、時間帯、過去の返信パターンから最適な連絡時刻を算出。

## 受入条件
- [ ] 来週の最適タイミングを3つ提案できる
- [ ] 各タイミングにスコアと理由が付与される
- [ ] 曜日別の惑星時間が考慮されている
- [ ] ユニットテストが通る

## タスク詳細

### 1. core/fortune-engine/timing.js の実装

#### 主要メソッド
```javascript
class TimingCalculator {
  calculateOptimalTimings(analysis) // メイン計算
  getNextWeekDates() // 来週の日付配列
  calculateScore(date, hour, analysis) // スコア計算
  calculateLuckyMinute(hour) // 分の計算
  suggestAction(score, dayName) // アクション提案
}
```

#### スコア計算要素
1. 過去の返信率（40%）
2. 惑星時間の適合度（30%）
3. 一般的な活動時間（20%）
4. ランダム要素（10%）

### 2. data/planetary-hours.json の作成
```json
{
  "月曜日": {
    "ruler": "月",
    "energy": "感情・直感",
    "bestHours": [20, 21, 22],
    "keywords": ["共感", "思いやり", "感謝"]
  },
  // ... 各曜日のデータ
}
```

### 3. テストケースの作成

#### tests/timing.test.js
- 基本的なタイミング計算
- エッジケース（データ不足時）
- スコアの妥当性検証
- 提案される時刻の多様性

### 4. 分計算のロジック
- 基本は14分、23分、32分、41分、50分から選択
- 数秘術を使用して個人化
- 「ゾロ目」回避（11:11など）

## 技術メモ
- dayjsでタイムゾーン考慮
- スコアは0-100の範囲で正規化
- 深夜早朝（0-6時）は基本的に除外

## 見積時間
6時間

## 依存関係
- TASK-001が完了していること

## 完了後の成果物
- timing.jsが完成
- planetary-hours.jsonが完成
- テストが全て通る
- ドキュメントが更新されている