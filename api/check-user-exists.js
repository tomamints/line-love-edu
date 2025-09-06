/**
 * ユーザーIDが実際にLINEプロファイルに存在するかチェックするAPI
 */

const ordersDB = require('../core/ordersDB');

module.exports = async (req, res) => {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = req.method === 'GET' ? req.query : req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // ユーザープロファイルの存在をチェック
    const profile = await ordersDB.getProfile(userId);
    
    // プロファイルが存在するかどうか
    const exists = profile !== null && profile !== undefined;

    return res.status(200).json({
      success: true,
      exists: exists,
      hasProfile: exists
    });

  } catch (error) {
    console.error('Error checking user existence:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};