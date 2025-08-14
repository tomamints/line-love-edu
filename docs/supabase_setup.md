# Supabase Setup Instructions

## Batch Debug機能用のカラム追加

Batch APIのデバッグ情報を保存するために、`orders`テーブルに`batch_debug`カラムを追加する必要があります。

### 手順

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. 以下のSQLを実行：

```sql
-- batch_debugカラムを追加（JSONB型）
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS batch_debug JSONB;

-- インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_orders_batch_debug 
ON orders USING gin(batch_debug);
```

### batch_debugカラムに保存される情報

```json
{
  "batchId": "batch_xxx",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "completed",
  "hasAiInsights": true,
  "parsedResultsCount": 1,
  "rawContentLength": 5000,
  "rawContentPreview": "最初の5000文字...",
  "parsedResults": [...],
  "aiInsightsPreview": {
    "hasPersonality": true,
    "hasInterests": true,
    "relationshipStage": 5
  }
}
```

### 確認方法

LINEで「バッチ」と送信すると、保存されたBatch API結果が表示されます。

### 削除方法（デバッグ完了後）

```sql
-- カラムを削除
ALTER TABLE orders DROP COLUMN IF EXISTS batch_debug;

-- インデックスも削除
DROP INDEX IF EXISTS idx_orders_batch_debug;
```

## 注意事項

- このカラムはデバッグ用の一時的なものです
- 問題が解決したら削除することを推奨します
- JSONB型なので、構造化されたデータを柔軟に保存できます