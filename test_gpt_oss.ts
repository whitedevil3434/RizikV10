// Quick GPT-OSS response test
async function testGPT() {
    const response = await fetch('http://localhost:8787/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Hi',
            squad_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            user_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        })
    });
    console.log(await response.json());
}
testGPT();
