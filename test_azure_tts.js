
const WebSocket = require('ws');

// Connect to the local backend
const ws = new WebSocket('ws://localhost:8789/api/agent/voice');

ws.on('open', function open() {
    console.log('✅ Connected to Voice Agent');

    // Send a text input to trigger TTS
    const payload = JSON.stringify({
        type: 'text_input',
        text: 'হ্যালো, আপনি কেমন আছেন?' // "Hello, how are you?" in Bengali
    });

    console.log('📤 Sending Bengali Text:', payload);
    ws.send(payload);
});

ws.on('message', function message(data) {
    const msgString = data.toString();
    try {
        const json = JSON.parse(msgString);
        console.log('📝 Received Transcript:', json);
        // Use json.transcript if available for validation
    } catch (e) {
        // Only treat as audio if it's NOT valid JSON
        if (data.length > 500) {
            console.log(`🎧 Received Audio Response: ${data.length} bytes`);
            console.log('✅ Azure TTS Audio Verified');
            process.exit(0);
        } else {
            console.log("⚠️ Unknown Small Binary/Text:", msgString);
        }
    }
});

ws.on('error', function error(err) {
    console.error('❌ Connection Error:', err);
    process.exit(1);
});
