#!/bin/bash

# 動画からサムネイルを自動生成するスクリプト

# 動画ファイルのパス
VIDEO_PATH="public/videos/talk-history-tutorial.mp4"
THUMBNAIL_PATH="public/images/video-thumbnail.jpg"

# ディレクトリが存在しない場合は作成
mkdir -p public/images

# 動画の1秒目をサムネイルとして抽出
ffmpeg -i "$VIDEO_PATH" -ss 00:00:01 -vframes 1 -vf scale=1280:720 "$THUMBNAIL_PATH"

echo "✅ サムネイル生成完了: $THUMBNAIL_PATH"