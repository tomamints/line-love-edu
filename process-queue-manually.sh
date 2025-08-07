#!/bin/bash

# キューを手動で処理するスクリプト
# 決済後にこのスクリプトを実行してレポートを生成

echo "📋 キューの処理を開始します..."

# 本番環境のURLを設定
BASE_URL="https://line-love-edu.vercel.app"

# 特定の注文IDを指定する場合は引数で渡す
ORDER_ID=$1

if [ -n "$ORDER_ID" ]; then
  echo "📍 特定の注文を処理: $ORDER_ID"
  curl -X POST "$BASE_URL/api/process-queue?orderId=$ORDER_ID"
else
  echo "📍 全ての待機中の注文を処理"
  curl -X POST "$BASE_URL/api/process-queue"
fi

echo ""
echo "✅ キュー処理リクエストを送信しました"
echo "📌 Vercelのログでレポート生成状況を確認してください"