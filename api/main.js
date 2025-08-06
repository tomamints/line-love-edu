// api/main.js - Vercel用のメインWebhookハンドラー
require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('@line/bot-sdk');

// 環境変数チェック
console.log("✅ SECRET:", !!process.env.CHANNEL_SECRET);
console.log("✅ TOKEN:", !!process.env.CHANNEL_ACCESS_TOKEN);
console.log("✅ OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);

// 環境変数の長さを確認（セキュアにログ出力）
console.log("📏 SECRET length:", process.env.CHANNEL_SECRET?.length || 0);
console.log("📏 TOKEN length:", process.env.CHANNEL_ACCESS_TOKEN?.length || 0);

// LINEクライアント設定
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new Client(config);
console.log("🤖 LINE Client initialized");

// 重いモジュールは必要時に遅延ロード
let profileManager, handleFollowEvent, handleTextMessage, handlePostbackEvent, handleTestReport;

function loadHandlers() {
  if (!profileManager) {
    const UserProfileManager = require('../core/user-profile');
    profileManager = new UserProfileManager();
  }
  
  // メインのindex.jsから関数をインポート
  const mainModule = require('../index');
  handleFollowEvent = mainModule.handleFollowEvent;
  handleTextMessage = mainModule.handleTextMessage;
  handlePostbackEvent = mainModule.handlePostbackEvent;
  handleTestReport = mainModule.handleTestReport;
}

// 重複防止用
const recentMessageIds = new Set();
const recentPostbackIds = new Set();

// 署名検証ヘルパー関数
function validateSignature(body, signature, secret) {
  const hash = crypto
    .createHmac('SHA256', secret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

// Vercel用のハンドラー関数
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("🔮 恋愛お告げボット - リクエスト受信 (Vercel)");
  
  // 署名検証
  const signature = req.headers['x-line-signature'];
  if (!signature) {
    console.error('❌ 署名がありません');
    return res.status(401).json({ error: 'No signature' });
  }

  // リクエストボディを取得
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  
  // 署名を検証
  if (process.env.CHANNEL_SECRET) {
    const isValid = validateSignature(rawBody, signature, process.env.CHANNEL_SECRET);
    if (!isValid) {
      console.error('❌ 署名検証失敗');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    console.log('✅ 署名検証成功');
  }
  
  console.log("📝 イベント数:", body.events?.length || 0);
  
  // リトライチェック
  const retryCount = req.headers['x-line-retry'] || 0;
  if (retryCount > 0) {
    console.log(`⚠️ リトライ検出: ${retryCount}回目のリトライ`);
  }

  // ハンドラーをロード
  loadHandlers();

  // まず200を返す（LINEのタイムアウトを防ぐ）
  res.status(200).json({ status: 'ok' });
  console.log('✅ 200レスポンス送信完了');

  // イベント処理を非同期で実行
  try {
    const events = body.events || [];
    
    // 各イベントを順番に処理（エラーハンドリングを強化）
    for (const event of events) {
      try {
        // 友達追加イベント
        if (event.type === 'follow') {
          console.log('🎯 Followイベント処理開始');
          await handleFollowEventLocal(event);
          console.log('✅ Followイベント処理完了');
          continue;
      }
        
        // テキストメッセージの処理
        if (event.type === 'message' && event.message.type === 'text') {
          console.log('🎯 テキストメッセージ処理開始:', event.message.text);
          await handleTextMessageLocal(event);
          console.log('✅ テキストメッセージ処理完了');
          continue;
        }
        
        // Postbackイベント処理（生年月日入力など）
        if (event.type === 'postback') {
          const postbackId = `${event.source.userId}_${event.postback.data}_${event.timestamp}`;
          
          if (recentPostbackIds.has(postbackId)) {
            console.log("⏭️ 重複postbackをスキップ:", postbackId);
            continue;
          }
          recentPostbackIds.add(postbackId);
          
          // サイズ制限
          if (recentPostbackIds.size > 1000) {
            const firstKey = recentPostbackIds.values().next().value;
            recentPostbackIds.delete(firstKey);
          }
          
          console.log('🎯 Postbackイベント処理開始');
          await handlePostbackEventLocal(event);
          console.log('✅ Postbackイベント処理完了');
          continue;
        }
        
        // テスト用レポート生成
        if (event.type === 'message' && event.message.type === 'text' && 
            event.message.text === 'テストレポート') {
          console.log('🎯 テストレポート処理開始');
          await handleTestReportLocal(event).catch(err => {
            console.error('=== テストレポート生成エラー ===', err);
          });
          console.log('✅ テストレポート処理完了');
          continue;
        }
        
        console.log('⏭️ 未処理のイベントタイプ:', event.type);
      } catch (eventError) {
        console.error('❌ イベント処理エラー:', eventError);
        console.error('❌ エラー詳細:', eventError.stack);
      }
    }
    
    console.log('✅ すべてのイベント処理完了');
    
  } catch (fatal) {
    console.error('🌋 致命的なエラー:', fatal);
    console.error('🌋 スタック:', fatal.stack);
  }
};

// ローカル版のハンドラー関数（index.jsの関数が使えない場合のフォールバック）
async function handleFollowEventLocal(event) {
  console.log('👋 新しい友達が追加されました (Vercel)');
  console.log('📍 Reply Token:', event.replyToken);
  console.log('👤 User ID:', event.source.userId);
  
  // まずシンプルなテキストメッセージを送信してテスト
  try {
    console.log('📤 テキストメッセージ送信開始...');
    const result = await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '🌙 月相恋愛占いへようこそ！\n\n生年月日から二人の相性を占います✨\n\n「占いを始める」と送信してください'
    });
    console.log('✅ テキストメッセージ送信成功:', result);
    return;
  } catch (error) {
    console.error('❌ テキストメッセージ送信失敗:', error);
    console.error('❌ エラー詳細:', error.response?.data || error.message);
    console.error('❌ エラースタック:', error.stack);
  }
  
  // Flexメッセージは一旦コメントアウト
  /*
  try {
    // 美しいウェルカムカードを送信
    const result = await client.replyMessage(event.replyToken, {
      type: 'flex',
      altText: '🌙 月相恋愛占いへようこそ！',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '🌙',
                  size: '60px',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '月相恋愛占い',
                  size: 'xl',
                  color: '#ffffff',
                  align: 'center',
                  weight: 'bold'
                },
                {
                  type: 'text',
                  text: '生年月日から導く運命の相性',
                  size: 'sm',
                  color: '#ffffff',
                  align: 'center',
                  margin: 'sm'
                }
              ]
            }
          ],
          paddingAll: '20px',
          backgroundColor: '#764ba2',
          spacing: 'md',
          paddingTop: '22px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'あなたと大切な人の相性を',
              size: 'md',
              wrap: true,
              align: 'center'
            },
            {
              type: 'text',
              text: '月の満ち欠けから占います',
              size: 'md',
              wrap: true,
              align: 'center',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '📝 かんたん3ステップ',
                  weight: 'bold',
                  size: 'sm',
                  color: '#764ba2'
                },
                {
                  type: 'text',
                  text: '1. あなたの生年月日を入力',
                  size: 'sm',
                  margin: 'sm'
                },
                {
                  type: 'text',
                  text: '2. お相手の生年月日を入力',
                  size: 'sm'
                },
                {
                  type: 'text',
                  text: '3. 相性診断結果をチェック！',
                  size: 'sm'
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'md',
              action: {
                type: 'message',
                label: '🔮 占いを始める',
                text: '占いを始める'
              },
              color: '#764ba2'
            }
          ]
        }
      }
    });
    console.log('✅ ウェルカムカード送信成功:', result);
  } catch (error) {
    console.error('❌ ウェルカムカード送信失敗:', error);
    console.error('❌ エラー詳細:', error.response?.data || error.message);
  }
  */
}

// 他のハンドラー関数もindex.jsから動的にインポートされるため、
// ここではフォールバック用の最小限の実装のみ
async function handleTextMessageLocal(event) {
  if (handleTextMessage) {
    return handleTextMessage(event);
  }
  // フォールバック実装
  console.log('テキストメッセージ受信:', event.message.text);
}

async function handlePostbackEventLocal(event) {
  if (handlePostbackEvent) {
    return handlePostbackEvent(event);
  }
  // フォールバック実装
  console.log('Postbackイベント受信:', event.postback.data);
}

async function handleTestReportLocal(event) {
  if (handleTestReport) {
    return handleTestReport(event);
  }
  // フォールバック実装
  console.log('テストレポート要求');
}