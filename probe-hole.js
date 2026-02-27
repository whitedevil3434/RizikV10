const { init } = require('@heyputer/puter.js/src/init.cjs');
const fs = require('fs');

// Intercept global fetch to see the RAW HOLE
const originalFetch = global.fetch;
global.fetch = async (...args) => {
    console.log("-----------------------------------------");
    console.log("🎯 HOLE DETECTED:", args[0]);
    if (args[1] && args[1].body) {
        console.log("📦 RAW PAYLOAD:", args[1].body);
    }
    console.log("-----------------------------------------");
    return originalFetch(...args);
};

const TOKEN_FILE = 'puter-token.txt';
const token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
const puter = init(token);

async function probe() {
    console.log("🚀 Probing Puter AI native capabilities...");
    try {
        await puter.ai.chat("Status check", {
            model: "moonshotai/kimi-k2.5",
            tools: [
                {
                    name: "test_tool",
                    description: "A tool to test native hijacking",
                    parameters: { type: "object", properties: { query: { type: "string" } } }
                }
            ]
        });
    } catch (e) {
        console.log("❌ Probe result:", e.message);
    }
}

probe();
