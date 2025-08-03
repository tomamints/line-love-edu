# TASK-003: 数秘術エンジンの実装

## 概要
メッセージ数や文字数から運命数・相性数を算出し、占い的要素を追加する数秘術エンジンを実装。

## 受入条件
- [ ] メッセージから各種数字を算出できる
- [ ] 数字の意味を解釈できる
- [ ] ラッキーナンバーを提案できる
- [ ] テストケースが通る

## タスク詳細

### 1. core/fortune-engine/numerology.js の実装

#### 主要メソッド
```javascript
class Numerology {
  calculateDestinyNumber(messages) // 運命数
  calculateCompatibilityNumber(messages) // 相性数
  calculatePersonalYearNumber(userId) // 個人年数
  reduceToSingleDigit(num) // 単数変換
  getNumberMeaning(num) // 数字の意味
  getLuckyNumbers(analysis) // ラッキーナンバー
}
```

#### 計算ロジック
1. **運命数**: 総メッセージ数を単数化
2. **相性数**: 総文字数を単数化
3. **個人年数**: 現在年 + ユーザーID数値を単数化
4. **パワー数**: 最頻出数字

### 2. 数字の意味定義
```javascript
const meanings = {
  1: { 
    keyword: "新しい始まり",
    action: "積極的なアプローチ",
    color: "赤",
    element: "火"
  },
  // ... 1-9の定義
}
```

### 3. ラッキータイム算出
- 運命数から導出される時刻
- 相性数から導出される分
- マスターナンバー（11, 22, 33）の特別扱い

### 4. テストケースの作成
- 各種計算の正確性
- 境界値テスト
- 意味解釈の妥当性

## 技術メモ
- ピタゴラス式数秘術がベース
- カバラ数秘術の要素も一部採用
- 0は9として扱う

## 見積時間
4時間

## 依存関係
- TASK-001が完了していること

## 完了後の成果物
- numerology.jsが完成
- 数字の意味データが整備
- テストが通る
- 数秘術の解説ドキュメント