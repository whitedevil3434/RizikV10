
const fs = require('fs');

async function testStandardApi() {
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const appId = "8841f81b0447329c269ce0d120c9865a"; // The App with Secret

  if (!email || !apiKey || !accountId) {
    console.error("❌ Missing Global Credentials");
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey
  };

  // Try creating a session via Standard API
  // Pattern: accounts/{id}/calls/apps/{id}/sessions
  const sessionUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps/${appId}/sessions`;

  try {
    console.error(`🧪 Testing Standard API Session Create: ${sessionUrl}...`);

    const res = await fetch(sessionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });

    const text = await res.text();
    console.log("Response Body:", text);

    if (res.status === 200 || res.status === 201) {
        console.error("✅ SUCCESS! Standard API works.");
    } else {
        console.error(`❌ Failed: ${res.status}`);
    }

  } catch (error) {
    console.error("💥 Test Failed:", error);
  }
}

testStandardApi();
