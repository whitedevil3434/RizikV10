
const http = require('http');
const args = process.argv.slice(2);

// Simple arg parser
let systemPrompt = '';
const systemIndex = args.indexOf('--system');
if (systemIndex > -1 && args[systemIndex + 1]) {
    systemPrompt = args[systemIndex + 1];
}

async function streamResponse(prompt) {
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const data = JSON.stringify({
        model: "moonshotai/kimi-k2.5",
        messages: messages,
        stream: true
    });

    const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        res.setEncoding('utf8');

        // Handling SEE stream manually to extract content
        let buffer = '';

        res.on('data', (chunk) => {
            buffer += chunk;
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep the last incomplete line

            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.includes('[DONE]')) continue;
                if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '').trim();
                    try {
                        const json = JSON.parse(jsonStr);
                        const content = json.choices?.[0]?.delta?.content;
                        if (content) {
                            process.stdout.write(content);
                        }
                    } catch (e) {
                        // ignore parse errors for partial chunks
                    }
                }
            }
        });

        res.on('end', () => {
            // process.stdout.write('\n'); // Optional: ensure newline at end
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        process.exit(1);
    });

    req.write(data);
    req.end();
}

// Read from stdin
let stdinData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    stdinData += chunk;
});

process.stdin.on('end', () => {
    if (stdinData.trim()) {
        streamResponse(stdinData);
    }
});
