# 動画セットアップ手順

## 1. 動画ファイルの準備

### 必要なファイル
- **動画**: `talk-history-tutorial.mp4`
- **サムネイル**: `video-thumbnail.jpg`

### 動画の仕様
```
フォーマット: MP4
コーデック: H.264
解像度: 1280x720 推奨
時間: 30秒〜1分
最大サイズ: 200MB
```

## 2. MOVからMP4への変換

### 方法1: FFmpeg（コマンドライン）
```bash
# 基本変換
ffmpeg -i tutorial.mov tutorial.mp4

# 最適化（ファイルサイズ削減）
ffmpeg -i tutorial.mov -c:v h264 -crf 23 -preset medium -c:a aac -b:a 128k tutorial.mp4
```

### 方法2: QuickTime Player（Mac）
1. MOVファイルをQuickTime Playerで開く
2. ファイル → 書き出す → 720p
3. MP4として自動保存される

### 方法3: iMovie
1. プロジェクトにMOVをインポート
2. ファイル → 共有 → ファイル
3. 品質「高」、圧縮「高品質」を選択

## 3. サムネイル画像の作成

### 動画から自動生成
```bash
# 動画の1秒目をサムネイルとして抽出
ffmpeg -i talk-history-tutorial.mp4 -ss 00:00:01 -vframes 1 video-thumbnail.jpg

# サイズを指定して抽出
ffmpeg -i talk-history-tutorial.mp4 -ss 00:00:01 -vframes 1 -s 1280x720 video-thumbnail.jpg
```

## 4. ファイルの配置

```bash
# 動画ファイルを配置
cp talk-history-tutorial.mp4 /Users/shiraitouma/daniel/line-love-edu/public/videos/

# サムネイルを配置
cp video-thumbnail.jpg /Users/shiraitouma/daniel/line-love-edu/public/images/
```

## 5. コードの有効化

`index.js` の1453-1460行目のコメントを外す：

```javascript
// 変更前（コメントアウト状態）
/*
,{
  type: 'video',
  originalContentUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/videos/talk-history-tutorial.mp4`,
  previewImageUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/images/video-thumbnail.jpg`,
  trackingId: 'talk-history-tutorial'
}
*/

// 変更後（有効化）
,{
  type: 'video',
  originalContentUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/videos/talk-history-tutorial.mp4`,
  previewImageUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/images/video-thumbnail.jpg`,
  trackingId: 'talk-history-tutorial'
}
```

## 6. ローカルテスト

```bash
# サーバー起動
npm start

# ngrokでHTTPS化（LINEはHTTPSが必須）
ngrok http 3000

# ngrokのURLをLINE Developersコンソールに設定
# https://xxxxx.ngrok.io/webhook
```

## 7. 本番デプロイ

```bash
# Vercelにデプロイ
vercel

# または
git add .
git commit -m "Add tutorial video"
git push
```

## 確認事項

✅ ファイルが正しい場所に配置されているか
```bash
ls -la public/videos/talk-history-tutorial.mp4
ls -la public/images/video-thumbnail.jpg
```

✅ ファイルサイズが200MB以下か
```bash
du -h public/videos/talk-history-tutorial.mp4
```

✅ 動画が再生可能か
```bash
# ローカルで確認
open public/videos/talk-history-tutorial.mp4
```

## トラブルシューティング

### 動画が送信されない場合
1. ファイルパスを確認
2. ファイルサイズを確認（200MB以下）
3. HTTPSでアクセス可能か確認
4. コンソールログでエラーを確認

### Android で再生できない場合
- コーデックがH.264になっているか確認
- 音声コーデックがAACになっているか確認

```bash
# コーデック情報を確認
ffprobe talk-history-tutorial.mp4
```