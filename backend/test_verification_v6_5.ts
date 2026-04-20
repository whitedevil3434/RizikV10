
import { transformText } from "./src/ghost/transformEngine";

const aiText = `In the realm of real estate, opportunities abound for those who dare to explore beyond the surface. Embark on a journey where each property holds a treasure trove of potential, waiting to be uncovered. As you delve into the intricacies of the market, you’ll discover a tapestry of data and insights, weaving together a comprehensive understanding of what drives value. This journey isn't just about finding the right property; it's about understanding the nuances that can transform a good investment into a great one.`;

const dnaProfile = {
  style: "academic",
  lexicon: "sophisticated",
  fingerprint: "phd_student_v6"
};

const env = {
  ENVIRONMENT: "test",
  AI: null, // Pure Pipeline
  CONSORTIUM_DB: {
    get: async () => ({ text: "real estate is mostly about the location and the people buying it regardless of the price." }),
    query: async () => [{ text: "whenever we talk about property, people just think about the money, but it's really about the neighborhood." }]
  }
};

const options = {
  chaosThreshold: 90,
  assignmentMode: true,
  isAcademic: true,
  strength: 1.0,
  errorFactor: 1.0
};

async function run() {
  console.log("🌪️ Generating Ghost V6.5 (Absolute Zero) Output for Verification...");
  try {
    const result = await transformText(aiText, dnaProfile, env, options);
    console.log("\n--- [VERIFICATION OUTPUT] ---\n");
    console.log(result.pipelineOutput);
    console.log("\n--- [END] ---\n");
  } catch (err) {
    console.error("Simulation Error:", err);
  }
}

run();
