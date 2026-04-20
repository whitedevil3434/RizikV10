import { transformText } from './src/ghost/transformEngine';

async function verify() {
  const aiText = `Introduction
Artificial intelligence has seen significant growth in recent years. It is important to note that researchers emphasize its potential.

Conclusion
In summary, we must be careful with how we deploy these technologies.`;

  const dnaProfile = {
    errorFingerprint: { error_factor: 1.0 },
    syntactic: { avgLength: 20 },
    rhythmic: { burstiness: 5 }
  };

  const env = {
    AI: null, // Skip LLM phase for local test
    CONSORTIUM_DB: null
  };

  const options = {
    humanErrorThreshold: 10, // 10% slider
    academic: false
  };

  console.log("--- INPUT TEXT ---");
  console.log(aiText);

  console.log("\n--- PROCESSING (10% Slider) ---");
  const result = await transformText(aiText, dnaProfile, env, options);

  console.log("\n--- OUTPUT TEXT ---");
  console.log(result.pipelineOutput);

  // Check for Header preservation
  const hasIntro = result.pipelineOutput.includes("Introduction");
  const hasConclusion = result.pipelineOutput.includes("Conclusion");
  const isMerged = result.pipelineOutput.replace(/\n/g, " ").includes("Introduction Artificial intelligence");

  console.log("\n--- VERIFICATION ---");
  console.log(`Headers Found: ${hasIntro && hasConclusion ? "✅ YES" : "❌ NO"}`);
  console.log(`Separate Lines: ${result.pipelineOutput.includes("\n\n") ? "✅ YES" : "❌ NO"}`);
  
  // Count errors (approximate by looking for common injection markers like weird punctuation or typos)
  // Since we don't have the dictionary here, we just look at the raw output.
}

verify();
