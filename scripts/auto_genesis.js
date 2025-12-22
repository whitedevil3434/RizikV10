
const fs = require('fs');

async function autoGenesis() {
  // Use the Manual Token provided by the User
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    console.error("❌ Missing Credentials (CLOUDFLARE_API_TOKEN or ACCOUNT_ID)");
    process.exit(1);
  }

  const appName = "rizik-genesis-v1";
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls/apps`;

  try {
    console.log(`🚀 Initiating Auto-Genesis for '${appName}'...`);

    // 1. Create App
    const createRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify({ name: appName })
    });

    const createData = await createRes.json();

    if (!createData.success) {
      // Handle duplicates by listing
      if (createData.errors && createData.errors[0].code === 10009) {
         console.log("⚠️ App likely exists. Fetching list to find ID...");
         const listRes = await fetch(url, { headers: { 'Authorization': `Bearer ${apiToken}` } });
         const listData = await listRes.json();
         const existing = listData.result.find(a => a.name === appName);
         if (existing) {
             console.log(`✅ Found Existing Genesis App: ${existing.uid}`);
             updateConfig(existing.uid);
             return;
         }
      }
      throw new Error(`Creation Failed: ${JSON.stringify(createData.errors)}`);
    }

    const newAppId = createData.result.uid;
    console.log(`✅ Created Fresh App ID: ${newAppId}`);

    // 2. Update wrangler.toml
    updateConfig(newAppId);

  } catch (error) {
    console.error("💥 Genesis Failed:", error);
    process.exit(1);
  }
}

function updateConfig(appId) {
    const tomlPath = 'wrangler.toml';
    let content = fs.readFileSync(tomlPath, 'utf8');

    // Regex replace or append
    const regex = /CALLS_APP_ID = ".*?"/;
    if (regex.test(content)) {
        content = content.replace(regex, `CALLS_APP_ID = "${appId}"`);
    } else {
        // Append to vars if missing (simple approach)
        content += `\nCALLS_APP_ID = "${appId}"\n`;
    }

    fs.writeFileSync(tomlPath, content);
    console.log(`📝 Updated wrangler.toml with CALLS_APP_ID = "${appId}"`);
}

autoGenesis();
