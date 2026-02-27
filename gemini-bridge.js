const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = 11436; // Hijack Port

app.use(bodyParser.json({ limit: '200mb' }));

// Helper to call our existing OMEGA bridge (Kimi-K2.5)
async function callOmegaBridge(messages, tools) {
    const payload = JSON.stringify({
        model: "moonshotai/kimi-k2.5",
        messages: messages,
        tools: tools,
        stream: false
    });

    const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', (e) => reject(e));
        req.write(payload);
        req.end();
    });
}

// Convert Gemini CLI format to OpenAI format
function translateGeminiToOpenAI(geminiReq) {
    const messages = [];
    
    if (geminiReq.request?.systemInstruction) {
        messages.push({
            role: 'system',
            content: geminiReq.request.systemInstruction.parts[0].text
        });
    }

    geminiReq.request?.contents?.forEach(content => {
        const role = content.role === 'model' ? 'assistant' : 'user';
        const parts = content.parts.map(p => p.text).join('\n');
        messages.push({ role, content: parts });
    });

    return messages;
}

// Convert OpenAI format to Gemini CLI response format
function translateOpenAIToGemini(openaiRes) {
    const choice = openaiRes.choices[0];
    const message = choice.message;
    
    const candidates = [{
        index: 0,
        content: {
            role: 'model',
            parts: []
        },
        finishReason: choice.finish_reason === 'tool_calls' ? 'FUNCTION_CALL' : 'STOP'
    }];

    if (message.content) {
        candidates[0].content.parts.push({ text: message.content });
    }

    if (message.tool_calls) {
        message.tool_calls.forEach(tc => {
            const func = tc.function;
            candidates[0].content.parts.push({
                functionCall: {
                    name: func.name,
                    args: JSON.parse(func.arguments)
                }
            });
        });
    }

    return {
        response: {
            candidates: candidates,
            usageMetadata: {
                promptTokenCount: openaiRes.usage?.prompt_tokens || 0,
                candidatesTokenCount: openaiRes.usage?.completion_tokens || 0,
                totalTokenCount: openaiRes.usage?.total_tokens || 0
            }
        },
        traceId: `omega-trace-${Date.now()}`
    };
}

// v1internal:loadCodeAssist (Auth Check)
app.post('/v1internal:loadCodeAssist', (req, res) => {
    console.log("📡 OMEGA-GEMINI-HIJACK: loadCodeAssist");
    res.json({
        currentTier: { id: "PREMIUM" },
        userState: { onboarded: true }
    });
});

// v1internal:generateContent
app.post('/v1internal:generateContent', async (req, res) => {
    console.log("📡 OMEGA-GEMINI-HIJACK: generateContent");
    try {
        const messages = translateGeminiToOpenAI(req.body);
        const tools = req.body.request?.tools;
        
        const omegaRes = await callOmegaBridge(messages, tools);
        const geminiRes = translateOpenAIToGemini(omegaRes);
        
        res.json(geminiRes);
    } catch (error) {
        console.error("❌ Hijack Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// v1internal:streamGenerateContent
app.post('/v1internal:streamGenerateContent', async (req, res) => {
    console.log("📡 OMEGA-GEMINI-HIJACK: streamGenerateContent (Non-stream fallback)");
    // For simplicity, we use the non-streaming logic and return as a single data chunk
    try {
        const messages = translateGeminiToOpenAI(req.body);
        const tools = req.body.request?.tools;
        
        const omegaRes = await callOmegaBridge(messages, tools);
        const geminiRes = translateOpenAIToGemini(omegaRes);
        
        res.write(`data: ${JSON.stringify(geminiRes)}\n\n`);
        res.end();
    } catch (error) {
        console.error("❌ Stream Hijack Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GEMINI CLI HIJACK BRIDGE ACTIVE ON PORT ${PORT}`);
    console.log(`🎯 HIJACK TARGET: CODE_ASSIST_ENDPOINT=http://localhost:${PORT}`);
});
