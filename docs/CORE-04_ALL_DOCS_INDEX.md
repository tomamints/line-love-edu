# 📚 おつきさま診断 全ドキュメントインデックス（番号体系付き）

## 🎯 実装用コアドキュメント（これだけで実装可能）

### 必須ファイル（CORE-XX）
1. **`CORE-01_IMPLEMENTATION_GUIDE.md`** ⭐
   - 完全実装ガイド（コード例付き）
   - 月相計算、Chart.js設定、全処理フロー

2. **`CORE-02_FINAL_SPEC_2025.md`** ⭐
   - 最終仕様書（2025年版）
   - 3ヶ月版の全仕様

3. **`CORE-03_GRAPH_DATA.js`** ⭐
   - 64パターン×12週間のグラフデータ

4. **`CORE-04_ALL_DOCS_INDEX.md`** 📍
   - 本ファイル（全ドキュメント一覧）

---

## 📊 64パターン運勢テキスト（2,400文字/パターン）

### パターンファイル（PATTERN-XX）全64パターン完成済み
- **`PATTERN-01_patterns_01-08.md`** - パターン1-8（ID: 00-07）
- **`PATTERN-02_patterns_09-20.md`** - パターン9-20（ID: 10-27）
- **`PATTERN-03_patterns_21-36.md`** - パターン21-36（ID: 30-36）
- **`PATTERN-04_patterns_37-48.md`** - パターン37-48（ID: 40-47）
- **`PATTERN-05_patterns_49-64.md`** - パターン49-64（ID: 50-77）

---

## 🌙 月相・システムロジック

### 基本ロジック（LOGIC-XX）
- **`LOGIC-01_hidden_moon_logic.md`** - 隠れ月相（裏月相）計算ロジック
- **`LOGIC-02_moon_phase_content.md`** - 8つの月相の基本説明
- **`LOGIC-03_fortune_logic.md`** - 運勢計算の詳細説明
- **`LOGIC-04_moon_calendar_64.md`** - 64パターンの月齢カレンダー
- **`LOGIC-05_personality_axes.md`** - 性格4軸の詳細定義

### その他のロジック（番号なし）
- **`moon_phase_calendar_specification.md`** - カレンダー表示仕様
- **`weekly_fortune_comments.md`** - 週間運勢コメント

---

## 📈 グラフ・ビジュアル

### グラフ仕様（GRAPH-XX）
- **`GRAPH-01_specification_simple.md`** - 簡略版グラフ仕様（総合運のみ）
- **`GRAPH-02_specification_full.md`** - 詳細グラフ仕様

### グラフデータ（番号なし）
- **`fortune_graph_all_64_patterns.json`** - グラフデータJSON（旧）
- **`fortune_graph_patterns_21_64.json`** - パターン21-64のグラフデータ

---

## 🎨 LP・UI関連

### LP構造とコンテンツ（UI-XX）
- **`UI-01_lp_complete_structure.md`** - LP完全構造
- **`UI-02_paid_version_html.md`** - 有料版HTML完全版
- **`UI-03_new_ui_design.md`** - 新UIデザイン仕様
- **`UI-04_lp_structure.md`** - LPの基本構造
- **`UI-05_lp_full_content.md`** - LPの全コンテンツ

### その他のUI関連（番号なし）
- **`otsukisama-paid-content-template.md`** - 有料版テンプレート
- **`love_type_icons_guide.md`** - 恋愛タイプアイコンガイド
- **`LP_love-type-descriptions.md`** - 恋愛タイプの説明文
- **`LP_commented.md`** - コメント付きLP
- **`LP_updates-summary.md`** - LP更新履歴
- **`LP_segment_question.md`** - セグメント質問

---

## 🗺️ マスターガイド・マッピング

### 統合ドキュメント（GUIDE-XX）
- **`GUIDE-01_master_guide.md`** - マスターガイド
- **`GUIDE-02_specification_map.md`** - 仕様書マッピング（HTMLセクション対応表）
- **`GUIDE-03_master_index.md`** - プロジェクト全体のインデックス
- **`GUIDE-04_all_display_texts.md`** - 全表示テキスト一覧

---

## 🔧 実装・開発ガイド

### 開発ガイド（DEV-XX）
- **`DEV-01_implementation_guide.md`** - 初期実装ガイド
- **`DEV-02_64patterns_guide.md`** - 64パターン実装ガイド
- **`DEV-03_development_guide.md`** - 開発ガイド
- **`DEV-04_hardcoded_issues.md`** - ハードコーディング問題
- **`DEV-05_64patterns_equal.md`** - 64パターン文字数統一版

### その他の開発関連（番号なし）
- **`FORTUNE_HARDCODED_GUIDE.md`** - 運勢ハードコーディングガイド
- **`ai_generated_love_fortune_personality_integration.md`** - 恋愛・運勢・性格の統合
- **`otsukisama_remaining_content.md`** - 残コンテンツ
- **`otsukisama_remaining_patterns_21_64.md`** - 残パターン（完成済み）
- **`otsukisama_complete_patterns_21_64.md`** - パターン21-64の統合版

---

## 🔄 その他のシステム

### 他の占いシステム（OTHER-XX）
- **`OTHER-01_star_hitomi.md`** - 星ひとみ診断の構造
- **`OTHER-02_wave_fortune.md`** - 波動診断8カード
- **`OTHER-03_aisyo.md`** - 相性診断
- **`OTHER-04_premium_report.md`** - プレミアムレポートシステム
- **`OTHER-05_api_data_format.md`** - APIデータ形式

### その他（番号なし）
- **`01_aisyo_rank.md`** - 相性ランク
- **`02_advice.md`** - アドバイス
- **`IO_SPECIFICATION.md`** - 入出力仕様
- **`COMPATIBILITY_IMPLEMENTATION.md`** - 互換性実装
- **`PREMIUM_REPORT_STRUCTURE.md`** - レポート構造
- **`premium_report.md`** - レポート詳細
- **`supabase_setup.md`** - Supabaseセットアップ

### タスク管理
- **`tasks/`** フォルダ内
  - TASK-001〜008の各種実装タスク

---

## 🚀 実装時の優先順位

### 最優先（これだけ見れば実装可能）
1. **`CORE-01_IMPLEMENTATION_GUIDE.md`**
2. **`CORE-03_GRAPH_DATA.js`**
3. **`PATTERN-*`** ファイル群（64パターンテキスト）

### 仕様確認用
- **`CORE-02_FINAL_SPEC_2025.md`**
- **`GUIDE-02_specification_map.md`**

### デバッグ・詳細確認用
- その他のドキュメント（必要に応じて参照）

---

## 📝 番号体系の説明

| プレフィックス | 用途 | 重要度 |
|--------------|------|--------|
| **CORE-XX** | 実装に必須のコアドキュメント | ⭐⭐⭐ |
| **PATTERN-XX** | 64パターンの運勢テキスト | ⭐⭐⭐ |
| **LOGIC-XX** | 月相計算・システムロジック | ⭐⭐ |
| **UI-XX** | LP・UIデザイン関連 | ⭐⭐ |
| **GUIDE-XX** | マスターガイド・仕様マッピング | ⭐⭐ |
| **GRAPH-XX** | グラフ表示仕様 | ⭐ |
| **DEV-XX** | 開発・実装ガイド | ⭐ |
| **OTHER-XX** | 他システム・参考資料 | 参考 |

---

更新日: 2025-01-27
番号体系導入完了