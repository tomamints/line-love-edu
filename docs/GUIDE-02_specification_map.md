# 📚 おつきさま診断 完全仕様書マッピング

このファイルは、HTML/LPの各セクションがどの仕様書に対応しているかの完全なマッピングです。

---

## 🎯 LP構造と対応仕様書

### 📄 **メインHTMLテンプレート**
- **ファイル**: `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md`
- **内容**: 完全なHTML構造（セクション1〜33）

---

## 📊 セクション別対応表

### **セクション1-5: 基本情報と診断結果**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 1. タイトル | おつきさま診断結果 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 2. ユーザー情報 | 名前、生年月日 | 同上 |
| 3. 月相タイプ発表 | 8つの月相タイプ | `ai_generated_moon_phase_content_updated.md` |
| 4. 月相の説明 | 各月相の詳細説明 | 同上 |
| 5. 月詠の解説 | キャラクター導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |

---

### **セクション6-10: 裏月相と3つの力**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 6. 無料版終了通知 | 35%表示メッセージ | `ai_generated_otsukisama_lp_complete_structure.md` |
| 7. 有料版への誘導 | 購入ボタン | 同上 |
| 8. 有料版開始 | 残り65%の内容 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 9. 裏月相（裏の顔）| 裏月相の説明 | `ai_generated_hidden_moon_phase_logic.md` |
| 10. 3つの月の力 | 月相別の3つの力 | `otsukisama_remaining_content.md` |

**裏月相計算ロジック**:
```
(月相 + 生月 + 生日の数字根) % 8
```
- **詳細**: `ai_generated_hidden_moon_phase_logic.md`

---

### **セクション11-13: 性格分析**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 11. 4つの軸タイトル | 性格分析導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 12. 4つの軸詳細 | 感情表現/距離感/価値観/エネルギー | `ai_generated_love_fortune_personality_integration.md` |
| 13. 月詠の総括 | 性格分析まとめ | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |

**4つの軸の詳細**:
- 感情表現: ストレート型/控えめ型/情熱型/クール型
- 距離感: 密着型/バランス型/自由マイペース型/一定距離型
- 価値観: ロマンチスト型/現実主義型/冒険型/調和型
- エネルギー: 燃え上がり型/持続型/波型/穏やか型
- **詳細**: `ai_generated_love_fortune_personality_integration.md`

---

### **セクション14-16: 3ヶ月運勢とグラフ**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 14. 3ヶ月への導入 | 月詠による導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 15. 3ヶ月運命バナー | タイトル表示 | 同上 |
| 16. 運勢グラフ | 総合運グラフ表示 | `fortune_graph_specification_simple.md` + `fortune_graph_all_64_patterns.json` |

**グラフ仕様**:
- 総合運のみの単一ライングラフ
- 12週間のデータポイント
- 5段階評価（絶好調〜低調）
- **詳細**: `fortune_graph_specification_simple.md`
- **データ**: `fortune_graph_all_64_patterns.json`

---

### **セクション17-21: 総合運**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 17. 全体運 | 3ヶ月の総合運勢（600文字） | `ai_generated_64patterns_equal_length.md` |
| 18. 3つの転機 | 重要な時期の説明 | 同上 |
| 19-21. 詳細説明 | 時期別アドバイス | 同上 |

**64パターンの運勢**:
- 8月相 × 8裏月相 = 64パターン
- 各パターン2,400文字（600+500+450+450+400）
- **完成済み**: 20パターン
- **生成ガイド**: `ai_implementation_guide_64patterns.md`

---

### **セクション22-26: 恋愛運**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 22. 恋愛運導入 | 月詠による導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 23. 恋愛運バナー | タイトル | 同上 |
| 24. 恋愛運本文 | 500文字の恋愛運 | `ai_generated_64patterns_equal_length.md` |
| 25. シングル向け | 出会いのアドバイス | 同上 |
| 26. カップル向け | 関係深化アドバイス | 同上 |

**月齢カレンダー（恋愛運内）**:
- あなただけの月齢カレンダー
- ラッキーデーと注意日の表示
- **詳細**: `moon_phase_calendar_specification.md`

---

### **セクション27-29: 人間関係運**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 27. 人間関係導入 | 月詠による導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 28. 人間関係バナー | タイトル | 同上 |
| 29. 人間関係本文 | 450文字の人間関係運 | `ai_generated_64patterns_equal_length.md` |

---

### **セクション30-32: 仕事運**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 30. 仕事運導入 | 月詠による導入 | `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md` |
| 31. 仕事運バナー | タイトル | 同上 |
| 32. 仕事運本文 | 450文字の仕事運 | `ai_generated_64patterns_equal_length.md` |

---

### **セクション33: 金運**

| セクション | 内容 | 対応仕様書 |
|-----------|------|-----------|
| 33. 金運 | 400文字の金運 | `ai_generated_64patterns_equal_length.md` |

---

## 📁 仕様書ファイル一覧

### **コア仕様書**
1. **`ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md`**
   - 完全HTMLテンプレート
   - セクション1〜33の構造

2. **`ai_generated_64patterns_equal_length.md`**
   - 64パターンの運勢文章
   - 文字数: 600/500/450/450/400

3. **`ai_generated_hidden_moon_phase_logic.md`**
   - 裏月相計算ロジック
   - JavaScriptコード例

### **グラフ関連**
4. **`fortune_graph_specification_simple.md`**
   - 総合運グラフ仕様
   - Chart.js実装例

5. **`fortune_graph_all_64_patterns.json`**
   - 64パターンの週別データ
   - ピーク週と注意週

### **月相・性格関連**
6. **`ai_generated_moon_phase_content_updated.md`**
   - 8つの月相の説明
   - 性格特性

7. **`otsukisama_remaining_content.md`**
   - 3つの月の力（8種類）
   - 追加パターン

8. **`ai_generated_love_fortune_personality_integration.md`**
   - 4つの性格軸
   - 256通りの組み合わせ

### **追加機能**
9. **`moon_phase_calendar_specification.md`**
   - 月齢カレンダー仕様
   - パーソナライズロジック

### **実装ガイド**
10. **`ai_implementation_guide_64patterns.md`**
    - パターン生成方法
    - 品質チェックリスト

11. **`ai_generated_otsukisama_lp_complete_structure.md`**
    - LP全体構造
    - 無料/有料の区分け

---

## 🔄 更新情報

### **最新の変更**
- ✅ 12ヶ月 → 3ヶ月に変更
- ✅ 固定月（1月〜12月）→ 相対表現（診断から1〜3ヶ月）
- ✅ グラフを5本線 → 総合運のみに簡略化
- ✅ 月齢カレンダー仕様を追加

---

## 💡 実装の流れ

1. **基本構造**: `ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md`を読む
2. **計算ロジック**: `ai_generated_hidden_moon_phase_logic.md`で裏月相を理解
3. **コンテンツ**: `ai_generated_64patterns_equal_length.md`でテキストを確認
4. **グラフ**: `fortune_graph_specification_simple.md`で視覚化
5. **追加機能**: `moon_phase_calendar_specification.md`でカレンダー実装

---

## ⚠️ 注意事項

1. **文字数厳守**: 各セクションの文字数は固定
2. **相対表現使用**: 「診断から〇ヶ月目」を使用
3. **64パターン対応**: すべての組み合わせに対応必要
4. **レスポンシブ**: PC/スマホ両対応必須