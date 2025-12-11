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

console.log('Starting Supabase MCP server to reload schema...');
const server = spawn(command, args, { env });

let buffer = '';
let step = 0;

const RELOAD_SQL = `
NOTIFY pgrst, 'reload schema';
`;

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

function send(msg) {
    server.stdin.write(JSON.stringify(msg) + '\n');
}

function handleMessage(msg) {
    if (msg.id === 1 && step === 0) {
        console.log('✅ Initialization successful');
        send({ jsonrpc: '2.0', method: 'notifications/initialized' });

        console.log('Reloading schema...');
        send({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: RELOAD_SQL
                }
            }
        });
        step = 1;
    } else if (msg.id === 2 && step === 1) {
        if (msg.error) {
            console.error('❌ Failed to reload schema:', msg.error);
            process.exit(1);
        }
        console.log('✅ Schema reloaded successfully!');
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
        clientInfo: { name: 'reload-client', version: '1.0.0' }
    }
});

setTimeout(() => {
    console.error('❌ Timeout');
    process.exit(1);
}, 30000);
