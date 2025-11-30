const { spawn } = require('child_process');

// Configuration
const command = 'npx';
const args = [
    '-y',
    '@supabase/mcp-server-supabase@latest',
    '--project-ref=dxekolvveoadbaftfsmy'
];
const env = {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: 'sbp_279856121fdba35b343f21605230bf549d11e482'
};

console.log('Starting Supabase MCP server...');
const server = spawn(command, args, { env });

let buffer = '';
let step = 0; // 0: init, 1: list tools, 2: execute query

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
                // Ignore non-JSON lines (like debug output)
                // console.log('Non-JSON:', line);
            }
        }
    }
    buffer = lines.join('\n');
});

server.stderr.on('data', (data) => {
    // console.error('Stderr:', data.toString());
});

function send(msg) {
    // console.log('Sending:', JSON.stringify(msg).substring(0, 100) + '...');
    server.stdin.write(JSON.stringify(msg) + '\n');
}

function handleMessage(msg) {
    if (msg.id === 1 && step === 0) {
        console.log('✅ Initialization successful');

        // Send initialized notification
        send({
            jsonrpc: '2.0',
            method: 'notifications/initialized'
        });

        // List tools
        console.log('Listing tools...');
        send({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list'
        });
        step = 1;
    } else if (msg.id === 2 && step === 1) {
        console.log('✅ Tools received');
        const tools = msg.result.tools;
        console.log('Available tools:', tools.map(t => t.name).join(', '));

        // We see 'execute_sql' in the list, so let's use it directly.
        console.log('Attempting to execute test query with execute_sql...');
        send({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: 'SELECT version()'
                }
            }
        });
        step = 2;
    } else if (msg.id === 3 && step === 2) {
        if (msg.error) {
            console.log('❌ JSON-RPC Error:', msg.error.message);
        } else if (msg.result.isError) {
            console.log('❌ Tool Execution Error:', JSON.stringify(msg.result.content));
        } else {
            console.log('✅ Query successful!');
            console.log('Result:', JSON.stringify(msg.result, null, 2));
        }
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
