import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const mod = require(path.resolve(__dirname, "../dist-test/transformEngine.js"));
const quality = require(path.resolve(__dirname, "../dist-test/qualityEngine.js"));

const {
  applyHumanizerQualityPolicy,
  applyBladerHumanizerPolicy,
  applyStructureRefinement,
  getQualityMetrics,
  calculateMaxAllowedFillers,
} = mod;
const { evaluateHumanQuality } = quality;

assert.equal(typeof applyHumanizerQualityPolicy, "function", "applyHumanizerQualityPolicy not exported");
assert.equal(typeof applyBladerHumanizerPolicy, "function", "applyBladerHumanizerPolicy not exported");
assert.equal(typeof applyStructureRefinement, "function", "applyStructureRefinement not exported");
assert.equal(typeof getQualityMetrics, "function", "getQualityMetrics not exported");
assert.equal(typeof calculateMaxAllowedFillers, "function", "calculateMaxAllowedFillers not exported");
assert.equal(typeof evaluateHumanQuality, "function", "evaluateHumanQuality not exported");

function makeSentence(lead, n) {
  return `${lead}, this is sentence number ${n} with enough words to keep structure stable.`;
}

// Case 1: forbidden short forms should not survive.
const forbiddenInput =
  "tbh this is raw text. idk why u think r fine. bruh this kinda feels sorta weird.";
const forbiddenOutput = applyHumanizerQualityPolicy(forbiddenInput);
assert(!/\btbh\b/i.test(forbiddenOutput), "tbh survived");
assert(!/\bidk\b/i.test(forbiddenOutput), "idk survived");
assert(!/\bu\b/i.test(forbiddenOutput), "u survived");
assert(!/\br\b/i.test(forbiddenOutput), "r survived");

// Case 2: filler cap for ~50 words.
const text50 = [
  makeSentence("overall", 1),
  makeSentence("in practice", 2),
  makeSentence("for example", 3),
].join(" ");
const out50 = applyHumanizerQualityPolicy(text50);
const metrics50 = getQualityMetrics(out50);
const max50 = calculateMaxAllowedFillers(metrics50.wordCount);
assert(metrics50.fillerCount <= max50, `50w filler cap failed: ${metrics50.fillerCount} > ${max50}`);

// Case 3: filler cap for ~100 words.
const text100 = Array.from({ length: 8 }, (_, i) =>
  makeSentence(i % 2 === 0 ? "overall" : "in this context", i + 1),
).join(" ");
const out100 = applyHumanizerQualityPolicy(text100);
const metrics100 = getQualityMetrics(out100);
const max100 = calculateMaxAllowedFillers(metrics100.wordCount);
assert(metrics100.fillerCount <= max100, `100w filler cap failed: ${metrics100.fillerCount} > ${max100}`);

// Case 4: filler cap for ~200 words.
const text200 = Array.from({ length: 16 }, (_, i) =>
  makeSentence(i % 3 === 0 ? "overall" : i % 3 === 1 ? "at the same time" : "for example", i + 1),
).join(" ");
const out200 = applyHumanizerQualityPolicy(text200);
const metrics200 = getQualityMetrics(out200);
const max200 = calculateMaxAllowedFillers(metrics200.wordCount);
assert(metrics200.fillerCount <= max200, `200w filler cap failed: ${metrics200.fillerCount} > ${max200}`);

// Case 5: repeated lead fillers should be reduced.
const repeated = `${makeSentence("overall", 1)} ${makeSentence("overall", 2)} ${makeSentence("overall", 3)}`;
const outRepeated = applyHumanizerQualityPolicy(repeated);
const repeatedMetrics = getQualityMetrics(outRepeated);
assert(repeatedMetrics.repeatedLeadCount === 0, "Repeated lead fillers still present");

// Case 6: HQS should remain healthy for coherent paragraph.
const sourceText = `Women representation in civil service in Bangladesh is important because balanced governance improves policy design and implementation. Greater inclusion can improve education, health, and social outcomes while strengthening accountability.`;
const coherentOutput = applyHumanizerQualityPolicy(
  `In this context, women representation in civil service in Bangladesh is important because balanced governance improves policy design and implementation. Greater inclusion can improve education, health, and social outcomes while strengthening accountability.`,
);
const hqs = evaluateHumanQuality(coherentOutput, sourceText);
assert(hqs.score >= 78, `HQS too low for coherent output: ${hqs.score}`);

// Case 7: structure refinement should split oversized run-on in strong mode.
const longSentence =
  "This is a very long sentence that keeps stacking clauses with extra descriptive phrases, and it continues with additional context and detail so that we can test structural splitting reliably in strong mode for better readability.";
const structured = applyStructureRefinement(longSentence, "strong");
const structuredParts = structured.split(/(?<=[.!?])\s+/).filter(Boolean);
assert(structuredParts.length >= 2, "Strong structure refinement did not split long sentence");

// Case 8: blader/humanizer cleanup removes signposting + simplifies AI-ish phrasing.
const bladerInput =
  "Let's dive in: Additionally, this serves as a pivotal moment — underscoring the importance of the change. I hope this helps!";
const bladerOut = applyBladerHumanizerPolicy(bladerInput);
assert(!/let['’]s dive in/i.test(bladerOut), "Signposting survived");
assert(!/i hope this helps/i.test(bladerOut), "Chatbot artifact survived");
assert(!/\badditionally\b/i.test(bladerOut), "AI vocab (additionally) survived");
assert(/\balso\b/i.test(bladerOut), "Expected 'also' replacement missing");
assert(!/\bserves as\b/i.test(bladerOut), "Copula avoidance survived");

console.log(
  JSON.stringify(
    {
      ok: true,
      checks: [
        "forbidden-short-forms",
        "filler-cap-50-100-200",
        "repeated-lead-reduction",
        "hqs-threshold",
        "structure-refinement-strong",
        "blader-humanizer-cleanup",
      ],
      sample: out100.slice(0, 180),
      hqsSample: hqs,
      structureSample: structured,
      bladerSample: bladerOut,
    },
    null,
    2,
  ),
);
