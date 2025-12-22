
const fs = require('fs');

async function createFreshApp() {
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
  const appName = "rizik-nuclear-v1";

  try {
    console.error(`☢️ Creating Clean App: ${appName}...`);

    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: appName })
    });
    const createData = await createRes.json();

    if (!createData.success) {
      // Check if already exists?
      if (createData.errors[0].code === 10009) { // Duplicate name (example code)
         console.error("⚠️ App name might strictly exist or error. Fetching list...");
         // Fallback to list if create fails due to duplicate
         // For now, throw error to see what happens
      }
      throw new Error(`Failed to create app: ${JSON.stringify(createData.errors)}`);
    }

    const appId = createData.result.uid;
    console.error(`✅ Created New Nuclear App ID: ${appId}`);

    // Output ONLY the ID to stdout
    console.log(appId);

  } catch (error) {
    console.error("💥 Creation Failed:", error);
    process.exit(1);
  }
}

createFreshApp();
