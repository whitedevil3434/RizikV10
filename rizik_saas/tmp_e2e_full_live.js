const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");

const BASE_URL = "https://rizikecosystem.com";
const SUPABASE_URL = "https://yhwhkwveupjzrwdljivn.supabase.co";
const SUPABASE_ANON = process.env.SUPABASE_ANON;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE;

const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL;
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const OUT_DIR = path.resolve("tmp/visual-audit-2026-04-05");
fs.mkdirSync(OUT_DIR, { recursive: true });

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login(page, email, password, next = "/writer") {
  await page.goto(`${BASE_URL}/login?next=${encodeURIComponent(next)}`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /Sign In/i }).click();
  await page.waitForLoadState("networkidle");
}

async function getUsageByEmail(email) {
  const { data: users, error: userErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (userErr) throw userErr;
  const user = users.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!user) throw new Error(`User not found for ${email}`);
  const { data: usage, error: usageErr } = await admin
    .from("user_usage")
    .select("user_id, free_uses_remaining, paid_credits, total_transformations")
    .eq("user_id", user.id)
    .single();
  if (usageErr) throw usageErr;
  return usage;
}

async function run() {
  if (!SUPABASE_ANON || !SUPABASE_SERVICE) throw new Error("Missing Supabase keys env");
  if (!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Missing customer/admin credentials env");
  }

  const report = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
  };

  const browser = await chromium.launch({ headless: true });

  // Customer flow
  const customerCtx = await browser.newContext({ viewport: { width: 1512, height: 960 } });
  const customerPage = await customerCtx.newPage();
  customerPage.on("dialog", async (d) => {
    try {
      await d.accept();
    } catch {}
  });

  await login(customerPage, CUSTOMER_EMAIL, CUSTOMER_PASSWORD, "/writer");
  await customerPage.waitForURL(/\/writer/, { timeout: 30000 });
  await customerPage.screenshot({
    path: path.join(OUT_DIR, "e2e-customer-writer-initial.png"),
    fullPage: true,
  });

  report.usageBefore = await getUsageByEmail(CUSTOMER_EMAIL);

  let modalOpened = false;
  let extractCount = 0;
  for (let i = 0; i < 6; i += 1) {
    await customerPage.getByRole("button", { name: /Paste Text/i }).click();
    await customerPage
      .locator('textarea[placeholder*="Paste an old essay"]')
      .fill(`sample reference text #${Date.now()} iteration-${i} with enough words to pass threshold.`);
    await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
    extractCount += 1;
    await sleep(2500);
    if (await customerPage.locator("text=Upgrade Your Credits").isVisible().catch(() => false)) {
      modalOpened = true;
      break;
    }
  }
  report.extractAttemptsUntilModal = extractCount;
  report.modalOpened = modalOpened;

  await customerPage.screenshot({
    path: path.join(OUT_DIR, "e2e-customer-after-extracts.png"),
    fullPage: true,
  });
  report.usageAfterExtractLoop = await getUsageByEmail(CUSTOMER_EMAIL);

  if (!modalOpened) throw new Error("Buy credits modal did not open after multiple extract attempts");

  const trx = `E2E${Date.now()}`;
  await customerPage.locator('input[type="number"]').fill("5");
  await customerPage.locator('input[placeholder*="TRXID"]').fill(trx);
  await customerPage.getByRole("button", { name: /Submit Payment Proof/i }).click();
  await sleep(2500);
  await customerPage.screenshot({
    path: path.join(OUT_DIR, "e2e-customer-after-order-submit.png"),
    fullPage: true,
  });

  // fetch pending digital order by trx
  const { data: orderRow, error: orderErr } = await admin
    .from("rizik_order_records")
    .select("id, order_code, status, channel, quantity, trxid, user_id")
    .eq("trxid", trx)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (orderErr) throw orderErr;
  report.order = orderRow;

  // Admin approves
  const adminCtx = await browser.newContext({ viewport: { width: 1512, height: 960 } });
  const adminPage = await adminCtx.newPage();
  await login(adminPage, ADMIN_EMAIL, ADMIN_PASSWORD, "/admin/orders");
  await adminPage.waitForURL(/\/admin\/orders/, { timeout: 30000 });
  await adminPage.screenshot({
    path: path.join(OUT_DIR, "e2e-admin-orders-before-approve.png"),
    fullPage: true,
  });

  const targetRow = adminPage.locator("tr").filter({ hasText: CUSTOMER_EMAIL }).first();
  await targetRow.scrollIntoViewIfNeeded();
  await targetRow.locator("button:has-text('APPROVE CREDITS')").click();
  await adminPage.getByRole("button", { name: /Approve Now/i }).click();
  await adminPage.waitForTimeout(2500);

  await adminPage.screenshot({
    path: path.join(OUT_DIR, "e2e-admin-orders-after-approve.png"),
    fullPage: true,
  });

  const { data: approvedOrder, error: approvedErr } = await admin
    .from("rizik_order_records")
    .select("id, order_code, status, channel, quantity, trxid")
    .eq("id", orderRow.id)
    .single();
  if (approvedErr) throw approvedErr;
  report.orderAfterApprove = approvedOrder;

  // Customer retest after approval
  await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  await customerPage.waitForTimeout(1200);
  report.usageAfterApproveBeforeExtract = await getUsageByEmail(CUSTOMER_EMAIL);

  await customerPage.getByRole("button", { name: /Paste Text/i }).click();
  await customerPage
    .locator('textarea[placeholder*="Paste an old essay"]')
    .fill(`post-approval extraction ${Date.now()} to verify paid credits are usable`);
  await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
  await customerPage.waitForTimeout(2500);
  await customerPage.screenshot({
    path: path.join(OUT_DIR, "e2e-customer-after-paid-extract.png"),
    fullPage: true,
  });
  report.usageAfterPaidExtract = await getUsageByEmail(CUSTOMER_EMAIL);

  await customerCtx.close();
  await adminCtx.close();
  await browser.close();

  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(OUT_DIR, "e2e-full-live-result.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
