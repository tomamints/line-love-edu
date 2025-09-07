/**
 * LINE アプリへのリダイレクトAPI
 * PayPayから戻ってきたユーザーをLINEアプリに転送する
 */

module.exports = async function handler(req, res) {
    // URLパラメータを取得
    const { id, userId, merchantPaymentId } = req.query;
    
    console.log('[LINE Redirect] Params:', { id, userId, merchantPaymentId });
    
    // User-Agentをチェック
    const userAgent = req.headers['user-agent'] || '';
    const isLineApp = userAgent.includes('Line/') || userAgent.includes('LIFF');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    
    console.log('[LINE Redirect] User-Agent:', userAgent);
    console.log('[LINE Redirect] Is LINE App:', isLineApp);
    console.log('[LINE Redirect] Is Mobile:', isMobile);
    
    // モバイルの場合、LINEアプリを開く
    if (isMobile) {
        // まず成功ページを表示してからLINEに戻す
        const successUrl = `https://line-love-edu.vercel.app/payment-success.html?id=${id}&userId=${userId || ''}&merchantPaymentId=${merchantPaymentId || ''}&autoReturn=true`;
        
        // メタタグでリダイレクト（LINEアプリを開く）
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>決済完了 - LINEに戻ります</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin: 0;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 400px;
        }
        .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: bounce 0.5s;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.6;
        }
        .loading {
            margin-top: 30px;
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: #00B900;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✅</div>
        <h1>決済が完了しました</h1>
        <p>
            お支払いありがとうございます。<br>
            3秒後にLINEアプリに戻ります...
        </p>
        <div class="loading">
            <div class="spinner"></div>
        </div>
        <a href="line://nv/chat" class="btn">今すぐLINEに戻る</a>
    </div>
    
    <script>
        // 自動的にLINEアプリを開く
        setTimeout(function() {
            // LINEアプリを開く
            window.location.href = 'line://nv/chat';
            
            // もしLINEアプリが開かない場合は成功ページへ
            setTimeout(function() {
                window.location.href = '${successUrl}';
            }, 1000);
        }, 3000);
    </script>
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    }
    
    // デスクトップの場合は通常の成功ページへ
    const successUrl = `https://line-love-edu.vercel.app/payment-success.html?id=${id}&userId=${userId || ''}&merchantPaymentId=${merchantPaymentId || ''}`;
    return res.redirect(302, successUrl);
}