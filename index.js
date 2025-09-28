// index.js

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { Client, middleware } = require('@line/bot-sdk');
const logger = require('./utils/logger');

// テスト用メッセージ生成関数
function generateTestMessages() {
  const messages = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    messages.push({
      text: 'こんにちは！今日も元気です',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    
    messages.push({
      text: 'こちらこそ！良い一日を',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 1000).toISOString(),
      isUser: false
    });
  }
  
  return messages;
}

// すべてのモジュールを初期化時にロード（高速化）
const parser = require('./metrics/parser');
const FortuneEngine = require('./core/fortune-engine');
const { FortuneCarouselBuilder } = require('./core/formatter/fortune-carousel');
const PaymentHandler = require('./core/premium/payment-handler');
const WaveFortuneEngine = require('./core/wave-fortune');
const MoonFortuneEngineV2 = require('./core/moon-fortune-v2');
const UserProfileManager = require('./core/database/profiles-db');
const ordersDB = require('./core/database/orders-db');
const { formatMoonReportV2 } = require('./utils/moon-formatter-v2');

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
  const stripeWebhook = require('./api/stripe-webhook-simple');
  await stripeWebhook(req, res);
});

// JSONボディパーサー（API用） - Stripe Webhookの後に配置
app.use('/api', express.json());
// URLエンコードされたフォームデータ用
app.use('/api', express.urlencoded({ extended: true }));

// 古いエンドポイントは削除（新しいフローを使用）

// プロフィールフォーム（V2に統合）
app.all('/api/profile-form', async (req, res) => {
  const profileFormV2 = require('./api/profile-form-v2');
  await profileFormV2(req, res);
});

// 新しいAPIエンドポイント（V2）
app.all('/api/profile-form-v2', async (req, res) => {
  const profileFormV2 = require('./api/profile-form-v2');
  await profileFormV2(req, res);
});

// Checkout Session作成
app.post('/api/create-checkout-session', async (req, res) => {
  const createCheckout = require('./api/create-checkout-session');
  await createCheckout(req, res);
});

// Payment Webhook V2
app.post('/api/payment-webhook-v2', express.raw({ type: 'application/json' }), async (req, res) => {
  const paymentWebhook = require('./api/payment-webhook-v2');
  await paymentWebhook(req, res);
});

// プロフィール保存成功ページ（廃止 - 直接HTMLを返す）
app.get('/api/profile-form-success', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>保存完了</title>
    </head>
    <body>
      <h1>プロフィール保存完了</h1>
      <p>プロフィールが正常に保存されました。</p>
      <p>LINEアプリに戻ってご利用ください。</p>
    </body>
    </html>
  `);
});

// プロファイル取得API
app.get('/api/get-love-profile', async (req, res) => {
  const getLoveProfile = require('./api/get-love-profile');
  await getLoveProfile(req, res);
});

// タロット権限管理API
app.post('/api/tarot-permission', async (req, res) => {
  const tarotPermission = require('./api/tarot-permission');
  await tarotPermission(req, res);
});

// リッチメニューからのタロットページアクセス
// LINEリッチメニューには固定URLしか設定できないため、
// このエンドポイントでユーザーIDを取得してリダイレクト
app.get('/tarot', (req, res) => {
  // LINEからのアクセスでユーザーIDが渡される場合
  const userId = req.query.userId || req.headers['x-line-userid'];
  
  if (userId) {
    // ユーザーIDがある場合はパラメータ付きでリダイレクト
    res.redirect(`/moon-tarot.html?userId=${userId}`);
  } else {
    // ユーザーIDがない場合は、LINE内ブラウザから直接アクセスさせる
    res.redirect('/moon-tarot.html');
  }
});

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
        
        // 本格テストコマンド - 完全版表示（テスト用）
        if (messageText === '本格テスト') {
          logger.log('🧪 本格テストコマンド受信:', userId);
          
          try {
            // 最新の診断IDを取得
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
              process.env.SUPABASE_URL,
              process.env.SUPABASE_ANON_KEY
            );
          
          // ユーザーの最新診断を取得
          const { data: diagnosis } = await supabase
            .from('diagnoses')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
            if (diagnosis) {
              const testUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/lp-otsukisama-unified.html?id=${diagnosis.id}&userId=${userId}&test=true`;
              
              return client.replyMessage(event.replyToken, {
              type: 'flex',
              altText: '🧪 テスト用完全版リンク',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#ff6b6b',
                  contents: [
                    {
                      type: 'text',
                      text: '🧪 テスト用完全版',
                      color: '#ffffff',
                      size: 'xl',
                      weight: 'bold',
                      align: 'center'
                    },
                    {
                      type: 'text',
                      text: '（権限チェックをバイパス）',
                      color: '#ffcccc',
                      size: 'sm',
                      align: 'center',
                      margin: 'sm'
                    }
                  ],
                  paddingAll: '20px'
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'text',
                      text: '診断結果の完全版を確認できます',
                      wrap: true,
                      size: 'md'
                    },
                    {
                      type: 'text',
                      text: '※このリンクは権限チェックをバイパスして全文を表示します',
                      wrap: true,
                      size: 'sm',
                      color: '#ff0000',
                      weight: 'bold',
                      margin: 'md'
                    },
                    {
                      type: 'text',
                      text: `診断ID: ${diagnosis.id}`,
                      size: 'xs',
                      color: '#666666',
                      margin: 'lg'
                    }
                  ],
                  paddingAll: '20px'
                },
                footer: {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'button',
                      action: {
                        type: 'uri',
                        label: '完全版を確認する',
                        uri: testUrl
                      },
                      style: 'primary',
                      color: '#ff6b6b',
                      height: 'sm'
                    }
                  ],
                  paddingAll: '10px'
                }
              }
            });
            } else {
              return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '診断データが見つかりません。\nまず診断を完了してください。'
              });
            }
          } catch (error) {
            logger.log('❌ 本格テストコマンドエラー:', error);
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: `エラーが発生しました:\n${error.message}\n\n診断を完了してから再度お試しください。`
            });
          }
        }
        
        // プロフィール保存完了通知を受け取った場合
        if (messageText === '診断開始' || messageText === '保存完了') {
          const profile = await profileManager.getProfile(userId);
          let result = profile?.lastFortuneResult;
          
          // データベースにない場合はファイルから読み込み
          if (!result) {
            try {
              const fs = require('fs').promises;
              const path = require('path');
              const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, '../data/temp');
              const fortuneData = await fs.readFile(
                path.join(tempDir, `${userId}_fortune.json`),
                'utf8'
              );
              result = JSON.parse(fortuneData);
            } catch (err) {
              console.log('診断結果ファイルが見つかりません:', err.message);
            }
          }
          
          if (result) {
            const message = {
              type: 'flex',
              altText: '🌙 月の相性診断結果',
              contents: {
                type: 'bubble',
                size: 'mega',
                header: {
                  type: 'box',
                  layout: 'vertical',
                  backgroundColor: '#764ba2',
                  contents: [
                    {
                      type: 'text',
                      text: '🌙 月の相性診断結果',
                      color: '#ffffff',
                      size: 'xl',
                      weight: 'bold'
                    }
                  ]
                },
                body: {
                  type: 'box',
                  layout: 'vertical',
                  spacing: 'md',
                  contents: [
                    {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: `あなた: ${result.user.moonPhaseType.symbol} ${result.user.moonPhaseType.name}`,
                          size: 'lg',
                          weight: 'bold',
                          color: '#667eea'
                        },
                        {
                          type: 'text',
                          text: `お相手: ${result.partner.moonPhaseType.symbol} ${result.partner.moonPhaseType.name}`,
                          size: 'lg',
                          weight: 'bold',
                          color: '#667eea'
                        }
                      ]
                    },
                    {
                      type: 'separator'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '相性スコア',
                          size: 'sm',
                          color: '#aaaaaa'
                        },
                        {
                          type: 'text',
                          text: `${result.compatibility.score}%`,
                          size: 'xxl',
                          weight: 'bold',
                          align: 'center',
                          color: '#764ba2'
                        },
                        {
                          type: 'text',
                          text: result.compatibility.level,
                          size: 'md',
                          align: 'center',
                          color: '#667eea'
                        }
                      ]
                    },
                    {
                      type: 'separator'
                    },
                    {
                      type: 'text',
                      text: result.compatibility.description,
                      wrap: true,
                      size: 'sm',
                      color: '#666666'
                    },
                    {
                      type: 'text',
                      text: '💫 アドバイス',
                      margin: 'lg',
                      size: 'md',
                      weight: 'bold',
                      color: '#667eea'
                    },
                    {
                      type: 'text',
                      text: Array.isArray(result.compatibility.advice) 
                        ? result.compatibility.advice.join(' ') 
                        : result.compatibility.advice,
                      wrap: true,
                      size: 'sm',
                      color: '#666666'
                    }
                  ]
                }
              }
            };
            
            return client.replyMessage(event.replyToken, message);
          } else {
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: 'プロフィール設定が完了していません。\n「プロフィール設定」と送信してください。'
            });
          }
        }
        
        // プロフィール設定（友だち登録時と同じデザイン）
        if (messageText === 'プロフィール設定' || messageText === 'プロフィール') {
          const formUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/api/profile-form?userId=${userId}`;
          
          return client.replyMessage(event.replyToken, {
            type: 'flex',
            altText: '🌙 おつきさま診断',
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
                        size: '80px',
                        align: 'center'
                      },
                      {
                        type: 'text',
                        text: 'おつきさま診断',
                        weight: 'bold',
                        size: 'xxl',
                        margin: 'md',
                        align: 'center',
                        color: '#ffffff'
                      },
                      {
                        type: 'text',
                        text: '〜月の満ち欠けが導く二人の運命〜',
                        size: 'sm',
                        color: '#e0e0e0',
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
                        text: '📝 二人の情報を入力',
                        weight: 'bold',
                        size: 'sm',
                        color: '#764ba2'
                      },
                      {
                        type: 'text',
                        text: 'より正確な診断のために',
                        size: 'sm',
                        margin: 'sm'
                      },
                      {
                        type: 'text',
                        text: '生年月日をお教えください',
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
                      type: 'uri',
                      label: '🔮 情報を入力する',
                      uri: formUrl
                    },
                    color: '#764ba2'
                  },
                  {
                    type: 'button',
                    style: 'primary',
                    height: 'md',
                    action: {
                      type: 'message',
                      label: '診断結果を見る',
                      text: '診断結果'
                    },
                    color: '#667eea'
                  }
                ]
              }
            }
          });
        }
        
        // 生成中の注文がある場合の処理を削除
        // 「レポート状況」コマンドで適切に処理される
        
        // Batch APIデバッグコマンド（後で削除）
        if (messageText === 'バッチ' || messageText === 'batch') {
          console.log('🔍 Batch debug command received from:', userId);
          
          try {
            const batchResult = await ordersDB.getBatchResult(userId);
            
            if (!batchResult) {
              return client.replyMessage(event.replyToken, {
                type: 'text',
                text: '⚠️ Batch結果が見つかりません\n\nまだレポート生成を実行していないか、データが削除されています。'
              });
            }
            
            // AI Insightsの内容を整形
            let aiInsightsInfo = '';
            let parsedAIContent = null;
            
            // Raw contentからAI分析結果を抽出
            if (batchResult.rawContent) {
              try {
                // レスポンス全体をパース
                const lines = batchResult.rawContent.split('\n').filter(line => line.trim());
                for (const line of lines) {
                  try {
                    const parsed = JSON.parse(line);
                    if (parsed.response?.body?.choices?.[0]?.message?.content) {
                      const aiContentStr = parsed.response.body.choices[0].message.content;
                      parsedAIContent = JSON.parse(aiContentStr);
                      break;
                    }
                  } catch (e) {
                    // この行はJSONではない、次へ
                  }
                }
              } catch (e) {
                console.error('Error parsing batch content:', e);
              }
            }
            
            // AI Insightsの内容を表示用に整形（全文表示）
            if (parsedAIContent || batchResult.aiInsights || batchResult.aiInsightsPreview) {
              const insights = parsedAIContent || batchResult.aiInsights || batchResult.aiInsightsPreview;
              
              // 完全な内容をJSON形式で表示（見やすく整形）
              aiInsightsInfo = '\n\n🤖 === AI分析結果（完全版） ===\n';
              aiInsightsInfo += JSON.stringify(insights, null, 2);
              
              // LINEの文字数制限（5000文字）を考慮
              if (aiInsightsInfo.length > 4500) {
                // 制限に収まるように分割情報を追加
                const truncated = aiInsightsInfo.substring(0, 4400);
                aiInsightsInfo = truncated + '\n\n⚠️ 文字数制限により一部省略されています。\n完全な内容は複数回に分けて送信します。';
                
                // 残りの部分を保存（後で別メッセージとして送信可能）
                console.log('📄 AI Insights完全版（コンソール出力）:');
                console.log(JSON.stringify(insights, null, 2));
              }
            }
            
            // メッセージを分割して送信する準備
            const messages = [];
            
            // 1. 基本情報
            const basicInfo = `📦 Batch API Debug Info
━━━━━━━━━━━━━━━━━
🆔 Batch ID: ${batchResult.batchId || 'N/A'}
📅 Time: ${batchResult.timestamp || 'N/A'}
✅ Status: ${batchResult.status || 'N/A'}
📊 Parsed: ${batchResult.parsedResults?.length || 0} results
📝 Raw Size: ${Math.round((batchResult.rawContent?.length || 0) / 1024)}KB
${parsedAIContent || batchResult.aiInsights || batchResult.aiInsightsPreview ? '✅ AI Insights: 取得成功' : '❌ AI Insights: なし'}`;
            
            // 2. AI分析結果がある場合は人間が理解しやすい形式で表示
            if (parsedAIContent || batchResult.aiInsights || batchResult.aiInsightsPreview) {
              const insights = parsedAIContent || batchResult.aiInsights || batchResult.aiInsightsPreview;
              
              // 基本情報を最初のメッセージとして追加
              messages.push({
                type: 'text',
                text: basicInfo
              });
              
              // 個別化された手紙があるか確認（最優先で表示）
              if (insights.personalizedLetter) {
                let letterText = '🌙 === 月詠からの特別なメッセージ ===\n\n';
                letterText += insights.personalizedLetter;
                
                // 文字数制限を考慮して分割
                if (letterText.length > 4500) {
                  const part1 = letterText.substring(0, 4400);
                  const part2 = letterText.substring(4400);
                  messages.push({
                    type: 'text',
                    text: part1 + '\n\n（続く...）'
                  });
                  if (part2.length > 50) {
                    messages.push({
                      type: 'text',
                      text: '（続き）\n\n' + part2
                    });
                  }
                } else {
                  messages.push({
                    type: 'text',
                    text: letterText
                  });
                }
              }
              
              // 月詠コメントがあるか確認
              if (insights.tsukuyomiComments) {
                let tsukuyomiText = '🌙 === 月詠からのメッセージ ===\n\n';
                const comments = insights.tsukuyomiComments;
                
                if (comments.weeklyPattern) {
                  tsukuyomiText += '【曜日別パターン】\n' + comments.weeklyPattern + '\n\n';
                }
                if (comments.hourlyPattern) {
                  tsukuyomiText += '【時間帯パターン】\n' + comments.hourlyPattern + '\n\n';
                }
                if (comments.conversationQuality) {
                  tsukuyomiText += '【会話の質】\n' + comments.conversationQuality + '\n\n';
                }
                if (comments.overallDiagnosis) {
                  tsukuyomiText += '【総合診断】\n' + comments.overallDiagnosis + '\n\n';
                }
                if (comments.fivePillars) {
                  tsukuyomiText += '【5つの柱】\n' + comments.fivePillars + '\n\n';
                }
                if (comments.futurePrediction) {
                  tsukuyomiText += '【未来予測】\n' + comments.futurePrediction;
                }
                
                // 文字数制限を考慮して分割
                if (tsukuyomiText.length > 4500) {
                  const part1 = tsukuyomiText.substring(0, 4400);
                  const part2 = tsukuyomiText.substring(4400);
                  messages.push({
                    type: 'text',
                    text: part1 + '\n\n（続く...）'
                  });
                  if (part2.length > 50) {
                    messages.push({
                      type: 'text',
                      text: '（続き）\n\n' + part2
                    });
                  }
                } else {
                  messages.push({
                    type: 'text',
                    text: tsukuyomiText
                  });
                }
              }
              
              // 関係性タイプ
              if (insights.relationshipType) {
                let relationText = '💕 === 関係性の分析 ===\n\n';
                relationText += `【関係性タイプ】\n${insights.relationshipType.title || '不明'}\n\n`;
                relationText += `【説明】\n${insights.relationshipType.description || '詳細なし'}\n\n`;
                
                if (insights.relationshipStage) {
                  relationText += `【関係性ステージ】${insights.relationshipStage}/10\n\n`;
                }
                
                if (insights.personality && insights.personality.length > 0) {
                  relationText += `【性格特徴】\n• ${insights.personality.join('\n• ')}\n\n`;
                }
                
                if (insights.interests && insights.interests.length > 0) {
                  relationText += `【共通の興味】\n• ${insights.interests.join('\n• ')}\n\n`;
                }
                
                messages.push({
                  type: 'text',
                  text: relationText
                });
              }
              
              // アクションプラン
              if (insights.suggestedActions && insights.suggestedActions.length > 0) {
                let actionText = '🎯 === アクションプラン ===\n\n';
                insights.suggestedActions.forEach((action, index) => {
                  actionText += `【${index + 1}. ${action.title}】\n`;
                  actionText += `${action.action}\n`;
                  if (action.moonGuidance) {
                    actionText += `💫 ${action.moonGuidance}\n`;
                  }
                  actionText += `⏰ タイミング: ${action.timing}\n`;
                  actionText += `📊 成功率: ${action.successRate}%\n\n`;
                });
                
                messages.push({
                  type: 'text',
                  text: actionText
                });
              }
              
              // 未来予測
              if (insights.futureSigns) {
                let futureText = '🔮 === 未来予測（3ヶ月後） ===\n\n';
                if (insights.futureSigns.threeMonthPrediction) {
                  futureText += insights.futureSigns.threeMonthPrediction + '\n\n';
                }
                futureText += `【より深い対話】${insights.futureSigns.deepTalk || '不明'}\n`;
                futureText += `【新しい始まり】${insights.futureSigns.newBeginning || '不明'}\n`;
                futureText += `【感情の深まり】${insights.futureSigns.emotionalDepth || '不明'}\n`;
                
                messages.push({
                  type: 'text',
                  text: futureText
                });
              }
              
              // 最大5メッセージまで（LINE APIの制限）
              if (messages.length > 5) {
                // 重要な情報を優先して5つに収める
                const prioritized = [
                  messages[0], // 基本情報
                  messages[1], // 月詠コメント
                  messages[2], // 関係性
                  messages[3], // アクションプラン
                  messages[4]  // 未来予測
                ].filter(msg => msg);
                
                messages.splice(0, messages.length, ...prioritized.slice(0, 5));
                
                if (messages.length === 5) {
                  messages[4] = {
                    type: 'text',
                    text: messages[4].text + '\n\n📌 完全な分析結果はレポートでご確認ください。'
                  };
                }
              }
            } else {
              // AI分析結果がない場合
              messages.push({
                type: 'text',
                text: basicInfo + '\n\n❌ AI分析結果が見つかりません\n\n考えられる原因:\n• まだAI分析が完了していない\n• バッチ処理でエラーが発生した\n• プロンプトの応答形式に問題がある\n\n「レポート状況」で現在の状態を確認してください。'
              });
            }
            
            return client.replyMessage(event.replyToken, messages);
            
          } catch (error) {
            console.error('Batch debug error:', error);
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: `❌ エラー: ${error.message}`
            });
          }
        }
        
        // 「レポート」コマンドで最新のレポートを表示
        if (messageText === 'レポート' || messageText === 'れぽーと') {
          const orders = await ordersDB.getUserOrders(userId);
          const completedOrder = orders.find(order => 
            order.status === 'completed' && order.report_url
          );
          
          if (completedOrder) {
            // 完成したレポートがある場合
            const completionMessage = paymentHandler.generateCompletionMessage({
              success: true,
              reportUrl: completedOrder.report_url,
              orderId: completedOrder.id
            });
            return client.replyMessage(event.replyToken, completionMessage);
          }
          
          // 生成中の注文を確認
          const generatingOrder = orders.find(order => 
            order.status === 'generating' || order.status === 'paid' ||
            (order.status && order.status.startsWith('generating_step_'))
          );
          
          if (generatingOrder) {
            // ステータスから進捗を取得
            let progressText = '生成中...';
            if (generatingOrder.status && generatingOrder.status.startsWith('generating_step_')) {
              const step = generatingOrder.status.replace('generating_step_', '');
              progressText = `ステップ ${step}/5 処理中...`;
            }
            
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: `⏳ レポート生成中\n\n${progressText}\n\n完成まで約1-2分お待ちください。\n完成後は「レポート」と送信して確認してください。`
            });
          }
          
          // レポートがない場合
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '📊 レポートはありません\n\nプレミアムレポートを購入するには「占いを始める」と送信してください。'
          });
        }
        
        // 「レポート履歴」コマンドの処理
        if (messageText === 'レポート履歴' || messageText === '購入履歴') {
          const orders = await ordersDB.getUserOrders(userId);
          const completedOrders = orders.filter(order => 
            order.status === 'completed' && order.report_url
          );
          
          if (completedOrders.length === 0) {
            return client.replyMessage(event.replyToken, {
              type: 'text',
              text: '📚 購入履歴はありません\n\nプレミアムレポートを購入すると、ここに履歴が表示されます。'
            });
          }
          
          // 履歴リストを作成
          const historyText = completedOrders.slice(0, 5).map((order, index) => {
            const date = new Date(order.created_at).toLocaleDateString('ja-JP');
            return `${index + 1}. ${date} - 完成済み`;
          }).join('\n');
          
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: `📚 購入履歴（最新5件）\n\n${historyText}\n\n最新のレポートを見るには「レポート」と送信してください。`
          });
        }
        
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
        
        // pendingNotificationsは使用しない（削除）
        
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
  
  const userId = event.source.userId;
  const formUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/api/profile-form?userId=${userId}`;
  
  try {
    logger.log('📤 プロフィール設定カード送信開始...');
    // プロフィール設定カードを送信
    const result = await client.replyMessage(event.replyToken, {
      type: 'flex',
      altText: '🌙 月タロット占いへようこそ！',
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
                  color: '#ffffff',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '月タロット占いへようこそ',
                  size: 'xl',
                  color: '#ffffff',
                  align: 'center',
                  weight: 'bold',
                  margin: 'md'
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
              text: '私は月詠（つくよみ）と申します',
              size: 'md',
              wrap: true,
              align: 'center'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'text',
              text: '月のカードがあなたの',
              size: 'md',
              wrap: true,
              align: 'center',
              margin: 'md'
            },
            {
              type: 'text',
              text: '今日の恋愛運を導きます',
              size: 'md',
              wrap: true,
              align: 'center',
              margin: 'sm'
            },
            {
              type: 'text',
              text: '特別なメッセージをお伝えします',
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
                  text: '✨ 月タロット占いの流れ',
                  weight: 'bold',
                  size: 'sm',
                  color: '#764ba2'
                },
                {
                  type: 'text',
                  text: '一、まずはあなたの情報を教えてください',
                  size: 'sm',
                  margin: 'sm'
                },
                {
                  type: 'text',
                  text: '二、月にメッセージを送ります',
                  size: 'sm'
                },
                {
                  type: 'text',
                  text: '三、月のカードがあなたの運勢を占います',
                  size: 'sm'
                },
                {
                  type: 'text',
                  text: '　　特別なメッセージをお届けします',
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
                type: 'uri',
                label: '🔮 情報を入力する',
                uri: formUrl
              },
              color: '#764ba2'
            },
            {
              type: 'button',
              style: 'primary',
              height: 'md',
              action: {
                type: 'message',
                label: '月タロット占いを受ける',
                text: '月タロット占い'
              },
              color: '#667eea'
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
        text: '🌙 私は月詠（つくよみ）と申します…\n\nあなたと大切な方の心に映る月の姿を視させていただきましょう\n\n「診断を始める」と… 囁いてください…'
      });
      logger.log('✅ フォールバックメッセージ送信成功:', fallbackResult);
    } catch (fallbackError) {
      console.error('❌ フォールバックメッセージも失敗:', fallbackError);
      console.error('❌ フォールバックエラー詳細:', fallbackError.message);
    }
  }
}


// ── ⑥ テキストメッセージ処理
async function handleTextMessage(event) {
  const userId = event.source.userId;
  const text = event.message.text;
  
  try {
    // 「履歴」キーワードで購入履歴を表示
    if (text === '履歴') {
      // Supabaseから購入履歴を取得
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
      
      if (!supabase) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '申し訳ございません。現在履歴を取得できません。'
        });
        return;
      }
      
      // ユーザーの購入履歴を取得
      const { data: purchases, error } = await supabase
        .from('purchases')
        .select(`
          *,
          diagnoses:diagnosis_id (
            user_name,
            birth_date,
            diagnosis_type_id,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error || !purchases || purchases.length === 0) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '購入履歴がありません。\n\n「本格」と入力すると、本格おつきさま診断を始められます。'
        });
        return;
      }
      
      // Flex Messageで履歴を表示
      const historyItems = purchases.map(p => ({
        type: 'box',
        layout: 'horizontal',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            flex: 3,
            contents: [
              {
                type: 'text',
                text: p.product_name || 'おつきさま診断',
                size: 'sm',
                weight: 'bold',
                color: '#333333'
              },
              {
                type: 'text',
                text: `¥${p.amount.toLocaleString()}`,
                size: 'xs',
                color: '#666666'
              },
              {
                type: 'text',
                text: new Date(p.created_at).toLocaleDateString('ja-JP'),
                size: 'xxs',
                color: '#999999'
              }
            ]
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '見る',
              uri: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/lp-otsukisama-unified.html?id=${p.diagnosis_id}&userId=${userId}`
            },
            style: 'primary',
            height: 'sm'
          }
        ],
        margin: 'md',
        paddingAll: 'sm',
        backgroundColor: '#f7f7f7',
        cornerRadius: 'md'
      }));
      
      await client.replyMessage(event.replyToken, {
        type: 'flex',
        altText: '購入履歴',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '📚 購入履歴',
                size: 'xl',
                weight: 'bold',
                color: '#ffffff'
              },
              {
                type: 'text',
                text: `${purchases.length}件の診断結果`,
                size: 'sm',
                color: '#ffffff'
              }
            ],
            backgroundColor: '#667eea'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: historyItems
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'message',
                  label: '新しい診断を始める',
                  text: '本格'
                },
                style: 'primary',
                color: '#667eea'
              }
            ]
          }
        }
      });
      return;
    }
    
    // 「おつきさま診断」メッセージのハンドリング
    if (text === 'おつきさま診断') {
      const webUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/moon-fortune.html?userId=${userId}`;
      
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '🌙 本格おつきさま診断は現在準備中です\n\nサービス開始までもうしばらくお待ちください。'
        },
        {
          type: 'flex',
          altText: '月の運勢占い（簡易版）のご案内',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: '✨ 今すぐ占える！',
                  size: 'sm',
                  color: '#ffffff'
                },
                {
                  type: 'text',
                  text: '月の運勢占い（簡易版）',
                  size: 'lg',
                  color: '#ffffff',
                  weight: 'bold'
                }
              ],
              backgroundColor: '#667eea',
              paddingTop: '15px',
              paddingBottom: '15px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'お名前を入力するだけで、今日の月相から運勢を占います',
                  wrap: true,
                  size: 'sm',
                  margin: 'md'
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
                      text: '📋 簡易版の内容',
                      weight: 'bold',
                      size: 'sm',
                      color: '#667eea'
                    },
                    {
                      type: 'text',
                      text: '• 月タイプ診断（8タイプ）',
                      size: 'xs',
                      margin: 'sm'
                    },
                    {
                      type: 'text',
                      text: '• 性格と恋愛スタイル',
                      size: 'xs'
                    },
                    {
                      type: 'text',
                      text: '• 月の満ち欠けの影響',
                      size: 'xs'
                    },
                    {
                      type: 'text',
                      text: '• 月の神様からのメッセージ',
                      size: 'xs'
                    }
                  ]
                }
              ]
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  action: {
                    type: 'uri',
                    label: '🌙 簡易版を試す（無料）',
                    uri: webUrl
                  },
                  color: '#667eea'
                },
                {
                  type: 'text',
                  text: '※Webサイトへ移動します',
                  size: 'xxs',
                  color: '#aaaaaa',
                  align: 'center',
                  margin: 'sm'
                }
              ]
            }
          }
        }
      ]);
      return;
    }
    
    // 「本格」キーワードでLPへ誘導（テスト用）
    if (text === '本格') {
      const lpUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/lp-otsukisama-input.html?userId=${userId}`;
      
      await client.replyMessage(event.replyToken, {
        type: 'flex',
        altText: '🌙 本格おつきさま診断',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🌙 本格おつきさま診断 🌙',
                size: 'xl',
                color: '#ffffff',
                align: 'center',
                weight: 'bold'
              },
              {
                type: 'text',
                text: '直近3ヶ月の詳細運勢',
                size: 'md',
                color: '#ffffff',
                align: 'center',
                margin: 'md'
              }
            ],
            backgroundColor: '#764ba2',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🌙 あなたの生まれた瞬間の月の形から',
                size: 'md',
                weight: 'bold',
                color: '#764ba2',
                wrap: true,
                align: 'center'
              },
              {
                type: 'text',
                text: '直近3ヶ月の詳細な運勢を診断します',
                size: 'sm',
                color: '#666666',
                wrap: true,
                align: 'center',
                margin: 'md'
              },
              {
                type: 'separator',
                margin: 'xl'
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'xl',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '💫 占い内容',
                    weight: 'bold',
                    size: 'md',
                    color: '#764ba2'
                  },
                  {
                    type: 'text',
                    text: '• 3ヶ月の全体運',
                    size: 'sm',
                    color: '#666666',
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    text: '• 恋愛運の詳細',
                    size: 'sm',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: '• 人間関係運',
                    size: 'sm',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: '• 金運・仕事運',
                    size: 'sm',
                    color: '#666666'
                  }
                ]
              }
            ],
            paddingAll: '20px'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                action: {
                  type: 'uri',
                  label: '🌙 診断を始める',
                  uri: lpUrl
                },
                color: '#764ba2'
              },
              {
                type: 'text',
                text: '※外部サイトへ移動します',
                size: 'xs',
                color: '#aaaaaa',
                align: 'center',
                margin: 'sm'
              }
            ]
          }
        }
      });
      return;
    }
    
    // 占いを始める - 友達追加時と同じカードを表示
    if (text === '占いを始める' || text === 'start') {
      const userId = event.source.userId;
      const formUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/api/profile-form?userId=${userId}`;
      
      await client.replyMessage(event.replyToken, {
        type: 'flex',
        altText: '🌙 月タロット占いへようこそ！',
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
                    size: 'xxl',
                    color: '#ffffff',
                    align: 'center'
                  },
                  {
                    type: 'text',
                    text: '月タロット占いへようこそ',
                    size: 'xl',
                    color: '#ffffff',
                    align: 'center',
                    weight: 'bold',
                    margin: 'md'
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
                text: '私は月詠（つくよみ）と申します',
                size: 'md',
                wrap: true,
                align: 'center'
              },
              {
                type: 'separator',
                margin: 'md'
              },
              {
                type: 'text',
                text: 'あなたと大切な方の心に映る',
                size: 'md',
                wrap: true,
                align: 'center',
                margin: 'md'
              },
              {
                type: 'text',
                text: '運命の相性',
                size: 'md',
                wrap: true,
                align: 'center',
                margin: 'sm'
              },
              {
                type: 'text',
                text: '月の姿を視させていただきます',
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
                    text: '✨ 月タロット占いの流れ',
                    weight: 'bold',
                    size: 'sm',
                    color: '#764ba2'
                  },
                  {
                    type: 'text',
                    text: '一、まずはあなたの情報を教えてください',
                    size: 'sm',
                    margin: 'sm'
                  },
                  {
                    type: 'text',
                    text: '二、月にメッセージを送ります',
                    size: 'sm'
                  },
                  {
                    type: 'text',
                    text: '三、月のカードがあなたの運勢を占います',
                    size: 'sm'
                  },
                  {
                    type: 'text',
                    text: '　　特別なメッセージをお届けします',
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
                  type: 'uri',
                  label: '🔮 情報を入力する',
                  uri: formUrl
                },
                color: '#764ba2'
              },
              {
                type: 'button',
                style: 'primary',
                height: 'md',
                action: {
                  type: 'message',
                  label: '診断結果を見る',
                  text: '診断結果'
                },
                color: '#667eea'
              }
            ]
          }
        }
      });
      return;
    }
    
    // 新しい診断コマンド（プロファイルリセットして新規開始）
    if (text === '新しい診断' || text === '新規診断') {
      await getProfileManager().deleteProfile(userId);
      
      // 新しい診断を開始
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: '🌟 新しい診断を始めます！\n\n前回の診断データをクリアしました。\n「診断を始める」をタップして、新たな相手との相性診断を開始してください。',
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: '🔮 診断を始める',
                  text: '診断を始める'
                }
              }
            ]
          }
        }
      ]);
      return;
    }
    
    // 月タロット占いコマンド
    if (text === '月タロット占い' || text === 'タロット占い') {
      // プロフィールが完成しているか確認
      const hasComplete = await getProfileManager().hasCompleteProfile(userId);

      if (!hasComplete) {
        // 情報未入力の場合
        const formUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/api/profile-form?userId=${userId}`;
        await client.replyMessage(event.replyToken, {
          type: 'flex',
          altText: '🌙 まずは情報を入力してください',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#764ba2',
              contents: [
                {
                  type: 'text',
                  text: '🌙 まずは情報を入力してください',
                  color: '#ffffff',
                  size: 'lg',
                  weight: 'bold',
                  align: 'center'
                }
              ],
              paddingAll: '20px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '月タロット占いを受けるには',
                  size: 'md',
                  weight: 'bold',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: 'まずあなたの情報を',
                  size: 'md',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '月に伝える必要があります',
                  size: 'md',
                  align: 'center'
                },
                {
                  type: 'separator',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '下のボタンから',
                  size: 'sm',
                  color: '#666666',
                  align: 'center',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '情報を入力してください',
                  size: 'sm',
                  color: '#666666',
                  align: 'center'
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
                    type: 'uri',
                    label: '🔮 情報を入力する',
                    uri: formUrl
                  },
                  color: '#764ba2'
                }
              ]
            }
          }
        });
      } else {
        // 情報入力済みの場合、タロット占いページに誘導
        const tarotUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/pages/moon-tarot.html?userId=${userId}`;
        await client.replyMessage(event.replyToken, {
          type: 'flex',
          altText: '🌙 月タロット占い',
          contents: {
            type: 'bubble',
            size: 'mega',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#667eea',
              contents: [
                {
                  type: 'text',
                  text: '🔮 月タロット占い',
                  color: '#ffffff',
                  size: 'xl',
                  weight: 'bold',
                  align: 'center'
                }
              ],
              paddingAll: '20px'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                {
                  type: 'text',
                  text: '月のカードが',
                  size: 'md',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: 'あなたの今日の恋愛運を',
                  size: 'md',
                  align: 'center'
                },
                {
                  type: 'text',
                  text: '導きます',
                  size: 'md',
                  align: 'center'
                },
                {
                  type: 'separator',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '※1日1回まで占えます',
                  size: 'xs',
                  color: '#999999',
                  align: 'center',
                  margin: 'lg'
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
                    type: 'uri',
                    label: '🔮 占いを始める',
                    uri: tarotUrl
                  },
                  color: '#667eea'
                }
              ]
            }
          }
        });
      }
      return;
    }

    // 診断結果コマンド（互換性のため残す）
    if (text === '診断結果' || text === '結果') {
      // 月タロット占いにリダイレクト
      return handleTextMessage({ ...event, message: { ...event.message, text: '月タロット占い' } });
    }
    
    // リセットコマンド（互換性のため残す）
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
        text: 'おつきさま診断を始めるには「情報を入力」して「診断結果」ボタンを押してください🌙',
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
    // プロフィールを取得
    const profile = await getProfileManager().getProfile(userId);
    if (!profile || !profile.birthDate || !profile.partnerBirthDate) {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '診断結果がありません。\n\nまず「プロフィール設定」から始めてください。'
      });
      return;
    }
    
    // ファイルから診断結果を読み込み
    let result = null;
    let savedProfile = null;
    let shouldRegenerate = false;
    
    try {
      const fs = require('fs').promises;
      const path = require('path');
      // Vercel環境では/tmpを使用
      const dataDir = process.env.VERCEL 
        ? '/tmp/profiles'
        : path.join(__dirname, 'data/profiles');
      const profileFile = path.join(dataDir, `${userId}.json`);
      
      const profileData = await fs.readFile(profileFile, 'utf8');
      savedProfile = JSON.parse(profileData);
      result = savedProfile.lastFortuneResult;
      
      // プロフィールが更新されているかチェック
      if (savedProfile.birthDate !== profile.birthDate ||
          savedProfile.partnerBirthDate !== profile.partnerBirthDate ||
          savedProfile.gender !== profile.gender ||
          savedProfile.partnerGender !== profile.partnerGender ||
          savedProfile.birthTime !== profile.birthTime ||
          savedProfile.partnerBirthTime !== profile.partnerBirthTime) {
        console.log('🔄 プロフィールが更新されているため再生成');
        shouldRegenerate = true;
        result = null;
      } else {
        console.log('🌙 保存済み診断結果を使用');
      }
    } catch (err) {
      console.log('診断結果ファイルが見つかりません:', err.message);
      shouldRegenerate = true;
    }
    
    // 診断結果がないか、再生成が必要な場合
    if (!result) {
      
      loadHeavyModules();
      const moonEngine = new MoonFortuneEngineV2();
      
      // おつきさま診断レポートを生成
      result = moonEngine.generateCompleteReading(
        profile.birthDate,
        profile.partnerBirthDate
      );
      
      // 結果をファイルに保存（エラーを無視）
      try {
        const fs = require('fs').promises;
        const path = require('path');
        // Vercel環境では/tmpを使用
        const dataDir = process.env.VERCEL 
          ? '/tmp/profiles'
          : path.join(__dirname, 'data/profiles');
        await fs.mkdir(dataDir, { recursive: true });
        
        const profileData = {
          ...profile,
          lastFortuneResult: result
        };
        
        await fs.writeFile(
          path.join(dataDir, `${userId}.json`),
          JSON.stringify(profileData, null, 2)
        );
        console.log('🌙 診断結果を保存');
      } catch (saveErr) {
        // ファイル保存エラーは無視（診断結果は既に生成済み）
        console.log('⚠️ 診断結果の保存をスキップ:', saveErr.message);
      }
    }
    
    // V2フォーマッターを使用して診断結果を表示
    const message = {
      type: 'flex',
      altText: '🌙 おつきさま診断の結果',
      contents: formatMoonReportV2(result)
    };
    
    // 結果を送信
    await client.replyMessage(replyToken, message);
    
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
    
    // カルーセル用にメッセージデータと分析データを追加
    fortune.messages = messages;
    fortune.analysis = {
      totalMessages: messages.length,
      conversationDays: Math.ceil((new Date(messages[messages.length - 1]?.datetime) - new Date(messages[0]?.datetime)) / (1000 * 60 * 60 * 24)) || 1,
      avgResponseTime: 0, // TODO: 実装
      responseRate: 75 // TODO: 実装
    };
    
    // パースしたメッセージを保存（プレミアムレポート用）
    try {
      const messagesDB = require('./core/database/messages-db');
      // bodyフィールドをtextフィールドにマッピング（レポート生成用）
      const messagesForStorage = messages.map(msg => ({
        ...msg,
        text: msg.body || msg.text, // bodyがあればtextとして保存
        isUser: msg.sender === parser.extractParticipants(messages, profile.displayName).self,
        timestamp: msg.datetime,
        createdAt: msg.datetime
      }));
      await messagesDB.saveMessages(userId, messagesForStorage);
      logger.log('💾 メッセージを保存しました（text/isUserフィールド付き）');
    } catch (saveError) {
      console.error('⚠️ メッセージ保存エラー（続行）:', saveError.message);
    }
    
    // おつきさま診断も生成
    logger.log('🌙 おつきさま診断を実行中...');
    loadHeavyModules();
    const moonEngine = new MoonFortuneEngineV2();
    
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
      moonReport = moonEngine.generateCompleteReading(
        userProfile.birthDate,
        userProfile.partnerBirthDate
      );
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
      moonReport = moonEngine.generateCompleteReading(
        testUserProfile.birthDate,
        testPartnerProfile.birthDate
      );
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

// 深掘り分析のレスポンスを送信する関数
async function sendDeepAnalysisResponse(replyToken, type) {
  const selectedText = type === 'feelings_reach' 
    ? 'お相手に今のあなたの想いが伝わるのかどうか'
    : 'お相手が今あなたに向ける気持ち';
    
  const details = type === 'feelings_reach' 
    ? [
        '・お相手があなたの言葉や態度をどう受け取っているか',
        '・ふたりの会話から"温度差"や"誤解のポイント"',
        '・お相手に想いを届けるために、あなたが取るべき一歩'
      ]
    : [
        '・お相手があなたに対して、今どんな気持ちを持っているかが分かります',
        '・ふたりの会話から"お相手の隠れた感情の動き"を見える化します',
        '・お相手の気持ちを理解することで、関係を前に進めるヒントが見つかります'
      ];
  
  await client.replyMessage(replyToken, [
    {
      type: 'flex',
      altText: '深掘り診断のご案内',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'なるほど。あなたが知りたいのは',
              size: 'sm',
              color: '#ffffff',
              align: 'center'
            },
            {
              type: 'text',
              text: `「${selectedText}」`,
              size: 'md',
              color: '#ffd700',
              weight: 'bold',
              align: 'center',
              margin: 'sm',
              wrap: true
            },
            {
              type: 'text',
              text: 'なのですね🌙',
              size: 'sm',
              color: '#ffffff',
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
          contents: [
            {
              type: 'text',
              text: 'このあとの会話診断では、こんなことが分かりますよ🔮',
              size: 'sm',
              color: '#764ba2',
              weight: 'bold',
              wrap: true,
              margin: 'md'
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
              contents: details.map(detail => ({
                type: 'text',
                text: detail,
                size: 'sm',
                color: '#555555',
                wrap: true
              }))
            },
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'text',
              text: '実際の診断結果はこんな感じで出てきます✨',
              size: 'sm',
              color: '#764ba2',
              weight: 'bold',
              margin: 'lg',
              align: 'center'
            },
            {
              type: 'image',
              url: 'https://line-love-edu.vercel.app/images/sample-result.png',
              size: 'full',
              aspectMode: 'fit',
              aspectRatio: '2:1',
              margin: 'lg'
            },
            {
              type: 'text',
              text: 'あなたも診断してみませんか？',
              size: 'md',
              color: '#764ba2',
              weight: 'bold',
              margin: 'xl',
              align: 'center'
            },
            {
              type: 'button',
              action: {
                type: 'postback',
                label: '診断する',
                data: 'action=want_more_analysis'
              },
              style: 'primary',
              color: '#764ba2',
              margin: 'lg',
              height: 'md'
            }
          ],
          paddingAll: '20px'
        }
      }
    }
  ]);
}

// ── ⑥ Postbackイベント処理
async function handlePostbackEvent(event) {
  logger.log('💳 Postback処理開始:', event.postback.data);
  logger.log('📅 Postback params:', event.postback.params);
  
  const userId = event.source.userId;
  
  // タロット占いへのアクセス
  if (event.postback.data === 'action=tarot') {
    logger.log('🔮 タロット占いへのアクセス要求:', userId);
    
    // ユーザーIDを含むURLを生成
    const tarotUrl = `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/moon-tarot.html?userId=${userId}`;
    
    return client.replyMessage(event.replyToken, {
      type: 'flex',
      altText: '🔮 月タロット占い',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🔮 月タロット占い 🔮',
              size: 'xl',
              color: '#ffffff',
              align: 'center',
              weight: 'bold'
            },
            {
              type: 'text',
              text: '1日1回の運命カード',
              size: 'md',
              color: '#ffffff',
              align: 'center',
              margin: 'md'
            }
          ],
          backgroundColor: '#667eea',
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '✨ 月の満ち欠けとタロットカードが',
              size: 'md',
              weight: 'bold',
              color: '#667eea',
              wrap: true,
              align: 'center'
            },
            {
              type: 'text',
              text: 'あなたの恋愛運を導きます',
              size: 'sm',
              color: '#666666',
              wrap: true,
              align: 'center',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'xl'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'xl',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: '🌙 占い内容',
                  weight: 'bold',
                  size: 'md',
                  color: '#667eea'
                },
                {
                  type: 'text',
                  text: '• 今日の恋愛運',
                  size: 'sm',
                  color: '#666666',
                  margin: 'sm'
                },
                {
                  type: 'text',
                  text: '• 運命のタロットカード',
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: '• 月からのメッセージ',
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: '• 恋愛アドバイス',
                  size: 'sm',
                  color: '#666666'
                }
              ]
            }
          ],
          paddingAll: '20px'
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: '🔮 占いを始める',
                uri: tarotUrl
              },
              color: '#667eea'
            },
            {
              type: 'text',
              text: '※1日1回まで占えます',
              size: 'xs',
              color: '#aaaaaa',
              align: 'center',
              margin: 'sm'
            }
          ]
        }
      }
    });
  }
  
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
    
    // 「想いが伝わるか」ボタンが押された時
    if (action === 'want_feelings_reach') {
      await sendDeepAnalysisResponse(event.replyToken, 'feelings_reach');
      return;
    }
    
    // 「相手の気持ち」ボタンが押された時
    if (action === 'want_partner_feelings') {
      await sendDeepAnalysisResponse(event.replyToken, 'partner_feelings');
      return;
    }
    
    // 「知りたい！」ボタンが押された時（既存）
    if (action === 'want_more_analysis') {
      // トーク履歴送信の案内を送信
      await client.replyMessage(event.replyToken, [
        {
          type: 'text',
          text: 'わかりました。\nより詳しくあなたとお相手を診断いたしましょう🧐\n\n診断の方法をお教えします\n\n私に、\nあなたとお相手のLINEの\n最近の会話内容をお見せください\n\n送り方は次の手順でできます👇'
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
                  type: 'text',
                  text: 'トーク履歴の送信方法',
                  size: 'md',
                  weight: 'bold',
                  color: '#764ba2',
                  align: 'center',
                  margin: 'md'
                },
                {
                  type: 'separator',
                  margin: 'md'
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '①',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '気になる相手のトーク画面をLINEで開く',
                      size: 'sm',
                      margin: 'md',
                      wrap: true,
                      flex: 1
                    }
                  ],
                  margin: 'md'
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '②',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '右上「≡」をタップ',
                      size: 'sm',
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
                      text: '③',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「設定」を選択',
                      size: 'sm',
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
                      text: '④',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「トーク履歴を送信」を選択',
                      size: 'sm',
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
                      text: '⑤',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「LINE」をタップ',
                      size: 'sm',
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
                      text: '⑥',
                      size: 'md',
                      color: '#764ba2',
                      weight: 'bold',
                      flex: 0
                    },
                    {
                      type: 'text',
                      text: '「おつきさま診断🌙」をタップして転送',
                      size: 'sm',
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
                  color: '#764ba2',
                  margin: 'lg'
                },
                {
                  type: 'text',
                  text: '相手との会話が多いほど\n診断の的中率が上がります',
                  size: 'sm',
                  color: '#666666',
                  wrap: true,
                  margin: 'sm',
                  align: 'center'
                }
              ],
              paddingAll: '20px'
            }
          }
        }
        // 動画送信を一時的に無効化
        // {
        //   type: 'video',
        //   originalContentUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/videos/talk-history-tutorial.mp4`,
        //   previewImageUrl: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/images/video-thumbnail.jpg`,
        //   trackingId: 'talk-history-tutorial'
        // }
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
      const moonEngine = new MoonFortuneEngineV2();
      const moonReport = moonEngine.generateCompleteReading(
        profile.birthDate,
        profile.partnerBirthDate
      );
      
      // V2フォーマッターを使用して表示
      const flexMessage = {
        type: 'flex',
        altText: '🌙 おつきさま診断の結果',
        contents: formatMoonReportV2(moonReport)
      };
      
      await client.replyMessage(event.replyToken, flexMessage);
      
      logger.log('✨ おつきさま診断を送信しました');
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
    
    // 注文が作成できない場合（生成中のみ）
    if (!orderResult.success) {
      // 処理中フラグを即座にクリア
      processingOrders.delete(userId);
      
      // 生成中またはその他のメッセージ
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: orderResult.message
      });
    }
    
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

app.post('/api/payjp-create-charge', express.json(), async (req, res) => {
  const payjpCreateCharge = require('./api/payjp-create-charge');
  await payjpCreateCharge(req, res);
});

// ── ⑩ 起動
console.log('VERCEL環境変数:', process.env.VERCEL);
console.log('サーバー起動を試みます...');
if (!process.env.VERCEL || process.env.VERCEL !== '1') {
  // ローカル環境でのみサーバーを起動
  const port = process.env.PORT || 3000;
  console.log(`ポート ${port} でサーバー起動中...`);
  
  const server = app.listen(port, () => {
    console.log(`サーバー起動成功！`);
    logger.log(`🔮 恋愛お告げボット起動: http://localhost:${port}`);
    logger.log('📡 Webhook URL: /webhook');
    logger.log(`💳 決済成功URL: http://localhost:${port}/payment/success`);
    logger.log('✨ 準備完了！トーク履歴を送信してください');
  });
  
  server.on('error', (err) => {
    console.error('サーバー起動エラー:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`ポート ${port} は既に使用中です`);
    }
  });
} else {
  console.log('Vercel環境のため、サーバーを起動しません');
}

module.exports = app;