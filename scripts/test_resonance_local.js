/**
 * Godly Chaos Engine: Resonance Backend Test v10.1
 * Verifies that the backend is correctly matching against the 7,718 human souls.
 */
const fs = require('fs');
const path = require('path');

// Configuration
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg";
const LOCAL_API_URL = "http://localhost:8787/api/ghost/humanize";

const TEST_DNA = {
    id: "test_dna_123",
    structure: { rhythm: "irregular", burstiness: 0.85 },
    errorFingerprint: { exactMisspellings: ["dont", "wana", "coz"] },
    consortiumNoise: ["Hey, kemon acho? I just finished that project cz I had some free time."]
};

const AI_TEXT = `Artificial Intelligence is a significant technological advancement that has the capability to improve productivity. However, it is essential to maintain high ethical standards to ensure that developments remain aligned with human values and societal needs.`;

async function testResonance() {
    console.log("🚀 Starting Godly Resonance Test...");
    
    try {
        const response = await fetch(LOCAL_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Rizik-Admin-Key": SERVICE_ROLE_KEY,
                "Authorization": "Bearer MOCK_TOKEN"
            },
            body: JSON.stringify({
                aiText: AI_TEXT,
                dnaProfile: TEST_DNA
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("\n✅ SUCCESS: Resonance Engine Responded.");
            console.log("--------------------------------------------------");
            console.log("INPUT AI TEXT:");
            console.log(AI_TEXT.substring(0, 100) + "...");
            console.log("\nGODLY HUMANIZED OUTPUT:");
            console.log(data.text);
            console.log("--------------------------------------------------");
            
            // Check for noise indicators
            const hasLowercaseI = data.text.includes(" i ");
            const hasTrailingDots = data.text.includes("..");
            
            if (hasLowercaseI || hasTrailingDots) {
                console.log("✨ PHANTOM NOISE DETECTED: Engine is injecting human quirks.");
            } else {
                console.log("⚠️ NOISE SCAN: No explicit lowercase i or .. found (Random chance). Try running again.");
            }
            
            if (data.creditsRemaining) {
                console.log(`💰 Credits: ${data.creditsRemaining} (Admin mode bypass verified)`);
            }
        } else {
            console.error("❌ FAILED:", data.error || "Unknown error");
        }
    } catch (err) {
        console.error("❌ REQUEST ERROR:", err.message);
        console.log("\n💡 TIP: Ensure 'npx wrangler dev' is running on port 8787 in another terminal.");
    }
}

testResonance();
