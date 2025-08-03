# TASK-007: Webhook統合と全体フロー実装

## 概要
新しいお告げ機能を既存のWebhookに統合し、エンドツーエンドの処理フローを完成させる。

## 受入条件
- [ ] トーク履歴を受け取ってお告げを返せる
- [ ] 既存機能との切り替えが可能
- [ ] エラーハンドリングが適切
- [ ] 9秒以内に処理完了

## タスク詳細

### 1. api/webhook.js の更新

#### 処理フローの変更
```javascript
async function handleEvent(event) {
  // 1. ファイル取得（既存）
  const messages = await parseUserFile(event.message.id);
  
  // 2. モード判定（新規）
  const mode = determineMode(event, messages);
  
  if (mode === 'fortune') {
    // 3. お告げモード
    await handleFortuneMode(event, messages);
  } else {
    // 4. 従来の相性診断モード
    await handleCompatibilityMode(event, messages);
  }
}
```

### 2. お告げモードの実装
```javascript
async function handleFortuneMode(event, messages) {
  const userId = event.source.userId;
  
  // 基本分析（既存エンジン活用）
  const basicAnalysis = await performBasicAnalysis(messages);
  
  // AI分析（条件付き）
  let aiAnalysis = null;
  if (process.env.ENABLE_AI === 'true') {
    aiAnalysis = await analyzeWithAI(messages);
  }
  
  // お告げ生成
  const fortune = await generateFortune(messages, basicAnalysis, aiAnalysis);
  
  // カルーセル作成
  const carousel = buildFortuneCarousel(fortune);
  
  // 送信
  await client.pushMessage(userId, carousel);
}
```

### 3. モード切り替えロジック
- ファイル名に「占い」「お告げ」が含まれる → fortuneモード
- リッチメニューからの選択
- デフォルトは従来モード

### 4. パフォーマンス最適化
```javascript
// 並列処理
const [basic, ai, numerology] = await Promise.all([
  performBasicAnalysis(messages),
  analyzeWithAI(messages).catch(() => null),
  calculateNumerology(messages)
]);

// タイムアウト設定
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 8000)
);
```

### 5. エラーハンドリング強化
- AI分析失敗 → 基本分析のみで続行
- お告げ生成失敗 → 簡易メッセージ
- 全体失敗 → ユーザーフレンドリーなエラー

### 6. ログとモニタリング
```javascript
console.log({
  mode: 'fortune',
  userId: hashUserId(userId),
  messageCount: messages.length,
  processingTime: endTime - startTime,
  aiUsed: !!aiAnalysis,
  success: true
});
```

## 技術メモ
- 既存コードへの影響を最小限に
- フィーチャーフラグで段階的リリース
- メトリクス収集の実装

## 見積時間
6時間

## 依存関係
- TASK-001〜006が完了
- 既存のwebhook.jsの理解

## 完了後の成果物
- 統合されたwebhook
- 切り替え可能な2モード
- E2Eテストケース
- デプロイ準備完了