// api/main.js - Vercel用のWebhookハンドラー
// index.jsの処理をそのまま使用

const app = require('../index');

// VercelはExpressアプリをそのまま処理できる
module.exports = app;