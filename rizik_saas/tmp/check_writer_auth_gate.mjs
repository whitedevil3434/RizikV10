import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { chromium } from "playwright";

dotenv.config({ path: path.resolve(".env.local") });

const BASE_URL = process.env.RIZIK_BASE_URL || "https://rizikecosystem.com";
const outDir = path.resolve("tmp/auth-gate-check");
fs.mkdirSync(outDir, { recursive: true });

const id = Date.now();
const email = `auth.gate.${id}@example.com`;
const password = `Rizik!${id}`;
const fullName = `Auth Gate ${id}`;

const report = {
  startedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  user: { email, fullName },
  steps: [],
  success: false,
};

function addStep(name, ok, details = {}) {
  report.steps.push({ name, ok, ...details });
}

const browser = await chromium.launch({ headless: true });
try {
  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page1 = await ctx1.newPage();

  await page1.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page1.getByRole("button", { name: /Create Account/i }).click();
  await page1.locator('input[name="fullName"]').fill(fullName);
  await page1.locator('input[name="email"]').fill(email);
  await page1.locator('input[name="password"]').fill(password);
  await page1.getByRole("button", { name: /^Create Account$/i }).click();

  await page1.waitForURL(/\/(store|writer|portal|admin|login)/, { timeout: 35000 });
  const afterSignupUrl = page1.url();
  const signupOk = !afterSignupUrl.includes("/login");
  addStep("signup_via_ui", signupOk, { afterSignupUrl });
  await page1.screenshot({ path: path.join(outDir, "01-after-signup.png"), fullPage: true });

  await page1.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  await page1.waitForTimeout(2500);
  const writerTitleVisible = await page1.getByText("RIZIK", { exact: false }).isVisible().catch(() => false);
  const writerUrl = page1.url();
  addStep("writer_access_with_session", writerUrl.includes("/writer") && writerTitleVisible, {
    writerUrl,
    writerTitleVisible,
  });
  await page1.screenshot({ path: path.join(outDir, "02-writer-with-session.png"), fullPage: true });

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page2 = await ctx2.newPage();
  await page2.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  await page2.waitForURL(/\/login\?next=/, { timeout: 30000 });
  const unauthUrl = page2.url();
  const loginHeadingVisible = await page2.getByText("Sign in to Rizik Ecosystem").isVisible().catch(() => false);
  addStep("writer_blocked_without_session", unauthUrl.includes("/login?next=%2Fwriter") && loginHeadingVisible, {
    unauthUrl,
    loginHeadingVisible,
  });
  await page2.screenshot({ path: path.join(outDir, "03-writer-without-session.png"), fullPage: true });

  await ctx2.close();
  await ctx1.close();

  report.success = report.steps.every((s) => s.ok);
} catch (err) {
  report.error = err?.stack || String(err);
} finally {
  await browser.close();
  report.finishedAt = new Date().toISOString();
  const reportPath = path.join(outDir, `report-${id}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, reportPath }, null, 2));
  if (!report.success) process.exit(1);
}
