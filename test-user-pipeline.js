
const puter = require('puter.js');

async function chatKimiK2(prompt) {
    try {
        console.log("Testing Kimi K2 via puter.js...");
        const response = await puter.ai.chat(prompt, {
            model: 'moonshotai/kimi-k2.5', // Using 2.5 as previous logs showed it exists
            messages: [{ role: 'user', content: prompt }]
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
    }
}

chatKimiK2('Write a Python binary search function');
