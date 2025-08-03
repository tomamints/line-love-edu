# タスク管理

恋愛お告げボットの実装タスク一覧です。

## タスク一覧

### Phase 1: 基礎構築
- [TASK-001](./TASK-001-project-setup.md) - プロジェクト初期設定 ⏱️ 4h
- [TASK-002](./TASK-002-timing-calculator.md) - タイミング計算エンジン ⏱️ 6h
- [TASK-003](./TASK-003-numerology-engine.md) - 数秘術エンジン ⏱️ 4h

### Phase 2: AI統合
- [TASK-004](./TASK-004-ai-analyzer.md) - AI分析エンジン ⏱️ 8h
- [TASK-005](./TASK-005-fortune-generator.md) - お告げ生成エンジン ⏱️ 8h

### Phase 3: UI実装とデプロイ
- [TASK-006](./TASK-006-carousel-formatter.md) - Flex Messageカルーセル ⏱️ 10h
- [TASK-007](./TASK-007-webhook-integration.md) - Webhook統合 ⏱️ 6h
- [TASK-008](./TASK-008-testing-deployment.md) - テストとデプロイ ⏱️ 8h

## 合計見積時間
54時間（約7営業日）

## 依存関係図
```
TASK-001 ─┬─→ TASK-002 ─┐
          ├─→ TASK-003 ─┼─→ TASK-005 ─┬─→ TASK-006 ─→ TASK-007 ─→ TASK-008
          └─→ TASK-004 ─┘             │
                                      └─→ TASK-007
```

## 優先順位
1. **必須（MVP）**: TASK-001, 002, 003, 005, 006, 007, 008
2. **推奨**: TASK-004（AI分析）
3. **オプション**: 追加機能は別途タスク化

## 進捗管理
各タスクの受入条件にチェックボックスがあるので、完了したらチェックを入れてください。

## リスク項目
- OpenAI APIの応答速度
- Vercelの実行時間制限（10秒）
- LINE Flex Messageのサイズ制限（25KB）

## 成功の定義
- ユーザーがトーク履歴を送信してから9秒以内にお告げを受信
- 具体的で実行可能なアドバイスが含まれている
- エラー率が5%以下