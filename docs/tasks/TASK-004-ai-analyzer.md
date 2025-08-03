# TASK-004: AI分析エンジンの実装

## 概要
OpenAI APIを使用してトーク履歴を深層分析し、相手の性格、感情パターン、最適なコミュニケーション方法を導き出す。

## 受入条件
- [ ] OpenAI APIと正常に通信できる
- [ ] 構造化されたJSON形式で分析結果を返す
- [ ] エラー時はフォールバック処理が動作する
- [ ] API使用量を最小限に抑える

## タスク詳細

### 1. core/ai-analyzer/index.js の実装

#### 主要メソッド
```javascript
class AIAnalyzer {
  constructor(apiKey)
  async analyzeConversation(messages)
  buildPrompt(messages)
  processResponse(aiResponse)
  getFallbackAnalysis()
  validateResponse(response)
}
```

### 2. プロンプトエンジニアリング

#### システムプロンプト
```javascript
const SYSTEM_PROMPT = `
あなたは恋愛心理学と占星術の専門家です。
LINEトーク履歴を分析し、以下の観点でJSON形式で結果を返してください：

1. personality: 相手の性格特性（5つのキーワード）
2. emotionalPattern: 感情の起伏パターン
3. communicationStyle: コミュニケーションスタイル
4. interests: 関心事トップ5
5. optimalTiming: 最適な連絡タイミング
6. avoidTopics: 避けるべき話題
7. relationshipStage: 関係性の段階（1-10）
8. advice: 具体的なアドバイス3つ
`;
```

### 3. レスポンス処理
```javascript
{
  personality: ["優しい", "慎重", "..."],
  emotionalPattern: {
    positive: ["話題A", "話題B"],
    negative: ["話題X"],
    neutral: ["日常会話"]
  },
  // ... 他のフィールド
}
```

### 4. コスト最適化
- メッセージは最新100件に制限
- キャッシュ機能の実装
- 同一ユーザーの再分析は1時間防ぐ

### 5. エラーハンドリング
- APIタイムアウト（5秒）
- レート制限対応
- 無効なレスポンス時の再試行

## 技術メモ
- GPT-4 Turbo使用（コストと精度のバランス）
- response_formatでJSON強制
- temperatureは0.7で創造性を確保

## 見積時間
8時間

## 依存関係
- TASK-001が完了していること
- OpenAI APIキーが取得済み

## 完了後の成果物
- AI分析エンジンが動作
- プロンプトが最適化されている
- エラー処理が実装されている
- 使用量ログが記録される