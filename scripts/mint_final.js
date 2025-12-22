
const fs = require('fs');

async function mintFinalToken() {
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

  try {
    console.error("🔍 Fetching Permission Groups...");
    const groupsRes = await fetch('https://api.cloudflare.com/client/v4/user/tokens/permission_groups', { headers });
    const groupsData = await groupsRes.json();

    if (!groupsData.success) {
      throw new Error(`Failed to list groups: ${JSON.stringify(groupsData.errors)}`);
    }

    // Helper to find ID by name pattern
    const findGroup = (pattern) => groupsData.result.find(g => g.name.toLowerCase().includes(pattern.toLowerCase()));

    const callsEdit = findGroup("Calls Write") || findGroup("Calls Edit");
    const workersEdit = findGroup("Workers Write") || findGroup("Workers Edit");

    if (!callsEdit) throw new Error("Could not find 'Calls Write/Edit' permission group");

    console.error(`✅ Found Groups: Calls=${callsEdit.name} (${callsEdit.id})`);
    if (workersEdit) console.error(`✅ Found Groups: Workers=${workersEdit.name} (${workersEdit.id})`);

    const permissionGroups = [ { id: callsEdit.id } ];
    if (workersEdit) permissionGroups.push({ id: workersEdit.id });

    // Create Token with Explicit Policies
    console.error("🔨 Minting Perfect Token...");
    const payload = {
      name: `Rizik Perfect Mint ${Date.now()}`,
      policies: [
        {
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: '*'
          },
          permission_groups: permissionGroups
        }
      ]
    };

    const mintRes = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const mintData = await mintRes.json();

    if (!mintData.success) {
      throw new Error(`Failed to mint token: ${JSON.stringify(mintData.errors)}`);
    }

    const newToken = mintData.result.value;
    console.error("✨ Token Successfully Minted!");

    // Output ONLY the token to stdout
    console.log(newToken);

    // Propagation Delay
    console.error("⏳ Waiting 30s for Token Propagation (Crucial Step)...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    console.error("✅ Propagation Complete.");

  } catch (error) {
    console.error("💥 Minting Failed:", error);
    process.exit(1);
  }
}

mintFinalToken();
