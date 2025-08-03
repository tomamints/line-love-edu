# TASK-008: テストとデプロイメント

## 概要
全機能の統合テストを実施し、本番環境へのデプロイを完了させる。

## 受入条件
- [ ] 全ユニットテストが通る
- [ ] E2Eテストが成功する
- [ ] Vercelにデプロイされている
- [ ] 本番環境で動作確認完了

## タスク詳細

### 1. ユニットテスト整備

#### tests/fortune-engine.test.js
```javascript
describe('FortuneEngine', () => {
  test('基本的なお告げ生成', async () => {
    const fortune = await engine.generateFortune(mockMessages);
    expect(fortune.destinyMoments).toHaveLength(3);
    expect(fortune.mainMessage).toBeTruthy();
  });
  
  test('データ不足時のフォールバック', async () => {
    const fortune = await engine.generateFortune([]);
    expect(fortune).toBeDefined();
  });
});
```

#### カバレッジ目標
- fortune-engine: 80%以上
- ai-analyzer: 70%以上（モック使用）
- formatter: 90%以上

### 2. 統合テスト

#### tests/integration/webhook.test.js
- 実際のLINEメッセージ形式でテスト
- タイムアウト処理の確認
- エラーケースの網羅

### 3. E2Eテスト手順

#### ローカル環境
1. ngrokでトンネル作成
2. LINE Developersで設定
3. 実機でファイル送信
4. 結果確認

#### ステージング環境
1. Vercel Previewデプロイ
2. 環境変数設定
3. 限定公開でテスト

### 4. デプロイチェックリスト

#### 環境変数
- [ ] CHANNEL_SECRET
- [ ] CHANNEL_ACCESS_TOKEN
- [ ] OPENAI_API_KEY
- [ ] BASE_URL
- [ ] ENABLE_AI（フィーチャーフラグ）

#### Vercel設定
```json
{
  "functions": {
    "api/webhook.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 5. 監視設定
- Vercel Analytics有効化
- エラー通知設定
- API使用量モニタリング

### 6. ロールバック計画
- 従来モードへの即時切り替え
- データベースなし（ステートレス）
- DNSキャッシュ考慮

## テストデータ
- 10パターンのサンプルトーク履歴
- 極端なケース（1メッセージ、1000メッセージ）
- 各言語パターン

## 見積時間
8時間

## 依存関係
- TASK-001〜007が完了
- 本番環境のアクセス権限

## 完了後の成果物
- 全テスト合格
- 本番稼働中
- 運用ドキュメント
- 監視ダッシュボード