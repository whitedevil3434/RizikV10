import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(".env.local") });

const BASE_URL = process.env.RIZIK_BASE_URL || "https://rizikecosystem.com";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://rizik-backend-godly.its-sabbir69.workers.dev";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase env keys in .env.local");
}

const outDir = path.resolve("tmp/verify-writer-pipeline");
fs.mkdirSync(outDir, { recursive: true });

const FORBIDDEN_SHORT_FORMS = /\b(tbh|idk|u|r|lol|bruh|fr|kinda|sorta|no cap)\b/i;
const NOISE_MARKERS =
  /(https?:\/\/|!\[[^\]]*]\([^)]*\)|\[[^\]]+]\((?:https?:\/\/|www\.)[^)]*\)|original reddit post|author:|source:)/i;
const ALLOWED_NEUTRAL_FILLERS =
  /\b(in practice|overall|for example|in this context|to some extent|in general|in many cases|at the same time|from this perspective)\b/gi;

function nowId() {
  return Date.now().toString();
}

function countWords(text) {
  return (String(text || "").match(/\b[A-Za-z']+\b/g) || []).length;
}

function maxFillers(words) {
  if (words >= 100) return Math.max(2, Math.ceil((words / 100) * 3));
  return Math.max(0, Math.ceil((words / 100) * 2));
}

function assertOutputQuality(output, scope) {
  const text = String(output || "");
  if (FORBIDDEN_SHORT_FORMS.test(text)) {
    throw new Error(`${scope}: forbidden short-form/slang detected`);
  }
  if (NOISE_MARKERS.test(text)) {
    throw new Error(`${scope}: link/markdown/source noise detected`);
  }
  const words = countWords(text);
  const fillerCount = (text.match(ALLOWED_NEUTRAL_FILLERS) || []).length;
  if (fillerCount > maxFillers(words)) {
    throw new Error(`${scope}: filler cap exceeded (${fillerCount} > ${maxFillers(words)})`);
  }
  return { words, fillerCount, fillerCap: maxFillers(words) };
}

async function createDisposableUser(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `Pipeline Verify ${nowId()}` },
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create disposable user: ${res.status} ${await res.text()}`);
  }
}

async function runApiChecks(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`Login failed for API checks: ${error?.message || "no session token"}`);
  }

  const token = data.session.access_token;

  const dnaRes = await fetch(`${BACKEND_URL}/api/ghost/dna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text: "This is a genuine writing sample with natural rhythm, short and long sentences, and personal tone.",
    }),
  });
  const dnaJson = await dnaRes.json();

  if (!dnaRes.ok || !dnaJson?.success || !dnaJson?.dna) {
    throw new Error(`DNA endpoint failed: ${dnaRes.status} ${JSON.stringify(dnaJson).slice(0, 250)}`);
  }

  const humanizeRes = await fetch(`${BACKEND_URL}/api/ghost/humanize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      aiText:
        "Artificial intelligence systems can support productivity, but people still prefer writing that sounds grounded and human.",
      dnaProfile: dnaJson.dna,
      options: { academic: false },
    }),
  });
  const humanizeJson = await humanizeRes.json();

  if (!humanizeRes.ok || !humanizeJson?.success || !humanizeJson?.content) {
    throw new Error(
      `Humanize endpoint failed: ${humanizeRes.status} ${JSON.stringify(humanizeJson).slice(0, 250)}`,
    );
  }
  const apiQuality = assertOutputQuality(humanizeJson.content, "API output");

  return {
    api: {
      dnaStatus: dnaRes.status,
      humanizeStatus: humanizeRes.status,
      outputPreview: String(humanizeJson.content).slice(0, 160),
      quality: apiQuality,
    },
  };
}

async function runUiChecks(email, password) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  const ghostResponses = [];

  page.on("response", async (res) => {
    const url = res.url();
    if (!url.includes("/api/ghost/")) return;
    let body = "";
    try {
      body = await res.text();
    } catch {
      body = "";
    }
    ghostResponses.push({ url, status: res.status(), body: body.slice(0, 220) });
  });

  await page.goto(`${BASE_URL}/login?next=%2Fwriter`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForURL(/\/writer/, { timeout: 30000 });

  await page.locator('textarea[placeholder*="genuine writing"]').fill(
    "My own real writing style has mixed length, pauses, and clear intent.",
  );
  await page.getByRole("button", { name: /ANALYZE WRITING DNA/i }).click();
  await page.waitForTimeout(3500);

  const dnaLoaded = await page.getByText("DNA_LOADED").isVisible().catch(() => false);
  if (!dnaLoaded) {
    throw new Error("UI check failed: DNA_LOADED indicator not visible after extraction.");
  }

  await page.locator('textarea[placeholder*="AI generated text"]').fill(
    "This draft sounds generic and polished, and needs to be rewritten with human variation.",
  );
  await page.getByRole("button", { name: /GENERATE GODLY OUTPUT/i }).click();
  await page.waitForTimeout(5000);

  const outputText = await page.evaluate(() => {
    const title = Array.from(document.querySelectorAll("h2")).find((n) =>
      n.textContent?.includes("Humanized Result"),
    );
    const panel = title?.closest(".glass-panel");
    const output = panel?.querySelector(".input-field");
    return output?.textContent?.trim() || "";
  });

  const hasOutput = outputText.length > 0 && !outputText.includes("will appear here");
  if (!hasOutput) {
    throw new Error("UI check failed: Humanized output did not render in output panel.");
  }
  const uiQuality = assertOutputQuality(outputText, "UI output");

  await page.screenshot({ path: path.join(outDir, "writer-ui-proof.png"), fullPage: true });
  await browser.close();

  return {
    ui: {
      dnaLoaded,
      outputPreview: outputText.slice(0, 160),
      quality: uiQuality,
      ghostResponses,
      screenshot: path.join(outDir, "writer-ui-proof.png"),
    },
  };
}

async function main() {
  const id = nowId();
  const email = `verify.pipeline.${id}@example.com`;
  const password = `Rizik!${id}`;
  const startedAt = new Date().toISOString();

  await createDisposableUser(email, password);
  const apiResult = await runApiChecks(email, password);
  const uiResult = await runUiChecks(email, password);

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    backendUrl: BACKEND_URL,
    email,
    result: "PASS",
    ...apiResult,
    ...uiResult,
  };

  const reportPath = path.join(outDir, `report-${id}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ...summary, reportPath }, null, 2));
}

main().catch((err) => {
  console.error("VERIFY_PIPELINE_FAILED:", err?.message || err);
  process.exit(1);
});
