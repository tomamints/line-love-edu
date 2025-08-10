# ハードコードされている箇所と要修正点

## 1. 環境変数・設定値

### 1.1 価格設定
**場所**: `/core/premium/payment-handler.js`
```javascript
const PREMIUM_REPORT_PRICE = 1980;  // ハードコード
```
**問題**: 価格変更時にコード修正が必要
**対応案**: 環境変数または設定ファイルに移動

### 1.2 GitHub リポジトリ情報
**場所**: 複数ファイル
```javascript
// /api/continue-report-generation.js
await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
```
**問題**: リポジトリ名がハードコード
**対応案**: `process.env.GITHUB_REPOSITORY`を使用

### 1.3 本番URL
**場所**: 複数ファイル
```javascript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
```
**問題**: フォールバックURLがハードコード
**対応案**: 環境変数必須化

## 2. 占い・診断ロジック

### 2.1 月相タイプの相性マトリックス
**場所**: `/core/moon-fortune.js`
```javascript
this.compatibilityMatrix = {
  'newMoon-newMoon': 75,
  'newMoon-waxingCrescent': 85,
  'newMoon-firstQuarter': 70,
  // ... 全組み合わせがハードコード
};
```
**問題**: 相性スコアが固定値
**対応案**: 設定ファイルまたはデータベース化

### 2.2 波動分析の判定基準
**場所**: `/core/wave-fortune.js`
```javascript
// オーラカラーの判定
if (text.includes('愛') || text.includes('好き')) colors.pink.score += 2;
if (text.includes('楽しい') || text.includes('嬉しい')) colors.yellow.score += 2;
```
**問題**: キーワードと重み付けがハードコード
**対応案**: 辞書ファイル化

### 2.3 相性スコアの計算係数
**場所**: `/core/fortune-engine.js`
```javascript
analyzeCompatibility(messages) {
  // 重み付けがハードコード
  const weights = {
    responseSpeed: 0.15,
    messageLength: 0.10,
    emojiUsage: 0.10,
    // ...
  };
}
```
**問題**: 重要度の配分が固定
**対応案**: 設定可能にする

## 3. メッセージ・テキスト

### 3.1 診断結果のテンプレート
**場所**: `/index.js`
```javascript
text: '🌙 おつきさま診断へようこそ！\n\n生年月日から二人の相性を診断します✨\n\n「診断を始める」と送信してください'
```
**問題**: 日本語メッセージがハードコード
**対応案**: メッセージカタログ化（i18n対応）

### 3.2 エラーメッセージ
**場所**: 複数ファイル
```javascript
return res.status(400).json({ 
  error: 'Order ID is required' 
});
```
**問題**: エラーメッセージが散在
**対応案**: エラーコード体系の整備

## 4. AI関連

### 4.1 OpenAI モデル設定
**場所**: `/core/premium/report-generator.js`
```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',  // ハードコード
  max_tokens: 16384,  // ハードコード
  temperature: 0.7,  // ハードコード
});
```
**問題**: モデルパラメータが固定
**対応案**: 環境変数または設定ファイル化

### 4.2 AIプロンプト
**場所**: `/core/premium/report-generator.js`
```javascript
const prompt = `以下のLINEトーク履歴を分析し、恋愛アドバイザーとして非常に詳細なレポートを作成してください。
// ... 長大なプロンプトがハードコード
`;
```
**問題**: プロンプトの改善が困難
**対応案**: プロンプトテンプレートファイル化

## 5. タイムアウト・制限値

### 5.1 処理時間制限
**場所**: `/api/continue-report-generation.js`
```javascript
// Step 3のタイムアウト
if (waitTime > 1200000) { // 20分ハードコード
  console.log('⏰ Timeout after 20 minutes - skipping AI analysis');
}

// Step 4の時間チェック
if (elapsedTime > 40000) { // 40秒ハードコード
  console.log('⏰ Time limit approaching for Step 4');
}
```
**問題**: タイムアウト値が散在
**対応案**: 定数定義またはconfig化

### 5.2 リトライ回数
**場所**: `/api/continue-report-generation.js`
```javascript
if (progress.errorCount < 3) {  // 3回ハードコード
  console.log(`🔄 Will retry step ${progress.currentStep}`);
}
```
**問題**: リトライ回数が固定
**対応案**: 設定可能にする

## 6. データベース関連

### 6.1 テーブル名・カラム名
**場所**: `/core/database/orders-db.js`
```javascript
const { data, error } = await this.supabase
  .from('orders')  // テーブル名ハードコード
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed');  // ステータス値ハードコード
```
**問題**: スキーマ変更時の影響大
**対応案**: 定数定義またはORM使用

### 6.2 ステータス値
**場所**: 複数ファイル
```javascript
// ステータスの遷移がハードコード
'paid' → 'generating_step_1' → 'generating_step_2' → ... → 'completed'
```
**問題**: ステータス管理が分散
**対応案**: ステータス定義の一元化

## 7. PDF生成

### 7.1 PDFスタイル
**場所**: `/core/premium/pdf-generator.js`
```javascript
const styles = `
  body {
    font-family: 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN', sans-serif;
    line-height: 1.8;
    color: #333;
  }
  // ... 大量のCSSがハードコード
`;
```
**問題**: デザイン変更が困難
**対応案**: 外部CSSファイル化

### 7.2 グラフ設定
**場所**: `/core/premium/pdf-generator.js`
```javascript
const chartConfig = {
  type: 'radar',
  data: {
    labels: ['コミュニケーション', '感情表現', '価値観', ...],  // ハードコード
    datasets: [{
      backgroundColor: 'rgba(255, 0, 110, 0.2)',  // 色がハードコード
    }]
  }
};
```
**問題**: グラフのカスタマイズが困難
**対応案**: 設定オブジェクト化

## 8. 外部サービス連携

### 8.1 Stripe設定
**場所**: `/api/create-checkout-session.js`
```javascript
success_url: `${baseUrl}/api/payment-success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `${baseUrl}/api/payment-cancel`,
```
**問題**: コールバックURLがハードコード
**対応案**: 環境変数化

### 8.2 LINE設定
**場所**: `/index.js`
```javascript
// リッチメニューID
if (event.type === 'follow') {
  // フォロー時のメッセージがハードコード
  await client.replyMessage(event.replyToken, {
    type: 'text',
    text: 'ようこそ！LINE Love Eduへ！'
  });
}
```
**問題**: LINE関連の設定が分散
**対応案**: LINE設定ファイルの作成

## 9. 改善優先度

### 高優先度（すぐに対応すべき）
1. **価格設定** - ビジネス要件で変更頻度が高い
2. **AIモデル設定** - コスト最適化のため
3. **エラーメッセージ** - ユーザー体験に直結
4. **タイムアウト値** - パフォーマンスチューニング

### 中優先度（段階的に対応）
1. **メッセージテンプレート** - 多言語対応の準備
2. **ステータス管理** - 保守性向上
3. **プロンプト管理** - A/Bテスト実施

### 低優先度（将来的に対応）
1. **占い相性マトリックス** - 現状で問題なし
2. **PDFスタイル** - デザイン要件が固まってから
3. **グラフ設定** - 現状で十分

## 10. 推奨アクション

### Step 1: 設定ファイルの作成
```javascript
// /config/app.config.js
module.exports = {
  pricing: {
    premiumReport: process.env.PREMIUM_PRICE || 1980
  },
  ai: {
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    maxTokens: process.env.OPENAI_MAX_TOKENS || 16384,
    temperature: process.env.OPENAI_TEMPERATURE || 0.7
  },
  timeouts: {
    batchApi: 1200000,  // 20分
    step4: 40000,       // 40秒
    step5: 50000        // 50秒
  },
  retry: {
    maxAttempts: 3,
    delay: 10000
  }
};
```

### Step 2: メッセージカタログ
```javascript
// /messages/ja.js
module.exports = {
  welcome: 'ようこそ！LINE Love Eduへ！',
  errors: {
    orderIdRequired: '注文IDが必要です',
    paymentFailed: '支払い処理に失敗しました',
    reportGenerationFailed: 'レポート生成に失敗しました'
  },
  fortunes: {
    moonTitle: 'おつきさま診断',
    moonDescription: '生年月日から二人の相性を診断します',
    // ...
  }
};
```

### Step 3: ステータス定義
```javascript
// /constants/order-status.js
module.exports = {
  PAID: 'paid',
  GENERATING_STEP_1: 'generating_step_1',
  GENERATING_STEP_2: 'generating_step_2',
  GENERATING_STEP_3: 'generating_step_3',
  GENERATING_STEP_4: 'generating_step_4',
  GENERATING_STEP_5: 'generating_step_5',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
};
```

### Step 4: 環境変数の整理
```bash
# .env.example
# App Settings
PREMIUM_PRICE=1980
BASE_URL=https://your-domain.vercel.app

# GitHub
GITHUB_REPOSITORY=owner/repo
GITHUB_TOKEN=ghp_xxxxx

# OpenAI
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=16384
OPENAI_TEMPERATURE=0.7

# Timeouts (ms)
BATCH_API_TIMEOUT=1200000
STEP_4_TIMEOUT=40000
STEP_5_TIMEOUT=50000

# Retry
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY=10000
```