
const crypto = require("crypto");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

// 直接的な認証情報
const API_KEY = "a_7Nh7OQU4LD_sgIG";
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";
const MERCHANT_ID = "958667152543465472";

console.log("=== PayPay Manual HMAC Test ===");
console.log("API Key:", API_KEY);
console.log("Merchant ID:", MERCHANT_ID);
console.log("");

// HMAC署名を手動で生成
function createHMACAuth(method, path, body) {
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4().substring(0, 8);
    
    let contentType = "empty";
    let payloadDigest = "empty";
    
    if (body) {
        contentType = "application/json";
        const bodyStr = JSON.stringify(body);
        
        // MD5ハッシュ（contentType + body）
        const md5 = crypto.createHash("md5");
        md5.update(contentType);
        md5.update(bodyStr);
        payloadDigest = md5.digest("base64");
    }
    
    // 署名対象データ
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        payloadDigest
    ].join("\n");
    
    console.log("Signature components:");
    console.log("- Path:", path);
    console.log("- Method:", method);
    console.log("- Nonce:", nonce);
    console.log("- Epoch:", epoch);
    console.log("- ContentType:", contentType);
    console.log("- PayloadDigest:", payloadDigest);
    
    // HMAC-SHA256署名
    const hmac = crypto.createHmac("sha256", API_SECRET);
    hmac.update(signatureData);
    const signature = hmac.digest("base64");
    
    const authHeader = `hmac OPA-Auth:${API_KEY}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
    
    console.log("- Signature:", signature);
    console.log("- Auth Header (first 80):", authHeader.substring(0, 80) + "...");
    console.log("");
    
    return { authHeader, bodyStr: body ? JSON.stringify(body) : "" };
}

// 簡単なGETリクエストから試す
async function testSimpleGet() {
    console.log("=== Testing GET /v1/user/profile ===");
    
    const { authHeader } = createHMACAuth("GET", "/v1/user/profile", null);
    
    const options = {
        hostname: "stg-api.paypay.ne.jp",
        port: 443,
        path: "/v1/user/profile",
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
            console.error("Error:", e.message);
            resolve();
        });
        
        req.end();
    });
}

// QRコード作成
async function testQRCode() {
    console.log("=== Testing POST /v2/codes ===");
    
    const payload = {
        merchantPaymentId: `manual_test_${Date.now()}`,
        amount: {
            amount: 100,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "Manual Test"
    };
    
    const { authHeader, bodyStr } = createHMACAuth("POST", "/v2/codes", payload);
    
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
                        console.log("Payment URL:", parsed.data?.url);
                    } else {
                        console.log("❌ Error:", parsed.resultInfo?.message);
                    }
                } catch (e) {
                    console.log("Response:", data);
                }
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e.message);
            resolve();
        });
        
        req.write(bodyStr);
        req.end();
    });
}

async function runTests() {
    await testSimpleGet();
    await testQRCode();
}

runTests();

