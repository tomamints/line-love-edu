# TASK-001: プロジェクト初期設定

## 概要
恋愛お告げボットの基盤となるプロジェクト構造を整備し、必要な依存関係をインストールする。

## 受入条件
- [ ] 新しいディレクトリ構造が作成されている
- [ ] 必要なnpmパッケージがインストールされている
- [ ] 環境変数の設定が完了している
- [ ] 基本的な動作確認ができる

## タスク詳細

### 1. ディレクトリ構造の作成
```bash
mkdir -p core/fortune-engine
mkdir -p core/ai-analyzer
mkdir -p core/formatter
mkdir -p data
mkdir -p utils
mkdir -p config
mkdir -p tests
```

### 2. 必要なパッケージのインストール
```bash
npm install openai dayjs
npm install --save-dev jest @types/jest
```

### 3. 設定ファイルの作成

#### config/fortune.config.js
- お告げ生成の各種設定
- タイミング計算のパラメータ
- スコアリングの重み付け

#### config/ai.config.js
- OpenAI APIの設定
- プロンプトテンプレート
- レート制限設定

### 4. 環境変数の追加
`.env`に以下を追加：
```
OPENAI_API_KEY=your_openai_api_key
FORTUNE_MODE=development
```

### 5. 基本的なユーティリティ作成

#### utils/date-utils.js
- 日付・時間計算のヘルパー関数
- 曜日判定
- 時間帯判定

#### utils/cache.js
- 簡易キャッシュシステム
- TTL管理
- メモリ効率化

## 技術メモ
- OpenAI SDKはv4系を使用
- dayjsはmomentjsの軽量代替
- キャッシュはMap()ベースで実装

## 見積時間
4時間

## 依存関係
なし（最初のタスク）

## 完了後の成果物
- プロジェクト構造が整備されている
- package.jsonが更新されている
- 設定ファイルのテンプレートが存在する
- READMEに新しい構造が反映されている