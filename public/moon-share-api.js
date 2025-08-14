// サーバーサイドでOGP画像を動的に生成するためのAPIエンドポイント
const express = require('express');
const router = express.Router();
const { createCanvas } = require('canvas');
const path = require('path');

// 月タイプのデータ
const moonTypeData = {
    '新月': {
        emoji: '🌑',
        title: '始まりと可能性の開拓者',
        colors: ['#1a1a2e', '#16213e']
    },
    '三日月': {
        emoji: '🌒',
        title: '繊細で優しい観察者',
        colors: ['#0f3460', '#16213e']
    },
    '上弦の月': {
        emoji: '🌓',
        title: '決断力と実行力の戦略家',
        colors: ['#533483', '#764ba2']
    },
    '十三夜': {
        emoji: '🌔',
        title: '美と調和を求める安定型',
        colors: ['#e74c3c', '#c0392b']
    },
    '満月': {
        emoji: '🌕',
        title: '情熱と感情豊かな表現者',
        colors: ['#f39c12', '#e67e22']
    },
    '十六夜': {
        emoji: '🌖',
        title: '成熟した余裕の包容者',
        colors: ['#e67e22', '#d35400']
    },
    '下弦の月': {
        emoji: '🌗',
        title: '分析力と整理整頓の完璧主義者',
        colors: ['#16a085', '#27ae60']
    },
    '暁': {
        emoji: '🌘',
        title: '内省と深い洞察の哲学者',
        colors: ['#34495e', '#2c3e50']
    }
};

// OGP画像生成エンドポイント
router.get('/og-image/:moonType', async (req, res) => {
    const moonType = decodeURIComponent(req.params.moonType);
    const data = moonTypeData[moonType];
    
    if (!data) {
        return res.status(404).send('Moon type not found');
    }
    
    try {
        // Canvas作成
        const canvas = createCanvas(1200, 630);
        const ctx = canvas.getContext('2d');
        
        // グラデーション背景
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, data.colors[0]);
        gradient.addColorStop(1, data.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 装飾的な円
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(150, 150, 120, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(1050, 480, 180, 0, Math.PI * 2);
        ctx.fill();
        
        // テキスト描画
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('おつきさま診断', canvas.width / 2, 140);
        
        // 月の絵文字
        ctx.font = '160px serif';
        ctx.fillText(data.emoji, canvas.width / 2, 320);
        
        // 月タイプ
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`${moonType}タイプ`, canvas.width / 2, 410);
        
        // タイトル
        ctx.font = '28px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(data.title, canvas.width / 2, 460);
        
        // サブテキスト
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('生まれた日の月があなたの', canvas.width / 2, 515);
        ctx.fillText('本当の性格と恋愛スタイルを教えます', canvas.width / 2, 550);
        
        // URL
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 570, canvas.width, 60);
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🌙 love-tsukuyomi.com/moon', canvas.width / 2, 605);
        
        // PNG画像として送信
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=31536000'); // 1年間キャッシュ
        res.send(buffer);
        
    } catch (error) {
        console.error('Error generating OG image:', error);
        res.status(500).send('Error generating image');
    }
});

// 動的OGPページ生成
router.get('/share/:moonType', (req, res) => {
    const moonType = decodeURIComponent(req.params.moonType);
    const data = moonTypeData[moonType];
    
    if (!data) {
        return res.redirect('/moon-fortune.html');
    }
    
    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>私は${moonType}タイプ！ - おつきさま診断</title>
    
    <!-- OGP設定 -->
    <meta property="og:title" content="私は${moonType}タイプでした！ ${data.emoji}">
    <meta property="og:description" content="${data.title} - おつきさま診断で本当の自分がわかる">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://love-tsukuyomi.com/share/${encodeURIComponent(moonType)}">
    <meta property="og:image" content="https://love-tsukuyomi.com/api/og-image/${encodeURIComponent(moonType)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="私は${moonType}タイプでした！ ${data.emoji}">
    <meta name="twitter:description" content="${data.title} - おつきさま診断">
    <meta name="twitter:image" content="https://love-tsukuyomi.com/api/og-image/${encodeURIComponent(moonType)}">
    
    <script>
        // 自動的に診断ページにリダイレクト
        setTimeout(() => {
            window.location.href = '/moon-fortune.html';
        }, 1000);
    </script>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: sans-serif;">
        <h1>おつきさま診断</h1>
        <div style="font-size: 100px;">${data.emoji}</div>
        <h2>${moonType}タイプ</h2>
        <p>${data.title}</p>
        <p>診断ページに移動中...</p>
    </div>
</body>
</html>
    `;
    
    res.send(html);
});

module.exports = router;