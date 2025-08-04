// index.js

require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { Client, middleware } = require('@line/bot-sdk');
const parser = require('./metrics/parser');
const FortuneEngine = require('./core/fortune-engine');
const { FortuneCarouselBuilder } = require('./core/formatter/fortune-carousel');

// ── ① 環境変数チェック
console.log("✅ SECRET:", !!process.env.CHANNEL_SECRET);
console.log("✅ TOKEN:", !!process.env.CHANNEL_ACCESS_TOKEN);
console.log("✅ OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);

// ── ② LINEクライアント初期化
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app    = express();
const client = new Client(config);
app.use('/images', express.static(path.join(__dirname, 'images')));

// ── ③ 重複防止
const recentMessageIds = new Set();

// ── ④ Webhook
app.post('/webhook', middleware(config), async (req, res) => {
  console.log("🔮 恋愛お告げボット - リクエスト受信");
  console.log("📝 イベント数:", req.body.events?.length || 0);

  // LINEに即座に200を返す
  res.status(200).json({});

  // イベント処理は非同期で実行
  try {
    const promises = req.body.events.map(event => {
      if (event.type === 'message' && event.message.type === 'file') {
        // 重複チェック
        if (recentMessageIds.has(event.message.id)) {
          console.log("⏭️ 重複メッセージをスキップ:", event.message.id);
          return Promise.resolve();
        }
        recentMessageIds.add(event.message.id);
        
        // サイズ制限（1000件まで保持）
        if (recentMessageIds.size > 1000) {
          const firstKey = recentMessageIds.values().next().value;
          recentMessageIds.delete(firstKey);
        }
        
        return handleEvent(event).catch(err => {
          console.error('=== お告げ生成中にエラー ===', err);
          return client.pushMessage(event.source.userId, {
            type: 'text',
            text: '⚠️ お告げの生成中にエラーが発生しました。もう一度お試しください🔮'
          }).catch(pushErr => console.error('Push message error:', pushErr));
        });
      }
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  } catch (fatal) {
    console.error('🌋 致命的なエラー', fatal);
  }
});


// ── ⑤ イベント処理本体
async function handleEvent(event) {
  console.log('🔮 恋愛お告げ生成開始');
  if (event.type !== 'message' || event.message.type !== 'file') return;

  const userId = event.source.userId;
  const startTime = Date.now();
  
  try {
    // ファイルダウンロード
    console.log('📥 トーク履歴を読み込み中...');
    const stream = await client.getMessageContent(event.message.id);
    const chunks = [];
    for await (const c of stream) {
      chunks.push(c);
    }
    const rawText = Buffer.concat(chunks).toString('utf8');

    // メッセージ解析
    console.log('📊 トーク履歴を分析中...');
    const messages = parser.parseTLText(rawText);
    console.log(`💬 メッセージ数: ${messages.length}`);
    
    // プロフィール取得
    let profile;
    try {
      profile = await client.getProfile(userId);
    } catch (err) {
      console.warn('プロフィール取得エラー:', err);
      profile = { displayName: 'あなた' };
    }
    
    // お告げ生成
    console.log('🔮 運命のお告げを生成中...');
    const fortuneEngine = new FortuneEngine();
    const fortune = await fortuneEngine.generateFortune(messages, userId, profile.displayName);
    
    // カルーセル作成
    console.log('🎨 お告げカルーセルを作成中...');
    const builder = new FortuneCarouselBuilder(fortune, profile);
    const carousel = builder.build();
    
    // サイズチェック
    const totalSize = Buffer.byteLength(JSON.stringify(carousel), 'utf8');
    console.log(`📦 カルーセルサイズ: ${totalSize} bytes`);
    if (totalSize > 25000) {
      console.warn('⚠️ Flex Message が 25KB を超えています！');
    }
    
    // 送信
    console.log('📮 お告げを送信中...');
    await client.pushMessage(userId, carousel);
    
    // 完了ログ
    const endTime = Date.now();
    console.log(`✨ お告げ生成完了！ (処理時間: ${endTime - startTime}ms)`);
    
  } catch (error) {
    console.error('❌ エラー発生:', error);
    
    // エラー時のフォールバック
    try {
      await client.pushMessage(userId, {
        type: 'text',
        text: '🔮 申し訳ございません。星々からのメッセージを受信できませんでした。\n\nもう一度お試しいただくか、しばらく時間をおいてからお試しください。'
      });
    } catch (pushErr) {
      console.error('プッシュメッセージエラー:', pushErr);
    }
  }
}

// ── ⑥ 起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔮 恋愛お告げボット起動: http://localhost:${port}`);
  console.log('📡 Webhook URL: /webhook');
  console.log('✨ 準備完了！トーク履歴を送信してください');
});

module.exports = app;