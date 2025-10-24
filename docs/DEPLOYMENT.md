# 恋愛お告げボット デプロイメントガイド

## 概要
このドキュメントでは、恋愛お告げボットのデプロイメント手順と運用方法について説明します。

## 前提条件
- Node.js 18.x以上
- Vercelアカウント
- LINE Developersアカウント
- OpenAI APIキー（オプション）

## 環境変数設定

### 必須環境変数
```bash
CHANNEL_SECRET=your_line_channel_secret
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
BASE_URL=https://your-app.vercel.app
```

### オプション環境変数
```bash
OPENAI_API_KEY=your_openai_api_key
FORTUNE_MODE=development|production|force
NODE_ENV=production
```

## ローカル開発環境セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して実際の値を設定
```

### 3. テストの実行
```bash
# 全テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# 統合テスト
npm run test:integration
```

### 4. ローカルサーバー起動
```bash
npm run dev
```

## Vercelデプロイメント

### 1. Vercel CLIを使用したデプロイ
```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトの初期化
vercel

# デプロイ
vercel --prod
```

### 2. 環境変数の設定（Vercel Dashboard）
1. Vercel Dashboardにログイン
2. プロジェクトを選択
3. Settings > Environment Variables
4. 必要な環境変数を追加

### 3. ドメイン設定
1. Vercel Dashboard > Domains
2. カスタムドメインを追加（オプション）
3. LINE Developersの Webhook URLを更新

## LINE Developers設定

### Webhook URL
```
https://your-app.vercel.app/webhook
```

### チャネル設定
1. Messaging API設定を有効化
2. Use webhookを有効化
3. Auto-reply messagesを無効化
4. Greeting messagesを設定（オプション）

## 機能切り替え

### モード設定
恋愛お告げ機能と従来の相性診断機能は以下の方法で切り替え可能：

#### 1. ファイル名による自動判定
- `占い`, `お告げ`, `fortune`を含むファイル名 → 恋愛お告げモード
- その他のファイル名 → 相性診断モード

#### 2. 環境変数による強制指定
```bash
FORTUNE_MODE=force  # 常に恋愛お告げモード
```

## モニタリング

### ログの確認
Vercel Dashboard > Functions > View Function Logs

### メトリクス
- 処理時間
- エラー率
- API使用量（OpenAI）
- メモリ使用量

### アラート設定
重要なエラーについてはVercelの通知機能を活用

## トラブルシューティング

### よくある問題

#### 1. タイムアウトエラー
- Vercelの関数タイムアウト（10秒）に達した場合
- 解決策：処理の最適化、並列処理の活用

#### 2. OpenAI APIエラー
- API キーの確認
- レート制限の確認
- フォールバック処理により基本機能は動作継続

#### 3. Flex Messageサイズエラー
- 25KB制限を超えた場合
- 解決策：コンテンツの簡略化、画像の最適化

### デバッグ方法
1. Vercelログの確認
2. ローカル環境での再現
3. テストケースの実行

## ロールバック手順

### 緊急時の対応
1. Vercel Dashboardで前のデプロイメントに切り替え
2. 環境変数`FORTUNE_MODE`を削除して従来モードに戻す
3. LINE Developersの設定確認

## セキュリティ考慮事項

### データ保護
- ユーザーIDのハッシュ化
- メッセージ内容の非永続化
- APIキーの適切な管理

### アクセス制御
- Webhook URLの秘匿
- Channel Secretによる署名検証

## パフォーマンス最適化

### 推奨設定
- メモリ：1024MB
- タイムアウト：10秒
- 並列処理の活用
- キャッシュの活用

## 運用チェックリスト

### デプロイ前
- [ ] 全テストが通過
- [ ] 環境変数の設定確認
- [ ] Webhook URLの更新
- [ ] ロールバック手順の確認

### デプロイ後
- [ ] 基本動作の確認
- [ ] エラーログの監視
- [ ] パフォーマンスメトリクスの確認
- [ ] ユーザーフィードバックの収集

## サポート情報

### ドキュメント
- [LINE Messaging API](https://developers.line.biz/ja/docs/messaging-api/)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### 連絡先
- 技術的な問題：GitHub Issues
- 緊急時対応：[緊急連絡先]

---

最終更新：2024年1月24日