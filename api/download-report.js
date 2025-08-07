// api/download-report.js
// レポートPDFをダウンロードするエンドポイント

const ordersDB = require('../core/database/orders-db');

module.exports = async (req, res) => {
  const { orderId } = req.query;
  
  if (!orderId) {
    return res.status(400).send('注文IDが指定されていません');
  }
  
  try {
    // 注文情報を取得
    const order = await ordersDB.getOrder(orderId);
    
    if (!order) {
      return res.status(404).send('レポートが見つかりません');
    }
    
    if (order.status !== 'completed') {
      return res.status(400).send(`レポートは${order.status === 'generating' ? '生成中' : '未完成'}です`);
    }
    
    // ファイルシステムから読み込む
    const fs = require('fs').promises;
    const path = require('path');
    const pdfPath = process.env.VERCEL 
      ? path.join('/tmp', 'orders', `${orderId}.pdf`)
      : path.join(process.cwd(), 'orders', `${orderId}.pdf`);
    
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      
      // HTMLファイルとして表示（ブラウザで閲覧可能にする）
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // attachmentを削除してブラウザで表示できるようにする
      // res.setHeader('Content-Disposition', `attachment; filename="premium_report_${orderId}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err) {
      console.error('PDFファイル読み込みエラー:', err);
      
      // Vercel環境では一時的なので、エラーメッセージを返す
      if (process.env.VERCEL) {
        return res.status(404).send('レポートファイルが見つかりません。レポート生成から時間が経過している場合は、再度生成してください。');
      }
    }
    
    return res.status(404).send('レポートファイルが見つかりません');
    
  } catch (error) {
    console.error('レポートダウンロードエラー:', error);
    return res.status(500).send('エラーが発生しました');
  }
};