
const crypto = require("crypto");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// 環境変数を読み込む
try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    envContent.split("\n").forEach(line => {
        if (line && !line.startsWith("#")) {
            const [key, value] = line.split("=");
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.log("⚠️ .env.localファイルが見つかりません");
}

// 2024年のタイムスタンプを使用（システム時刻が2025年のため）
const FIXED_EPOCH = 1733620800; // 2024-12-08 00:00:00 UTC

// PayPay OPA SDK compatible signature
function createPayPayAuth(method, resourceUrl, body, apiKey, apiSecret) {
    const epoch = FIXED_EPOCH;
    const nonce = uuidv4();
    
    let contentType = "empty";
    let payloadDigest = "empty";
    
    if (body && Object.keys(body).length > 0) {
        contentType = "application/json";
        const jsonBody = JSON.stringify(body);
        
        // MD5 hash with content type (PayPay specific)
        const md5 = crypto.createHash("md5");
        md5.update(contentType);
        md5.update(jsonBody);
        payloadDigest = md5.digest("base64");
    }
    
    // PayPay signature format
    const signatureRawList = [
        resourceUrl,
        method,
        nonce,
        epoch,
        contentType,
        payloadDigest
    ];
    
    const signatureRawData = signatureRawList.join("\n");
    
    console.log("=== Signature Data (2024 timestamp) ===");
    console.log("URL:", resourceUrl);
    console.log("Method:", method);
    console.log("Nonce:", nonce);
    console.log("Epoch:", epoch, "(", new Date(epoch * 1000).toISOString(), ")");
    console.log("ContentType:", contentType);
    console.log("PayloadDigest:", payloadDigest);
    
    // HMAC-SHA256
    const hmac = crypto.createHmac("sha256", apiSecret);
    hmac.update(signatureRawData);
    const signature = hmac.digest("base64");
    
    console.log("Signature:", signature);
    
    // PayPay Auth header format
    const authHeader = `hmac OPA-Auth:${apiKey}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
    console.log("Auth Header:", authHeader.substring(0, 80) + "...");
    console.log("");
    
    return authHeader;
}

// Test QR Code creation with 2024 timestamp
async function testQRCode() {
    const API_KEY = process.env.PAYPAY_API_KEY;
    const API_SECRET = process.env.PAYPAY_API_SECRET;
    const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
    
    console.log("=== PayPay QR Code Creation Test (2024 timestamp) ===");
    console.log("API Key:", API_KEY);
    console.log("Merchant ID:", MERCHANT_ID);
    console.log("");
    
    const payload = {
        merchantPaymentId: `test_2024_${Date.now()}`,
        codeType: "ORDER_QR",
        amount: {
            amount: 100,
            currency: "JPY"
        },
        orderDescription: "Test Order 2024",
        redirectUrl: "https://example.com/success",
        redirectType: "WEB_LINK",
        requestedAt: FIXED_EPOCH
    };
    
    const authHeader = createPayPayAuth("POST", "/v2/codes", payload, API_KEY, API_SECRET);
    
    const jsonBody = JSON.stringify(payload);
    
    const options = {
        hostname: "stg-api.paypay.ne.jp",
        port: 443,
        path: "/v2/codes",
        method: "POST",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(jsonBody),
            "X-ASSUME-MERCHANT": MERCHANT_ID
        }
    };
    
    console.log("Request payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("");
    console.log("Sending request to:", options.hostname + options.path);
    console.log("");
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log("Status:", res.statusCode);
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 201) {
                        console.log("✅ SUCCESS!");
                        console.log("Response:", JSON.stringify(parsed, null, 2));
                        if (parsed.data) {
                            console.log("\n決済URL:", parsed.data.url);
                            console.log("QRコードID:", parsed.data.codeId);
                        }
                    } else {
                        console.log("❌ Error Response:");
                        console.log(JSON.stringify(parsed, null, 2));
                    }
                } catch (e) {
                    console.log("Response:", data);
                }
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Connection Error:", e);
            resolve();
        });
        
        req.write(jsonBody);
        req.end();
    });
}

testQRCode();

