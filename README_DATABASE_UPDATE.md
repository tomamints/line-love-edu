# データベース更新手順

## Supabaseを使用している場合

### access_rightsテーブルの削除
ランタイムからの参照を廃止したため、以下のSQLでテーブルを削除してください。

```sql
DROP TABLE IF EXISTS access_rights;
```

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. 以下のSQLを実行：

```sql
-- report_progressカラムを追加
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS report_progress JSONB;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_orders_report_progress 
ON orders((report_progress IS NOT NULL));
```

## ファイルストレージを使用している場合

自動的に`progress/`ディレクトリが作成されるため、特に作業は不要です。

## 確認方法

### Supabase
```sql
-- カラムが追加されたか確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'report_progress';
```

### ローカル
```bash
# progressディレクトリが作成されるか確認
ls -la progress/
```

## 注意事項

- `report_progress`カラムはJSONB型で、以下のようなデータを保存します：
```json
{
  "currentStep": 3,
  "totalSteps": 5,
  "data": {
    "messages": [...],
    "userProfile": {...},
    "fortune": {...}
  },
  "attempts": 2,
  "startedAt": "2025-01-08T10:00:00Z",
  "updatedAt": "2025-01-08T10:01:00Z"
}
```

- このカラムは一時的なデータのため、レポート生成完了後は自動的にクリアされます
- Vercelの環境変数`FORCE_FILE_STORAGE=true`を設定している場合は、ファイルシステムが使用されます
