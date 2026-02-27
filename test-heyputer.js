
try {
    const puter = require('@heyputer/puter.js');

    async function testKimi() {
        console.log("🦞 Testing @heyputer/puter.js in Node...");

        // Some libraries require explicit auth for Node usage if they don't have window context
        // But doc says "no api keys". Let's try anonymous first.

        const response = await puter.ai.chat("Hello Kimi! Are you working in Node.js?", {
            model: 'moonshotai/kimi-k2.5'
        });

        console.log("✅ Response:", response);
    }

    testKimi();
} catch (e) {
    console.error("❌ Failed:", e);
}
