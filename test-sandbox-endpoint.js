
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

// API credentials
const API_KEY = process.env.PAYPAY_API_KEY;
const API_SECRET = process.env.PAYPAY_API_SECRET;
const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;

console.log("=== PayPay Sandbox API Test ===");
console.log("API Key:", API_KEY);
console.log("Merchant ID:", MERCHANT_ID);
console.log("");

// Create signature
function createAuthHeader(method, path, body) {
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4();
    
    let contentType = "empty";
    let payloadDigest = "empty";
    
    if (body) {
        contentType = "application/json";
        const md5 = crypto.createHash("md5");
        md5.update(contentType);
        md5.update(JSON.stringify(body));
        payloadDigest = md5.digest("base64");
    }
    
    const signatureRawData = [path, method, nonce, epoch, contentType, payloadDigest].join("\n");
    
    const hmac = crypto.createHmac("sha256", API_SECRET);
    hmac.update(signatureRawData);
    const signature = hmac.digest("base64");
    
    return `hmac OPA-Auth:\${API_KEY}:\${signature}:\${nonce}:\${epoch}:\${payloadDigest}`;
}

// Test request
const payload = {
    merchantPaymentId: `test_\${Date.now()}`,
    codeType: "ORDER_QR",
    redirectUrl: "https://example.com/success",
    redirectType: "WEB_LINK",
    orderDescription: "Test Order",
    orderItems: [{
        name: "Test Item",
        category: "DIGITAL_CONTENT",
        quantity: 1,
        productId: "test_001",
        unitPrice: {
            amount: 100,
            currency: "JPY"
        }
    }],
    amount: {
        amount: 100,
        currency: "JPY"
    },
    requestedAt: Math.floor(Date.now() / 1000)
};

const authHeader = createAuthHeader("POST", "/v2/codes", payload);

const options = {
    hostname: "stg-api.sandbox.paypay.ne.jp",
    port: 443,
    path: "/v2/codes",
    method: "POST",
    headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "X-ASSUME-MERCHANT": MERCHANT_ID
    }
};

console.log("Testing sandbox endpoint: stg-api.sandbox.paypay.ne.jp");
console.log("Authorization header:", authHeader.substring(0, 50) + "...");
console.log("");

const req = https.request(options, (res) => {
    let data = "";
    
    res.on("data", (chunk) => {
        data += chunk;
    });
    
    res.on("end", () => {
        console.log("Status:", res.statusCode);
        console.log("Response:", data);
    });
});

req.on("error", (e) => {
    console.error("Error:", e);
});

req.write(JSON.stringify(payload));
req.end();

