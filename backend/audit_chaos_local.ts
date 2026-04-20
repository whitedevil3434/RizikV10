import { applyHumanErrors } from './src/ghost/humanErrorEngine';
import { applyStructuralChaos } from './src/ghost/chaosEngine';

const sampleAiText = `Artificial intelligence has seen significant growth in recent years. 
It is important to note that balanced governance improves policy design and implementation. 
Greater inclusion can improve education, health, and social outcomes while strengthening accountability. 
Furthermore, the integration of technology into daily life has reshaped how societies function. 
The bureaucracy of government often slows down the development of necessary infrastructure.
We definitely need to separate the analysis from the argument to receive a clear result.`;

const dnaProfile = {
  errorFingerprint: { error_factor: 1.2 },
  syntactic: { avgLength: 15 },
  rhythmic: { burstiness: 8, flow: "chaotic" }
};

const userDnaSeed = "test_dna_shabbir_omega";

console.log("------------------------------------------------------------------");
console.log("RIZIK GHOST: DEEP CHAOS AUDIT");
console.log("------------------------------------------------------------------");
console.log("Original AI Text (Word count: " + sampleAiText.split(/\s+/).length + ")");
console.log(sampleAiText);
console.log("------------------------------------------------------------------");

const runAudit = (threshold: number, isAcademic: boolean) => {
  console.log(`\n>>> TESTING AT ${threshold}% SLIDER (Academic: ${isAcademic})`);
  
  // 1. Structural Chaos (Sentence Shuffling + Vocabulary)
  const chaosOutput = applyStructuralChaos(sampleAiText, userDnaSeed, isAcademic);
  
  // 2. Human Error Injection
  const errorConfig = {
    chaosThreshold: threshold,
    errorFactor: dnaProfile.errorFingerprint.error_factor,
    isAcademic: isAcademic,
    dnaSeed: userDnaSeed
  };
  
  const errorResult = applyHumanErrors(chaosOutput, errorConfig);
  
  console.log("Final Output:");
  console.log(errorResult.text);
  
  console.log("\nMutation Summary:");
  const mutationsByType: Record<string, number> = {};
  errorResult.mutations.forEach(m => {
    mutationsByType[m.type] = (mutationsByType[m.type] || 0) + 1;
    console.log(`  - [${m.type}] ${m.original} -> ${m.mutated}`);
  });
  
  console.log("\nChaos Effectiveness Statistics:");
  const finalWords = errorResult.text.split(/\s+/).length;
  const originalWords = sampleAiText.split(/\s+/).length;
  console.log(`- Word Retention: ${((finalWords / originalWords) * 100).toFixed(1)}%`);
  console.log(`- Total Mutations: ${errorResult.mutations.length}`);
  console.log(`- Error Density: ${((errorResult.mutations.length / finalWords) * 100).toFixed(2)}%`);
};

runAudit(35, true);  // Academic Standard
runAudit(75, false); // Extreme Casual
