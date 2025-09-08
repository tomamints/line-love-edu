// api/download-report.js
// PDFレポートダウンロード用のスタブファイル
// 実際の機能は後で実装予定

module.exports = async (req, res) => {
  try {
    // 一時的にエラーメッセージを返す
    res.status(501).json({
      error: 'PDF download feature is not yet implemented',
      message: 'この機能は現在開発中です'
    });
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};