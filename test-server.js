/**
 * PayPay決済テスト用ローカルサーバー
 * 使用方法:
 * 1. .env.localファイルにPayPay認証情報を設定
 * 2. node test-server.js で起動
 * 3. http://localhost:3000/payment-select.html?id=test123&userId=testuser にアクセス
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// .env.localファイルを読み込む
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.log('⚠️ .env.localファイルが見つかりません。環境変数を直接設定してください。');
}

// PayPay APIハンドラーをインポート（手動HMAC実装版）
const createPayPaySession = require('./api/create-paypay-session.js');

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log(`📥 ${req.method} ${pathname}`);
    
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 静的ファイルの配信
    if (pathname.endsWith('.html') || pathname.endsWith('.js') || pathname.endsWith('.css')) {
        const filePath = path.join(__dirname, 'public', pathname.replace('/', ''));
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath);
            const contentType = pathname.endsWith('.html') ? 'text/html' :
                              pathname.endsWith('.js') ? 'text/javascript' :
                              pathname.endsWith('.css') ? 'text/css' : 'text/plain';
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(content);
            res.end();
            return;
        }
    }
    
    // PayPay APIエンドポイント
    if (pathname === '/api/create-paypay-session' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                req.body = data;
                
                // Express風のレスポンスオブジェクトをエミュレート
                const mockRes = {
                    statusCode: 200,
                    headers: {},
                    setHeader: (key, value) => {
                        mockRes.headers[key] = value;
                        res.setHeader(key, value);
                    },
                    status: (code) => {
                        mockRes.statusCode = code;
                        return mockRes;
                    },
                    json: (data) => {
                        res.writeHead(mockRes.statusCode, { 
                            'Content-Type': 'application/json',
                            ...mockRes.headers
                        });
                        res.write(JSON.stringify(data));
                        res.end();
                    },
                    end: () => res.end()
                };
                
                // PayPayハンドラーを実行
                await createPayPaySession(req, mockRes);
                
            } catch (error) {
                console.error('❌ エラー:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ error: error.message }));
                res.end();
            }
        });
        
        return;
    }
    
    // その他のAPIエンドポイント（モック）
    if (pathname === '/api/get-love-profile') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ 
            success: true, 
            exists: true,
            hasProfile: true 
        }));
        res.end();
        return;
    }
    
    // ルートへのアクセス
    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>PayPay決済テスト</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .links {
                        margin: 20px 0;
                    }
                    a {
                        display: block;
                        margin: 10px 0;
                        padding: 15px;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        text-align: center;
                    }
                    a:hover {
                        background: #764ba2;
                    }
                    .env-status {
                        background: #f0f0f0;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .env-ok { color: green; }
                    .env-ng { color: red; }
                </style>
            </head>
            <body>
                <h1>🎯 PayPay決済テストサーバー</h1>
                
                <div class="env-status">
                    <h3>環境変数の状態:</h3>
                    <p class="${process.env.PAYPAY_API_KEY ? 'env-ok' : 'env-ng'}">
                        PAYPAY_API_KEY: ${process.env.PAYPAY_API_KEY ? '✅ 設定済み' : '❌ 未設定'}
                    </p>
                    <p class="${process.env.PAYPAY_API_SECRET ? 'env-ok' : 'env-ng'}">
                        PAYPAY_API_SECRET: ${process.env.PAYPAY_API_SECRET ? '✅ 設定済み' : '❌ 未設定'}
                    </p>
                    <p class="${process.env.PAYPAY_MERCHANT_ID ? 'env-ok' : 'env-ng'}">
                        PAYPAY_MERCHANT_ID: ${process.env.PAYPAY_MERCHANT_ID ? '✅ 設定済み' : '❌ 未設定'}
                    </p>
                    <p>PAYPAY_ENV: ${process.env.PAYPAY_ENV || 'sandbox'}</p>
                </div>
                
                <div class="links">
                    <h3>テストリンク:</h3>
                    <a href="/payment-select.html?id=test123&userId=testuser">
                        決済選択画面（payment-select.html）
                    </a>
                    <a href="/moon-tarot.html?userId=U12345678901234567890123456789012">
                        タロット占い（moon-tarot.html）
                    </a>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                    <h4>📝 使い方:</h4>
                    <ol>
                        <li>.env.localファイルにPayPay認証情報を設定してください</li>
                        <li>サーバーを再起動してください（Ctrl+C → node test-server.js）</li>
                        <li>上記のリンクから決済フローをテストしてください</li>
                    </ol>
                </div>
            </body>
            </html>
        `);
        res.end();
        return;
    }
    
    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found');
    res.end();
});

server.listen(PORT, () => {
    console.log(`
🚀 テストサーバー起動完了
================================
URL: http://localhost:${PORT}
================================

環境変数の状態:
- PAYPAY_API_KEY: ${process.env.PAYPAY_API_KEY ? '✅ 設定済み' : '❌ 未設定'}
- PAYPAY_API_SECRET: ${process.env.PAYPAY_API_SECRET ? '✅ 設定済み' : '❌ 未設定'}
- PAYPAY_MERCHANT_ID: ${process.env.PAYPAY_MERCHANT_ID ? '✅ 設定済み' : '❌ 未設定'}
- PAYPAY_ENV: ${process.env.PAYPAY_ENV || 'sandbox'}

ブラウザで http://localhost:${PORT} を開いてテストを開始してください。
    `);
    
    if (!process.env.PAYPAY_API_KEY || !process.env.PAYPAY_API_SECRET || !process.env.PAYPAY_MERCHANT_ID) {
        console.log(`
⚠️  警告: PayPay認証情報が設定されていません！
.env.localファイルに以下を設定してください:

PAYPAY_API_KEY=your_api_key
PAYPAY_API_SECRET=your_api_secret  
PAYPAY_MERCHANT_ID=your_merchant_id
        `);
    }
});