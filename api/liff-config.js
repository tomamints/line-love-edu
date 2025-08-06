// LIFF設定を返すAPI
module.exports = async (req, res) => {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // 環境変数から設定を取得
  const config = {
    liffId: process.env.LIFF_ID || '2006754848-5GVVkzzV',
    apiUrl: process.env.BASE_URL ? 
      `${process.env.BASE_URL}/api/save-profile` : 
      'https://line-love-edu.vercel.app/api/save-profile'
  };
  
  return res.status(200).json(config);
};