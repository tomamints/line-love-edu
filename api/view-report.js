// api/view-report.js
// レポートをブラウザで表示するエンドポイント

const ordersDB = require('../core/database/orders-db');
const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  const { orderId } = req.query;
  
  if (!orderId) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>エラー</title>
      </head>
      <body style="font-family: sans-serif; padding: 20px;">
        <h1>エラー</h1>
        <p>注文IDが指定されていません</p>
      </body>
      </html>
    `);
  }
  
  try {
    // 注文情報を取得
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>レポートが見つかりません</title>
        </head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>レポートが見つかりません</h1>
          <p>指定された注文IDのレポートが見つかりませんでした。</p>
        </body>
        </html>
      `);
    }
    
    if (order.status !== 'completed') {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>レポート${order.status === 'generating' ? '生成中' : '未完成'}</title>
        </head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>レポートは${order.status === 'generating' ? '生成中' : '未完成'}です</h1>
          <p>しばらくお待ちください。</p>
          <p>現在のステータス: ${order.status}</p>
        </body>
        </html>
      `);
    }
    
    // まずデータベースからPDFデータを取得
    if (order.pdf_data) {
      console.log('📄 PDFデータがデータベースに存在');
      
      // Base64エンコードされたPDFをデコード
      const pdfBuffer = Buffer.from(order.pdf_data, 'base64');
      
      // PDFファイルとして返す
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="report_${orderId}.pdf"`);
      return res.send(pdfBuffer);
    }
    
    // データベースにない場合はファイルシステムを確認（後方互換性）
    const pdfPath = process.env.VERCEL 
      ? path.join('/tmp', 'orders', `${orderId}.pdf`)
      : path.join(process.cwd(), 'orders', `${orderId}.pdf`);
    
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // PDFファイルとして返す
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="report_${orderId}.pdf"`);
      return res.send(pdfBuffer);
      
    } catch (err) {
      console.error('レポートファイル読み込みエラー:', err);
      
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ファイルエラー</title>
        </head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>レポートファイルが見つかりません</h1>
          <p>レポートファイルの読み込みに失敗しました。</p>
          ${process.env.VERCEL ? '<p>Vercel環境では時間経過でファイルが削除される場合があります。</p>' : ''}
          <p>エラー: ${err.message}</p>
        </body>
        </html>
      `);
    }
    
  } catch (error) {
    console.error('レポート表示エラー:', error);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>エラー</title>
      </head>
      <body style="font-family: sans-serif; padding: 20px;">
        <h1>エラーが発生しました</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `);
  }
};