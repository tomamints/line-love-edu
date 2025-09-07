# Claude Code 開発ルール

## 絶対的ルール（確定事項）

### 推測禁止ルール
- **推測での対応は絶対禁止**
- エラーや問題が発生した場合は必ず最新情報を調査する
- 時間がかかっても正確な情報を確認してから対応する
- 調査結果は必ずmemoryとCLAUDE.mdの両方に記録する
- 「〜だと思います」「〜の可能性があります」ではなく、調査して事実を確認する

### 調査手順
1. エラーが発生したら、まずエラーメッセージを正確に読む
2. 公式ドキュメントを確認（WebFetch/WebSearch）
3. 最新の仕様や変更点を確認
4. 調査結果を記録してから対応策を実装

---

## プロジェクト情報

### PayPay Sandbox環境の正確な仕様（2025-01-09調査済み）

#### PayPayアプリのDeveloper Mode
**事実**: PayPayアプリはSandbox環境に対応している
- 通常のPayPayアプリをDeveloper Modeに切り替えることで使用可能
- APP_DEEP_LINKはSandbox環境でも正常に動作する

#### Developer Mode切り替え手順
1. PayPayアプリのサインイン画面でPayPayロゴを7回タップ
2. Developer Mode Sign Inへの切り替えを確認
3. テストユーザーでログイン
4. OTP: 1234を入力

#### API仕様
- Sandbox API: `https://stg-api.sandbox.paypay.ne.jp/v2/`
- redirectType: モバイルは"APP_DEEP_LINK"、デスクトップは"WEB_LINK"

---

## 過去の誤った推測と修正

### 2025-01-09: PayPay Sandbox APP_DEEP_LINK
**誤った推測**: 「サンドボックス環境は実際のPayPayアプリに対応していない」
**事実**: PayPayアプリのDeveloper Modeで対応している
**学習**: 推測せずに公式ドキュメントを確認すべきだった

---

## 今後の対応

1. **エラー発生時は必ず調査**
   - WebSearch/WebFetchで公式情報を確認
   - StackOverflow、GitHub Issues等も参照
   - 推測での回答は絶対にしない

2. **調査結果の記録**
   - このファイル（CLAUDE.md）に記録
   - memoryシステムにも保存
   - 日付と調査元を明記

3. **ユーザーへの報告**
   - 調査中であることを伝える
   - 調査結果を正確に報告
   - 推測や憶測は一切含めない