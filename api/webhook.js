// api/webhook.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Client, middleware } = require('@line/bot-sdk');
const parser        = require('../metrics/parser');
const compatibility = require('../metrics/compatibility');
const habits        = require('../metrics/habits');
const behavior      = require('../metrics/behavior');
const records       = require('../metrics/records');
const { buildCompatibilityCarousel } = require('../metrics/formatterFlexCarousel');
const { calcZodiacTypeScores } = require('../metrics/zodiac');

// 恋愛お告げ関連のインポート
const FortuneEngine = require('../core/fortune-engine');
const { buildFortuneCarousel } = require('../core/formatter/fortune-carousel');

const commentsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../comments.json'), 'utf8')
);

console.log("🔧 環境変数チェック:");
console.log("  - CHANNEL_ACCESS_TOKEN:", process.env.CHANNEL_ACCESS_TOKEN ? "設定済み" : "未設定");
console.log("  - CHANNEL_SECRET:", process.env.CHANNEL_SECRET ? "設定済み" : "未設定");
console.log("  - OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "設定済み" : "未設定");
console.log("  - FORTUNE_MODE:", process.env.FORTUNE_MODE || "未設定");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

console.log("🔧 LINE Client 初期化中...");
const client = new Client(config);
console.log("🔧 LINE Client 初期化完了");

function getScoreBand(score) {
  if (score >= 95) return '95';
  if (score >= 90) return '90';
  if (score >= 85) return '85';
  if (score >= 80) return '80';
  if (score >= 70) return '70';
  if (score >= 60) return '60';
  if (score >= 50) return '50';
  return '49';
}

function getShutaComment(category, scoreOrKey) {
  const band = typeof scoreOrKey === 'number'
    ? getScoreBand(scoreOrKey)
    : scoreOrKey;
  return commentsData[category]?.[band] || '';
}

// VercelではsetIntervalは使えないため、重複チェックは簡易的に実装
const recentMessageIds = new Set();

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  console.log("🧪 Webhook received:", JSON.stringify(req.body, null, 2));
  
  try {
    // 処理を実行してからレスポンスを返す
    for (const event of req.body.events) {
      if (event.type === 'message' && event.message.type === 'file') {
        // 重複チェック
        if (recentMessageIds.has(event.message.id)) {
          console.log("⏭️ 重複メッセージをスキップ:", event.message.id);
          continue;
        }
        recentMessageIds.add(event.message.id);
        
        // サイズ制限（1000件まで保持）
        if (recentMessageIds.size > 1000) {
          const firstKey = recentMessageIds.values().next().value;
          recentMessageIds.delete(firstKey);
        }
        
        try {
          // 同期的に処理を実行（最大9秒）
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Processing timeout')), 9000)
          );
          
          await Promise.race([
            handleEvent(event),
            timeout
          ]);
          
        } catch (err) {
          console.error('イベント処理エラー:', err);
          // エラーメッセージは handleEvent 内で送信される
        }
      }
    }
    
    // すべての処理が完了してから200を返す
    res.status(200).json({});
    console.log("✅ 処理完了 & 200レスポンスを送信");
    
  } catch (error) {
    console.error('🌋 致命的なエラー:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};


/**
 * モードを判定する
 * @param {object} event - LINEイベント
 * @param {string} fileName - ファイル名
 * @returns {string} 'fortune' または 'compatibility'
 */
function determineMode(event, fileName = '') {
  // ファイル名での判定
  if (fileName && (fileName.includes('占い') || fileName.includes('お告げ') || fileName.includes('fortune'))) {
    return 'fortune';
  }
  
  // 環境変数での強制指定
  if (process.env.FORTUNE_MODE === 'force') {
    return 'fortune';
  }
  
  // デフォルトは従来の相性診断
  return 'compatibility';
}

/**
 * ユーザーIDをハッシュ化（プライバシー保護）
 * @param {string} userId - ユーザーID
 * @returns {string} ハッシュ化されたID
 */
function hashUserId(userId) {
  return userId ? userId.substring(0, 8) + '...' : 'unknown';
}

async function handleEvent(event) {
  console.log("📥 handleEvent start!");
  console.log("📎 fileName:", event.message?.fileName);

  if (event.type !== 'message' || event.message.type !== 'file') return;

  const userId = event.source.userId;
  const fileName = event.message?.fileName || '';
  const startTime = Date.now();
  
  // モード判定
  const mode = determineMode(event, fileName);
  console.log(`🎯 処理モード: ${mode} (ファイル名: ${fileName})`);
  
  // 基本ログ
  console.log({
    mode,
    userId: hashUserId(userId),
    fileName,
    messageId: event.message.id
  });

  // === ⭐️ ここにログ追加 ===
  console.log("📥 getMessageContent 開始");

  // ファイル読み込み
  let rawText = '';
  try {
    console.log("📥 client.getMessageContent を呼び出し中...");
    console.log("  - message.id:", event.message.id);
    console.log("  - client:", !!client);
    console.log("  - client.getMessageContent:", typeof client.getMessageContent);
    
    // タイムアウト付きで実行（5秒）
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getMessageContent timeout (5s)')), 5000)
    );
    
    console.log("📡 getMessageContent 呼び出し前");
    
    const stream = await Promise.race([
      client.getMessageContent(event.message.id).catch(err => {
        console.error("❌ getMessageContent エラー詳細:", err);
        throw err;
      }),
      timeoutPromise
    ]);
    
    console.log("📡 getMessageContent 成功");

    // === ⭐️ stream取得ログ ===
    console.log("📥 stream を取得");

    const chunks = [];
    for await (const c of stream) chunks.push(c);

    // === ⭐️ stream読み込み完了ログ ===
    console.log("📥 stream 読み込み完了");

    rawText = Buffer.concat(chunks).toString('utf8');
    console.log("📃 rawText length:", rawText.length);
    console.log("📃 rawText preview:", rawText.slice(0, 100));
  } catch (err) {
    console.error("📛 getMessageContent error:", err);
    await client.pushMessage(userId, {
      type: 'text',
      text: '⚠️ ファイルの読み込み中にエラーが発生しました'
    });
    return;
  }

  let messages;
  try {
    messages = parser.parseTLText(rawText);
    console.log("📝 メッセージ数:", messages.length);
  } catch (err) {
    console.error("📛 parseTLText error:", err);
    await client.pushMessage(userId, {
      type: 'text',
      text: '⚠️ トーク履歴の解析に失敗しました'
    });
    return;
  }

  // ユーザープロファイル取得
  let profile;
  try {
    profile = await client.getProfile(userId);
  } catch (err) {
    console.error("📛 getProfile error:", err);
    profile = { displayName: 'ユーザー' };
  }
  
  const { self, other } = parser.extractParticipants(messages, profile.displayName);
  const selfName = self;
  const otherName = other;

  // モード別処理分岐
  if (mode === 'fortune') {
    await handleFortuneMode(event, messages, userId, profile, startTime);
  } else {
    await handleCompatibilityMode(event, messages, userId, selfName, otherName, startTime);
  }
}

/**
 * 恋愛お告げモードの処理
 */
async function handleFortuneMode(event, messages, userId, profile, startTime) {
  console.log("🔮 恋愛お告げモード開始");
  
  try {
    // お告げエンジン初期化
    const fortuneEngine = new FortuneEngine();
    
    // お告げ生成（タイムアウト付き）
    const fortunePromise = fortuneEngine.generateFortune(messages, userId, profile.displayName);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fortune generation timeout')), 7000)
    );
    
    const fortune = await Promise.race([fortunePromise, timeoutPromise]);
    
    // カルーセル生成
    const carousel = buildFortuneCarousel(fortune, profile);
    
    // サイズチェック
    logCarouselSize(carousel, 'fortune');
    
    // 送信
    await client.pushMessage(userId, carousel);
    
    // 成功ログ
    const endTime = Date.now();
    console.log({
      mode: 'fortune',
      userId: hashUserId(userId),
      messageCount: messages.length,
      processingTime: endTime - startTime,
      aiUsed: !!fortune.metadata?.analysisSource?.ai,
      success: true
    });
    
    console.log("✅ 恋愛お告げ送信完了");
    
  } catch (err) {
    console.error("📛 恋愛お告げ処理エラー:", err);
    
    // エラーログ
    const endTime = Date.now();
    console.log({
      mode: 'fortune',
      userId: hashUserId(userId),
      messageCount: messages.length,
      processingTime: endTime - startTime,
      error: err.message,
      success: false
    });
    
    // フォールバックメッセージ
    await sendFallbackMessage(userId, 'fortune');
  }
}

/**
 * 従来の相性診断モードの処理
 */
async function handleCompatibilityMode(event, messages, userId, selfName, otherName, startTime) {
  console.log("💕 相性診断モード開始");
  
  try {
    const recordsData  = records.calcAll({ messages, selfName, otherName });
    const compData     = compatibility.calcAll({ messages, selfName, otherName, recordsData });
    const habitsData   = habits.calcAll({ messages, selfName, otherName });
    const behaviorData = await behavior.calcAll({ messages, selfName, otherName });

    const { animalType, scores: zodiacScores } = calcZodiacTypeScores({
      messages,
      selfName,
      otherName,
      recordsData
    });
    const animalTypeData = commentsData.animalTypes?.[animalType] || {};
    console.log('🐯 干支診断 scores:', zodiacScores);

    const radar = compData.radarScores;
    const lowestCategory = Object.entries(radar).sort((a, b) => a[1] - b[1])[0][0];
    const commentOverall = getShutaComment('overall', compData.overall).replace(/（相手）/g, otherName);
    const comment7p      = getShutaComment('7p', lowestCategory).replace(/（相手）/g, otherName);

    const carousel = buildCompatibilityCarousel({
      selfName,
      otherName,
      radarScores: compData.radarScores,
      overall:     compData.overall,
      habitsData,
      behaviorData,
      recordsData,
      comments: {
        overall: commentOverall,
        time:    commentsData.time,
        balance: commentsData.balance,
        tempo:   commentsData.tempo,
        type:    commentsData.type,
        words:   commentsData.words,
        '7p':    comment7p,
        animalTypes: commentsData.animalTypes,
      },
      animalType,
      animalTypeData,
      zodiacScores,
      promotionalImageUrl: `${process.env.BASE_URL}/images/promotion.png`,
      promotionalLinkUrl:  'https://note.com/enkyorikun/n/n38aad7b8a548'
    });

    // サイズチェック
    logCarouselSize(carousel, 'compatibility');
    
    // 送信
    await client.pushMessage(userId, carousel);
    
    // 成功ログ
    const endTime = Date.now();
    console.log({
      mode: 'compatibility',
      userId: hashUserId(userId),
      messageCount: messages.length,
      processingTime: endTime - startTime,
      success: true
    });
    
    console.log("✅ 相性診断送信完了");
    
  } catch (err) {
    console.error("📛 相性診断処理エラー:", err);
    
    // エラーログ
    const endTime = Date.now();
    console.log({
      mode: 'compatibility',
      userId: hashUserId(userId),
      messageCount: messages.length,
      processingTime: endTime - startTime,
      error: err.message,
      success: false
    });
    
    // フォールバックメッセージ
    await sendFallbackMessage(userId, 'compatibility');
  }
}

/**
 * カルーセルサイズをログ出力
 */
function logCarouselSize(carousel, mode) {
  if (carousel?.contents?.type === 'carousel' && Array.isArray(carousel.contents.contents)) {
    carousel.contents.contents.forEach((bubble, index) => {
      const msg = {
        type: 'flex',
        altText: `ページ${index + 1}`,
        contents: bubble
      };
      const size = Buffer.byteLength(JSON.stringify(msg), 'utf8');
      console.log(`📦 [${mode}] ページ${index + 1} のサイズ: ${size} bytes`);
    });

    const totalSize = Buffer.byteLength(JSON.stringify(carousel), 'utf8');
    console.log(`📦 [${mode}] 全体（carousel）サイズ: ${totalSize} bytes`);
    if (totalSize > 25000) {
      console.warn(`⚠️ [${mode}] Flex Message が 25KB を超えています！`);
    }
  }
}

/**
 * フォールバックメッセージを送信
 */
async function sendFallbackMessage(userId, mode) {
  const messages = {
    fortune: {
      type: 'text',
      text: '⚠️ 恋愛お告げの生成中にエラーが発生しました。\n\n✨ でも大丈夫！あなたの恋愛運は必ず上向きます。\n今は心を穏やかにして、愛情を育む準備をしてくださいね💕'
    },
    compatibility: {
      type: 'text',
      text: '⚠️ 相性診断の処理中にエラーが発生しました。\n\n💕 お時間をおいて再度お試しください。'
    }
  };
  
  try {
    await client.pushMessage(userId, messages[mode] || messages.compatibility);
  } catch (err) {
    console.error("📛 フォールバックメッセージ送信エラー:", err);
  }
}