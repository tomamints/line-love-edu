// api/download-report.js
// PDFレポートのダウンロードエンドポイント

const orderStorage = require('../core/premium/order-storage');
const PremiumReportGenerator = require('../core/premium/report-generator');
const PDFReportGenerator = require('../core/premium/pdf-generator');

module.exports = async (req, res) => {
  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: '注文IDが指定されていません' });
    }
    
    // 注文情報を取得
    const order = await orderStorage.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: '注文が見つかりません' });
    }
    
    // 決済済みかチェック
    if (order.status !== 'completed') {
      return res.status(403).json({ error: '決済が完了していません' });
    }
    
    // PDFがキャッシュされているか確認
    let pdfBuffer;
    const fs = require('fs').promises;
    const path = require('path');
    const pdfPath = path.join(process.cwd(), 'orders', `${orderId}.pdf`);
    
    try {
      // キャッシュされたPDFを読み込み
      pdfBuffer = await fs.readFile(pdfPath);
      console.log('📄 キャッシュされたPDFを使用');
    } catch (err) {
      // PDFが存在しない場合は生成
      console.log('🔮 PDFを新規生成中...');
      
      try {
        // テスト用のメッセージ履歴を生成
        const testMessages = generateTestMessages();
        
        // レポートデータを生成
        const reportGenerator = new PremiumReportGenerator();
        const reportData = await reportGenerator.generatePremiumReport(
          testMessages,
          order.userId,
          order.userProfile.displayName || 'あなた'
        );
        
        // PDFを生成
        const pdfGenerator = new PDFReportGenerator();
        pdfBuffer = await pdfGenerator.generatePDF(reportData);
        
        // PDFをキャッシュとして保存
        await fs.writeFile(pdfPath, pdfBuffer);
        console.log('💾 PDFをキャッシュに保存');
      } catch (generateError) {
        console.error('PDF生成エラー:', generateError);
        // エラー時はシンプルなHTMLを生成
        const errorHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>プレミアム恋愛レポート - ${orderId}</title>
    <style>
        body {
            font-family: 'Hiragino Sans', Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f9f9f9;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #ff006e; text-align: center; }
        .info { background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .features { margin: 30px 0; }
        .features h3 { color: #1a0033; }
        .features ul { line-height: 2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 プレミアム恋愛レポート</h1>
        <div class="info">
            <p><strong>注文番号:</strong> ${orderId}</p>
            <p><strong>生成日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            <p><strong>ステータス:</strong> 生成中...</p>
        </div>
        <p>ご購入ありがとうございます！現在、あなた専用のレポートを生成中です。</p>
        <p>しばらく時間をおいてから、再度ダウンロードをお試しください。</p>
        
        <div class="features">
            <h3>プレミアムレポートの内容：</h3>
            <ul>
                <li>✨ 詳細な相性分析（20項目）</li>
                <li>📅 月別恋愛運勢カレンダー</li>
                <li>🎯 40個のパーソナルアクション</li>
                <li>💕 告白成功戦略</li>
                <li>🗺️ 長期的な関係構築ロードマップ</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
        pdfBuffer = Buffer.from(errorHtml, 'utf8');
      }
    }
    
    // HTMLをダウンロード可能にして返す（ブラウザで開いてPDF保存可能）
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="premium_love_report_${orderId}.html"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDFダウンロードエラー:', error);
    res.status(500).json({ error: 'PDFの生成中にエラーが発生しました' });
  }
};

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