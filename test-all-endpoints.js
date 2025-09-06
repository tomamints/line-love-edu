
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

console.log("=== PayPay Test API - Different Endpoints ===");
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
    
    console.log("Signature components:");
    console.log("- Path:", path);
    console.log("- Method:", method);
    console.log("- Nonce:", nonce);
    console.log("- Epoch:", epoch);
    console.log("- ContentType:", contentType);
    console.log("- PayloadDigest:", payloadDigest);
    
    const hmac = crypto.createHmac("sha256", API_SECRET);
    hmac.update(signatureRawData);
    const signature = hmac.digest("base64");
    
    return `hmac OPA-Auth:${API_KEY}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
}

// Test different endpoints
const endpoints = [
    { hostname: "api.paypay.ne.jp", name: "Production" },
    { hostname: "stg-api.paypay.ne.jp", name: "Staging" },
    { hostname: "api.sandbox.paypay.ne.jp", name: "Sandbox API" },
    { hostname: "stg-api.sandbox.paypay.ne.jp", name: "Staging Sandbox" }
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const payload = {
            merchantPaymentId: `test_${Date.now()}`,
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
            hostname: endpoint.hostname,
            port: 443,
            path: "/v2/codes",
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
                "X-ASSUME-MERCHANT": MERCHANT_ID
            }
        };

        console.log(`\nTesting ${endpoint.name}: ${endpoint.hostname}`);

        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log(`Status: ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 201) {
                        console.log("✅ SUCCESS!");
                        console.log("Response:", JSON.stringify(parsed, null, 2));
                    } else {
                        console.log("❌ Error:", parsed.resultInfo?.message || data);
                    }
                } catch (e) {
                    console.log("Response:", data);
                }
                resolve();
            });
        });

        req.on("error", (e) => {
            console.error("Connection error:", e.message);
            resolve();
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

async function testAll() {
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
}

testAll();

