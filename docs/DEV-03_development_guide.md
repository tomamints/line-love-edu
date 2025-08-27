# 開発ガイド

## プロジェクト構造

```
line-love-edu/
├── api/                    # Vercel Functions
│   └── webhook.js         # メインエントリーポイント
├── core/                  # コアビジネスロジック
│   ├── fortune-engine/    # お告げ生成エンジン
│   │   ├── index.js      # メインクラス
│   │   ├── timing.js     # タイミング計算
│   │   ├── numerology.js # 数秘術
│   │   └── astrology.js  # 占星術要素
│   ├── ai-analyzer/      # AI分析
│   │   ├── index.js      # OpenAI連携
│   │   ├── prompts.js    # プロンプト管理
│   │   └── fallback.js   # フォールバック
│   └── formatter/        # 出力フォーマット
│       └── fortune-carousel.js
├── metrics/              # 既存の分析エンジン
├── data/                 # 静的データ
│   ├── planetary-hours.json
│   ├── fortune-texts.json
│   └── lucky-items.json
├── config/              # 設定ファイル
├── tests/               # テストコード
└── docs/                # ドキュメント
    └── tasks/          # タスクチケット
```

## 開発フロー

### 1. 環境構築
```bash
# リポジトリクローン
git clone https://github.com/tomamints/line-love-edu.git
cd line-love-edu

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .envを編集してAPIキーを設定
```

### 2. ローカル開発
```bash
# 開発サーバー起動
npm run dev

# ngrokでトンネル作成
ngrok http 3000

# LINE Webhook URLを更新
# https://your-ngrok-url.ngrok.io/webhook
```

### 3. テスト実行
```bash
# ユニットテスト
npm test

# 特定のテスト
npm test -- timing.test.js

# カバレッジ確認
npm run test:coverage
```

### 4. コミット規約
```bash
# 機能追加
git commit -m "feat: タイミング計算エンジンを実装"

# バグ修正
git commit -m "fix: 深夜時間帯の除外ロジックを修正"

# ドキュメント
git commit -m "docs: 数秘術の解説を追加"

# リファクタリング
git commit -m "refactor: AI分析のエラーハンドリングを改善"
```

## 実装の注意点

### パフォーマンス
- Vercelの実行時間制限: 10秒
- 目標応答時間: 9秒以内
- 並列処理を活用

### エラーハンドリング
```javascript
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('エラー詳細:', error);
  // フォールバック処理
  return getFallbackResult();
}
```

### AI API使用
- 必ずタイムアウトを設定
- レート制限を考慮
- コストモニタリング

### Flex Messageサイズ
- 1メッセージ25KB以内
- 画像は最小限に
- 不要な空白を削除

## デバッグ方法

### ログ確認
```javascript
// 構造化ログ
console.log({
  event: 'fortune_generation',
  userId: hashUserId(userId),
  messageCount: messages.length,
  timestamp: new Date().toISOString()
});
```

### Vercelログ
```bash
# リアルタイムログ
vercel logs --follow

# 関数別ログ
vercel logs api/webhook.js
```

### LINE Webhook確認
- LINE Developersコンソール
- Webhook設定 > 接続確認

## トラブルシューティング

### よくあるエラー

#### 1. Signature validation failed
- Webhook URLが正しいか確認
- Channel Secretが一致しているか確認

#### 2. Timeout error
- 処理時間を計測
- 重い処理を特定
- 並列化を検討

#### 3. AI API エラー
- APIキーの確認
- 使用量制限の確認
- フォールバック動作の確認

## リリース手順

### 1. テスト完了確認
- [ ] 全ユニットテスト合格
- [ ] E2Eテスト実施
- [ ] コードレビュー完了

### 2. ステージング確認
```bash
# プレビューデプロイ
vercel --prod

# 動作確認
# Preview URLでテスト
```

### 3. 本番デプロイ
```bash
# mainブランチにマージ
git checkout main
git merge develop

# 自動デプロイ確認
# Vercelダッシュボードで確認
```

### 4. 監視
- エラー率確認
- 応答時間確認
- API使用量確認

## 参考リンク

- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/)
- [OpenAI API](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)