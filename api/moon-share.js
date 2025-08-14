// Vercel Serverless Function for dynamic OGP
const { createCanvas } = require('canvas');

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

module.exports = async (req, res) => {
    // パスから月タイプを取得
    const { type } = req.query;
    
    if (!type) {
        // 月タイプが指定されていない場合は通常のOGPページを返す
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>おつきさま診断 - あなたの月タイプを知ろう</title>
    <meta property="og:title" content="おつきさま診断 🌙 あなたの月タイプを知ろう">
    <meta property="og:description" content="生まれた日の月があなたの本当の性格と恋愛スタイルを教えます">
    <meta property="og:image" content="https://love-tsukuyomi.com/moon-share.png">
    <meta property="og:url" content="https://love-tsukuyomi.com/moon-fortune.html">
    <meta name="twitter:card" content="summary_large_image">
    <script>window.location.href = '/moon-fortune.html';</script>
</head>
<body>
    <p>診断ページに移動中...</p>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    }
    
    const moonType = decodeURIComponent(type);
    const data = moonTypeData[moonType];
    
    if (!data) {
        // 無効な月タイプの場合は通常の診断ページにリダイレクト
        res.setHeader('Location', '/moon-fortune.html');
        return res.status(302).end();
    }
    
    // OGP画像のURL（別のエンドポイントで生成）
    const ogImageUrl = `https://love-tsukuyomi.com/api/moon-image?type=${encodeURIComponent(moonType)}`;
    
    // 動的OGPページを生成
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>私は${moonType}タイプ！ - おつきさま診断</title>
    
    <!-- OGP設定 -->
    <meta property="og:title" content="私は${moonType}タイプでした！ ${data.emoji}">
    <meta property="og:description" content="${data.title} - おつきさま診断で本当の自分がわかる✨">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://love-tsukuyomi.com/api/moon-share?type=${encodeURIComponent(moonType)}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="おつきさま診断">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="私は${moonType}タイプでした！ ${data.emoji}">
    <meta name="twitter:description" content="${data.title}">
    <meta name="twitter:image" content="${ogImageUrl}">
    
    <style>
        body {
            font-family: 'Kiwi Maru', sans-serif;
            background: linear-gradient(135deg, ${data.colors[0]} 0%, ${data.colors[1]} 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            color: white;
        }
        .container {
            text-align: center;
            padding: 20px;
        }
        .emoji {
            font-size: 120px;
            margin: 20px 0;
        }
        h1 {
            font-size: 36px;
            margin: 20px 0;
        }
        p {
            font-size: 18px;
            opacity: 0.9;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 16px 32px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            border-radius: 12px;
            color: white;
            text-decoration: none;
            font-size: 18px;
            margin-top: 30px;
            transition: all 0.3s;
        }
        .btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
    <script>
        // 3秒後に診断ページにリダイレクト
        setTimeout(() => {
            window.location.href = '/moon-fortune.html';
        }, 3000);
    </script>
</head>
<body>
    <div class="container">
        <div class="emoji">${data.emoji}</div>
        <h1>${moonType}タイプ</h1>
        <p>${data.title}</p>
        <p style="font-size: 14px; opacity: 0.7;">このページは自動的に診断ページに移動します...</p>
        <a href="/moon-fortune.html" class="btn">今すぐ診断する</a>
    </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(html);
};