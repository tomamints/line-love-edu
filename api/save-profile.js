// LIFFからのプロファイル保存API
const { Client } = require('@line/bot-sdk');
const UserProfileManager = require('../core/user-profile');
const MoonFortuneEngine = require('../core/moon-fortune');

const client = new Client({
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

const profileManager = new UserProfileManager();
const moonEngine = new MoonFortuneEngine();

module.exports = async (req, res) => {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // アクセストークンからユーザーIDを取得
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // LINEのプロファイルを取得
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to get LINE profile');
    }
    
    const lineProfile = await profileResponse.json();
    const userId = lineProfile.userId;
    
    // リクエストボディからプロファイルデータを取得
    const {
      userName,
      birthDate,
      gender,
      partnerName,
      partnerBirthDate,
      partnerGender
    } = req.body;
    
    // プロファイルを保存
    await profileManager.saveProfile(userId, {
      userName,
      birthDate,
      gender,
      partnerName,
      partnerBirthDate,
      partnerGender,
      status: 'complete',
      completedAt: new Date().toISOString()
    });
    
    // 月相占いレポートを生成
    const moonReport = moonEngine.generateFreeReport(
      {
        birthDate,
        birthTime: '00:00',
        gender
      },
      {
        birthDate: partnerBirthDate,
        birthTime: '00:00',
        gender: partnerGender
      }
    );
    
    // フォーマット済みのテキストを取得
    const reportText = moonEngine.formatReportForLine(moonReport);
    
    // LINEにメッセージを送信
    await client.pushMessage(userId, [
      {
        type: 'text',
        text: reportText
      },
      {
        type: 'flex',
        altText: 'さらに詳しい占いを見る',
        contents: {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://line-love-edu.vercel.app/images/moon-fortune.jpg',
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '✨ より詳しい相性分析',
                weight: 'bold',
                size: 'xl',
                margin: 'md'
              },
              {
                type: 'text',
                text: 'トーク履歴から二人の深層心理を分析',
                size: 'sm',
                color: '#999999',
                margin: 'md',
                wrap: true
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'lg',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '【プレミアム機能】',
                    size: 'sm',
                    color: '#764ba2',
                    weight: 'bold'
                  },
                  {
                    type: 'text',
                    text: '・詳細な月相相性分析',
                    size: 'xs',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: '・今後3ヶ月の関係性予測',
                    size: 'xs',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: '・ベストタイミングカレンダー',
                    size: 'xs',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: '・具体的なアプローチ方法',
                    size: 'xs',
                    color: '#666666'
                  }
                ]
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                style: 'primary',
                height: 'sm',
                action: {
                  type: 'message',
                  label: 'トーク履歴を送信する',
                  text: 'トーク履歴を送信して詳細分析を開始'
                },
                color: '#764ba2'
              },
              {
                type: 'text',
                text: '今なら ¥1,980（通常 ¥2,980）',
                size: 'xs',
                color: '#FF5551',
                align: 'center',
                margin: 'sm'
              }
            ]
          }
        }
      }
    ]);
    
    return res.status(200).json({ 
      success: true,
      message: 'プロファイル保存完了',
      moonPhase: {
        user: moonReport.user.moonPhaseType.name,
        partner: moonReport.partner.moonPhaseType.name,
        compatibility: moonReport.compatibility.score
      }
    });
    
  } catch (error) {
    console.error('プロファイル保存エラー:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};