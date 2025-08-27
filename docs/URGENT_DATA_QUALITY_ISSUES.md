# 緊急：otsukisama-patterns-complete.json データ品質問題

## 🚨 重大な問題

### 1. 英語混在問題
日本語の運勢文章内に英単語が多数混在しており、日本人向けサービスとして不適切。

**発見された英単語の例**：
- compatibility（相性）
- breakthrough（画期的な成果）
- professional（プロフェッショナル）
- mentor-mentee（師弟関係）
- lifestyle（ライフスタイル）
- influential（影響力のある）
- solutions（解決策）
- messages（メッセージ）
- beautiful partnership（美しいパートナーシップ）
- innovative（革新的）
- realistic（現実的）
- dreams（夢）
- goals（目標）
- misunderstanding（誤解）
- breakthrough moment（ブレイクスルーの瞬間）
- spiritual guide（スピリチュアルガイド）
- compatibility を見極められる

### 2. 時期表現の不整合
**現状**：12ヶ月版の表現が残存
- 「診断から2ヶ月目、5ヶ月目、8ヶ月目」
- 「診断から3ヶ月目と9ヶ月目」
- 「診断から4ヶ月目と8ヶ月目」

**仕様**：3ヶ月版
- 今後3ヶ月の運勢のみを表示

## 📝 修正が必要な箇所

### パターン例（ID: 1）
```json
"love": "相手との compatibility を見極められるでしょう"
→ "love": "相手との相性を見極められるでしょう"

"work": "innovative でありながら realistic な成果"
→ "work": "革新的でありながら現実的な成果"
```

### 影響範囲
- 64パターン × 5カテゴリ = 320文章
- 推定：100箇所以上の英単語混在

## 🔧 修正方法

### ステップ1：英単語を日本語に置換
| 英語 | 日本語 |
|-----|-------|
| compatibility | 相性 |
| breakthrough | 画期的な成果/ブレイクスルー |
| professional | プロフェッショナル/専門的 |
| mentor | メンター/指導者 |
| lifestyle | ライフスタイル/生活様式 |
| influential | 影響力のある |
| partnership | パートナーシップ/協力関係 |

### ステップ2：時期表現の統一
- 「診断から○ヶ月目」→「今月/来月/再来月」
- 4ヶ月目以降の表現は削除または3ヶ月以内に集約

## ⚡ 優先度：最高

**理由**：
1. ユーザーに直接表示される文章
2. 日本人向けサービスの品質に直結
3. プロフェッショナルさの欠如につながる

## 推奨アクション
1. 即座に全文章の英語チェックと日本語化
2. 3ヶ月版への時期表現統一
3. 品質チェック体制の確立