const MoonFortuneEngineV2 = require('../core/moon-fortune-v2');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userBirthdate, partnerBirthdate } = req.body || {};

    if (!userBirthdate || !partnerBirthdate) {
      return res.status(400).json({
        success: false,
        error: '生年月日が足りません。両方の生年月日を入力してください。'
      });
    }

    const engine = new MoonFortuneEngineV2();
    const reading = engine.generateCompleteReading(userBirthdate, partnerBirthdate);

    if (!reading || !reading.compatibility) {
      return res.status(500).json({
        success: false,
        error: '診断結果の生成に失敗しました。'
      });
    }

    const userMoon = reading.user || {};
    const partnerMoon = reading.partner || {};
    const compatibility = reading.compatibility || {};
    const specific = compatibility.specific || {};

    const summary = `${userMoon.emoji || ''}${userMoon.moonType || ''} × ${partnerMoon.emoji || ''}${partnerMoon.moonType || ''} は ${compatibility.score || '-'}点（${compatibility.level || '相性'}）`;
    const detailChunks = [];

    if (compatibility.description) detailChunks.push(compatibility.description);
    if (specific.reason) detailChunks.push(specific.reason);
    if (specific.example) detailChunks.push(specific.example);

    const detail = detailChunks.join('\n\n');
    const relationship = specific.relationship || specific.example || '';

    let adviceArray = [];
    if (Array.isArray(specific.advice)) {
      adviceArray = specific.advice;
    } else if (specific.advice && typeof specific.advice === 'object') {
      adviceArray = Object.entries(specific.advice).map(([key, value]) => `${key}: ${value}`);
    } else if (typeof specific.advice === 'string') {
      adviceArray = [specific.advice];
    }

    const shareText = `${summary}\n${detail}\nhttps://line-love-edu.vercel.app/compatibility.html`;

    return res.json({
      success: true,
      data: {
        user: userMoon,
        partner: partnerMoon,
        compatibility: {
          score: compatibility.score,
          level: compatibility.level,
          summary,
          detail
        },
        relationship,
        advice: adviceArray,
        shareText
      }
    });
  } catch (error) {
    console.error('Compatibility API error:', error);
    return res.status(500).json({
      success: false,
      error: '診断中にエラーが発生しました。'
    });
  }
};
