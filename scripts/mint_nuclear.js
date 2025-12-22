
const fs = require('fs');

async function mintNuclearComboToken() {
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

    // "Frankenstein" Strategy: Grab everything relevant
    const keywords = ['calls', 'workers', 'account settings', 'billing', 'zone'];
    const selectedGroups = groupsData.result.filter(g => {
        const name = g.name.toLowerCase();
        return keywords.some(k => name.includes(k));
    });

    if (selectedGroups.length === 0) {
        throw new Error("No relevant groups found for Combo Minting");
    }

    console.error(`✅ Selected ${selectedGroups.length} Groups for Combo Token:`);
    selectedGroups.forEach(g => console.error(` - ${g.name} (${g.id})`));

    const permissionGroupIds = selectedGroups.map(g => ({ id: g.id }));

    // Create Token with Massive Policy
    console.error("☢️ Minting Frankenstein Token...");
    const payload = {
      name: `Rizik FRANKENSTEIN Mint ${Date.now()}`,
      policies: [
        {
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: '*'
          },
          permission_groups: permissionGroupIds
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
    console.error("✨ Frankenstein Token Successfully Minted!");

    // Output ONLY the token to stdout
    console.log(newToken);

    // Propagation Delay
    console.error("⏳ Waiting 30s for Propagation...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    console.error("✅ Ready.");

  } catch (error) {
    console.error("💥 Minting Failed:", error);
    process.exit(1);
  }
}

mintNuclearComboToken();
