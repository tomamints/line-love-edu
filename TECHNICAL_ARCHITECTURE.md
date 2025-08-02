# 技術アーキテクチャ設計書

## 🏗️ システム構成

### 全体アーキテクチャ
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  LINE App   │────▶│ Webhook API  │────▶│  分析処理   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Vercel     │     │ AI分析API  │
                    │  Functions   │     │ (OpenAI)    │
                    └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ お告げ生成   │
                    │   エンジン   │
                    └──────────────┘
```

## 🛠️ 技術スタック

### フロントエンド（LINE）
- LINE Messaging API
- Flex Message（カルーセル）
- リッチメニュー

### バックエンド
- **ランタイム**: Node.js 18+
- **フレームワーク**: Express.js
- **デプロイ**: Vercel Functions
- **AI処理**: OpenAI API (GPT-4)

### データ処理
- **パーサー**: カスタムテキストパーサー
- **分析**: 
  - 基本統計（既存のmetrics）
  - AI深層分析（新規）
  - 占術アルゴリズム（新規）

### 外部API
- OpenAI API（テキスト分析）
- 天体データAPI（月齢など）※オプション

## 📁 ディレクトリ構造

```
line-love-edu/
├── api/
│   ├── webhook.js          # メインWebhook
│   └── analyze.js          # AI分析エンドポイント
├── core/
│   ├── fortune-engine/     # お告げ生成エンジン
│   │   ├── index.js
│   │   ├── timing.js       # タイミング計算
│   │   ├── astrology.js    # 占星術要素
│   │   └── numerology.js   # 数秘術
│   ├── ai-analyzer/        # AI分析モジュール
│   │   ├── index.js
│   │   ├── patterns.js     # パターン認識
│   │   └── predictions.js  # 予測生成
│   └── formatter/          # メッセージフォーマッター
│       ├── fortune-carousel.js
│       └── templates.js
├── utils/
│   ├── date-utils.js       # 日時計算
│   ├── lunar-calendar.js   # 月齢計算
│   └── cache.js           # キャッシュ管理
├── data/
│   ├── fortune-texts.json  # お告げテキスト
│   ├── lucky-items.json    # 開運アイテムDB
│   └── planetary-hours.json # 惑星時間
└── config/
    ├── fortune.config.js   # お告げ設定
    └── ai.config.js       # AI設定
```

## 🔄 処理フロー

### 1. メッセージ受信
```javascript
// api/webhook.js
async function handleWebhook(event) {
  if (event.type === 'message' && event.message.type === 'file') {
    const fileContent = await downloadFile(event.message.id);
    const userId = event.source.userId;
    
    // 非同期で分析開始
    await startFortuneAnalysis(userId, fileContent);
  }
}
```

### 2. テキスト解析 + AI分析
```javascript
// core/ai-analyzer/index.js
async function analyzeConversation(messages) {
  // 基本分析（既存）
  const basicAnalysis = await performBasicAnalysis(messages);
  
  // AI深層分析（新規）
  const aiAnalysis = await callOpenAI({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: FORTUNE_ANALYSIS_PROMPT
      },
      {
        role: "user",
        content: formatMessagesForAI(messages)
      }
    ]
  });
  
  return mergeAnalyses(basicAnalysis, aiAnalysis);
}
```

### 3. お告げ生成
```javascript
// core/fortune-engine/index.js
async function generateFortune(analysis) {
  // タイミング計算
  const optimalTimings = calculateOptimalTimings(analysis);
  
  // 占術要素追加
  const astrologyData = addAstrologyElements(analysis, optimalTimings);
  
  // AI支援でお告げテキスト生成
  const fortuneText = await generateFortuneText(astrologyData);
  
  // カルーセル生成
  const carousel = buildFortuneCarousel(fortuneText, astrologyData);
  
  return carousel;
}
```

## 🤖 AI活用詳細

### プロンプトエンジニアリング
```javascript
const FORTUNE_ANALYSIS_PROMPT = `
あなたは恋愛分析の専門家です。
以下のLINEトーク履歴を分析し、JSON形式で結果を返してください。

分析項目：
1. 相手の性格傾向
2. 返信パターン（曜日・時間帯別）
3. 感情の起伏パターン
4. 関心のある話題
5. 避けるべき話題
6. 関係性の現在地
7. 今後の発展可能性

追加で、占星術的な観点から：
- 最も相性の良い曜日と時間
- エネルギーが高まる瞬間
- 注意すべきタイミング

出力形式：
{
  "personality": {},
  "patterns": {},
  "emotions": {},
  "recommendations": {},
  "astrology": {}
}
`;
```

### AI応答の後処理
```javascript
function processAIResponse(aiResponse) {
  // 信頼性スコアの追加
  const reliability = calculateReliability(aiResponse);
  
  // 占い要素の強化
  const enhancedFortune = enhanceWithMysticalElements(aiResponse);
  
  // 具体的アクションへの変換
  const actions = convertToSpecificActions(enhancedFortune);
  
  return {
    ...aiResponse,
    reliability,
    mysticalElements: enhancedFortune,
    actionPlan: actions
  };
}
```

## 🔐 セキュリティ

### データ保護
- トーク履歴は処理後即削除
- ユーザーIDはハッシュ化
- SSL/TLS通信必須

### API制限
- レート制限実装
- 不正アクセス防止
- APIキーの環境変数管理

## 📊 パフォーマンス最適化

### キャッシュ戦略
```javascript
// utils/cache.js
const cache = new Map();

function getCachedAnalysis(userId, hash) {
  const key = `${userId}:${hash}`;
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.timestamp < 3600000) { // 1時間
      return cached.data;
    }
  }
  return null;
}
```

### 非同期処理
- Promise.allで並列処理
- ストリーミングレスポンス
- タイムアウト設定（9秒）

## 🚀 デプロイ設定

### Vercel設定
```json
{
  "version": 2,
  "functions": {
    "api/webhook.js": {
      "maxDuration": 10,
      "memory": 1024
    },
    "api/analyze.js": {
      "maxDuration": 30,
      "memory": 3008
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai-api-key",
    "LINE_CHANNEL_SECRET": "@line-channel-secret",
    "LINE_CHANNEL_ACCESS_TOKEN": "@line-access-token"
  }
}
```

## 📈 モニタリング

### ログ設計
- 分析リクエスト数
- AI API使用量
- エラー率
- 平均処理時間

### アラート
- エラー率上昇
- API制限接近
- 処理時間超過