# おつきさま診断LP - マスターガイド

## このガイドについて

このマスターガイドは、おつきさま診断LPプロジェクトの全体像を把握し、各専門ドキュメントを効率的に活用するためのナビゲーションです。

---

## 📋 ドキュメント構成と使用目的

### 🏗️ システム設計・実装関連

#### 1. `ai_generated_otsukisama_lp_complete_structure.md` 
**用途**: プロジェクト全体の構造理解
**内容**: LP全体の仕様書、画面遷移、情報の流れ
**対象者**: プロジェクトマネージャー、開発チーム全員
**更新頻度**: プロジェクト初期に確定、大幅変更時のみ更新

#### 2. `ai_generated_implementation_guide.md`
**用途**: 技術実装の詳細仕様
**内容**: API設計、フロントエンド実装、データベース設計、決済統合
**対象者**: エンジニア、技術リード
**更新頻度**: 実装進行に合わせて随時更新

### 🧠 ロジック・アルゴリズム関連

#### 3. `ai_generated_fortune_determination_logic.md`
**用途**: 運勢計算の根幹システム理解
**内容**: 64パターン運勢システム、季節調整、個人化要素
**対象者**: バックエンドエンジニア、品質保証担当
**更新頻度**: アルゴリズム調整時

#### 4. `ai_generated_hidden_moon_phase_logic.md`
**用途**: 裏月相システムの理解と実装
**内容**: 裏月相計算アルゴリズム、データ構造、活用方法
**対象者**: バックエンドエンジニア、コンテンツ企画
**更新頻度**: 裏月相システム修正時

### 📊 データ・パターン定義

#### 5. `ai_generated_64_pattern_fortune_matrix.md`
**用途**: 全64パターンの運勢傾向データベース
**内容**: 月相×裏月相の全組み合わせによる運勢傾向
**対象者**: コンテンツ企画、バックエンドエンジニア
**更新頻度**: コンテンツ品質向上時

#### 6. `ai_generated_love_fortune_personality_integration.md`
**用途**: 恋愛運の個人化システム
**内容**: 4つの個性要素（エネルギー、価値観、距離感、感情表現）の統合
**対象者**: コンテンツ企画、UI/UXデザイナー
**更新頻度**: ユーザーフィードバック反映時

### 📅 時間軸・運勢システム

#### 7. `ai_generated_annual_fortune_system.md`
**用途**: 年間運勢システムの設計理解
**内容**: 季節的フロー、転換点、長期的運勢パターン
**対象者**: コンテンツ企画、プロダクトマネージャー
**更新頻度**: 年次更新、システム大幅変更時

#### 8. `ai_generated_moon_phase_content_updated.md`
**用途**: 8つの月相コンテンツの最新版
**内容**: LP最適化された月相別コンテンツ
**対象者**: コンテンツライター、UI/UXデザイナー
**更新頻度**: コンテンツ品質改善時

### 📖 完成版コンテンツ

#### 9. `LP_otsukisama-full-content.md`
**用途**: 完成版LPコンテンツのサンプル
**内容**: 実際のLP画面で使用するテキスト例
**対象者**: フロントエンドエンジニア、デザイナー、コンテンツ確認担当
**更新頻度**: デザイン調整、コンテンツ修正時

---

## 🔄 ファイル間の関係性

```
システム全体設計
├── ai_generated_otsukisama_lp_complete_structure.md
└── ai_generated_implementation_guide.md

運勢計算エンジン
├── ai_generated_fortune_determination_logic.md
├── ai_generated_64_pattern_fortune_matrix.md
└── ai_generated_hidden_moon_phase_logic.md

個人化システム
├── ai_generated_love_fortune_personality_integration.md
└── ai_generated_annual_fortune_system.md

コンテンツ
├── ai_generated_moon_phase_content_updated.md
└── LP_otsukisama-full-content.md
```

---

## 📋 開発フェーズ別必読ドキュメント

### Phase 1: 要件定義・設計
1. `ai_generated_otsukisama_lp_complete_structure.md` - 全体構造の理解
2. `ai_generated_implementation_guide.md` - 技術要件の把握

### Phase 2: バックエンド開発
1. `ai_generated_fortune_determination_logic.md` - 運勢計算ロジック実装
2. `ai_generated_64_pattern_fortune_matrix.md` - データ定義
3. `ai_generated_hidden_moon_phase_logic.md` - 裏月相システム実装

### Phase 3: フロントエンド開発
1. `ai_generated_implementation_guide.md` - フロントエンド実装部分
2. `ai_generated_moon_phase_content_updated.md` - 表示コンテンツ
3. `LP_otsukisama-full-content.md` - 具体的な表示例

### Phase 4: 個人化機能開発
1. `ai_generated_love_fortune_personality_integration.md` - 恋愛運個人化
2. `ai_generated_annual_fortune_system.md` - 年間運勢システム

### Phase 5: テスト・調整
- 全ドキュメントをレビューし、実装との整合性確認

---

## 🚨 よくある質問と該当ドキュメント

**Q: 月相の計算方法を知りたい**  
→ `ai_generated_fortune_determination_logic.md` のSection 3参照

**Q: 裏月相とは何か？**  
→ `ai_generated_hidden_moon_phase_logic.md` 全体を参照

**Q: 64パターンすべての詳細が知りたい**  
→ `ai_generated_64_pattern_fortune_matrix.md` 全体を参照

**Q: API仕様が知りたい**  
→ `ai_generated_implementation_guide.md` のSection 6参照

**Q: 恋愛運がどう個人化されるのか？**  
→ `ai_generated_love_fortune_personality_integration.md` 全体を参照

**Q: 年間運勢の考え方は？**  
→ `ai_generated_annual_fortune_system.md` 全体を参照

**Q: 実際のLP画面のコンテンツ例は？**  
→ `LP_otsukisama-full-content.md` を参照

**Q: 8つの月相の特徴は？**  
→ `ai_generated_moon_phase_content_updated.md` を参照

---

## ⚠️ 重要な注意事項

### ドキュメントの優先順位
1. **マスター仕様**: `ai_generated_otsukisama_lp_complete_structure.md`
2. **実装詳細**: `ai_generated_implementation_guide.md`  
3. **専門システム**: 各ai_generated_*_logic.mdファイル群

### 更新時のルール
- 仕様変更時は必ずマスター仕様書を先に更新
- 関連する全ドキュメントの整合性をチェック
- 変更履歴を残す

### データ整合性
- 64パターンマトリックスが全システムの基盤
- 月相定義（8種類）は全ドキュメントで統一
- 個性要素（4カテゴリー）の定義は統一

---

## 📈 今後の拡張予定

現在のドキュメントセットは以下の拡張を想定して設計されています：

1. **多言語対応** - コンテンツファイルの多言語版作成
2. **追加の個性要素** - 恋愛運以外の運勢への個性統合
3. **リアルタイム要素** - 現在の月相との相性計算
4. **AI生成コンテンツ** - 動的なメッセージ生成システム

---

このマスターガイドを参照することで、プロジェクトの全体像を把握し、目的に応じて適切なドキュメントを効率的に活用できます。質問や不明点がある場合は、このガイドの該当セクションを確認してから、具体的なドキュメントを参照してください。

**最終更新**: 2025年1月25日  
**バージョン**: 1.0  
**管理者**: プロジェクトマネージャー