# 📚 おつきさま診断 全ドキュメントインデックス

## 🎯 実装用コアドキュメント（これだけで実装可能）

### 必須ファイル
1. **`OTSUKISAMA_IMPLEMENTATION_GUIDE.md`** ⭐
   - 完全実装ガイド（コード例付き）
   - 月相計算、Chart.js設定、全処理フロー

2. **`OTSUKISAMA_FINAL_SPEC_2025.md`** ⭐
   - 最終仕様書（2025年版）
   - 3ヶ月版の全仕様

3. **`fortune_graph_64patterns_data.js`** ⭐
   - 64パターン×12週間のグラフデータ

---

## 📊 64パターン運勢テキスト（2,400文字/パターン）

### パターンファイル（全64パターン完成済み）
- **`otsukisama_complete_all_64_patterns.md`** - パターン1-8（ID: 00-07）
- **`otsukisama_patterns_9-20.md`** - パターン9-20（ID: 10-27）
- **`otsukisama_patterns_21-36.md`** - パターン21-36（ID: 30-36）
- **`otsukisama_patterns_37-48.md`** - パターン37-48（ID: 40-47）
- **`otsukisama_patterns_49-64.md`** - パターン49-64（ID: 50-77）
- **`otsukisama_complete_patterns_21_64.md`** - パターン21-64の統合版

---

## 🌙 月相・システムロジック

### 基本ロジック
- **`ai_generated_hidden_moon_phase_logic.md`** - 隠れ月相（裏月相）計算ロジック
- **`ai_generated_moon_phase_content_updated.md`** - 8つの月相の基本説明
- **`FORTUNE_LOGIC_EXPLANATION.md`** - 運勢計算の詳細説明

### データ仕様
- **`moon_calendar_64_patterns.md`** - 64パターンの月齢カレンダー
- **`moon_phase_calendar_specification.md`** - カレンダー表示仕様
- **`personality_axes_complete.md`** - 性格4軸の詳細定義
- **`weekly_fortune_comments.md`** - 週間運勢コメント

---

## 📈 グラフ・ビジュアル

### グラフデータと仕様
- **`fortune_graph_specification_simple.md`** - 簡略版グラフ仕様（総合運のみ）
- **`fortune_graph_specification.md`** - 詳細グラフ仕様
- **`fortune_graph_all_64_patterns.json`** - グラフデータJSON（旧）
- **`fortune_graph_patterns_21_64.json`** - パターン21-64のグラフデータ

---

## 🎨 LP・UI関連

### LP構造とコンテンツ
- **`ai_generated_otsukisama_lp_complete_structure.md`** - LP完全構造
- **`ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md`** - 有料版HTML完全版
- **`LP_otsukisama-structure.md`** - LPの基本構造
- **`LP_otsukisama-full-content.md`** - LPの全コンテンツ
- **`otsukisama-paid-content-template.md`** - 有料版テンプレート

### デザイン・UI
- **`NEW_UI_DESIGN.md`** - 新UIデザイン仕様
- **`love_type_icons_guide.md`** - 恋愛タイプアイコンガイド
- **`LP_love-type-descriptions.md`** - 恋愛タイプの説明文

---

## 🗺️ マスターガイド・マッピング

### 統合ドキュメント
- **`OTSUKISAMA_MASTER_GUIDE.md`** - マスターガイド
- **`COMPLETE_SPECIFICATION_MAP.md`** - 仕様書マッピング（どのHTMLセクションがどの仕様書に対応）
- **`MASTER_INDEX.md`** - プロジェクト全体のインデックス
- **`ALL_DISPLAY_TEXTS.md`** - 全表示テキスト一覧

---

## 🔧 実装・開発ガイド

### 実装ガイド
- **`ai_generated_implementation_guide.md`** - 初期実装ガイド
- **`ai_implementation_guide_64patterns.md`** - 64パターン実装ガイド
- **`DEVELOPMENT_GUIDE.md`** - 開発ガイド
- **`HARDCODED_ISSUES.md`** - ハードコーディング問題
- **`FORTUNE_HARDCODED_GUIDE.md`** - 運勢ハードコーディングガイド

### 統合・残作業
- **`otsukisama_remaining_content.md`** - 残コンテンツ
- **`otsukisama_remaining_patterns_21_64.md`** - 残パターン（完成済み）
- **`ai_generated_love_fortune_personality_integration.md`** - 恋愛・運勢・性格の統合
- **`ai_generated_64patterns_equal_length.md`** - 64パターン文字数統一版

---

## 🔄 その他のシステム

### 他の占いシステム
- **`LP_star-hitomi-structure.md`** - 星ひとみ診断の構造
- **`WAVE_FORTUNE_8CARDS.md`** - 波動診断8カード
- **`aisyo.md`** - 相性診断
- **`01_aisyo_rank.md`** - 相性ランク
- **`02_advice.md`** - アドバイス

### API・データ形式
- **`API_DATA_FORMAT.md`** - APIデータ形式
- **`IO_SPECIFICATION.md`** - 入出力仕様
- **`COMPATIBILITY_IMPLEMENTATION.md`** - 互換性実装

### プレミアムレポート
- **`PREMIUM_REPORT_SYSTEM.md`** - プレミアムレポートシステム
- **`PREMIUM_REPORT_STRUCTURE.md`** - レポート構造
- **`premium_report.md`** - レポート詳細

### その他
- **`LP_commented.md`** - コメント付きLP
- **`LP_updates-summary.md`** - LP更新履歴
- **`LP_segment_question.md`** - セグメント質問
- **`supabase_setup.md`** - Supabaseセットアップ

### タスク管理
- **`tasks/`** フォルダ内
  - TASK-001〜008の各種実装タスク

---

## 🚀 実装時の優先順位

### 最優先（これだけ見れば実装可能）
1. `OTSUKISAMA_IMPLEMENTATION_GUIDE.md`
2. `fortune_graph_64patterns_data.js`
3. `otsukisama_patterns_*.md`（64パターンテキスト）

### 仕様確認用
- `OTSUKISAMA_FINAL_SPEC_2025.md`
- `COMPLETE_SPECIFICATION_MAP.md`

### デバッグ・詳細確認用
- その他のドキュメント（必要に応じて参照）

---

更新日: 2025-01-27
全64ドキュメント整理済み