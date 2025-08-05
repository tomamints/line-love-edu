// index.js

require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs');
const { Client, middleware } = require('@line/bot-sdk');
const parser = require('./metrics/parser');
const FortuneEngine = require('./core/fortune-engine');
const { FortuneCarouselBuilder } = require('./core/formatter/fortune-carousel');
const PaymentHandler = require('./core/premium/payment-handler');

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
const paymentHandler = new PaymentHandler();
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
      // ファイルメッセージ（トーク履歴）の処理
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
        
        return handleFortuneEvent(event).catch(err => {
          console.error('=== お告げ生成中にエラー ===', err);
          return client.pushMessage(event.source.userId, {
            type: 'text',
            text: '⚠️ お告げの生成中にエラーが発生しました。もう一度お試しください🔮'
          }).catch(pushErr => console.error('Push message error:', pushErr));
        });
      }
      
      // postbackイベント（課金処理）の処理
      if (event.type === 'postback') {
        return handlePostbackEvent(event).catch(err => {
          console.error('=== Postback処理中にエラー ===', err);
          return client.pushMessage(event.source.userId, {
            type: 'text',
            text: '⚠️ 処理中にエラーが発生しました。しばらく経ってから再度お試しください。'
          }).catch(pushErr => console.error('Push message error:', pushErr));
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
});


// ── ⑤ お告げ生成イベント処理
async function handleFortuneEvent(event) {
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
    console.log('📊 カルーセル構造:', JSON.stringify(carousel, null, 2));
    
    try {
      await client.pushMessage(userId, carousel);
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

// ── ⑥ Postbackイベント処理（課金処理）
async function handlePostbackEvent(event) {
  console.log('💳 Postback処理開始:', event.postback.data);
  
  const userId = event.source.userId;
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
        return await handlePremiumReportOrder(userId, profile);
        
      case 'payment_success':
        return await handlePaymentSuccess(postbackData.orderId, userId);
        
      default:
        console.log('未知のpostbackアクション:', postbackData.action);
        return;
    }
    
  } catch (error) {
    console.error('Postbackイベント処理エラー:', error);
    
    await client.pushMessage(userId, {
      type: 'text',
      text: '申し訳ございません。処理中にエラーが発生しました。サポートまでお問い合わせください。'
    });
  }
}

// ── ⑦ プレミアムレポート注文処理
async function handlePremiumReportOrder(userId, profile) {
  console.log('📋 プレミアムレポート注文処理開始');
  
  try {
    // 注文を処理
    const orderResult = await paymentHandler.handlePremiumOrderRequest(userId, profile);
    
    // 決済案内メッセージを送信
    const paymentMessage = paymentHandler.generatePaymentMessage(orderResult);
    await client.pushMessage(userId, paymentMessage);
    
    console.log('✅ 決済案内送信完了');
    
  } catch (error) {
    console.error('プレミアムレポート注文エラー:', error);
    
    await client.pushMessage(userId, {
      type: 'text',
      text: '申し訳ございません。注文処理中にエラーが発生しました。しばらく経ってから再度お試しください。'
    });
  }
}

// ── ⑧ 決済完了処理
async function handlePaymentSuccess(orderId, userId) {
  console.log('💰 決済完了処理開始:', orderId);
  
  try {
    // 注文に関連するメッセージ履歴を取得（実際の実装では保存されたデータから取得）
    // ここではプレースホルダーとして空配列を使用
    const messages = []; // 実際はデータベースから取得
    
    // 決済完了後の処理（レポート生成）
    const completionResult = await paymentHandler.handlePaymentSuccess(orderId, messages);
    
    // 完成通知メッセージを送信
    const completionMessages = paymentHandler.generateCompletionMessage(completionResult);
    
    if (Array.isArray(completionMessages)) {
      for (const message of completionMessages) {
        await client.pushMessage(userId, message);
      }
    } else {
      await client.pushMessage(userId, completionMessages);
    }
    
    console.log('✅ レポート完成通知送信完了');
    
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
  console.log('🧪 テストレポート生成開始');
  
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
    const reportData = await paymentHandler.reportGenerator.generatePremiumReport(
      testMessages,
      userId,
      profile.displayName
    );
    
    // レポート内容をテキストで送信（PDF生成の代わり）
    await sendReportAsText(userId, reportData, profile.displayName);
    
    console.log('✅ テストレポート送信完了');
    
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

🔮 このレポートはAIによる詳細分析結果です
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

// Stripe Webhook（raw bodyが必要なので、express.json()の前に配置）
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripeWebhook = require('./api/stripe-webhook');
  await stripeWebhook(req, res);
});

// ── ⑩ 起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🔮 恋愛お告げボット起動: http://localhost:${port}`);
  console.log('📡 Webhook URL: /webhook');
  console.log(`💳 決済成功URL: http://localhost:${port}/payment/success`);
  console.log('✨ 準備完了！トーク履歴を送信してください');
});

module.exports = app;