const https = require('https');
const fs = require('fs');

async function probeQoder() {
    console.log("🚀 Probing Qoder RAW Hole...");
    const token = fs.readFileSync('/Users/sabbir/.qoder/.auth/user', 'utf8').trim();
    
    // We suspect the hole is api2.qoder.sh/api/v1/chat/completions
    const payload = JSON.stringify({
        model: "qmodel",
        messages: [{ role: "user", content: "hi" }],
        stream: false
    });

    const options = {
        hostname: "api2.qoder.sh",
        path: "/api/v1/chat/completions",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const req = https.request(options, (res) => {
        console.log("📥 RESPONSE CODE:", res.statusCode);
        console.log("📥 HEADERS:", res.headers);
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => console.log("📥 DATA:", data));
    });
    req.on('error', (e) => console.log("❌ Error:", e.message));
    req.write(payload);
    req.end();
}

probeQoder();
