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
let step = 0;
// Steps:
// 0: Init
// 1: Create Table
// 2: Insert Data
// 3: Select Data
// 4: Drop Table

const tableName = 'mcp_test_table_' + Date.now();

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

        console.log(`Creating table ${tableName}...`);
        send({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: `CREATE TABLE ${tableName} (id SERIAL PRIMARY KEY, name TEXT, value INT)`
                }
            }
        });
        step = 1;
    } else if (msg.id === 2 && step === 1) {
        if (checkError(msg)) return;
        console.log('✅ Table created');

        console.log('Inserting data...');
        send({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: `INSERT INTO ${tableName} (name, value) VALUES ('test_item', 123)`
                }
            }
        });
        step = 2;
    } else if (msg.id === 3 && step === 2) {
        if (checkError(msg)) return;
        console.log('✅ Data inserted');

        console.log('Selecting data...');
        send({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: `SELECT * FROM ${tableName}`
                }
            }
        });
        step = 3;
    } else if (msg.id === 4 && step === 3) {
        if (checkError(msg)) return;
        console.log('✅ Data selected:', JSON.stringify(msg.result, null, 2));

        console.log('Dropping table...');
        send({
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
                name: 'execute_sql',
                arguments: {
                    query: `DROP TABLE ${tableName}`
                }
            }
        });
        step = 4;
    } else if (msg.id === 5 && step === 4) {
        if (checkError(msg)) return;
        console.log('✅ Table dropped');
        console.log('🎉 All Supabase CRUD tests passed!');
        process.exit(0);
    }
}

function checkError(msg) {
    if (msg.error) {
        console.error('❌ JSON-RPC Error:', msg.error);
        process.exit(1);
        return true;
    }
    if (msg.result && msg.result.isError) {
        console.error('❌ Tool Error:', JSON.stringify(msg.result.content));
        process.exit(1);
        return true;
    }
    return false;
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
