
const fs = require('fs');

async function listAllApps() {
  const email = process.env.CLOUDFLARE_EMAIL;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!email || !apiKey || !accountId) {
    console.error("❌ Missing Global Credentials");
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey
  };

  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps`;

  try {
    console.error("🔍 Listing All Calls Apps...");
    const listRes = await fetch(baseUrl, { headers });
    const listData = await listRes.json();

    if (!listData.success) {
      throw new Error(`Failed to list apps: ${JSON.stringify(listData.errors)}`);
    }

    console.log("✅ Found Apps:");
    listData.result.forEach(app => {
        console.log(` - Name: "${app.name}", ID: ${app.uid}, Created: ${app.created}`);
    });

  } catch (error) {
    console.error("💥 Failed:", error);
    process.exit(1);
  }
}

listAllApps();
