// index.js

require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { Client, middleware } = require('@line/bot-sdk');
const logger = require('./utils/logger');

// すべてのモジュールを初期化時にロード（高速化）
const parser = require('./metrics/parser');
const FortuneEngine = require('./core/fortune-engine');
const { FortuneCarouselBuilder } = require('./core/formatter/fortune-carousel');
const PaymentHandler = require('./core/premium/payment-handler');
const WaveFortuneEngine = require('./core/wave-fortune');
const MoonFortuneEngine = require('./core/moon-fortune');
const UserProfileManager = require('./core/database/profiles-db');
const ordersDB = require('./core/database/orders-db');

// loadHeavyModulesは互換性のために空関数として残す
function loadHeavyModules() {}

// ── ① 環境変数チェック
logger.log("✅ SECRET:", !!process.env.CHANNEL_SECRET);
logger.log("✅ TOKEN:", !!process.env.CHANNEL_ACCESS_TOKEN);
logger.log("✅ OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);

// ── ② LINEクライアント初期化
const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const app    = express();
const client = new Client(config);

// インスタンスを事前に作成（高速化）
const paymentHandler = new PaymentHandler();
const profileManager = UserProfileManager; // ProfilesDBはすでにインスタンス

function getPaymentHandler() {
  return paymentHandler;
}

function getProfileManager() {
  return profileManager;
}

// 静的ファイルの提供
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));

// Stripe Webhook（raw bodyが必要なので、他のミドルウェアの前に配置）
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripeWebhook = require('./api/stripe-webhook');
  await stripeWebhook(req, res);
});

// JSONボディパーサー（API用） - Stripe Webhookの後に配置
app.use('/api', express.json());


// ── ③ 重複防止
const recentMessageIds = new Set();
const recentPostbackIds = new Set();

// ── ④ Webhook
app.post('/webhook', middleware(config), async (req, res) => {
  logger.log("🔮 恋愛お告げボット - リクエスト受信");
  logger.log("📝 イベント数:", req.body.events?.length || 0);
  
  // X-Line-Retryヘッダーをチェック（リトライ回数）
  const retryCount = req.headers['x-line-retry'] || 0;
  if (retryCount > 0) {
    logger.log(`⚠️ リトライ検出: ${retryCount}回目のリトライ`);
  }

  // イベント処理を実行
  try {
    const promises = req.body.events.map(async event => {
      // 友達追加イベント
      if (event.type === 'follow') {
        return handleFollowEvent(event).catch(err => {
          console.error('❌ 友達追加イベントエラー:', err);
          console.error('❌ スタック:', err.stack);
        });
      }
      
      // テキストメッセージの処理（プロファイル入力）
      if (event.type === 'message' && event.message.type === 'text') {
        const userId = event.source.userId;
        const messageText = event.message.text;
        loadHeavyModules();
        
        // 「レポート状況」コマンドの処理
        if (messageText === 'レポート状況') {
          const orders = await ordersDB.getUserOrders(userId);
          const latestOrder = orders[0];
          
          if (!latestOrder) {
            // 未購入
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: '📢 レポート未購入\n\nプレミアム恋愛レポートをご希望の場合は、まず「占いを始める」と送信してください🌙'
            });
          }
          
          // ステータスに応じた返信
          if (latestOrder.status === 'completed' && latestOrder.report_url) {
            // 完成済み - カードを送信
            // paymentHandlerは既にインスタンス化済み
            const completionMessage = paymentHandler.generateCompletionMessage({
              reportUrl: latestOrder.report_url,
              orderId: latestOrder.id,
              success: true
            });
            return client.replyMessage(event.replyToken, completionMessage);
            
          } else if (latestOrder.status === 'generating' || latestOrder.status === 'paid') {
            // 生成中
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: '⏳ レポート生成中...\n\n現在あなた専用のレポートを作成しています。\nもう少しお待ちください（約2-3分）📝✨'
            });
            
          } else if (latestOrder.status === 'pending') {
            // 決済待ち
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: '💳 決済待ち\n\n決済が完了していません。\n決済ページをご確認ください。'
            });
            
          } else if (latestOrder.status === 'error') {
            // エラー
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: '❌ エラーが発生しました\n\nレポートの生成に失敗しました。\nサポートまでお問い合わせください。'
            });
          }
        }
        
        // 保留中のレポート完成通知をチェック
        const pendingNotifications = global.pendingNotifications || new Map();
        const notification = pendingNotifications.get(userId);
        
        if (notification && notification.type === 'report_complete') {
          logger.log('🔔 保留中のレポート完成通知を発見');
          
          // paymentHandlerは既にインスタンス化済み
          const completionMessage = paymentHandler.generateCompletionMessage({
            reportUrl: notification.reportUrl,
            orderId: notification.orderId,
            success: true
          });
          
          await client.replyMessage(event.replyToken, completionMessage);
          logger.log('✅ レポート完成通知を送信しました');
          
          // 通知を削除
          pendingNotifications.delete(userId);
          return;
        }
        
        // 通常のメッセージ処理
        return handleTextMessage(event).catch(err => {
          console.error('テキストメッセージ処理エラー:', err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `エラーが発生しました:\n${err.message}\n\nもう一度「占いを始める」と送信してください。`
          });
        });
      }
      
      // ファイルメッセージ（トーク履歴）の処理
      if (event.type === 'message' && event.message.type === 'file') {
        // 重複チェック
        if (recentMessageIds.has(event.message.id)) {
          logger.log("⏭️ 重複メッセージをスキップ:", event.message.id);
          return Promise.resolve();
        }
        recentMessageIds.add(event.message.id);
        
        // サイズ制限（1000件まで保持）
        if (recentMessageIds.size > 1000) {
          const firstKey = recentMessageIds.values().next().value;
          recentMessageIds.delete(firstKey);
        }
        
        return handleFortuneEvent(event).catch(err => {
          console.error('=== お告げ生成中にエラー ===', err);
          // エラーハンドリングはhandleFortuneEvent内で行うので、ここでは何もしない
        });
      }
      
      // postbackイベント（課金処理）の処理
      if (event.type === 'postback') {
        // postbackの重複チェック
        const postbackId = `${event.source.userId}_${event.postback.data}_${event.timestamp}`;
        if (recentPostbackIds.has(postbackId)) {
          logger.log("⏭️ 重複postbackをスキップ:", postbackId);
          return Promise.resolve();
        }
        recentPostbackIds.add(postbackId);
        
        // サイズ制限
        if (recentPostbackIds.size > 1000) {
          const firstKey = recentPostbackIds.values().next().value;
          recentPostbackIds.delete(firstKey);
        }
        
        return handlePostbackEvent(event).catch(err => {
          console.error('=== Postback処理中にエラー ===', err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `⚠️ エラーが発生しました:\n${err.message}\n\nもう一度お試しください。`
          });
        });
      }
      
      // テスト用：テキストメッセージでレポート生成をテスト
      if (event.type === 'message' && event.message.type === 'text' && 
          event.message.text === 'テストレポート') {
        return handleTestReport(event).catch(err => {
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

  // すべての処理が完了してから200を返す
  res.status(200).json({});
});


// ── ⑤ 友達追加イベント処理
async function handleFollowEvent(event) {
  logger.log('👋 新しい友達が追加されました');
  logger.log('📍 Reply Token:', event.replyToken);
  logger.log('👤 User ID:', event.source.userId);
  logger.log('🔑 Client exists:', !!client);
  logger.log('🔑 Access Token exists:', !!config.channelAccessToken);
  
  try {
    logger.log('📤 Flexメッセージ送信開始...');
    // 美しいウェルカムカードを送信
    const result = await client.replyMessage(event.replyToken, {
      type: 'flex',
      altText: '🌙 おつきさま診断へようこそ！',
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
                  text: 'おつきさま診断',
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
    logger.log('✅ ウェルカムカード送信成功:', result);
    return;
  } catch (error) {
    console.error('❌ ウェルカムカード送信失敗:', error);
    console.error('❌ エラー詳細:', error.message);
    console.error('❌ エラースタック:', error.stack);
    
    // フォールバック：シンプルなテキストメッセージ
    try {
      logger.log('📤 フォールバックメッセージ送信開始...');
      const fallbackResult = await client.replyMessage(event.replyToken, {
        type: 'text', 
        text: '🌙 おつきさま診断へようこそ！\n\n生年月日から二人の相性を診断します✨\n\n「診断を始める」と送信してください'
      });
      logger.log('✅ フォールバックメッセージ送信成功:', fallbackResult);
    } catch (fallbackError) {
      console.error('❌ フォールバックメッセージも失敗:', fallbackError);
      console.error('❌ フォールバックエラー詳細:', fallbackError.message);
    }
  }
  
  // 以下は実行されない（上でreturn）
  const userId = event.source.userId;
  
  try {
    logger.log('📮 リッチカード送信開始...');
    // 美しいウェルカムカードを送信
    const result = await client.replyMessage(event.replyToken, [
      {
        type: 'flex',
        altText: '🌙 おつきさま診断へようこそ！',
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
                    text: 'おつきさま診断',
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
      }
    ]);
    logger.log('✅ ウェルカムメッセージ送信完了:', result);
    
  } catch (error) {
    console.error('❌ 友達追加処理エラー:', error);
    console.error('❌ エラー詳細:', error.response?.data || error.message);
    
    // シンプルなテキストメッセージでリトライ
    try {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: '🌙 おつきさま診断へようこそ！\n\n「診断を始める」と送信して、あなたとお相手の相性を診断しましょう✨'
      });
      logger.log('✅ フォールバックメッセージ送信成功');
    } catch (fallbackError) {
      console.error('❌ フォールバックも失敗:', fallbackError);
    }
  }
}


// ── ⑥ テキストメッセージ処理
async function handleTextMessage(event) {
  const userId = event.source.userId;
  const text = event.message.text;
  
  try {
    // 占いを始める
    if (text === '占いを始める' || text === 'start') {
      // あなたの情報入力カード（生年月日と性別を一つのカードで）
      await client.replyMessage(event.replyToken, [
        {
          type: 'flex',
          altText: 'あなたの情報を入力',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'STEP 1/2',
                  size: 'xs',
                  color: '#ffffff'
                },
                {
                  type: 'text',
                  text: 'あなたの情報',
                  size: 'lg',
                  color: '#ffffff',
                  weight: 'bold'
                }
              ],
              backgroundColor: '#764ba2',
              paddingAll: '15px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '1️⃣ 生年月日',
                  size: 'sm',
                  weight: 'bold',
                  color: '#764ba2'
                },
                {
                  type: 'button',
                  action: {
                    type: 'datetimepicker',
                    label: '📅 生年月日を選択',
                    data: 'action=userBirthDate',
                    mode: 'date',
                    initial: '1995-01-01',
                    max: '2010-12-31',
                    min: '1950-01-01'
                  },
                  style: 'secondary'
                },
                {
                  type: 'separator',
                  margin: 'md'
                },
                {
                  type: 'text',
                  text: '2️⃣ 性別',
                  size: 'sm',
                  weight: 'bold',
                  color: '#764ba2',
                  margin: 'md'
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '👨 男性',
                        data: 'action=userGenderWithBirthDate&value=male'
                      },
                      style: 'secondary',
                      flex: 1
                    },
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '👩 女性',
                        data: 'action=userGenderWithBirthDate&value=female'
                      },
                      style: 'secondary',
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'text',
                  text: '※ まず生年月日を選択してから性別を選んでください',
                  size: 'xs',
                  color: '#999999',
                  wrap: true,
                  margin: 'md'
                }
              ]
            }
          }
        }
      ]);
      return;
    }
    
    // リセットコマンド
    if (text === 'リセット' || text === 'reset') {
      await getProfileManager().deleteProfile(userId);
      
      // リセット後、占いを始めるボタンを送信
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: 'プロファイルをリセットしました✨\n\nもう一度占いを始めるには「占いを始める」とメッセージを送信してください。',
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: '🔮 占いを始める',
                  text: '占いを始める'
                }
              }
            ]
          }
        }
      ]);
      return;
    }
    
    // プロファイルが完成していない場合
    const hasComplete = await getProfileManager().hasCompleteProfile(userId);
    if (!hasComplete) {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'おつきさま診断を始めるには「診断を始める」と送信してください🌙',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: '🔮 占いを始める',
                text: '占いを始める'
              }
            }
          ]
        }
      });
      return;
    }
    
    // プロファイルが完成している場合
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '占い結果を更新するには、トーク履歴ファイルを送信してください📁\n\n生年月日を変更したい場合は「リセット」と送信してください。'
    });
    
  } catch (error) {
    console.error('テキストメッセージ処理エラー:', error);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: 'エラーが発生しました。もう一度お試しください。'
    });
  }
}

// おつきさま診断結果を送信
async function sendMoonFortuneResult(replyToken, userId) {
  try {
    const profile = await getProfileManager().getProfile(userId);
    loadHeavyModules();
    const moonEngine = new MoonFortuneEngine();
    
    // おつきさま診断レポートを生成
    const moonReport = moonEngine.generateFreeReport(
      {
        birthDate: profile.birthDate,
        birthTime: profile.birthTime || '00:00',
        gender: profile.gender
      },
      {
        birthDate: profile.partnerBirthDate,
        birthTime: profile.partnerBirthTime || '00:00',
        gender: profile.partnerGender
      }
    );
    
    // フォーマット済みのテキストを取得
    const reportText = moonEngine.formatReportForLine(moonReport);
    
    // 結果を送信
    await client.replyMessage(replyToken, [
      {
        type: 'text',
        text: reportText
      },
      {
        type: 'text',
        text: '✨ より詳しい相性分析を見る ✨\n\nトーク履歴ファイルを送信すると、会話パターンから二人の深層心理を分析します！\n\n【プレミアム機能】\n・詳細なおつきさま相性分析\n・今後3ヶ月の関係性予測\n・ベストタイミングカレンダー\n・具体的なアプローチ方法\n\n今なら ¥1,980（通常 ¥2,980）'
      }
    ]);
    
  } catch (error) {
    console.error('おつきさま診断結果送信エラー:', error);
    await client.replyMessage(replyToken, {
      type: 'text',
      text: 'エラーが発生しました。もう一度お試しください。'
    });
  }
}

// ── ⑦ お告げ生成イベント処理
async function handleFortuneEvent(event) {
  logger.log('🔮 恋愛お告げ生成開始');
  logger.log('📱 イベントタイプ:', event.type);
  logger.log('📱 メッセージタイプ:', event.message?.type);
  
  const rateLimiter = require('./utils/rate-limiter');
  
  if (event.type !== 'message' || event.message.type !== 'file') {
    logger.log('⏭️ ファイルメッセージではないためスキップ');
    return;
  }

  const userId = event.source.userId;
  const startTime = Date.now();
  
  // タイムアウト設定（25秒）
  const timeout = setTimeout(() => {
    console.error('⏱️ タイムアウト: 処理が25秒を超えました');
    rateLimiter.sendMessage(client, userId, {
      type: 'text',
      text: '⏱️ 処理がタイムアウトしました。\nファイルサイズが大きすぎる可能性があります。\n\nもう一度お試しください。'
    }).catch(err => console.error('タイムアウトメッセージ送信エラー:', err));
  }, 25000);
  
  try {
    logger.log('📢 Step 1: 分析開始（メッセージは最後にまとめて送信）');
    // replyTokenは1回しか使えないので、分析開始メッセージはスキップし、
    // 最後の結果送信時にreplyTokenを使用する
    
    // ファイルダウンロード
    logger.log('📥 Step 2: トーク履歴を読み込み中...');
    const stream = await client.getMessageContent(event.message.id);
    logger.log('📥 Stream取得完了');
    
    const chunks = [];
    let chunkCount = 0;
    for await (const c of stream) {
      chunks.push(c);
      chunkCount++;
      if (chunkCount % 100 === 0) {
        logger.log(`📥 チャンク読み込み中: ${chunkCount}`);
      }
    }
    logger.log(`📥 総チャンク数: ${chunkCount}`);
    const rawText = Buffer.concat(chunks).toString('utf8');
    logger.log(`📥 テキストサイズ: ${rawText.length} 文字`);

    // メッセージ解析
    logger.log('📊 トーク履歴を分析中...');
    loadHeavyModules();
    const messages = parser.parseTLText(rawText);
    logger.log(`💬 メッセージ数: ${messages.length}`);
    
    // プロフィール取得
    let profile;
    try {
      profile = await client.getProfile(userId);
    } catch (err) {
      console.warn('プロフィール取得エラー:', err);
      profile = { displayName: 'あなた' };
    }
    
    // お告げ生成
    logger.log('🔮 運命のお告げを生成中...');
    loadHeavyModules();
    const fortuneEngine = new FortuneEngine();
    const fortune = await fortuneEngine.generateFortune(messages, userId, profile.displayName);
    
    // 波動系占いも生成
    logger.log('💫 波動恋愛診断を実行中...');
    loadHeavyModules();
    const waveEngine = new WaveFortuneEngine();
    const waveAnalysis = waveEngine.analyzeWaveVibration(messages);
    const waveResult = waveEngine.formatWaveFortuneResult(waveAnalysis);
    
    // 占い結果に波動診断を追加
    fortune.waveAnalysis = waveResult;
    
    // おつきさま診断も生成
    logger.log('🌙 おつきさま診断を実行中...');
    loadHeavyModules();
    const moonEngine = new MoonFortuneEngine();
    
    // ユーザープロファイルを取得（エラーを防ぐためtry-catch追加）
    let userProfile = null;
    try {
      userProfile = await getProfileManager().getProfile(userId);
    } catch (profileErr) {
      console.warn('プロファイル取得エラー（正常）:', profileErr.message);
    }
    
    let moonReport = null;
    
    if (userProfile && await getProfileManager().hasCompleteProfile(userId)) {
      // プロファイルが完成している場合は実際のデータを使用
      const userMoonProfile = {
        birthDate: userProfile.birthDate,
        birthTime: userProfile.birthTime || '00:00',
        gender: userProfile.gender
      };
      const partnerMoonProfile = {
        birthDate: userProfile.partnerBirthDate,
        birthTime: userProfile.partnerBirthTime || '00:00',
        gender: userProfile.partnerGender
      };
      moonReport = moonEngine.generateFreeReport(userMoonProfile, partnerMoonProfile);
    } else {
      // プロファイルがない場合はテストデータを使用
      const testUserProfile = {
        birthDate: '1998-04-30',
        birthTime: '08:10',
        gender: 'female'
      };
      const testPartnerProfile = {
        birthDate: '1995-08-15',
        birthTime: '12:00',
        gender: 'male'
      };
      moonReport = moonEngine.generateFreeReport(testUserProfile, testPartnerProfile);
    }
    
    fortune.moonAnalysis = moonReport;
    
    // カルーセル作成
    logger.log('🎨 お告げカルーセルを作成中...');
    loadHeavyModules();
    const builder = new FortuneCarouselBuilder(fortune, profile);
    const carousel = builder.build();
    
    // サイズチェック
    const totalSize = Buffer.byteLength(JSON.stringify(carousel), 'utf8');
    logger.log(`📦 カルーセルサイズ: ${totalSize} bytes`);
    if (totalSize > 25000) {
      console.warn('⚠️ Flex Message が 25KB を超えています！');
    }
    
    // 送信
    logger.log('📮 お告げを送信中...');
    logger.log('📊 カルーセル構造:', JSON.stringify(carousel, null, 2));
    
    try {
      // replyTokenが有効な場合はreplyMessageを使用（無料・無制限）
      if (event.replyToken && !event.replyToken.startsWith('00000000')) {
        logger.log('📮 replyMessageを使用（無料・無制限）');
        await client.replyMessage(event.replyToken, carousel);
      } else {
        logger.log('📮 pushMessageを使用（月間1000通制限）');
        await client.pushMessage(userId, carousel);
      }
    } catch (apiError) {
      console.error('🔥 LINE API エラー詳細:');
      console.error('  - Status:', apiError.statusCode);
      console.error('  - Message:', apiError.statusMessage);
      if (apiError.originalError?.response?.data) {
        console.error('  - Details:', JSON.stringify(apiError.originalError.response.data, null, 2));
      }
      throw apiError;
    }
    
    // 完了ログ
    clearTimeout(timeout); // タイムアウトをクリア
    const endTime = Date.now();
    logger.log(`✨ お告げ生成完了！ (処理時間: ${endTime - startTime}ms)`);
    
  } catch (error) {
    clearTimeout(timeout); // タイムアウトをクリア
    console.error('❌ エラー発生:', error);
    console.error('❌ エラースタック:', error.stack);
    
    // エラー時のフォールバック（429エラーの場合は送信しない）
    if (error.statusCode !== 429) {
      try {
        await rateLimiter.sendMessage(client, userId, {
          type: 'text',
          text: '🔮 申し訳ございません。星々からのメッセージを受信できませんでした。\n\nもう一度お試しいただくか、しばらく時間をおいてからお試しください。'
        });
      } catch (pushErr) {
        console.error('プッシュメッセージエラー:', pushErr);
      }
    } else {
      logger.log('⚠️ LINE APIレート制限に到達。エラーメッセージ送信をスキップ');
    }
  }
}

// ── ⑥ Postbackイベント処理
async function handlePostbackEvent(event) {
  logger.log('💳 Postback処理開始:', event.postback.data);
  logger.log('📅 Postback params:', event.postback.params);
  
  const userId = event.source.userId;
  
  // postback処理（日付選択と性別選択）
  if (event.postback.data.startsWith('action=')) {
    const params = new URLSearchParams(event.postback.data);
    const action = params.get('action');
    const value = params.get('value');
    const selectedDate = event.postback.params?.date; // YYYY-MM-DD format
    
    // ユーザーの生年月日選択
    if (action === 'userBirthDate') {
      // 即座にレスポンスを返す（重要）
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '✅ 生年月日を選択しました\n\n次に、上のカードから性別を選んでください'
        }
      ]);
      
      // プロファイル保存は非同期で実行（エラーが出ても無視）
      getProfileManager().saveProfile(userId, {
        birthDate: selectedDate
      }).catch(err => {
        console.error('生年月日保存エラー（無視）:', err);
      });
      
      return;
    }
    
    // ユーザーの性別選択（生年月日入力後）
    if (action === 'userGenderWithBirthDate') {
      const profile = await getProfileManager().getProfile(userId);
      
      // 生年月日が入力されているか確認
      if (!profile || !profile.birthDate) {
        await client.replyMessage(event.replyToken, [
          {
            type: 'text',
            text: '⚠️ まず生年月日を選択してください'
          }
        ]);
        return;
      }
      
      // 性別を保存
      await getProfileManager().saveProfile(userId, {
        gender: value
      });
      
      // お相手の情報入力カード
      await client.replyMessage(event.replyToken, [
        {
          type: 'flex',
          altText: 'お相手の情報を入力',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'STEP 2/2',
                  size: 'xs',
                  color: '#ffffff'
                },
                {
                  type: 'text',
                  text: 'お相手の情報',
                  size: 'lg',
                  color: '#ffffff',
                  weight: 'bold'
                }
              ],
              backgroundColor: '#764ba2',
              paddingAll: '15px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '1️⃣ 生年月日',
                  size: 'sm',
                  weight: 'bold',
                  color: '#764ba2'
                },
                {
                  type: 'button',
                  action: {
                    type: 'datetimepicker',
                    label: '📅 生年月日を選択',
                    data: 'action=partnerBirthDate',
                    mode: 'date',
                    initial: '1995-01-01',
                    max: '2010-12-31',
                    min: '1950-01-01'
                  },
                  style: 'secondary'
                },
                {
                  type: 'separator',
                  margin: 'md'
                },
                {
                  type: 'text',
                  text: '2️⃣ 性別',
                  size: 'sm',
                  weight: 'bold',
                  color: '#764ba2',
                  margin: 'md'
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '👨 男性',
                        data: 'action=partnerGenderWithBirthDate&value=male'
                      },
                      style: 'secondary',
                      flex: 1
                    },
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '👩 女性',
                        data: 'action=partnerGenderWithBirthDate&value=female'
                      },
                      style: 'secondary',
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'text',
                  text: '※ まず生年月日を選択してから性別を選んでください',
                  size: 'xs',
                  color: '#999999',
                  wrap: true,
                  margin: 'md'
                }
              ]
            }
          }
        }
      ]);
      return;
    }
    
    // お相手の生年月日選択
    if (action === 'partnerBirthDate') {
      // 生年月日を一時保存
      await getProfileManager().saveProfile(userId, {
        partnerBirthDate: selectedDate
      });
      
      // 生年月日選択後のメッセージ
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '✅ お相手の生年月日を選択しました\n\n次に、上のカードからお相手の性別を選んでください'
        }
      ]);
      return;
    }
    
    // 「知りたい！」ボタンが押された時
    if (action === 'want_more_analysis') {
      // トーク履歴送信の案内を送信
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '💕 もっと詳しく知りたいんですね！\n\n💬 LINEのトーク履歴を送信すると、会話パターンから二人の深層心理を分析します。\n\n具体的に分かること：\n✨ 会話の相性度\n✨ 感情の温度差\n✨ コミュニケーションパターン\n✨ 関係性の深さ\n✨ 将来の可能性'
        },
        {
          type: 'flex',
          altText: '📤 トーク履歴の送信方法',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '📤 トーク履歴の送信方法',
                  size: 'lg',
                  color: '#ffffff',
                  weight: 'bold',
                  align: 'center'
                }
              ],
              backgroundColor: '#06c755',
              paddingAll: '15px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '1️⃣',
                      size: 'lg',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: 'トークルームの右上「≡」をタップ',
                      size: 'md',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '2️⃣',
                      size: 'lg',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「設定」を選択',
                      size: 'md',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '3️⃣',
                      size: 'lg',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「トーク履歴のバックアップ」をタップ',
                      size: 'md',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '4️⃣',
                      size: 'lg',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「LINE」をタップ',
                      size: 'md',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '5️⃣',
                      size: 'lg',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「おつきさま診断🌙」をタップして転送',
                      size: 'md',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ]
                },
                {
                  type: 'separator',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '💡 ポイント',
                  weight: 'bold',
                  size: 'md',
                  color: '#06c755',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '• テキストファイル(.txt)が送信されます\n• 1ヶ月分以上のデータがおすすめ\n• 相手との会話が多いほど精度UP！',
                  size: 'sm',
                  color: '#666666',
                  wrap: true,
                  margin: 'sm'
                }
              ],
              paddingAll: '20px'
            }
          }
        },
        // 動画を直接送信
        {
          type: 'video',
          originalContentUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/videos/talk-history-tutorial.mp4`,
          previewImageUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/images/video-thumbnail.jpg`,
          trackingId: 'talk-history-tutorial'
        }
      ]);
      return;
    }
    
    // お相手の性別選択（生年月日入力後）
    if (action === 'partnerGenderWithBirthDate') {
      const profile = await getProfileManager().getProfile(userId);
      
      // お相手の生年月日が入力されているか確認
      if (!profile || !profile.partnerBirthDate) {
        await client.replyMessage(event.replyToken, [
          {
            type: 'text',
            text: '⚠️ まずお相手の生年月日を選択してください'
          }
        ]);
        return;
      }
      
      // 性別を保存してプロフィールを完成
      await getProfileManager().saveProfile(userId, {
        partnerGender: value,
        status: 'complete'
      });
      
      // おつきさま診断結果を生成
      loadHeavyModules();
    const moonEngine = new MoonFortuneEngine();
      const moonReport = moonEngine.generateFreeReport(
        {
          birthDate: profile.birthDate,
          birthTime: '00:00',
          gender: profile.gender || 'female'
        },
        {
          birthDate: profile.partnerBirthDate,
          birthTime: '00:00',
          gender: value
        }
      );
      
      // 複数カードで充実した結果を送信
      const compatScore = parseFloat(moonReport.compatibility.score);
      const starCount = Math.floor(compatScore / 20);
      
      // カルーセルで複数カードを送信
      await client.replyMessage(event.replyToken, [
        {
          type: 'flex',
          altText: '🌙 おつきさま診断の結果',
          contents: {
            type: 'carousel',
            contents: [
              // カード1: 総合相性
              {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '🌙 おつきさま診断',
                      size: 'xl',
                      color: '#ffffff',
                      weight: 'bold',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: `総合相性: ${compatScore}%`,
                      size: 'xxl',
                      color: '#ffd700',
                      align: 'center',
                      margin: 'md',
                      weight: 'bold'
                    },
                    {
                      type: 'text',
                      text: '★'.repeat(starCount) + '☆'.repeat(5 - starCount),
                      size: 'xxl',
                      color: '#ffd700',
                      align: 'center',
                      margin: 'sm'
                    }
                  ],
                  backgroundColor: '#764ba2',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: `【${moonReport.compatibility.level}】`,
                      weight: 'bold',
                      size: 'xl',
                      color: '#764ba2',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: moonReport.compatibility.description,
                      wrap: true,
                      size: 'md',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'xl'
                    },
                    {
                      type: 'text',
                      text: '🔮 相性のポイント',
                      weight: 'bold',
                      size: 'lg',
                      color: '#764ba2',
                      margin: 'xl'
                    },
                    {
                      type: 'text',
                      text: moonReport.compatibility.advice.slice(0, 2).join('\n\n'),
                      wrap: true,
                      size: 'sm',
                      margin: 'md',
                      color: '#555555'
                    }
                  ],
                  paddingAll: '20px'
                }
              },
              // カード2: あなたの月相タイプ
              {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'あなたのおつきさま',
                      size: 'lg',
                      color: '#ffffff',
                      weight: 'bold',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: `${moonReport.user.moonPhaseType.symbol}`,
                      size: '80px',
                      align: 'center',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: moonReport.user.moonPhaseType.name,
                      size: 'xl',
                      color: '#ffd700',
                      align: 'center',
                      weight: 'bold'
                    }
                  ],
                  backgroundColor: '#667eea',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: moonReport.user.moonPhaseType.traits,
                      weight: 'bold',
                      size: 'md',
                      color: '#667eea',
                      align: 'center'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.user.moonPhaseType.description,
                      wrap: true,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: '🌟 特徴キーワード',
                      weight: 'bold',
                      size: 'md',
                      color: '#667eea',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.user.moonPhaseType.keywords.join(' / '),
                      wrap: true,
                      size: 'sm',
                      margin: 'sm',
                      align: 'center',
                      color: '#555555'
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'lg',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '月齢:',
                          size: 'sm',
                          flex: 1
                        },
                        {
                          type: 'text',
                          text: `${moonReport.user.moonAge}日`,
                          size: 'sm',
                          align: 'end',
                          color: '#667eea'
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '輝面比:',
                          size: 'sm',
                          flex: 1
                        },
                        {
                          type: 'text',
                          text: `${moonReport.user.illumination}%`,
                          size: 'sm',
                          align: 'end',
                          color: '#667eea'
                        }
                      ]
                    }
                  ],
                  paddingAll: '20px'
                }
              },
              // カード3: お相手の月相タイプ
              {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'お相手のおつきさま',
                      size: 'lg',
                      color: '#ffffff',
                      weight: 'bold',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: `${moonReport.partner.moonPhaseType.symbol}`,
                      size: '80px',
                      align: 'center',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: moonReport.partner.moonPhaseType.name,
                      size: 'xl',
                      color: '#ffd700',
                      align: 'center',
                      weight: 'bold'
                    }
                  ],
                  backgroundColor: '#e91e63',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: moonReport.partner.moonPhaseType.traits,
                      weight: 'bold',
                      size: 'md',
                      color: '#e91e63',
                      align: 'center'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.partner.moonPhaseType.description,
                      wrap: true,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: '🌟 特徴キーワード',
                      weight: 'bold',
                      size: 'md',
                      color: '#e91e63',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.partner.moonPhaseType.keywords.join(' / '),
                      wrap: true,
                      size: 'sm',
                      margin: 'sm',
                      align: 'center',
                      color: '#555555'
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      margin: 'lg',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '月齢:',
                          size: 'sm',
                          flex: 1
                        },
                        {
                          type: 'text',
                          text: `${moonReport.partner.moonAge}日`,
                          size: 'sm',
                          align: 'end',
                          color: '#e91e63'
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'horizontal',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '輝面比:',
                          size: 'sm',
                          flex: 1
                        },
                        {
                          type: 'text',
                          text: `${moonReport.partner.illumination}%`,
                          size: 'sm',
                          align: 'end',
                          color: '#e91e63'
                        }
                      ]
                    }
                  ],
                  paddingAll: '20px'
                }
              },
              // カード4: 今月の運勢
              {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '🌃 今月の恋愛運',
                      size: 'xl',
                      color: '#ffffff',
                      weight: 'bold',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: `【${moonReport.monthlyFortune.fortune.level}】`,
                      size: 'lg',
                      color: '#ffd700',
                      align: 'center',
                      margin: 'md',
                      weight: 'bold'
                    }
                  ],
                  backgroundColor: '#ff6b6b',
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: '🌙 現在のおつきさま',
                      weight: 'bold',
                      size: 'md',
                      color: '#ff6b6b'
                    },
                    {
                      type: 'text',
                      text: `${moonReport.monthlyFortune.currentMoonSymbol} ${moonReport.monthlyFortune.currentMoonPhase}`,
                      size: 'sm',
                      margin: 'sm',
                      align: 'center'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: '💫 月からのメッセージ',
                      weight: 'bold',
                      size: 'md',
                      color: '#ff6b6b',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.monthlyFortune.fortune.message,
                      wrap: true,
                      size: 'sm',
                      margin: 'md'
                    },
                    {
                      type: 'separator',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: '🌟 ラッキーデー',
                      weight: 'bold',
                      size: 'md',
                      color: '#ff6b6b',
                      margin: 'lg'
                    },
                    {
                      type: 'text',
                      text: moonReport.monthlyFortune.luckyDays.length > 0 
                        ? moonReport.monthlyFortune.luckyDays.slice(0, 3).map(day => 
                            `${day.date}日 ${day.moonPhase}`
                          ).join('\n')
                        : '今月は内面を充実させる時期です',
                      wrap: true,
                      size: 'sm',
                      margin: 'md'
                    }
                  ],
                  paddingAll: '20px'
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  backgroundColor: '#f0f0f0',
                  paddingAll: '15px',
                  contents: [
                    {
                      type: 'text',
                      text: '🔮 もっと詳しく二人の相性を知りたいですか？',
                      wrap: true,
                      size: 'sm',
                      weight: 'bold',
                      color: '#333333',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: '会話パターンから深層心理を分析します',
                      wrap: true,
                      size: 'xs',
                      color: '#666666',
                      align: 'center',
                      margin: 'sm'
                    },
                    {
                      type: 'button',
                      action: {
                        type: 'postback',
                        label: '💖 知りたい！',
                        data: 'action=want_more_analysis'
                      },
                      style: 'primary',
                      color: '#ff6b6b',
                      height: 'md'
                    }
                  ]
                }
              }
            ]
          }
        }
      ]);
      return;
    }
  }
  
  // 既存の課金処理用のJSONパース
  const postbackData = JSON.parse(event.postback.data);
  
  try {
    // プロフィール取得
    let profile;
    try {
      profile = await client.getProfile(userId);
    } catch (err) {
      console.warn('プロフィール取得エラー:', err);
      profile = { displayName: 'あなた', userId };
    }
    
    // アクションに応じて処理を分岐
    switch (postbackData.action) {
      case 'order_premium_report':
        return await handlePremiumReportOrder(event, userId, profile);
        
      case 'payment_success':
        return await handlePaymentSuccess(postbackData.orderId, userId);
        
      default:
        logger.log('未知のpostbackアクション:', postbackData.action);
        return;
    }
    
  } catch (error) {
    console.error('Postbackイベント処理エラー:', error);
    
    // 429エラー（レート制限）の場合はエラーメッセージを送信しない
    if (error.statusCode !== 429) {
      try {
        await client.pushMessage(userId, {
          type: 'text',
          text: '申し訳ございません。処理中にエラーが発生しました。サポートまでお問い合わせください。'
        });
      } catch (msgError) {
        console.error('エラーメッセージ送信失敗:', msgError.statusCode);
      }
    } else {
      logger.log('⚠️ LINE APIレート制限に到達。メッセージ送信をスキップ');
    }
  }
}

// 注文処理中のユーザーを記録（連打防止）
const processingOrders = new Set();

// ── ⑦ プレミアムレポート注文処理
async function handlePremiumReportOrder(event, userId, profile) {
  logger.log('📋 プレミアムレポート注文処理開始');
  
  // 連打防止チェック
  if (processingOrders.has(userId)) {
    logger.log('⚠️ 注文処理中のため無視:', userId);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '⏳ 処理中です...\n\n現在注文を処理しています。\nしばらくお待ちください。'
    });
  }
  
  // 処理中フラグを立てる
  processingOrders.add(userId);
  
  try {
    // 注文を処理
    const orderResult = await getPaymentHandler().handlePremiumOrderRequest(userId, profile);
    
    // 決済案内メッセージを送信
    const paymentMessage = getPaymentHandler().generatePaymentMessage(orderResult);
    
    // replyTokenが有効な場合はreplyMessageを使用（無料・無制限）
    if (event.replyToken && !event.replyToken.startsWith('00000000')) {
      logger.log('📮 replyMessageを使用（Postback応答・無料）');
      await client.replyMessage(event.replyToken, paymentMessage);
    } else {
      logger.log('📮 pushMessageを使用（月間制限あり）');
      const rateLimiter = require('./utils/rate-limiter');
      await rateLimiter.sendMessage(client, userId, paymentMessage);
    }
    
    logger.log('✅ 決済案内送信完了');
    
  } catch (error) {
    console.error('プレミアムレポート注文エラー:', error);
    
    // 429エラー（レート制限）の場合はエラーメッセージを送信しない
    if (error.statusCode !== 429) {
      try {
        await client.pushMessage(userId, {
          type: 'text',
          text: '申し訳ございません。注文処理中にエラーが発生しました。しばらく経ってから再度お試しください。'
        });
      } catch (msgError) {
        console.error('エラーメッセージ送信失敗:', msgError.statusCode);
      }
    } else {
      logger.log('⚠️ LINE APIレート制限に到達。メッセージ送信をスキップ');
    }
  } finally {
    // 処理中フラグをクリア（10秒後）
    setTimeout(() => {
      processingOrders.delete(userId);
      logger.log('🔓 注文処理フラグをクリア:', userId);
    }, 10000); // 10秒後にクリア
  }
}

// ── ⑧ 決済完了処理
async function handlePaymentSuccess(orderId, userId) {
  logger.log('💰 決済完了処理開始:', orderId);
  
  try {
    // まず購入完了メッセージを送信
    await client.pushMessage(userId, [
      {
        type: 'text',
        text: '✅ 購入完了しました！\n\n🔮 プレミアムレポートを作成中です...\n\n少々お待ちください（約1〜2分）'
      },
      {
        type: 'sticker',
        packageId: '11537',
        stickerId: '52002750' // LINEのローディングスタンプ
      }
    ]);
    
    // 注文に関連するメッセージ履歴を取得（実際の実装では保存されたデータから取得）
    // ここではプレースホルダーとして空配列を使用
    const messages = []; // 実際はデータベースから取得
    
    // 決済完了後の処理（レポート生成）
    const completionResult = await getPaymentHandler().handlePaymentSuccess(orderId, messages);
    
    // 完成通知メッセージを送信
    const completionMessages = getPaymentHandler().generateCompletionMessage(completionResult);
    
    if (Array.isArray(completionMessages)) {
      for (const message of completionMessages) {
        await client.pushMessage(userId, message);
      }
    } else {
      await client.pushMessage(userId, completionMessages);
    }
    
    logger.log('✅ レポート完成通知送信完了');
    
  } catch (error) {
    console.error('決済完了処理エラー:', error);
    
    await client.pushMessage(userId, {
      type: 'text',
      text: '決済は完了しましたが、レポート生成中にエラーが発生しました。サポートまでお問い合わせください。'
    });
  }
}

// ── テスト用：レポート生成テスト
async function handleTestReport(event) {
  logger.log('🧪 テストレポート生成開始');
  
  const userId = event.source.userId;
  
  try {
    // プロフィール取得
    let profile;
    try {
      profile = await client.getProfile(userId);
    } catch (err) {
      console.warn('プロフィール取得エラー:', err);
      profile = { displayName: 'テストユーザー', userId };
    }
    
    // テスト用のメッセージ履歴を作成
    const testMessages = generateTestMessages();
    
    // レポート生成
    await client.pushMessage(userId, {
      type: 'text',
      text: '🔮 テスト用プレミアムレポートを生成中です...\nしばらくお待ちください。'
    });
    
    // プレミアムレポートを生成
    const reportData = await getPaymentHandler().reportGenerator.generatePremiumReport(
      testMessages,
      userId,
      profile.displayName
    );
    
    // レポート内容をテキストで送信（PDF生成の代わり）
    await sendReportAsText(userId, reportData, profile.displayName);
    
    logger.log('✅ テストレポート送信完了');
    
  } catch (error) {
    console.error('テストレポート生成エラー:', error);
    
    await client.pushMessage(userId, {
      type: 'text',
      text: 'テストレポートの生成中にエラーが発生しました。'
    });
  }
}

// テスト用メッセージ履歴を生成
function generateTestMessages() {
  const now = new Date();
  const testMessages = [];
  
  // 過去1ヶ月のメッセージを生成
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // ユーザーのメッセージ
    testMessages.push({
      text: getRandomMessage(true, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    // 相手のメッセージ（返信）
    testMessages.push({
      text: getRandomMessage(false, i),
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      isUser: false
    });
  }
  
  return testMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// ランダムなメッセージを生成
function getRandomMessage(isUser, dayIndex) {
  const userMessages = [
    'おはよう！今日も一日頑張ろうね',
    '昨日見た映画がすごく面白かった！',
    'お疲れさま！今日はどんな一日だった？',
    '今度一緒にカフェでも行かない？',
    'ありがとう！すごく嬉しい😊',
    '最近どう？元気にしてる？',
    'その話面白そう！詳しく聞かせて',
    '今度の週末は何か予定ある？',
    'いつも優しくしてくれてありがとう',
    '一緒にいると楽しいです'
  ];
  
  const partnerMessages = [
    'おはよう！今日もよろしくお願いします',
    'それいいですね！私も見てみたいです',
    'お疲れさまでした。充実した一日でした',
    'いいですね！ぜひ行きましょう',
    'こちらこそありがとうございます😊',
    '元気です！心配してくれてありがとう',
    '実は最近こんなことがあって...',
    '特に予定はないです。何かあります？',
    'いつも気にかけてくれて嬉しいです',
    '私も一緒にいると安心します'
  ];
  
  const messages = isUser ? userMessages : partnerMessages;
  const randomIndex = (dayIndex + (isUser ? 0 : 5)) % messages.length;
  
  return messages[randomIndex];
}

// レポート内容をテキストメッセージで送信
async function sendReportAsText(userId, reportData, userName) {
  const messages = [];
  
  // 1. エグゼクティブサマリー
  messages.push({
    type: 'text',
    text: `🔮 ${userName}さん専用プレミアム恋愛レポート

📊 エグゼクティブサマリー
━━━━━━━━━━━━━━━━━━

総合相性スコア: ${reportData.executiveSummary.overallAssessment.score}点
グレード: ${reportData.executiveSummary.overallAssessment.grade}
評価: ${reportData.executiveSummary.overallAssessment.description}

🔍 主な発見事項:
${reportData.executiveSummary.keyFindings.map(finding => `• ${finding}`).join('\n')}

💡 重要な推奨事項:
${reportData.executiveSummary.recommendations.map(rec => `• ${rec}`).join('\n')}`
  });
  
  // 2. 詳細相性分析（一部）
  const compatibility = reportData.compatibilityAnalysis;
  messages.push({
    type: 'text',
    text: `💕 詳細相性分析

総合相性スコア: ${compatibility.overallCompatibilityScore}%

📈 カテゴリー別分析:
${Object.entries(compatibility.categoryBreakdown).map(([category, score]) => 
  `• ${category}: ${score}%`
).join('\n')}

⭐ 強みの分野:
${compatibility.strengthAreas.slice(0, 3).map(item => 
  `• ${item.item}: ${item.score}%`
).join('\n')}

⚠️ 改善が必要な分野:
${compatibility.improvementAreas.slice(0, 2).map(item => 
  `• ${item.item}: ${item.score}%`
).join('\n')}`
  });
  
  // 3. 月別予測（3ヶ月分）
  const forecast = reportData.monthlyForecast;
  messages.push({
    type: 'text',
    text: `📅 月別恋愛運勢カレンダー

🌟 年間概要: ${forecast.yearlyOverview}

📝 今後3ヶ月の詳細:
${forecast.monthlyDetails.slice(0, 3).map(month => 
  `${month.month} (${month.loveScore}%)
  テーマ: ${month.theme}
  チャンス: ${month.opportunities.slice(0, 2).join(', ')}
  注意点: ${month.cautions.slice(0, 1).join(', ')}`
).join('\n\n')}`
  });
  
  // 4. アクションプラン（優先度高のみ）
  messages.push({
    type: 'text',
    text: `🎯 パーソナライズドアクションプラン

総アクション数: ${reportData.actionPlan.totalActions}個

🔥 最優先アクション (Top 5):
${reportData.actionPlan.priorityActions.slice(0, 5).map((action, index) => 
  `${index + 1}. ${action.title}
     成功率: ${action.successRate}%
     タイミング: ${action.timing}
     説明: ${action.description.substring(0, 50)}...`
).join('\n\n')}`
  });
  
  // 5. 告白戦略
  const strategy = reportData.confessionStrategy;
  messages.push({
    type: 'text',
    text: `💖 告白成功の最適戦略

📊 現在の準備度: ${strategy.readinessAssessment.currentReadiness}%
⏰ 推定期間: ${strategy.readinessAssessment.timeframe}

🎯 戦略プラン:
• 最適タイミング: ${strategy.strategyPlan.timing}
• 推奨場所: ${strategy.strategyPlan.location}
• 告白方法: ${strategy.strategyPlan.method}

📝 必要なステップ:
${strategy.readinessAssessment.requiredSteps.slice(0, 3).map(step => `• ${step}`).join('\n')}`
  });
  
  // 6. 関係構築ロードマップ
  const roadmap = reportData.relationshipRoadmap;
  messages.push({
    type: 'text',
    text: `🗺️ 長期的な関係構築ロードマップ

📍 現在位置:
レベル ${roadmap.currentStage.level}: ${roadmap.currentStage.title}
評価: ${roadmap.currentStage.assessment}

🛤️ 次のステップ:
${roadmap.roadmap.slice(0, 2).map(milestone => 
  `レベル ${milestone.stage}: ${milestone.title}
  期間: ${milestone.estimatedTimeframe}
  目標: ${milestone.objectives.slice(0, 2).join(', ')}`
).join('\n\n')}

⭐ 全体タイムライン: ${roadmap.overallTimeline}`
  });
  
  // 7. 統計データ
  messages.push({
    type: 'text',
    text: `📊 付録：詳細統計データ

会話分析結果:
• 総メッセージ数: ${reportData.appendix.statisticalData?.totalMessages || '62'}件
• 平均メッセージ長: ${reportData.appendix.statisticalData?.averageLength || '28'}文字
• 返信率: ${reportData.appendix.statisticalData?.responseRate || '89%'}
• 平均返信時間: ${reportData.appendix.statisticalData?.averageResponseTime || '12分'}

━━━━━━━━━━━━━━━━━━

🔮 このレポートはおつきさま診断による詳細分析結果です
生成日時: ${new Date().toLocaleString('ja-JP')}
レポートID: ${reportData.metadata.reportId}

💎 実際のPDF版では、さらに詳細な
   グラフや図表も含まれます！`
  });
  
  // メッセージを順次送信
  for (let i = 0; i < messages.length; i++) {
    await client.pushMessage(userId, messages[i]);
    // メッセージ間に少し間隔を空ける
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// ── ⑨ 決済関連のルート（ローカルテスト用）
app.get('/payment/success', async (req, res) => {
  const paymentSuccess = require('./api/payment-success');
  await paymentSuccess(req, res);
});

app.get('/payment/cancel', async (req, res) => {
  const paymentCancel = require('./api/payment-cancel');
  await paymentCancel(req, res);
});

app.post('/api/payment-webhook', express.json(), async (req, res) => {
  const paymentWebhook = require('./api/payment-webhook');
  await paymentWebhook(req, res);
});

app.get('/api/download-report', async (req, res) => {
  const downloadReport = require('./api/download-report');
  await downloadReport(req, res);
});

app.get('/api/view-report', async (req, res) => {
  const viewReport = require('./api/view-report');
  await viewReport(req, res);
});

// ── ⑩ 起動
if (process.env.VERCEL !== '1') {
  // ローカル環境でのみサーバーを起動
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.log(`🔮 恋愛お告げボット起動: http://localhost:${port}`);
    logger.log('📡 Webhook URL: /webhook');
    logger.log(`💳 決済成功URL: http://localhost:${port}/payment/success`);
    logger.log('✨ 準備完了！トーク履歴を送信してください');
  });
}

module.exports = app;