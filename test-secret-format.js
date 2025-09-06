
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

const API_KEY = process.env.PAYPAY_API_KEY;
const API_SECRET_BASE64 = process.env.PAYPAY_API_SECRET;
const MERCHANT_ID = process.env.PAYPAY_MERCHANT_ID;

console.log("=== PayPay API Secret Test ===");
console.log("API Key:", API_KEY);
console.log("API Secret (Base64):", API_SECRET_BASE64);
console.log("Merchant ID:", MERCHANT_ID);
console.log("");

// Test both with and without Base64 decoding
async function testWithSecret(secretToUse, description) {
    console.log(`\n=== Testing with ${description} ===`);
    
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4();
    
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
    
    const jsonBody = JSON.stringify(payload);
    
    // Create MD5 hash
    const md5 = crypto.createHash("md5");
    md5.update("application/json");
    md5.update(jsonBody);
    const payloadDigest = md5.digest("base64");
    
    // Create signature
    const signatureRawData = [
        "/v2/codes",
        "POST",
        nonce,
        epoch,
        "application/json",
        payloadDigest
    ].join("\n");
    
    const hmac = crypto.createHmac("sha256", secretToUse);
    hmac.update(signatureRawData);
    const signature = hmac.digest("base64");
    
    const authHeader = `hmac OPA-Auth:${API_KEY}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
    
    console.log("Secret type:", typeof secretToUse);
    console.log("Secret length:", secretToUse.length);
    console.log("Auth header (first 80 chars):", authHeader.substring(0, 80) + "...");
    
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
                if (res.statusCode === 201) {
                    console.log("✅ SUCCESS with", description);
                    const parsed = JSON.parse(data);
                    if (parsed.data) {
                        console.log("Payment URL:", parsed.data.url);
                    }
                } else {
                    console.log("❌ Failed with", description);
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.resultInfo) {
                            console.log("Error:", parsed.resultInfo.message);
                        }
                    } catch (e) {
                        console.log("Response:", data);
                    }
                }
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e.message);
            resolve();
        });
        
        req.write(jsonBody);
        req.end();
    });
}

async function runTests() {
    // Test 1: Use API Secret as-is (Base64 string)
    await testWithSecret(API_SECRET_BASE64, "Base64 string as-is");
    
    // Test 2: Decode Base64 to binary
    const decodedSecret = Buffer.from(API_SECRET_BASE64, "base64");
    await testWithSecret(decodedSecret, "Decoded binary secret");
}

runTests();

