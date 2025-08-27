# プレミアムレポート生成システム

## 概要
LINE Love Eduのプレミアムレポート生成システムは、Vercelの制限（60秒タイムアウト、無限ループ検出）を回避しながら、大規模なAI分析を含むレポートを確実に生成するための分散処理システムです。

## アーキテクチャ

### 主要コンポーネント

1. **generate-report-chunked.js**
   - メインのレポート生成エンドポイント
   - 5つのステップに分割して処理
   - GitHub Actionsとの連携

2. **continue-report-generation.js**
   - generate-report-chunkedのコピー
   - 無限ループ検出を回避するための代替エンドポイント
   - GitHub Actionsから呼び出される

3. **process-report-loop.js**
   - レポート生成の自動ループ処理
   - iteration 3以降はcontinue-report-generationを使用

4. **GitHub Actions (continue-report.yml)**
   - リクエストチェーンをリセット
   - Batch API処理の待機と再実行

## 処理フロー

### 5つのステップ

#### Step 1: データ読み込み
- ユーザーのメッセージ履歴を取得
- プロフィール情報を読み込み
- 約2-3秒で完了

#### Step 2: 基本分析
- 占い・相性診断の実行
- メッセージの基本統計
- 約1秒で完了

#### Step 3: AI分析（Batch API）
- OpenAI Batch APIを使用した非同期処理
- 大規模なプロンプトでの詳細分析
- 通常30-60秒で完了
- GitHub Actions経由で結果を取得

#### Step 4: レポート生成
- AI分析結果を元にレポート作成
- HTML/PDF生成
- 約30-40秒（重い処理）

#### Step 5: 保存と通知
- PDFをBase64で保存
- データベース更新
- 完了通知
- 約2-3秒で完了

### 無限ループ検出の回避

Vercelは同一エンドポイントへの連続呼び出しが6回を超えると無限ループと判定します（HTTP 508エラー）。

**対策：**
1. iteration 1-2: `generate-report-chunked`を使用
2. iteration 3以降: `continue-report-generation`を使用
3. GitHub Actions経由でリクエストチェーンをリセット

### GitHub Actions統合

**トリガータイミング：**
- Batch APIジョブ作成時
- Batch API処理待機中の再チェック時
- 各ステップのタイムアウト時

**ワークフロー：**
```yaml
# 初回は10秒待機、リトライは30秒待機
- リポジトリディスパッチイベントを受信
- 適切な待機時間を設定
- continue-report-generationを呼び出し
- X-GitHub-Actionsヘッダーで識別
```

## データ永続化

### Supabase統合

**ordersテーブル：**
- `status`: 処理状態（paid → generating_step_N → completed）
- `report_progress`: JSONB型で進捗データを保存
- `pdf_data`: Base64エンコードされたPDF

**進捗データの構造：**
```json
{
  "currentStep": 3,
  "totalSteps": 5,
  "attempts": 2,
  "startedAt": "2025-08-10T13:05:55.706Z",
  "data": {
    "userProfile": {...},
    "fortune": {...},
    "aiBatchId": "batch_xxx",
    "aiInsights": {...},
    "messageCount": 1948
  }
}
```

### /tmpディレクトリの活用

- 関数実行中のみ利用可能
- `progress_${orderId}.json`として一時保存
- messagesなど大きなデータの一時保管

## タイムアウト対策

### 時間制限

**Vercel Functions:** 60秒（Hobbyプラン）

**対策：**
1. **Step 3完了後の判定**
   - 30秒経過またはGitHub Actions経由の場合はStep 4を延期
   
2. **Step 4開始時の判定**
   - 40秒経過していたら次回イテレーションへ
   
3. **Step 4完了後の判定**
   - 50秒経過していたらStep 5を延期

### GitHub Actions活用

- 月2000分の無料枠（プライベートリポジトリ）
- 各実行は最大2分でタイムアウト
- 自動的に次のステップを継続

## エラーハンドリング

### リトライ機構

- 各ステップで最大3回までリトライ
- エラー時は10秒待機して再実行
- 3回失敗したら次のステップへ

### フォールバック

- Batch API失敗時はAI分析なしで続行
- データベース接続失敗時はファイルストレージ使用
- GitHub Actions失敗時は通常の処理継続

## セキュリティ

### 環境変数

```bash
OPENAI_API_KEY=sk-xxx          # OpenAI API
GITHUB_TOKEN=ghp_xxx            # GitHub Actions トリガー用
SUPABASE_URL=https://xxx        # Supabase接続
SUPABASE_ANON_KEY=xxx          # Supabase認証
```

### データ保護

- PDFはBase64エンコードでDB保存
- messagesは進捗データから除外（大きすぎるため）
- 一時ファイルは処理後に削除

## トラブルシューティング

### よくある問題

1. **HTTP 508 (Loop Detected)**
   - 原因：無限ループ検出
   - 対策：continue-report-generationを使用

2. **Step 6エラー**
   - 原因：完了処理の不具合
   - 対策：completedフラグで適切に制御

3. **レポートが表示されない**
   - 原因：statusがpaidのまま
   - 対策：clearReportProgressでstatusを変更しない

4. **タイムアウトエラー**
   - 原因：Step 4の処理が重い
   - 対策：GitHub Actions経由で分割処理

## 今後の改善案

1. **Step 4の最適化**
   - レポート生成処理の軽量化
   - テンプレートのキャッシュ

2. **並列処理**
   - 独立したステップの並列実行

3. **プログレス表示**
   - ユーザーへのリアルタイム進捗通知

4. **エラー通知**
   - 失敗時のLINE通知実装