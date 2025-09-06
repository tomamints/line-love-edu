
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

// PayPay OPA SDK compatible signature
function createPayPayAuth(method, resourceUrl, body, apiKey, apiSecret) {
    const epoch = Math.floor(Date.now() / 1000);
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
    
    console.log("=== Debug Signature Data ===");
    console.log("URL:", resourceUrl);
    console.log("Method:", method);
    console.log("Nonce:", nonce);
    console.log("Epoch:", epoch);
    console.log("ContentType:", contentType);
    console.log("PayloadDigest:", payloadDigest);
    console.log("Signature Raw (escaped):", signatureRawData.replace(/\n/g, "\\n"));
    
    // HMAC-SHA256
    const hmac = crypto.createHmac("sha256", apiSecret);
    hmac.update(signatureRawData);
    const signature = hmac.digest("base64");
    
    console.log("Signature:", signature);
    
    // PayPay Auth header format
    const authHeader = `hmac OPA-Auth:${apiKey}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
    console.log("Auth Header:", authHeader);
    console.log("");
    
    return authHeader;
}

// Test with account balance check (simpler API)
async function testAccountBalance() {
    const API_KEY = process.env.PAYPAY_API_KEY;
    const API_SECRET = process.env.PAYPAY_API_SECRET;
    const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
    
    console.log("=== Testing Account Balance API ===");
    console.log("API Key:", API_KEY);
    console.log("Merchant ID:", MERCHANT_ID);
    console.log("");
    
    // Try GET request first (simpler)
    const userAuthorizationId = "test_user";
    const path = `/v2/wallet/check_balance?userAuthorizationId=${userAuthorizationId}&amount=100&currency=JPY`;
    
    const authHeader = createPayPayAuth("GET", path.split("?")[0], null, API_KEY, API_SECRET);
    
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
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log("Status:", res.statusCode);
                console.log("Response:", data);
                console.log("");
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e);
            resolve();
        });
        
        req.end();
    });
}

// Test QR Code creation
async function testQRCode() {
    const API_KEY = process.env.PAYPAY_API_KEY;
    const API_SECRET = process.env.PAYPAY_API_SECRET;
    const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;
    
    console.log("=== Testing QR Code Creation ===");
    
    const payload = {
        merchantPaymentId: `test_${Date.now()}`,
        codeType: "ORDER_QR",
        amount: {
            amount: 100,
            currency: "JPY"
        },
        orderDescription: "Test Order",
        redirectUrl: "https://example.com/success",
        redirectType: "WEB_LINK"
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
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log("Status:", res.statusCode);
                console.log("Response:", data);
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e);
            resolve();
        });
        
        req.write(jsonBody);
        req.end();
    });
}

async function runTests() {
    await testAccountBalance();
    await testQRCode();
}

runTests();

