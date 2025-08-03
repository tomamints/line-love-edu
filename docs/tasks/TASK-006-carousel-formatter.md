# TASK-006: Flex Messageカルーセルフォーマッターの実装

## 概要
お告げ結果を美しい8ページのLINE Flex Messageカルーセルに変換するフォーマッターを実装。

## 受入条件
- [ ] 8ページ構成のカルーセルが生成される
- [ ] 各ページが25KB以内に収まる
- [ ] デザインが統一されている
- [ ] エラー時は簡易版で表示

## タスク詳細

### 1. core/formatter/fortune-carousel.js の実装

#### 主要クラス
```javascript
class FortuneCarouselBuilder {
  constructor(fortune, userProfile)
  addOpeningPage()
  addOverallPage()
  addDestinyMomentPage(moment, index)
  addWarningsPage()
  addLuckyItemsPage()
  addActionSummaryPage()
  addNextStepsPage()
  build()
}
```

### 2. 各ページの詳細設計

#### ページ1: オープニング
- 背景: 紫グラデーション
- アニメーション風エフェクト（絵文字）
- ユーザー名を含むパーソナルメッセージ

#### ページ2: 総合運勢
- レーダーチャート（既存を流用）
- スコアと信頼度表示
- 今週のテーマ

#### ページ3-4: 運命の瞬間
- 具体的な日時（大きく表示）
- 推奨アクション
- 成功率バー
- 占星術的説明

#### ページ5: 注意時間帯
- 警告色の背景
- 避けるべき時間帯リスト
- 理由の簡潔な説明

#### ページ6: 開運アイテム
- ビジュアル重視
- 色、数字、絵文字、言葉
- 使い方の説明

#### ページ7: アクションまとめ
- 1週間のカレンダー形式
- 実行チェックリスト風
- 保存促進

#### ページ8: 次回予告
- 有料版への誘導
- シェアボタン
- フィードバック募集

### 3. スタイル定義
```javascript
const styles = {
  primary: "#7B68EE",
  secondary: "#FFD700",
  background: "#1C1C3D",
  text: "#FFFFFF",
  warning: "#FF6B6B",
  success: "#4ECDC4"
}
```

### 4. サイズ最適化
- 画像は最小限（背景色で表現）
- 不要な要素の削除
- 文字数制限の実装

### 5. フォールバック処理
- エラー時は3ページの簡易版
- 必須情報のみ表示
- ユーザビリティ確保

## 技術メモ
- Flex Message v2.0仕様準拠
- bubbleサイズは"mega"使用
- altTextは適切に設定

## 見積時間
10時間

## 依存関係
- TASK-005が完了していること
- 既存のformatterFlexCarousel.jsを参考

## 完了後の成果物
- 新しいカルーセルフォーマッター
- 各ページのテンプレート
- スタイルガイド
- サンプル出力