import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
  const env = {};
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function wordCount(text) {
  return (text.match(/\b[A-Za-z']+\b/g) || []).length;
}

function maxFillers(words) {
  if (words >= 100) return Math.max(2, Math.ceil((words / 100) * 3));
  return Math.max(0, Math.ceil((words / 100) * 2));
}

function repeatedSentenceRatio(text) {
  const parts = String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!parts.length) return 0;
  const seen = new Set();
  let dup = 0;
  for (const p of parts) {
    if (seen.has(p)) dup += 1;
    seen.add(p);
  }
  return dup / parts.length;
}

const envPath = path.resolve(__dirname, "../../rizik_saas/.env.local");
const loaded = loadEnvFile(envPath);
const backendUrl =
  loaded.NEXT_PUBLIC_BACKEND_URL || "https://rizik-backend-godly.its-sabbir69.workers.dev";
const serviceKey = loaded.SUPABASE_SERVICE_ROLE_KEY;
assert(serviceKey, "Missing SUPABASE_SERVICE_ROLE_KEY in rizik_saas/.env.local");

const inputText = `Introduction:
Women's representation in civil service and administration in Bangladesh means active participation of women in policy and administration. The civil service is a core foundation of state structure and public service delivery.
Gender equality in governance is crucial because it improves diversity in policy and decisions. When women are in governance roles, issues like education, health, social security, and human development receive stronger practical focus.
The main objective of this study is to analyze the present situation, opportunities, and barriers to women's full participation in administration for inclusive and sustainable development in Bangladesh.`;

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer admin-bypass-token",
  "X-Rizik-Admin-Key": serviceKey,
};

const dnaRes = await fetch(`${backendUrl}/api/ghost/dna`, {
  method: "POST",
  headers,
  body: JSON.stringify({ text: inputText }),
});
const dnaJson = await dnaRes.json();
assert.equal(dnaRes.status, 200, `DNA status ${dnaRes.status}`);
assert.ok(dnaJson?.success && dnaJson?.dna, "DNA response missing");

const hRes = await fetch(`${backendUrl}/api/ghost/humanize`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    aiText: inputText,
    dnaProfile: dnaJson.dna,
    options: { academic: false, strength: "balanced" },
  }),
});
const hJson = await hRes.json();
assert.equal(hRes.status, 200, `Humanize status ${hRes.status}`);
assert.ok(hJson?.success && hJson?.content, "Humanize response missing content");

const output = String(hJson.content);

const forbidden = /\b(tbh|idk|u|r|lol|bruh|fr|kinda|sorta|no cap)\b/gi;
const noise = /(https?:\/\/|!\[[^\]]*]\([^)]*\)|\[[^\]]+]\((?:https?:\/\/|www\.)[^)]*\)|original reddit post|author:|source:)/gi;
const allowedFiller = /\b(in practice|overall|for example|in this context|to some extent|in general|in many cases|at the same time|from this perspective)\b/gi;
const fillerCount = (output.match(allowedFiller) || []).length;
const words = wordCount(output);
const duplicateSentenceRatio = repeatedSentenceRatio(output);
const longestSentenceWords = Math.max(
  0,
  ...String(output)
    .split(/(?<=[.!?])\s+/)
    .map((s) => wordCount(s)),
);

assert(!forbidden.test(output), "Forbidden short-form/slang found in output");
assert(!noise.test(output), "Noise/link markdown found in output");
assert(
  fillerCount <= maxFillers(words),
  `Filler cap exceeded: ${fillerCount} > ${maxFillers(words)} for ${words} words`,
);
assert(duplicateSentenceRatio <= 0.15, `Too much duplicate sentence reuse: ${duplicateSentenceRatio}`);
assert(longestSentenceWords <= 40, `Longest sentence too long after refinement: ${longestSentenceWords}`);

console.log(
  JSON.stringify(
    {
      ok: true,
      backendUrl,
      dnaStatus: dnaRes.status,
      humanizeStatus: hRes.status,
      words,
      fillerCount,
      fillerCap: maxFillers(words),
      duplicateSentenceRatio,
      longestSentenceWords,
      outputPreview: output.slice(0, 220),
    },
    null,
    2,
  ),
);
