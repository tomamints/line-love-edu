// api/main.js - Vercel用のメインWebhookハンドラー
// ローカルのindex.jsと完全に同じ処理にする

require('dotenv').config();
const { middleware } = require('@line/bot-sdk');
const app = require('../index');

// Vercel用のハンドラー - Expressアプリの/webhookエンドポイントに直接渡す
module.exports = async (req, res) => {
  // ローカルと全く同じミドルウェアとハンドラーを使用
  const webhookHandler = app._router.stack
    .find(layer => layer.route && layer.route.path === '/webhook')
    ?.route.stack[1].handle; // middleware(config)の後のハンドラー
  
  if (webhookHandler) {
    // middlewareを適用してからハンドラーを実行
    const config = {
      channelSecret: process.env.CHANNEL_SECRET,
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    };
    
    const middlewareHandler = middleware(config);
    
    // ミドルウェアを実行
    middlewareHandler(req, res, (err) => {
      if (err) {
        console.error('Middleware error:', err);
        return res.status(400).json({ error: err.message });
      }
      // ミドルウェアが成功したら、元のハンドラーを実行
      webhookHandler(req, res);
    });
  } else {
    // フォールバック：直接index.jsのappを呼ぶ
    app(req, res);
  }
};