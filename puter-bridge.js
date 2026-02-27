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
            tools: tools,
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
            res.on('end', () => resolve(data));
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
        
        const rawData = await breachPuterHole(messages, model, tools, stream);
        
        let content = "";
        let tool_calls = null;
        let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        let finish_reason = "stop";

        // ROBUST DATA EXTRACTION
        const lines = rawData.split('\n').filter(l => l.trim());
        let combinedToolCalls = [];

        for (const line of lines) {
            try {
                const obj = JSON.parse(line);
                
                // Handle Success Wrapper
                if (obj.success && obj.result) {
                    const resObj = obj.result;
                    content += (resObj.message?.content || resObj.choices?.[0]?.message?.content || "");
                    if (resObj.message?.tool_calls || (resObj.choices?.[0]?.message?.tool_calls)) {
                         const tc = resObj.message?.tool_calls || resObj.choices[0].message.tool_calls;
                         combinedToolCalls.push(...tc);
                    }
                    usage = resObj.usage || usage;
                    finish_reason = resObj.finish_reason || finish_reason;
                }
                
                // Handle Direct NDJSON items
                if (obj.type === 'text') content += (obj.text || "");
                if (obj.type === 'tool_use') {
                    combinedToolCalls.push({
                        id: obj.id,
                        type: "function",
                        function: { name: obj.name, arguments: JSON.stringify(obj.input) }
                    });
                }
                if (obj.type === 'usage') usage = obj.usage || usage;
                if (obj.error) {
                    console.error("❌ Hole Internal Error:", obj.error);
                }
            } catch(e) {
                // If it's not JSON, skip but log if not empty
                if (line.length > 0 && !line.startsWith('{')) {
                    // console.log("Non-JSON line:", line);
                }
            }
        }

        if (combinedToolCalls.length > 0) {
            tool_calls = combinedToolCalls;
            finish_reason = "tool_calls";
        }

        const response = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
                index: 0,
                message: { role: "assistant", content: content, tool_calls: tool_calls },
                finish_reason: finish_reason
            }],
            usage: usage
        };

        res.json(response);
    } catch (error) {
        console.error("❌ OMEGA CRITICAL BREACH ENGINE ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔓 OMEGA RAW BREACH BRIDGE ACTIVE ON http://localhost:${PORT}`);
});
