
const crypto = require("crypto");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

// PayPay認証情報
const API_KEY = "a_7Nh7OQU4LD_sgIG";
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";
const MERCHANT_ID = "958667152543465472";

console.log("\n🎯 PayPay決済テスト - 実際の決済フロー\n");
console.log("=" .repeat(50));

// HMAC署名を生成
function createAuthHeader(method, path, body) {
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4().substring(0, 8);
    
    let contentType = "empty";
    let payloadDigest = "empty";
    
    if (body) {
        contentType = "application/json";
        const bodyStr = JSON.stringify(body);
        
        const md5 = crypto.createHash("md5");
        md5.update(contentType);
        md5.update(bodyStr);
        payloadDigest = md5.digest("base64");
    }
    
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        payloadDigest
    ].join("\n");
    
    const hmac = crypto.createHmac("sha256", API_SECRET);
    hmac.update(signatureData);
    const signature = hmac.digest("base64");
    
    return `hmac OPA-Auth:${API_KEY}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
}

// 1. QRコード作成
async function createPaymentQRCode() {
    const payload = {
        merchantPaymentId: `test_payment_${Date.now()}`,
        amount: {
            amount: 100,  // テスト用に100円
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "テスト決済 - おつきさま診断",
        redirectUrl: "https://line-love-edu.vercel.app/payment-success.html",
        redirectType: "WEB_LINK",
        orderItems: [{
            name: "テスト商品",
            category: "DIGITAL_CONTENT",
            quantity: 1,
            productId: "test_product",
            unitPrice: {
                amount: 100,
                currency: "JPY"
            }
        }]
    };
    
    const bodyStr = JSON.stringify(payload);
    const authHeader = createAuthHeader("POST", "/v2/codes", payload);
    
    const options = {
        hostname: "stg-api.paypay.ne.jp",
        port: 443,
        path: "/v2/codes",
        method: "POST",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
            "X-ASSUME-MERCHANT": MERCHANT_ID
        }
    };
    
    console.log("\n📱 STEP 1: QRコード生成");
    console.log("-" .repeat(40));
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    
                    if (res.statusCode === 201 && parsed.data) {
                        console.log("✅ 成功！QRコードが生成されました");
                        console.log("");
                        console.log("📊 決済情報:");
                        console.log("  - 金額: ¥100");
                        console.log("  - 決済ID:", payload.merchantPaymentId);
                        console.log("  - QRコードID:", parsed.data.codeId);
                        console.log("");
                        console.log("🔗 決済URL:");
                        console.log("  ", parsed.data.url);
                        console.log("");
                        console.log("📱 このURLをブラウザで開いて決済を完了してください");
                        console.log("  （PayPayアプリがインストールされている必要があります）");
                        resolve({
                            merchantPaymentId: payload.merchantPaymentId,
                            codeId: parsed.data.codeId,
                            url: parsed.data.url
                        });
                    } else {
                        console.log("❌ エラー:", parsed.resultInfo?.message || "Unknown error");
                        reject(new Error(parsed.resultInfo?.message));
                    }
                } catch (e) {
                    console.log("Parse error:", e);
                    reject(e);
                }
            });
        });
        
        req.on("error", (e) => {
            console.error("Request error:", e);
            reject(e);
        });
        
        req.write(bodyStr);
        req.end();
    });
}

// 2. 決済状態を確認
async function checkPaymentStatus(merchantPaymentId) {
    const path = `/v2/codes/payments/${merchantPaymentId}`;
    const authHeader = createAuthHeader("GET", path, null);
    
    const options = {
        hostname: "stg-api.paypay.ne.jp",
        port: 443,
        path: path,
        method: "GET",
        headers: {
            "Authorization": authHeader,
            "X-ASSUME-MERCHANT": MERCHANT_ID
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 200 && parsed.data) {
                        resolve(parsed.data);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on("error", (e) => {
            reject(e);
        });
        
        req.end();
    });
}

// メイン処理
async function runPaymentTest() {
    try {
        // QRコード生成
        const payment = await createPaymentQRCode();
        
        console.log("\n=" .repeat(50));
        console.log("\n📊 STEP 2: 決済状態の確認");
        console.log("-" .repeat(40));
        console.log("30秒間、5秒ごとに決済状態を確認します...");
        console.log("");
        
        // 30秒間、5秒ごとに決済状態を確認
        let attempts = 0;
        const maxAttempts = 6;
        
        const checkInterval = setInterval(async () => {
            attempts++;
            
            try {
                const status = await checkPaymentStatus(payment.merchantPaymentId);
                
                if (status) {
                    console.log(`[確認 ${attempts}/${maxAttempts}] 決済完了！`);
                    console.log("  - ステータス:", status.status);
                    console.log("  - 金額: ¥", status.amount?.amount);
                    clearInterval(checkInterval);
                    
                    console.log("\n=" .repeat(50));
                    console.log("\n✅ テスト完了！");
                    console.log("PayPay決済が正常に動作しています。");
                } else {
                    console.log(`[確認 ${attempts}/${maxAttempts}] 決済待機中...`);
                    
                    if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        console.log("\n⏱️ タイムアウト");
                        console.log("決済が完了していません。URLから手動で決済を試してください。");
                        console.log("URL:", payment.url);
                    }
                }
            } catch (error) {
                console.error("Status check error:", error);
            }
        }, 5000);
        
    } catch (error) {
        console.error("\n❌ エラー:", error.message);
    }
}

// 実行
runPaymentTest();

