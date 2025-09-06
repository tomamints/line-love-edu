
const crypto = require("crypto");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

// PayPay認証情報
const API_KEY = "a_7Nh7OQU4LD_sgIG";
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";
const MERCHANT_ID = "958667152543465472";

console.log("=== PayPay QR Code Creation (Working Version) ===\n");

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

// QRコード作成
async function createPaymentQRCode() {
    const payload = {
        merchantPaymentId: `payment_${Date.now()}`,
        amount: {
            amount: 2980,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "おつきさま診断 - 完全版",
        redirectUrl: "https://line-love-edu.vercel.app/payment-success.html",
        redirectType: "WEB_LINK",
        orderItems: [{
            name: "おつきさま診断 完全版",
            category: "DIGITAL_CONTENT",
            quantity: 1,
            productId: "otsukisama_full",
            unitPrice: {
                amount: 2980,
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
    
    console.log("Creating PayPay QR Code...");
    console.log("Amount: ¥2,980");
    console.log("Description: おつきさま診断 - 完全版\n");
    
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
                        console.log("✅ SUCCESS! PayPay QR Code created!");
                        console.log("\n=== Payment Details ===");
                        console.log("Payment URL:", parsed.data.url);
                        console.log("QR Code ID:", parsed.data.codeId);
                        console.log("Merchant Payment ID:", payload.merchantPaymentId);
                        console.log("\nOpen this URL to complete payment:");
                        console.log(parsed.data.url);
                        console.log("\nNote: This is a STAGING environment payment");
                        resolve(parsed.data);
                    } else {
                        console.log("❌ Error:", parsed.resultInfo?.message || "Unknown error");
                        console.log("Full response:", JSON.stringify(parsed, null, 2));
                        reject(new Error(parsed.resultInfo?.message));
                    }
                } catch (e) {
                    console.log("Parse error:", e);
                    console.log("Response:", data);
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

// 実行
createPaymentQRCode().catch(console.error);

