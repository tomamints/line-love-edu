# LINE Love Edu - 恋愛相性診断ボット

LINEのトーク履歴を分析して、恋愛相性を診断するLINEボットアプリケーションです。

## 機能

- トーク履歴の自動分析
- 5つの相性カテゴリー（時間・バランス・テンポ・会話タイプ・言葉）の評価
- 干支男子タイプ診断（12タイプ）
- ビジュアルなレーダーチャート表示
- 改善アドバイスの提供

## 技術スタック

- Node.js
- LINE Bot SDK
- Chart.js（レーダーチャート生成）
- Express.js
- Vercel（デプロイ）

## セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
CHANNEL_SECRET=your_line_channel_secret
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
BASE_URL=https://your-domain.vercel.app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. ローカル開発

```bash
npm run dev
```

ngrokを使用してローカル環境をインターネットに公開：

```bash
ngrok http 3000
```

LINE DevelopersコンソールでWebhook URLを設定：
```
https://your-ngrok-id.ngrok.io/webhook
```

### 4. Vercelへのデプロイ

```bash
vercel
```

環境変数をVercelのダッシュボードで設定してください。

## プロジェクト構造

```
line-love-edu/
├── api/
│   └── webhook.js       # Webhook処理（Vercel Functions）
├── metrics/
│   ├── parser.js        # トーク履歴パーサー
│   ├── compatibility.js # 相性計算
│   ├── habits.js        # 習慣分析
│   ├── behavior.js      # 行動分析
│   ├── records.js       # 記録分析
│   ├── zodiac.js        # 干支タイプ診断
│   └── formatterFlexCarousel.js # カルーセル生成
├── images/              # 画像アセット
├── comments.json        # コメントデータ
├── vercel.json          # Vercel設定
├── package.json         # プロジェクト設定
└── index.js            # ローカル開発用エントリーポイント
```

## 使い方

1. LINE公式アカウントを友だち追加
2. トーク履歴をテキストファイルでエクスポート
3. エクスポートしたファイルをボットに送信
4. 分析結果がカルーセル形式で返信されます

## 分析内容

### 相性スコア（5カテゴリー）
- **時間**: 返信タイミングの相性
- **バランス**: メッセージ頻度のバランス
- **テンポ**: 会話のテンポの相性
- **タイプ**: 会話スタイルの相性
- **言葉**: 言葉遣いの相性

### 干支男子タイプ（12種類）
- ねずみ男子：おしゃべりアイデアマン
- うし男子：マイペース癒し系
- とら男子：通話派リーダー
- うさぎ男子：さみしがり共感系
- りゅう男子：ナルシストロマン派
- へび男子：夜型ミステリアス
- うま男子：即レスアクティブ系
- ひつじ男子：バランス気配り屋
- さる男子：おちゃらけノリ男
- とり男子：きまぐれ自由人
- いぬ男子：健気なかまちょ系
- いのしし男子：情熱ギャップ系

## 注意事項

- プライバシー保護のため、トーク履歴は処理後即座に破棄されます
- 分析結果は参考程度にご利用ください
- 個人情報は一切保存されません

## ライセンス

ISC