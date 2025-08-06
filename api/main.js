// api/main.js - Vercel用のメインWebhookハンドラー
require('dotenv').config();
const { middleware, Client } = require('@line/bot-sdk');

// 環境変数チェック
console.log("✅ SECRET:", !!process.env.CHANNEL_SECRET);
console.log("✅ TOKEN:", !!process.env.CHANNEL_ACCESS_TOKEN);
console.log("✅ OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);

// LINEクライアント設定
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new Client(config);

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
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  console.log("📝 イベント数:", body.events?.length || 0);
  
  // リトライチェック
  const retryCount = req.headers['x-line-retry'] || 0;
  if (retryCount > 0) {
    console.log(`⚠️ リトライ検出: ${retryCount}回目のリトライ`);
  }

  // LINEに即座に200を返す
  res.status(200).json({});

  // ハンドラーをロード
  loadHandlers();

  // イベント処理は非同期で実行
  try {
    const events = body.events || [];
    const promises = events.map(async event => {
      // 友達追加イベント
      if (event.type === 'follow') {
        return handleFollowEventLocal(event).catch(err => {
          console.error('❌ 友達追加イベントエラー:', err);
        });
      }
      
      // テキストメッセージの処理
      if (event.type === 'message' && event.message.type === 'text') {
        return handleTextMessageLocal(event).catch(err => {
          console.error('テキストメッセージ処理エラー:', err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `エラーが発生しました:\n${err.message}\n\nもう一度「占いを始める」と送信してください。`
          });
        });
      }
      
      // Postbackイベント処理（生年月日入力など）
      if (event.type === 'postback') {
        const postbackId = `${event.source.userId}_${event.postback.data}_${event.timestamp}`;
        
        if (recentPostbackIds.has(postbackId)) {
          console.log("⏭️ 重複postbackをスキップ:", postbackId);
          return Promise.resolve();
        }
        recentPostbackIds.add(postbackId);
        
        // サイズ制限
        if (recentPostbackIds.size > 1000) {
          const firstKey = recentPostbackIds.values().next().value;
          recentPostbackIds.delete(firstKey);
        }
        
        return handlePostbackEventLocal(event).catch(err => {
          console.error('=== Postback処理中にエラー ===', err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `⚠️ エラーが発生しました:\n${err.message}\n\nもう一度お試しください。`
          });
        });
      }
      
      // テスト用レポート生成
      if (event.type === 'message' && event.message.type === 'text' && 
          event.message.text === 'テストレポート') {
        return handleTestReportLocal(event).catch(err => {
          console.error('=== テストレポート生成エラー ===', err);
          return client.pushMessage(event.source.userId, {
            type: 'text',
            text: '⚠️ テストレポートの生成中にエラーが発生しました。'
          }).catch(pushErr => console.error('Push message error:', pushErr));
        });
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  } catch (fatal) {
    console.error('🌋 致命的なエラー', fatal);
  }
};

// ローカル版のハンドラー関数（index.jsの関数が使えない場合のフォールバック）
async function handleFollowEventLocal(event) {
  console.log('👋 新しい友達が追加されました (Vercel)');
  
  try {
    // 美しいウェルカムカードを送信
    await client.replyMessage(event.replyToken, {
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
    console.log('✅ ウェルカムカード送信成功');
  } catch (error) {
    console.error('❌ ウェルカムカード送信失敗:', error.message);
    // フォールバック
    try {
      await client.replyMessage(event.replyToken, {
        type: 'text', 
        text: '🌙 月相恋愛占いへようこそ！\n\n生年月日から二人の相性を占います✨\n\n「占いを始める」と送信してください'
      });
    } catch (fallbackError) {
      console.error('❌ フォールバックメッセージも失敗:', fallbackError.message);
    }
  }
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