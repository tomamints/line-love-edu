# トーク履歴送信チュートリアル動画の作成方法

## 動画に含めるべき内容

1. **オープニング** (0-3秒)
   - 「トーク履歴の送信方法」というタイトル

2. **手順説明** (3-30秒)
   - Step 1: トークルーム右上の「≡」メニューをタップ
   - Step 2: 「その他」を選択
   - Step 3: 「トーク履歴を送信」をタップ  
   - Step 4: 期間を選択（過去1ヶ月推奨）
   - Step 5: 送信先でこのボットを選択

3. **エンディング** (30-35秒)
   - 「テキストファイルが送信されます」
   - 「分析が自動的に開始されます」

## 画面録画の方法

### iPhoneの場合
1. コントロールセンターから画面録画を開始
2. LINEアプリを開いて手順を実行
3. 録画を停止

### Androidの場合
1. クイック設定から「スクリーンレコード」を選択
2. LINEアプリを開いて手順を実行
3. 録画を停止

## 動画編集

### 無料ツール
- **iMovie** (Mac/iOS)
- **DaVinci Resolve** (Windows/Mac)
- **OpenShot** (クロスプラットフォーム)

### 編集のポイント
1. 不要な部分をカット
2. 各ステップに字幕を追加
3. 矢印や丸で重要な部分を強調
4. BGMを追加（オプション）

## 動画の書き出し設定

```
フォーマット: MP4 (推奨) / MOV (可能)
コーデック: H.264
解像度: 1280x720 (HD)
フレームレート: 30fps
ビットレート: 2-5 Mbps
音声: AAC, 128kbps
```

## MOVファイルを使う場合

### MOVファイルの注意点
- 一部のAndroid端末で再生できない可能性がある
- ファイルサイズが大きくなりがち
- LINE公式ではMP4を推奨

### MOVからMP4への変換方法

#### 1. FFmpegを使う方法（無料・コマンドライン）
```bash
# FFmpegのインストール（Mac）
brew install ffmpeg

# MOVをMP4に変換
ffmpeg -i input.mov -c:v h264 -c:a aac output.mp4

# サイズを最適化しながら変換
ffmpeg -i input.mov -c:v h264 -crf 23 -c:a aac -b:a 128k output.mp4
```

#### 2. QuickTime Player（Mac）
1. MOVファイルをQuickTime Playerで開く
2. ファイル → 書き出す → 1080p（または720p）
3. MP4として保存

#### 3. オンラインコンバーター
- CloudConvert: https://cloudconvert.com/mov-to-mp4
- Convertio: https://convertio.co/ja/mov-mp4/

#### 4. iMovie（Mac/iOS）
1. MOVファイルをインポート
2. ファイル → 共有 → ファイル
3. フォーマットを「ビデオとオーディオ」に設定
4. 圧縮を「高品質」に設定

## ファイルの配置

1. 動画ファイル: `/public/videos/talk-history-tutorial.mp4`
2. サムネイル画像: `/public/images/video-thumbnail.jpg`

## 実装の有効化

動画ファイルを配置したら、`index.js`の以下の部分のコメントアウトを外す：

```javascript
// 1451行目あたり
,{
  type: 'video',
  originalContentUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/videos/talk-history-tutorial.mp4`,
  previewImageUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/images/video-thumbnail.jpg`,
  trackingId: 'talk-history-tutorial'
}
```

## テスト方法

1. ローカルでテスト
   ```bash
   npm start
   ```

2. ngrokでHTTPS化
   ```bash
   ngrok http 3000
   ```

3. LINEボットのWebhook URLを更新

4. 実際にLINEで「占いを始める」から動画が送信されることを確認