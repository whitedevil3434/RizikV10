/**
 * Rizik Human Error Engine — Live API Integration Test
 * Tests the full 4-stage pipeline at different slider levels and analyzes error injection results.
 */

const BACKEND_URL = "https://rizik-backend-godly.its-sabbir69.workers.dev";
const SUPABASE_URL = "https://yhwhkwveupjzrwdljivn.supabase.co";

// Admin bypass key (from env)
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg";

// Sample academic AI-generated text for testing
const SAMPLE_AI_TEXT = `Artificial intelligence has fundamentally transformed the landscape of modern education. The implementation of machine learning algorithms in educational settings has demonstrated significant improvements in student engagement and learning outcomes. Research conducted by numerous institutions indicates that personalized learning pathways, driven by AI analysis of student performance data, result in measurably better academic achievement compared to traditional one-size-fits-all approaches.

The methodology employed in this investigation involved a comprehensive assessment of multiple educational platforms that utilize artificial intelligence for adaptive learning. Data was collected from approximately five thousand students across twelve different institutions over a period of eighteen months. The analysis revealed that students who received AI-driven personalized recommendations showed a twenty-three percent improvement in overall test scores.

Furthermore, the environmental considerations surrounding the deployment of AI infrastructure in educational institutions cannot be overlooked. The energy consumption associated with running sophisticated machine learning models raises questions about the sustainability of widespread AI adoption in schools. However, proponents argue that the long-term benefits of improved educational outcomes justify the initial environmental cost.

In conclusion, while the integration of artificial intelligence in education presents both opportunities and challenges, the evidence overwhelmingly suggests that thoughtful implementation of AI technologies can significantly enhance the quality of education. The development of more efficient algorithms and the reduction of computational requirements will be crucial for the sustainable growth of AI-assisted learning.`;

// ─── Step 1: Extract DNA ─────────────────────────────────────────────────────

async function extractDNA() {
  console.log("🧬 Step 1: Extracting DNA profile...");
  
  const sampleRef = "I think the education system really needs to change. Like, the way they teach stuff is kinda old fashioned and dont really help students learn properly. In my opinion, technology can make things better but people are not utilizing it the right way. The goverment should invest more in digital education because its the future.";
  
  const res = await fetch(`${BACKEND_URL}/api/ghost/dna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer admin-test-token",
      "X-Rizik-Admin-Key": SERVICE_KEY,
    },
    body: JSON.stringify({ text: sampleRef }),
  });

  const data = await res.json();
  if (!data.success) throw new Error("DNA extraction failed: " + JSON.stringify(data));
  
  console.log("✅ DNA Profile extracted.");
  console.log("   Error Factor:", data.dna?.errorFingerprint?.error_factor || "N/A");
  console.log("   Flow Type:", data.dna?.rhythmic?.flow || "N/A");
  console.log("   Avg Sentence Length:", data.dna?.syntactic?.avgLength?.toFixed(1) || "N/A");
  
  return data.dna;
}

// ─── Step 2: Run Transform at Different Slider Levels ────────────────────────

async function runTransform(dnaProfile, humanErrorThreshold, label) {
  console.log(`\n🌪️ ${label}: Running transform (humanErrorThreshold=${humanErrorThreshold}%)...`);
  
  const res = await fetch(`${BACKEND_URL}/api/ghost/humanize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer admin-test-token",
      "X-Rizik-Admin-Key": SERVICE_KEY,
    },
    body: JSON.stringify({
      aiText: SAMPLE_AI_TEXT,
      dnaProfile: dnaProfile,
      options: {
        academic: true,
        chaosLevel: 0.8,
        useConsortium: true,
        humanErrorThreshold: humanErrorThreshold,
      },
    }),
  });

  const data = await res.json();
  if (!data.success) {
    console.error(`❌ ${label} FAILED:`, data);
    return null;
  }

  return {
    label,
    threshold: humanErrorThreshold,
    pipelineOutput: data.pipelineOutput || "",
    llmOutput: data.content || "",
  };
}

// ─── Step 3: Analyze Error Density ──────────────────────────────────────────

function analyzeErrors(text, label) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordCount = words.length;
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  
  let errorCounts = {
    spelling: 0,
    article: 0,
    preposition: 0,
    tense: 0,
    agreement: 0,
    uncountable_plural: 0,
    confused_words: 0,
    l1_interference: 0,
    double_comparative: 0,
    am_br_mix: 0,
    total: 0,
  };

  // Spelling errors detection
  const spellingErrors = ["enviroment", "goverment", "accomodation", "seperate", "definately", "recieve", "neccessary", "occurence", "recomend", "particulary", "begining", "immediatly", "independant", "developement", "achievment", "assesment", "sofisticated", "prespective", "comprehinsive", "implimentation", "aproximatly", "phenomenom", "organisaton", "beaurucracy", "hypotheisis", "analisis", "arguement", "embarass", "apparantly", "oportunity", "experiance", "consequense", "significanse", "aknowledge", "comittee", "contempory", "cirriculum", "disipline", "effeciency", "exagerate", "fundamnetal", "gaurantee", "influencial", "inteligence", "maintainance", "methodolgy", "noticable", "philosphy", "posession", "proffesional", "phsychology", "questionare", "responsibilty", "temprature", "unfortunatly", "bibliograhy", "charachteristic", "contravesial", "correspondance", "determintion", "descrimination", "infastructure", "investigaton", "manufactering", "particiption", "predominatly", "recomendation", "representtion", "simultaniously", "interpretaion", "comunication", "colaboration", "sustainablity", "transfomation", "vulnerablity", "rehabilitaion", "archeological", "administartor", "categoriztion", "documention", "establishmnet", "identifaction", "justificaton", "legitimasy", "miscellanous", "envirnoment", "govermnent", "phenomemon", "hypotheisis", "anaylsis", "seperete", "definatly", "neccesary", "acommodation", "reccommend", "particualrly", "beggining", "aparently", "immedietaly", "oppurtunity", "expierence", "indipendent", "consequnce", "signifcance", "devlopment", "acknowlede", "achivement", "asessment", "commitee", "comtemporary", "curiculum", "disciplin", "efficency", "exaggarate", "fundemental", "guarentee", "influentail", "intelligense", "maintenence", "methedology", "noticible", "philsophy", "possesion", "profesional", "psycology", "questionaire", "responsiblity", "sophistacated", "temperture", "unfortunatley", "perspetive", "prelimanary", "biblography", "characterisitc", "comperhensive", "controversal", "corespondence", "determintaion", "discrimintion", "implementaion", "infrastructre", "investagation", "manufaturing", "organzation", "partcipation", "predominently", "recommandation", "represenation", "simultaenously", "interpertation", "commmunication", "approximatley", "collabration", "sutainability", "transormation", "vulnarability", "rehabiliation", "archaelogical", "adminstrator", "categorsation", "documentaion", "establisment", "indentification", "justifcation", "legtimacy", "miscellneous", "bureaucrasy"];
  
  for (const w of words) {
    if (spellingErrors.includes(w)) errorCounts.spelling++;
  }

  // Uncountable plurals
  const uncountables = ["informations", "advices", "knowledges", "equipments", "researches", "evidences", "feedbacks", "furnitures", "homeworks", "luggages", "progresses", "softwares", "traffics", "vocabularies", "literatures", "musics", "clothings"];
  for (const w of words) {
    if (uncountables.includes(w)) errorCounts.uncountable_plural++;
  }

  // Double comparatives
  const doubleCompPatterns = ["more better", "more worse", "most best", "most worst", "more higher", "more lower", "more easier", "more harder", "more faster", "more simpler", "more clearer"];
  const lowerText = text.toLowerCase();
  for (const p of doubleCompPatterns) {
    if (lowerText.includes(p)) errorCounts.double_comparative++;
  }

  // L1 interference
  const l1Patterns = ["according to my opinion", "in the other hand", "by this way", "take a decision", "make a research", "it depends from", "interested on", "focus to", "consist from", "participate on", "discuss about the", "enter into the", "emphasize on the", "comprise from", "lack in", "different than", "regardless from", "superior than", "inferior than", "prefer than", "in any how"];
  for (const p of l1Patterns) {
    if (lowerText.includes(p)) errorCounts.l1_interference++;
  }

  // Wrong collocations
  const wrongCollocs = ["do progress", "do an effort", "make homework", "make notes", "make a break", "say advice", "give attention", "rise awareness"];
  for (const p of wrongCollocs) {
    if (lowerText.includes(p)) errorCounts.l1_interference++;
  }

  // Am/Br spelling mix detection (check for mixed usage)
  const brForms = ["analyse", "colour", "favour", "honour", "behaviour", "organisation", "realise", "recognise", "optimise", "summarise", "criticise", "apologise", "characterise", "emphasise", "hypothesise", "utilise", "defence", "offence", "licence", "centre", "metre", "fibre", "theatre", "catalogue", "dialogue", "programme", "enrolment", "fulfilment", "judgement", "ageing", "modelling", "travelling", "cancelled", "labelled"];
  for (const w of words) {
    if (brForms.includes(w)) errorCounts.am_br_mix++;
  }

  // Confused words (count common confusions)
  const confusedPairs = [["affect", "effect"], ["its", "it's"], ["then", "than"], ["their", "there"], ["lose", "loose"], ["accept", "except"], ["principle", "principal"], ["whether", "weather"], ["whose", "who's"]];
  // This is hard to detect without context, just count known confused tokens
  
  // Total up
  errorCounts.total = errorCounts.spelling + errorCounts.uncountable_plural + errorCounts.double_comparative + errorCounts.l1_interference + errorCounts.am_br_mix;

  const errorRate = wordCount > 0 ? ((errorCounts.total / wordCount) * 100).toFixed(2) : "0";

  return {
    label,
    wordCount,
    sentenceCount: sentences.length,
    errors: errorCounts,
    errorRate: errorRate + "%",
    errorRatePerSentence: sentences.length > 0 ? (errorCounts.total / sentences.length).toFixed(2) : "0",
  };
}

// ─── Main Test Runner ───────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  RIZIK HUMAN ERROR ENGINE — LIVE INTEGRATION TEST");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Step 1: Get DNA
  const dna = await extractDNA();

  // Step 2: Run transforms at different slider levels
  const tests = [
    { threshold: 0, label: "BASELINE (0% — No Errors)" },
    { threshold: 10, label: "BOOST LEVEL 1 (10% slider)" },
    { threshold: 20, label: "BOOST LEVEL 2 (20% slider)" },
    { threshold: 50, label: "HEAVY (50% slider)" },
  ];

  const results = [];

  for (const test of tests) {
    const result = await runTransform(dna, test.threshold, test.label);
    if (result) results.push(result);
  }

  // Step 3: Analyze error density for each
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  ERROR ANALYSIS RESULTS");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (const r of results) {
    console.log(`\n─── ${r.label} ───────────────────────────────────────`);
    
    const pipelineAnalysis = analyzeErrors(r.pipelineOutput, "Pipeline Output");
    const llmAnalysis = analyzeErrors(r.llmOutput, "LLM Output (Final)");
    
    console.log(`\n  📦 PIPELINE OUTPUT (${pipelineAnalysis.wordCount} words, ${pipelineAnalysis.sentenceCount} sentences):`);
    console.log(`     Error Rate: ${pipelineAnalysis.errorRate} (${pipelineAnalysis.errors.total} errors detected)`);
    console.log(`     Errors/Sentence: ${pipelineAnalysis.errorRatePerSentence}`);
    if (pipelineAnalysis.errors.total > 0) {
      console.log(`     Breakdown: Spelling=${pipelineAnalysis.errors.spelling}, Plurals=${pipelineAnalysis.errors.uncountable_plural}, Double-Comp=${pipelineAnalysis.errors.double_comparative}, L1=${pipelineAnalysis.errors.l1_interference}, Am/Br=${pipelineAnalysis.errors.am_br_mix}`);
    }
    
    console.log(`\n  🤖 LLM OUTPUT (${llmAnalysis.wordCount} words, ${llmAnalysis.sentenceCount} sentences):`);
    console.log(`     Error Rate: ${llmAnalysis.errorRate} (${llmAnalysis.errors.total} errors detected)`);
    console.log(`     Errors/Sentence: ${llmAnalysis.errorRatePerSentence}`);
    if (llmAnalysis.errors.total > 0) {
      console.log(`     Breakdown: Spelling=${llmAnalysis.errors.spelling}, Plurals=${llmAnalysis.errors.uncountable_plural}, Double-Comp=${llmAnalysis.errors.double_comparative}, L1=${llmAnalysis.errors.l1_interference}, Am/Br=${llmAnalysis.errors.am_br_mix}`);
    }

    // Show a snippet of the LLM output
    console.log(`\n  📝 LLM Output Preview (first 300 chars):`);
    console.log(`     "${r.llmOutput.slice(0, 300)}..."`);
  }

  // Survival rate calculation
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  ERROR SURVIVAL ANALYSIS (Pipeline → LLM)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (const r of results) {
    if (r.threshold === 0) continue;
    const pErr = analyzeErrors(r.pipelineOutput, "").errors.total;
    const lErr = analyzeErrors(r.llmOutput, "").errors.total;
    const survivalRate = pErr > 0 ? ((lErr / pErr) * 100).toFixed(1) : "N/A";
    console.log(`  ${r.label}:`);
    console.log(`    Pipeline: ${pErr} errors → LLM Final: ${lErr} errors → Survival: ${survivalRate}%`);
  }

  console.log("\n✅ Test complete.");
}

main().catch(console.error);
