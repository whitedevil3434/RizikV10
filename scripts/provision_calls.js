
const fs = require('fs');

async function provisionCalls() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  if (!accountId || !email || !apiKey) {
    console.error("❌ Missing Cloudflare Credentials");
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey
  };

  const appId = "8f2c1a873c6fcfa782e92795fe8d8fda";

  try {
    console.log(`🧪 Testing Session Creation via Standard API (Proxy)...`);
    // Guessing the endpoint structure based on CF patterns
    const sessionUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps/${appId}/sessions/new`;

    const sessionRes = await fetch(sessionUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });

    const sessionData = await sessionRes.json();
    console.log("Response:", JSON.stringify(sessionData));

    if (sessionData.success) {
       console.log("✅ Success! Standard API Proxy works.");
    } else {
       console.log("❌ Standard API Proxy failed.");
    }

  } catch (error) {
    console.error("💥 Test Failed:", error);
  }
}

provisionCalls();
