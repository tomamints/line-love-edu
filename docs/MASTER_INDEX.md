# 📚 おつきさま診断 マスター仕様書インデックス

このファイルは、おつきさま診断システムの全仕様書の目次です。
実装時は、このインデックスを参照して必要な仕様書を確認してください。

---

## 🎯 実装に必要な主要仕様書

### 1. **3ヶ月運勢グラフ仕様**
📁 **`fortune_graph_specification.md`**
- 3ヶ月の運勢グラフの完全仕様
- 5段階の運勢レベル（絶好調〜低調）
- グラフデザイン、アニメーション仕様
- レスポンシブ対応

📁 **`fortune_graph_all_64_patterns.json`**
- 64パターンの週ごとの運勢データ
- ピーク週と注意週の定義
- JSONフォーマットで実装可能

---

### 2. **64パターン運勢文章仕様**
📁 **`ai_generated_64patterns_equal_length.md`**
- 文字数統一版（2,400文字/パターン）
- 8パターン完成済み（新月×各裏月相）

📁 **`otsukisama_remaining_content.md`**
- 追加20パターンの運勢文章
- 3つの月の力（8種類完全版）
- 4つの性格軸の詳細

📁 **`ai_implementation_guide_64patterns.md`**
- AIで残りのパターンを生成する方法
- プロンプトテンプレート
- 品質チェックリスト

---

### 3. **LP構造・HTMLテンプレート**
📁 **`ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md`**
- 有料版の完全HTMLテンプレート（省略なし）
- 「診断から〇ヶ月目」の相対表現使用
- 3ヶ月構成に更新済み

📁 **`ai_generated_otsukisama_lp_complete_structure.md`**
- LP全体構造の詳細
- 無料版と有料版の区分け
- ユーザーフロー

---

### 4. **月相・裏月相ロジック**
📁 **`ai_generated_hidden_moon_phase_logic.md`**
- 裏月相の計算ロジック
- `(月相 + 生月 + 生日の数字根) % 8`
- JavaScriptサンプルコード付き

📁 **`ai_generated_moon_phase_content_updated.md`**
- 8つの月相の詳細説明
- 各月相の性格特性

---

### 5. **性格分析システム**
📁 **`ai_generated_love_fortune_personality_integration.md`**
- 4つの性格軸（感情表現、距離感、価値観、エネルギー）
- 各軸4タイプ×4 = 256通りの組み合わせ
- 性格統合ロジック

---

## 📊 実装優先度

### 🔴 最優先（必須）
1. `fortune_graph_specification.md` - グラフ表示
2. `fortune_graph_all_64_patterns.json` - グラフデータ
3. `ai_generated_hidden_moon_phase_logic.md` - 計算ロジック

### 🟡 優先（重要）
4. `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` - HTMLテンプレート
5. `ai_generated_64patterns_equal_length.md` - 運勢文章

### 🟢 標準（必要に応じて）
6. `ai_implementation_guide_64patterns.md` - パターン生成ガイド
7. `ai_generated_love_fortune_personality_integration.md` - 性格分析

---

## 🔄 更新履歴

### 最新の変更（重要）
- **12ヶ月→3ヶ月に変更** ✅
  - すべての仕様書で「今後12ヶ月」→「直近3ヶ月」に更新
  - グラフも3ヶ月（12週間）対応
  
- **固定月の削除** ✅
  - 「1月〜12月」→「診断から1〜3ヶ月目」
  - 相対的な時期表現に統一

---

## 💡 実装のヒント

### グラフ実装
```javascript
// fortune_graph_all_64_patterns.json を読み込み
const patternData = patterns[patternNumber - 1];
const weeklyData = patternData.fortune_data.overall;
// Chart.jsなどで12週分のデータを描画
```

### 月相計算
```javascript
// ai_generated_hidden_moon_phase_logic.md 参照
const hiddenPhase = (moonPhase + birthMonth + digitalRoot(birthDay)) % 8;
```

### 運勢テキスト取得
```javascript
// パターン番号 = (月相インデックス * 8) + 裏月相インデックス + 1
const patternNumber = (moonPhaseIndex * 8) + hiddenPhaseIndex + 1;
```

---

## 📝 注意事項

1. **文字数は厳守**
   - 全体運：600文字
   - 恋愛運：500文字
   - 人間関係運：450文字
   - 仕事運：450文字
   - 金運：400文字

2. **相対表現を使用**
   - ❌「2025年8月」
   - ✅「診断から2ヶ月目」

3. **3ヶ月構成**
   - 1ヶ月目：始動期
   - 2ヶ月目：展開期
   - 3ヶ月目：結実期

---

## 🚀 クイックスタート

1. まず `MASTER_INDEX.md`（このファイル）を確認
2. `fortune_graph_specification.md` でグラフ仕様を理解
3. `fortune_graph_all_64_patterns.json` でデータ構造を確認
4. `ai_generated_hidden_moon_phase_logic.md` で計算ロジックを実装
5. 必要に応じて他の仕様書を参照

---

質問があれば、まずこのインデックスを確認してください。
必要な仕様書がすぐに見つかります！