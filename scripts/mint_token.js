
const fs = require('fs');

async function mintToken() {
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

    // Find "Calls" permission
    // Look for "Calls" in name and "Write" or "Edit"
    const callsGroup = groupsData.result.find(g =>
      g.name.toLowerCase().includes('calls') &&
      (g.name.toLowerCase().includes('write') || g.name.toLowerCase().includes('edit'))
    );

    if (!callsGroup) {
      console.error("⚠️ Specific 'Calls Write' permission not found. Falling back to broader permissions?");
      // List all related to calls for debugging
      const callsRelated = groupsData.result.filter(g => g.name.toLowerCase().includes('calls'));
      console.error("Available Calls groups:", JSON.stringify(callsRelated.map(g => g.name)));
      throw new Error("Could not identify correct Permission Group ID for Calls Write");
    }

    console.error(`✅ Found Permission Group: ${callsGroup.name} (${callsGroup.id})`);

    // Create Token
    console.error("🔨 Minting New Token...");
    const payload = {
      name: `Rizik Auto-Minted ${Date.now()}`,
      policies: [
        {
          effect: 'allow',
          resources: {
            [`com.cloudflare.api.account.${accountId}`]: '*'
          },
          permission_groups: [
            { id: callsGroup.id }
          ]
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

    // Output ONLY the token to stdout for capturing
    console.log(newToken);

  } catch (error) {
    console.error("💥 Minting Failed:", error);
    process.exit(1);
  }
}

mintToken();
