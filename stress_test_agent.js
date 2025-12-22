
const WebSocket = require('ws');

// Configuration
const URL = "ws://localhost:8789/api/agent/voice";
const HEADERS = {
    'upgrade': 'websocket',
    'connection': 'Upgrade',
    'sec-websocket-version': '13',
    'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ=='
};

function connect() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(URL, { headers: HEADERS });
        ws.on('open', () => resolve(ws));
        ws.on('error', reject);
    });
}

function sendText(ws, text) {
    console.log(`\n📤 Sending: "${text}"`);
    ws.send(JSON.stringify({ type: 'text_input', text: text }));
}

async function runTest() {
    console.log("🚀 Starting Stress Test: Context Retention");

    try {
        const ws = await connect();
        console.log("✅ WebSocket Connected");

        // Listen for messages
        ws.on('message', (data) => {
            if (typeof data === 'string') {
                const json = JSON.parse(data);
                // We don't get 'assistant' text messages back directly in this architecture (it goes to Audio),
                // BUT we added logs on the server side to verify context.
                // However, we DO get 'transcript_user' events if we sent audio.
                // Wait, the current implementation sends AUDIO back.
                // We can't easily parse the audio to verify "Sabbir" without an STT on client side.
                // BUT, the server logs will show "🧠 Context: X msgs".
                // I will listen for audio chunks size to confirm response generation.
            } else {
                console.log(`🎧 Received Audio Chunk: ${data.length} bytes`);
            }
        });

        // Turn 1: Establish Context
        sendText(ws, "Hello, my name is Captain Sabbir.");

        await new Promise(r => setTimeout(r, 5000)); // Wait for processing

        // Turn 2: Verify Context
        sendText(ws, "What is my name?");

        await new Promise(r => setTimeout(r, 5000));

        console.log("✅ Test Complete. Check SERVER LOGS for Memory Verification.");
        ws.close();

    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

runTest();
