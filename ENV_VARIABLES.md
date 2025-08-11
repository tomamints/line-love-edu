# 環境変数設定ガイド

## 📋 環境変数一覧

### 🔴 必須設定

#### LINE Bot設定
```env
CHANNEL_SECRET=your_line_channel_secret
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
```
- **取得方法**: [LINE Developers Console](https://developers.line.biz/console/)
- **用途**: LINEボットの認証とAPI通信

#### アプリケーション設定
```env
BASE_URL=https://your-app.vercel.app
```
- **例**: `https://line-love-edu.vercel.app`
- **用途**: Webhook URLやリダイレクトURL生成

### 🟡 プレミアム機能（有料レポート用）

#### Stripe設定
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```
- **取得方法**: [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **注意**: 本番環境では`sk_live_`を使用

#### Webhook設定手順
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint → `https://your-app.vercel.app/api/stripe-webhook-simple`
3. Events to send: `checkout.session.completed`
4. Signing secretをコピー

### 🟢 オプション設定

#### Supabase（データベース）
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
```
- **未設定時**: ファイルストレージを使用
- **推奨**: 本番環境では設定推奨

#### OpenAI（AI分析）
```env
OPENAI_API_KEY=sk-xxxxx
```
- **未設定時**: デフォルト分析を使用（高速）
- **効果**: より詳細な心理分析が可能

#### その他
```env
NODE_ENV=production           # 本番環境
FORCE_FILE_STORAGE=false      # ファイルストレージ強制
```

## 🔧 環境別設定

### 開発環境（.env.local）
```env
# LINE Bot（テスト用）
CHANNEL_SECRET=test_secret
CHANNEL_ACCESS_TOKEN=test_token

# ローカルURL
BASE_URL=http://localhost:3000

# Stripe（テストモード）
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# ファイルストレージ使用
FORCE_FILE_STORAGE=true
```

### 本番環境（Vercel）
```env
# LINE Bot（本番）
CHANNEL_SECRET=prod_secret
CHANNEL_ACCESS_TOKEN=prod_token

# 本番URL
BASE_URL=https://line-love-edu.vercel.app

# Stripe（本番モード）
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

NODE_ENV=production
```

## 📝 設定方法

### Vercelでの設定
1. Vercelダッシュボード → Settings
2. Environment Variables
3. 各変数を追加：
   - Name: 変数名
   - Value: 値
   - Environment: Production/Preview/Development

### ローカルでの設定
`.env.local`ファイルを作成：
```bash
cp .env.example .env.local
# 値を編集
```

## 🔍 設定確認

### 環境変数の確認コマンド
```javascript
// api/check-env.js
module.exports = (req, res) => {
  const config = {
    LINE: {
      secret: !!process.env.CHANNEL_SECRET,
      token: !!process.env.CHANNEL_ACCESS_TOKEN
    },
    Stripe: {
      key: !!process.env.STRIPE_SECRET_KEY,
      webhook: !!process.env.STRIPE_WEBHOOK_SECRET
    },
    Supabase: {
      url: !!process.env.SUPABASE_URL,
      key: !!process.env.SUPABASE_ANON_KEY
    },
    OpenAI: {
      key: !!process.env.OPENAI_API_KEY
    },
    App: {
      baseUrl: process.env.BASE_URL,
      nodeEnv: process.env.NODE_ENV,
      fileStorage: process.env.FORCE_FILE_STORAGE
    }
  };
  
  res.json(config);
};
```

### 確認URL
```
https://your-app.vercel.app/api/check-env
```

## ⚠️ セキュリティ注意事項

### してはいけないこと
- ❌ 環境変数をGitにコミット
- ❌ クライアント側で使用
- ❌ ログに出力
- ❌ エラーメッセージに含める

### すべきこと
- ✅ `.env`を`.gitignore`に追加
- ✅ 本番とテストのキーを分離
- ✅ 定期的にキーをローテーション
- ✅ 最小権限の原則を適用

## 🆘 トラブルシューティング

### LINE Botが応答しない
```bash
# 環境変数確認
echo $CHANNEL_SECRET
echo $CHANNEL_ACCESS_TOKEN

# Webhook URL確認
curl https://your-app.vercel.app/webhook
```

### Stripe Webhookが失敗
```bash
# シークレット確認
echo $STRIPE_WEBHOOK_SECRET

# エンドポイント確認
curl -X POST https://your-app.vercel.app/api/stripe-webhook-simple
```

### Supabaseに接続できない
```javascript
// 接続テスト
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('orders')
  .select('count');
  
console.log(error || `Connected: ${data} orders`);
```

### OpenAI APIエラー
```javascript
// APIキー確認
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// テスト
const response = await openai.chat.completions.create({
  model: 'gpt-4.1-mini',  // 2025年2月リリース：50%高速化
  messages: [{ role: 'user', content: 'test' }],
  max_tokens: 10
});
```

## 📚 参考リンク

- [LINE Developers](https://developers.line.biz/ja/)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)