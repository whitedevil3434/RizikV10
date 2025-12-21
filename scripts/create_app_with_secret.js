
const fs = require('fs');

async function createAppWithSecret() {
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
  const appName = "rizik-secret-v1";

  try {
    console.error(`☢️ Creating App with Secret Discovery: ${appName}...`);

    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: appName })
    });
    const createData = await createRes.json();

    console.log("FULL RESPONSE:", JSON.stringify(createData, null, 2));

    if (!createData.success) {
      throw new Error(`Failed to create app: ${JSON.stringify(createData.errors)}`);
    }

    const result = createData.result;
    console.error(`✅ App Created!`);
    console.error(`ID: ${result.uid}`);
    if (result.secret) {
        console.error(`🔐 SECRET FOUND: ${result.secret}`);
        console.log(result.secret); // Output only secret to stdout if needed
    } else {
        console.error("❌ NO SECRET IN RESPONSE. Check full log above.");
    }

  } catch (error) {
    console.error("💥 Creation Failed:", error);
    process.exit(1);
  }
}

createAppWithSecret();
