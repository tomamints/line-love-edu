# 📝 ドキュメント リネーム計画

## 番号体系

### CORE-XX: 実装コアドキュメント
- CORE-01_IMPLEMENTATION_GUIDE.md （旧: OTSUKISAMA_IMPLEMENTATION_GUIDE.md）
- CORE-02_FINAL_SPEC_2025.md （旧: OTSUKISAMA_FINAL_SPEC_2025.md）
- CORE-03_GRAPH_DATA.js （旧: fortune_graph_64patterns_data.js）
- CORE-04_ALL_DOCS_INDEX.md （旧: OTSUKISAMA_ALL_DOCS_INDEX.md）

### PATTERN-XX: 64パターン運勢テキスト
- PATTERN-01_patterns_01-08.md （旧: otsukisama_complete_all_64_patterns.md）
- PATTERN-02_patterns_09-20.md （旧: otsukisama_patterns_9-20.md）
- PATTERN-03_patterns_21-36.md （旧: otsukisama_patterns_21-36.md）
- PATTERN-04_patterns_37-48.md （旧: otsukisama_patterns_37-48.md）
- PATTERN-05_patterns_49-64.md （旧: otsukisama_patterns_49-64.md）

### LOGIC-XX: 月相・システムロジック
- LOGIC-01_hidden_moon_logic.md （旧: ai_generated_hidden_moon_phase_logic.md）
- LOGIC-02_moon_phase_content.md （旧: ai_generated_moon_phase_content_updated.md）
- LOGIC-03_fortune_logic.md （旧: FORTUNE_LOGIC_EXPLANATION.md）
- LOGIC-04_moon_calendar_64.md （旧: moon_calendar_64_patterns.md）
- LOGIC-05_personality_axes.md （旧: personality_axes_complete.md）

### UI-XX: LP・UI関連
- UI-01_lp_complete_structure.md （旧: ai_generated_otsukisama_lp_complete_structure.md）
- UI-02_paid_version_html.md （旧: ai_generated_paid_version_COMPLETE_NO_ABBREVIATION.md）
- UI-03_new_ui_design.md （旧: NEW_UI_DESIGN.md）
- UI-04_lp_structure.md （旧: LP_otsukisama-structure.md）
- UI-05_lp_full_content.md （旧: LP_otsukisama-full-content.md）

### GUIDE-XX: マスターガイド・マッピング
- GUIDE-01_master_guide.md （旧: OTSUKISAMA_MASTER_GUIDE.md）
- GUIDE-02_specification_map.md （旧: COMPLETE_SPECIFICATION_MAP.md）
- GUIDE-03_master_index.md （旧: MASTER_INDEX.md）
- GUIDE-04_all_display_texts.md （旧: ALL_DISPLAY_TEXTS.md）

### DEV-XX: 開発・実装ガイド
- DEV-01_implementation_guide.md （旧: ai_generated_implementation_guide.md）
- DEV-02_64patterns_guide.md （旧: ai_implementation_guide_64patterns.md）
- DEV-03_development_guide.md （旧: DEVELOPMENT_GUIDE.md）
- DEV-04_hardcoded_issues.md （旧: HARDCODED_ISSUES.md）
- DEV-05_64patterns_equal.md （旧: ai_generated_64patterns_equal_length.md）

### GRAPH-XX: グラフ仕様
- GRAPH-01_specification_simple.md （旧: fortune_graph_specification_simple.md）
- GRAPH-02_specification_full.md （旧: fortune_graph_specification.md）

### OTHER-XX: その他のシステム
- OTHER-01_star_hitomi.md （旧: LP_star-hitomi-structure.md）
- OTHER-02_wave_fortune.md （旧: WAVE_FORTUNE_8CARDS.md）
- OTHER-03_aisyo.md （旧: aisyo.md）
- OTHER-04_premium_report.md （旧: PREMIUM_REPORT_SYSTEM.md）

### LEGACY-XX: 旧ファイル・参考用
- 残りのファイルはLEGACY-XXとして番号付け

## リネームコマンド

```bash
# COREファイル
mv OTSUKISAMA_IMPLEMENTATION_GUIDE.md CORE-01_IMPLEMENTATION_GUIDE.md
mv OTSUKISAMA_FINAL_SPEC_2025.md CORE-02_FINAL_SPEC_2025.md
mv fortune_graph_64patterns_data.js CORE-03_GRAPH_DATA.js
mv OTSUKISAMA_ALL_DOCS_INDEX.md CORE-04_ALL_DOCS_INDEX.md

# PATTERNファイル
mv otsukisama_complete_all_64_patterns.md PATTERN-01_patterns_01-08.md
mv otsukisama_patterns_9-20.md PATTERN-02_patterns_09-20.md
mv otsukisama_patterns_21-36.md PATTERN-03_patterns_21-36.md
mv otsukisama_patterns_37-48.md PATTERN-04_patterns_37-48.md
mv otsukisama_patterns_49-64.md PATTERN-05_patterns_49-64.md

# 以下同様...
```