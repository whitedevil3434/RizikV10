const https = require('https');

const PUTER_API = "https://api.puter.com/drivers/call";
const TOKEN = process.env.PUTER_TOKEN;

if (!TOKEN) {
    console.error("Error: PUTER_TOKEN environment variable is required.");
    process.exit(1);
}

const MESSAGES = [
    { role: "system", content: "You are Kimi, a helpful AI." },
    { role: "user", content: "Hello, who are you?" }
];

async function callPuter(driver, method, params) {
    const payload = JSON.stringify({
        driver: driver,
        method_name: method,
        parameters: params
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;actually=json',
            'Authorization': `Bearer ${TOKEN}`,
            'Origin': 'https://puter.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(PUTER_API, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

async function main() {
    console.log("🚀 Attempting to breach Puter.js pipeline...");

    // Payload Variation 1: The most likely candidate based on grep
    // puter.drivers.call("puter-chat-completion", "complete", { ... })
    const v1 = await callPuter("puter-chat-completion", "complete", {
        messages: MESSAGES,
        model: "moonshotai/kimi-k2.5",
        stream: false
    });

    if (v1.body && v1.body.result) { // Puter usually wraps success in 'result'
        console.log("✅ Success (Variation 1)!");
        console.log(JSON.stringify(v1.body, null, 2));
        return;
    } else {
        console.log("⚠️ Variation 1 failed:", JSON.stringify(v1.body));
    }

    // Payload Variation 2: Maybe method is 'ai-chat'?
    const v2 = await callPuter("puter-chat-completion", "ai-chat", {
        messages: MESSAGES,
        model: "moonshotai/kimi-k2.5"
    });

    if (v2.body && v2.body.result) {
        console.log("✅ Success (Variation 2)!");
        console.log(JSON.stringify(v2.body, null, 2));
        return;
    } else {
        console.log("⚠️ Variation 2 failed:", JSON.stringify(v2.body));
    }

    console.log("❌ All variations failed or token is invalid.");
}

main();
