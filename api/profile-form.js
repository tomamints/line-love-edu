/**
 * プロファイルフォームのHTMLサーバー
 * LINEからアクセスされた時にフォームHTMLを返す
 */

const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
    // GETリクエストでHTMLフォームを返す
    if (req.method === 'GET' && !req.query.action) {
        const userId = req.query.userId;
        
        // moon-fortune.htmlを読み込んで返す
        const htmlPath = path.join(__dirname, '..', 'public', 'moon-fortune.html');
        
        try {
            let html = fs.readFileSync(htmlPath, 'utf8');
            
            // userIdをJavaScriptで使えるようにする
            if (userId) {
                const userIdScript = `
                <script>
                    // LINEから渡されたユーザーID
                    window.lineUserId = '${userId}';
                    sessionStorage.setItem('moon_tarot_line_user_id', '${userId}');
                    localStorage.setItem('moon_tarot_line_user_id', '${userId}');
                </script>
                `;
                html = html.replace('</head>', userIdScript + '</head>');
            }
            
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(html);
        } catch (error) {
            console.error('Error reading HTML file:', error);
            return res.status(500).json({ error: 'Failed to load form' });
        }
    }
    
    // POSTリクエストや action パラメータがある場合は profile-form-v2 に転送
    const profileFormV2 = require('./profile-form-v2');
    return profileFormV2(req, res);
};