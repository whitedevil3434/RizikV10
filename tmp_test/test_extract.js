const jwt = require('jsonwebtoken');

async function test() {
  const secret = '0HO8B/tYISvzMe4J4WTwJlp76lgxgOe/MjwCpOt5';
  const token = jwt.sign({
    aud: 'authenticated',
    role: 'authenticated',
    sub: 'test-user-999'
  }, secret, { expiresIn: '1h' });

  console.log("Testing POST /api/ghost/extract...");
  const response = await fetch('https://rizik-backend.its-sabbir69.workers.dev/api/ghost/extract', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      text: "This is a sample text that represents my natural writing style. It is very important that the system captures the nuances of how I communicate. Sometimes I use shorter sentences. Other times, I prefer to elaborate extensively on a given topic to ensure clarity. I hope the DNA extraction catches my burstiness and rhythm accurately."
    })
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Body:", text);
}
test();
