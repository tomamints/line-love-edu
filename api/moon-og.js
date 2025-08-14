// 統合版: OGPページと画像生成を1つのエンドポイントで処理
const { createCanvas } = require('canvas');

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

function generateImage(moonType) {
    const data = moonType ? moonTypeData[moonType] : null;
    
    // Canvas作成
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    
    if (!data) {
        // デフォルト画像
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 72px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('おつきさま診断', canvas.width / 2, 200);
        
        ctx.font = '180px serif';
        ctx.fillText('🌙', canvas.width / 2, 380);
        
        ctx.font = '32px sans-serif';
        ctx.fillText('あなたの月タイプを知ろう', canvas.width / 2, 480);
        
        return canvas.toBuffer('image/png');
    }
    
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
    
    ctx.beginPath();
    ctx.arc(600, 100, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // タイトル背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 60, canvas.width, 120);
    
    // テキスト描画
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText('おつきさま診断', canvas.width / 2, 140);
    ctx.shadowBlur = 0;
    
    // 月の絵文字（背景付き）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 280, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = '160px serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.fillText(data.emoji, canvas.width / 2, 320);
    ctx.shadowBlur = 0;
    
    // 月タイプ名
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(`${moonType}タイプ`, canvas.width / 2, 410);
    ctx.shadowBlur = 0;
    
    // キャッチフレーズ
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(data.title, canvas.width / 2, 460);
    
    // サブテキスト
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '24px sans-serif';
    ctx.fillText('生まれた日の月があなたの', canvas.width / 2, 515);
    ctx.fillText('本当の性格と恋愛スタイルを教えます', canvas.width / 2, 550);
    
    // URL（背景付き）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 570, canvas.width, 60);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌙 love-tsukuyomi.com/moon', canvas.width / 2, 605);
    
    return canvas.toBuffer('image/png');
}

module.exports = async (req, res) => {
    const { type, mode } = req.query;
    
    // 画像生成モード
    if (mode === 'image') {
        const moonType = type ? decodeURIComponent(type) : null;
        const buffer = generateImage(moonType);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(200).send(buffer);
    }
    
    // OGPページ生成モード（デフォルト）
    const moonType = type ? decodeURIComponent(type) : null;
    
    if (!moonType) {
        // デフォルトページ
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>おつきさま診断 - あなたの月タイプを知ろう</title>
    <meta property="og:title" content="おつきさま診断 🌙 あなたの月タイプを知ろう">
    <meta property="og:description" content="生まれた日の月があなたの本当の性格と恋愛スタイルを教えます">
    <meta property="og:image" content="https://love-tsukuyomi.com/api/moon-og?mode=image">
    <meta property="og:url" content="https://love-tsukuyomi.com/moon-fortune.html">
    <meta name="twitter:card" content="summary_large_image">
    <script>window.location.href = 'https://love-tsukuyomi.com/moon-fortune.html';</script>
</head>
<body>
    <p>診断ページに移動中...</p>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    }
    
    const data = moonTypeData[moonType];
    if (!data) {
        res.setHeader('Location', 'https://love-tsukuyomi.com/moon-fortune.html');
        return res.status(302).end();
    }
    
    // OGP画像のURL
    const ogImageUrl = `https://love-tsukuyomi.com/api/moon-og?mode=image&type=${encodeURIComponent(moonType)}`;
    
    // 動的OGPページ
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
    <meta property="og:url" content="https://love-tsukuyomi.com/api/moon-og?type=${encodeURIComponent(moonType)}">
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
            window.location.href = 'https://love-tsukuyomi.com/moon-fortune.html';
        }, 3000);
    </script>
</head>
<body>
    <div class="container">
        <div class="emoji">${data.emoji}</div>
        <h1>${moonType}タイプ</h1>
        <p>${data.title}</p>
        <p style="font-size: 14px; opacity: 0.7;">このページは自動的に診断ページに移動します...</p>
        <a href="https://love-tsukuyomi.com/moon-fortune.html" class="btn">今すぐ診断する</a>
    </div>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(html);
};