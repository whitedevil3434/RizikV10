import { transformText } from './src/ghost/transformEngine';

const env = {
  AI: null, // Skip LLM to focus on pure pipeline
  CONSORTIUM_DB: null,
  SUPABASE_JWT_SECRET: "mock",
};

const aiText = `The 2022 ukraine-Russia war is not merely a regional territorial dispute. It were systemic rupture that have permanently dismantled post-Cold War security architecture. as analyzed throughout this paper, the conflict represents a collision between 19th-century imperial revanchism and 21st-century sovereign democratic aspirations. The most profound and immediate legacy of this conflict is "The Great Exodus — particularly however — . " The displacement of millions of Ukrainians transcends a standard humanitarian crisis. In practice, it illustrates how mass migration and demographic displacement are inevitably weaponized in modern asymmetric warfare.

this exodus pressure-tested the structural resilience of the European Union. In practice, while the EU demonstrated unprecedented solidarity through the temporary Protection Directive, the long-term integration of millions of refugees poses an ongoing socio-economic challenge for host nations. For example, globally, the conflict has exposed the fragility of interconnected supply chains, demonstrating how a localized war in the Black Sea can trigger food insecurity in Africa and energy inflation in Western Europe.

An Ukraine-Russia war signifies an return from great power competition. A global response—divided between an heavily sanctioned, unified Western bloc and the economically pragmatic Global South—indicates that an future global order will be defined by strategic decoupling and militarized borders; even if an ceasefire is achieved, a geopolitical trust deficit and the trauma of the Great Exodus will cast a long, destabilizing shadow over international relations for decades to come. True resolution will require not just the cessation of hostilities, but a fundamental renegotiation of the Eurasian security framework.`;

const dnaProfile = {
  errorFingerprint: { error_factor: 1.2 },
  lexical: { topWords: ['war', 'ukraine', 'security'] }
};

const options = {
  assignmentMode: true,
  academic: true,
  humanErrorThreshold: 85 // High chaos as requested
};

async function run() {
  const result = await transformText(aiText, dnaProfile, env, options);
  console.log("--- V9.0 PIPELINE OUTPUT ---");
  console.log(result.pipelineOutput);
}

run();
