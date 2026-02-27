const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 4000;
const TOKEN_FILE = 'puter-token.txt';
const PUTER_API = "api.puter.com";
const PUTER_PATH = "/drivers/call";

app.use(bodyParser.json({ limit: '200mb' }));

function getPuterToken() {
    if (fs.existsSync(TOKEN_FILE)) {
        return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    }
    return null;
}

// THE OMEGA BREACHER: Mimics the raw hitting point
async function breachPuterHole(messages, model, tools, stream) {
    const token = getPuterToken();
    if (!token) throw new Error("Puter token not found.");

    const payload = JSON.stringify({
        interface: "puter-chat-completion",
        driver: "ai-chat",
        test_mode: false,
        method: "complete",
        args: {
            messages: messages,
            model: model || "moonshotai/kimi-k2.5",
            tools: tools, // NATIVE TOOL INJECTION
            stream: stream || false
        },
        auth_token: token
    });

    const options = {
        hostname: PUTER_API,
        path: PUTER_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;actually=json',
            'Origin': 'https://puter.com',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    resolve(data);
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

app.post('/v1/chat/completions', async (req, res) => {
    try {
        const { messages, model, tools, stream } = req.body;
        console.log(`⚡ OMEGA BREACH: Hitting RAW HOLE for ${model}`);
        
        // Pass everything through the breach point
        const rawResponse = await breachPuterHole(messages, model, tools, stream);
        
        if (!rawResponse.success) {
            console.error("❌ Hole rejection:", rawResponse.error);
            return res.status(500).json({ error: rawResponse.error });
        }

        const result = rawResponse.result;
        
        // Map Puter result to OpenAI standard
        const response = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
                index: 0,
                message: {
                    role: "assistant",
                    content: result.message?.content || result.choices?.[0]?.message?.content || "",
                    tool_calls: result.message?.tool_calls || result.choices?.[0]?.message?.tool_calls || null
                },
                finish_reason: result.finish_reason || "stop"
            }],
            usage: result.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        };

        res.json(response);
    } catch (error) {
        console.error("❌ Breach Engine Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔓 OMEGA RAW BREACH BRIDGE ACTIVE ON http://localhost:${PORT}`);
});
