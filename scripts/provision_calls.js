
const fs = require('fs');

async function provisionCalls() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    console.error("Missing Credentials");
    process.exit(1);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiToken}`
  };

  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps`;
  const appName = "rizik-voice-node";

  try {
    // 1. List Apps
    const listRes = await fetch(baseUrl, { headers });
    const listData = await listRes.json();

    if (!listData.success) {
      console.error(JSON.stringify(listData.errors));
      process.exit(1);
    }

    let appId = null;
    const existingApp = listData.result.find(app => app.name === appName);

    if (existingApp) {
      appId = existingApp.uid;
    } else {
      // 2. Create App
      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: appName })
      });
      const createData = await createRes.json();

      if (!createData.success) {
        console.error(JSON.stringify(createData.errors));
        process.exit(1);
      }
      appId = createData.result.uid;
    }

    // Output ONLY the ID
    console.log(appId);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

provisionCalls();
