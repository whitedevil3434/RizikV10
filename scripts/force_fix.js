
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const APP_NAME = "rizik-nuclear-v1";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const EMAIL = process.env.CLOUDFLARE_EMAIL;
const API_KEY = process.env.CLOUDFLARE_API_KEY;

if (!ACCOUNT_ID || !EMAIL || !API_KEY) {
    console.error("❌ Missing Global Credentials (ACCOUNT_ID, EMAIL, API_KEY)");
    process.exit(1);
}

const GLOBAL_HEADERS = {
    'Content-Type': 'application/json',
    'X-Auth-Email': EMAIL,
    'X-Auth-Key': API_KEY
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function forceFix() {
    try {
        console.log("🚀 Starting Force Fix Protocol...");

        // 1. Fetch Permission Groups
        console.log("🔍 Fetching Permission Groups...");
        const groupsRes = await fetch('https://api.cloudflare.com/client/v4/user/tokens/permission_groups', { headers: GLOBAL_HEADERS });
        const groupsData = await groupsRes.json();

        if (!groupsData.success) throw new Error("Failed to list groups");

        // Strategy: "Kitchen Sink" - Account Admin + All Calls/Workers
        let permissionIds = [];

        // Try to find "Account Administrator"
        const adminGroup = groupsData.result.find(g => g.name === 'Account Administrator');
        if (adminGroup) {
            console.log(`✅ Found 'Account Administrator' Group (${adminGroup.id})`);
            permissionIds.push({ id: adminGroup.id });
        } else {
            console.log("⚠️ 'Account Administrator' not found. Building 'Kitchen Sink' permissions...");
            const keywords = ['Account Settings', 'Calls', 'Workers', 'Zone', 'DNS', 'SSL', 'KV', 'Durable Objects'];
            const relevantGroups = groupsData.result.filter(g => keywords.some(k => g.name.includes(k)));
            permissionIds = relevantGroups.map(g => ({ id: g.id }));
            console.log(`✅ Selected ${permissionIds.length} Permission Groups.`);
        }

        // 2. Mint Token
        console.log("🔨 Minting 'Force Fix' Token...");
        const mintPayload = {
            name: `Rizik Force Fix ${Date.now()}`,
            policies: [{
                effect: 'allow',
                resources: { [`com.cloudflare.api.account.${ACCOUNT_ID}`]: '*' },
                permission_groups: permissionIds
            }]
        };

        const mintRes = await fetch('https://api.cloudflare.com/client/v4/user/tokens', {
            method: 'POST',
            headers: GLOBAL_HEADERS,
            body: JSON.stringify(mintPayload)
        });
        const mintData = await mintRes.json();
        if (!mintData.success) throw new Error(`Minting failed: ${JSON.stringify(mintData.errors)}`);

        const NEW_TOKEN = mintData.result.value;
        console.log("✨ Token Minted!");

        // 3. Propagation Wait
        console.log("⏳ Waiting 60s for Token Propagation...");
        await sleep(60000);
        console.log("✅ Wait Complete.");

        // 4. Verify Token (Self-Test)
        console.log("🧪 Verifying Token Validity (List Apps)...");
        const verifyRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/apps`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEW_TOKEN}`
            }
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            console.error("❌ Token Verification Failed! The token was rejected by Cloudflare API.");
            console.error("Errors:", JSON.stringify(verifyData.errors));
            // Don't abort, try to continue? No, if API fails, Runtime definitely fails.
            throw new Error("Minted Token is invalid/insufficient.");
        }
        console.log("✅ Token Verified! Access granted to Calls API.");

        // 5. App Sync
        let appId = null;
        const existingApp = verifyData.result.find(a => a.name === APP_NAME);
        if (existingApp) {
            appId = existingApp.uid;
            console.log(`✅ Found Existing App '${APP_NAME}' (${appId})`);
        } else {
            console.log(`⚠️ App '${APP_NAME}' not found. Creating...`);
            const createRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/calls/apps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${NEW_TOKEN}`
                },
                body: JSON.stringify({ name: APP_NAME })
            });
            const createData = await createRes.json();
            if (!createData.success) throw new Error("Failed to create app with new token");
            appId = createData.result.uid;
            console.log(`✅ Created App '${APP_NAME}' (${appId})`);
        }

        // 6. Update wrangler.toml
        console.log("📝 Updating wrangler.toml...");
        let tomlContent = fs.readFileSync('wrangler.toml', 'utf8');
        // Regex replace the CALLS_APP_ID
        const regex = /CALLS_APP_ID = ".*?"/;
        if (regex.test(tomlContent)) {
            tomlContent = tomlContent.replace(regex, `CALLS_APP_ID = "${appId}"`);
        } else {
            // If not found, append (should exist though)
            tomlContent += `\nCALLS_APP_ID = "${appId}"\n`;
        }
        fs.writeFileSync('wrangler.toml', tomlContent);
        console.log("✅ Config Updated.");

        // 7. Inject Secret
        console.log("💉 Injecting Secret...");
        execSync(`echo "${NEW_TOKEN}" | npx wrangler secret put CLOUDFLARE_API_TOKEN`, { stdio: 'inherit' });
        console.log("✅ Secret Injected.");

        // 8. Deploy
        console.log("🚀 Deploying Worker...");
        execSync(`npx wrangler deploy`, { stdio: 'inherit' });
        console.log("✅ Deployment Complete.");

    } catch (error) {
        console.error("💥 Force Fix Failed:", error);
        process.exit(1);
    }
}

forceFix();
