
try {
    const puter = require('puter');

    async function testKimi() {
        console.log("Testing Puter.js Kimi K2.5...");
        const response = await puter.ai.chat("Hello Kimi, are you running in Node.js?", { model: 'moonshotai/kimi-k2.5' });
        console.log("Response:", response);
    }

    testKimi();
} catch (e) {
    console.error("Puter.js not compatible with Node or setup required:", e);
}
