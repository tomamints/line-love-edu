// // api/main.js - Vercel用のメインWebhookハンドラー
// // index.jsの処理を直接インポートして使用
// 
// require('dotenv').config();
// const express = require('express');
// const { middleware, Client } = require('@line/bot-sdk');
// 
// // 環境変数チェック
// console.log("✅ SECRET:", !!process.env.CHANNEL_SECRET);
// console.log("✅ TOKEN:", !!process.env.CHANNEL_ACCESS_TOKEN);
// console.log("✅ OPENAI_API_KEY:", !!process.env.OPENAI_API_KEY);
// 
// // LINEクライアント設定
// const config = {
//   channelSecret: process.env.CHANNEL_SECRET,
//   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
// };
// 
// const client = new Client(config);
// 
// // 重複防止用
// const recentMessageIds = new Set();
// const recentPostbackIds = new Set();
// 
// // 重いモジュールは必要時に遅延ロード
// let parser, FortuneEngine, FortuneCarouselBuilder, PaymentHandler;
// let WaveFortuneEngine, MoonFortuneEngine, UserProfileManager;
// let profileManager;
// 
// function loadHeavyModules() {
//   if (!parser) parser = require('../metrics/parser');
//   if (!FortuneEngine) FortuneEngine = require('../core/fortune-engine');
//   if (!FortuneCarouselBuilder) ({ FortuneCarouselBuilder } = require('../core/formatter/fortune-carousel'));
//   if (!PaymentHandler) PaymentHandler = require('../core/premium/payment-handler');
//   if (!WaveFortuneEngine) WaveFortuneEngine = require('../core/wave-fortune');
//   if (!MoonFortuneEngine) MoonFortuneEngine = require('../core/moon-fortune');
//   if (!UserProfileManager) UserProfileManager = require('../core/user-profile');
//   if (!profileManager) profileManager = new UserProfileManager();
// }
// 
// // index.jsから関数をインポート
// const mainModule = require('../index');
// 
// // Vercel用のハンドラー
// module.exports = middleware(config);
// module.exports = async (req, res) => {
//   console.log("🔮 恋愛お告げボット - リクエスト受信");
//   console.log("📝 イベント数:", req.body.events?.length || 0);
//   
//   // X-Line-Retryヘッダーをチェック（リトライ回数）
//   const retryCount = req.headers['x-line-retry'] || 0;
//   if (retryCount > 0) {
//     console.log(`⚠️ リトライ検出: ${retryCount}回目のリトライ`);
//   }
// 
//   // LINEに即座に200を返す（超重要：これを早くしないとリトライされる）
//   res.status(200).json({});
// 
//   // モジュールをロード
//   loadHeavyModules();
// 
//   // イベント処理は非同期で実行
//   try {
//     const promises = req.body.events.map(async event => {
//       // 友達追加イベント
//       if (event.type === 'follow') {
//         return mainModule.handleFollowEvent(event).catch(err => {
//           console.error('❌ 友達追加イベントエラー:', err);
//           console.error('❌ スタック:', err.stack);
//         });
//       }
//       
//       // テキストメッセージの処理（プロファイル入力）
//       if (event.type === 'message' && event.message.type === 'text') {
//         return mainModule.handleTextMessage(event).catch(err => {
//           console.error('テキストメッセージ処理エラー:', err);
//           return client.replyMessage(event.replyToken, {
//             type: 'text',
//             text: `エラーが発生しました:\n${err.message}\n\nもう一度「占いを始める」と送信してください。`
//           });
//         });
//       }
//       
//       // ファイルメッセージ（トーク履歴）の処理
//       if (event.type === 'message' && event.message.type === 'file') {
//         // 重複チェック
//         if (recentMessageIds.has(event.message.id)) {
//           console.log("⏭️ 重複メッセージをスキップ:", event.message.id);
//           return Promise.resolve();
//         }
//         recentMessageIds.add(event.message.id);
//         
//         // サイズ制限（1000件まで保持）
//         if (recentMessageIds.size > 1000) {
//           const firstKey = recentMessageIds.values().next().value;
//           recentMessageIds.delete(firstKey);
//         }
//         
//         return mainModule.handleFortuneEvent(event).catch(err => {
//           console.error('=== お告げ生成中にエラー ===', err);
//           return client.pushMessage(event.source.userId, {
//             type: 'text',
//             text: '⚠️ お告げの生成中にエラーが発生しました。もう一度お試しください🔮'
//           }).catch(pushErr => console.error('Push message error:', pushErr));
//         });
//       }
//       
//       // postbackイベント（課金処理）の処理
//       if (event.type === 'postback') {
//         // postbackの重複チェック
//         const postbackId = `${event.source.userId}_${event.postback.data}_${event.timestamp}`;
//         if (recentPostbackIds.has(postbackId)) {
//           console.log("⏭️ 重複postbackをスキップ:", postbackId);
//           return Promise.resolve();
//         }
//         recentPostbackIds.add(postbackId);
//         
//         // サイズ制限
//         if (recentPostbackIds.size > 1000) {
//           const firstKey = recentPostbackIds.values().next().value;
//           recentPostbackIds.delete(firstKey);
//         }
//         
//         return mainModule.handlePostbackEvent(event).catch(err => {
//           console.error('=== Postback処理中にエラー ===', err);
//           return client.replyMessage(event.replyToken, {
//             type: 'text',
//             text: `⚠️ エラーが発生しました:\n${err.message}\n\nもう一度お試しください。`
//           });
//         });
//       }
//       
//       // テスト用：テキストメッセージでレポート生成をテスト
//       if (event.type === 'message' && event.message.type === 'text' && 
//           event.message.text === 'テストレポート') {
//         return mainModule.handleTestReport(event).catch(err => {
//           console.error('=== テストレポート生成エラー ===', err);
//           return client.pushMessage(event.source.userId, {
//             type: 'text',
//             text: '⚠️ テストレポートの生成中にエラーが発生しました。'
//           }).catch(pushErr => console.error('Push message error:', pushErr));
//         });
//       }
//       
//       return Promise.resolve();
//     });
//     
//     await Promise.all(promises);
//   } catch (fatal) {
//     console.error('🌋 致命的なエラー', fatal);
//   }
// };

// index.jsを直接エクスポート
const app = require('../index');
module.exports = app;