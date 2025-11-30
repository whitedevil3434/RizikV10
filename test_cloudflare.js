const { spawn } = require('child_process');

// We will test one of the Cloudflare servers: Documentation
// The others use the same mechanism (mcp-remote), so testing one validates the connection method.
// If needed, we can expand to test all.

const command = 'npx';
const args = ['mcp-remote', 'https://docs.mcp.cloudflare.com/sse'];
const env = { ...process.env };

console.log('Starting Cloudflare Documentation MCP server...');
const server = spawn(command, args, { env });

let buffer = '';
let step = 0;

server.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;

    const lines = buffer.split('\n');
    while (lines.length > 1) {
        const line = lines.shift();
        if (line.trim()) {
            try {
                const msg = JSON.parse(line);
                handleMessage(msg);
            } catch (e) {
                // Ignore non-JSON
            }
        }
    }
    buffer = lines.join('\n');
});

server.stderr.on('data', (data) => {
    // mcp-remote might output logs to stderr
    // console.error('Stderr:', data.toString());
});

function send(msg) {
    server.stdin.write(JSON.stringify(msg) + '\n');
}

function handleMessage(msg) {
    if (msg.id === 1 && step === 0) {
        console.log('✅ Initialization successful');
        send({ jsonrpc: '2.0', method: 'notifications/initialized' });

        console.log('Listing tools...');
        send({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
        });
        step = 1;
    } else if (msg.id === 2 && step === 1) {
        if (msg.error) {
            console.error('❌ Failed to list tools:', msg.error);
            process.exit(1);
        }

        console.log('✅ Tools received');
        const tools = msg.result.tools || [];
        console.log('Available tools:', tools.map(t => t.name).join(', '));

        // If we have tools, let's try to list resources too
        console.log('Listing resources...');
        send({
            jsonrpc: '2.0',
            id: 3,
            method: 'resources/list'
        });
        step = 2;
    } else if (msg.id === 3 && step === 2) {
        // Resources might be empty or not supported, but getting a response is success
        console.log('✅ Resources response received');
        if (msg.result && msg.result.resources) {
            console.log('Resources count:', msg.result.resources.length);
        }

        console.log('🎉 Cloudflare Documentation MCP test passed!');
        process.exit(0);
    }
}

// Start initialization
send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
    }
});

// Timeout after 30 seconds
setTimeout(() => {
    console.error('❌ Test timed out');
    process.exit(1);
}, 30000);
