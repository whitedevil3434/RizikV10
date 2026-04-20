const { chromium } = require("playwright");
const fs = require("fs");

const BASE_URL = "https://rizikecosystem.com";
const SUPABASE_URL = "https://yhwhkwveupjzrwdljivn.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlod2hrd3ZldXBqenJ3ZGxqaXZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIxMjg3OCwiZXhwIjoyMDg3Nzg4ODc4fQ.cOMxhnL4BjvllMx5K2UNkfHUuhC3rVhzWWSIIBLWCDg";

const CUSTOMER = {
  id: "1e499a55-d271-466b-9a4f-fe90f97e6f4d",
  email: "e2e.rizik.customer.1775378837104@gmail.com",
  password: "RizikCustomer!2026",
};

const ADMIN = {
  email: "e2e.rizik.admin.final.1775379029@gmail.com",
  password: "RizikAdmin!2026",
};

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function getUsage(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_usage?user_id=eq.${userId}&select=user_id,free_uses_remaining,paid_credits,total_transformations,updated_at`, { headers });
  if (!res.ok) throw new Error(`getUsage failed ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function getLatestOrder(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rizik_order_records?user_id=eq.${userId}&channel=eq.DIGITAL&order=created_at.desc&limit=1&select=id,order_code,trxid,status,quantity,created_at,user_id`, { headers });
  if (!res.ok) throw new Error(`getLatestOrder failed ${res.status}: ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForTimeout(2500);
}

async function ensureOnWriter(page) {
  await page.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  const onLogin = await page.getByText("Sign in to Rizik Ecosystem").isVisible().catch(() => false);
  if (onLogin) return false;
  return true;
}

async function doExtract(page, i) {
  await page.getByRole("button", { name: /Paste Text/i }).click();
  await page.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...")
    .fill(`Natural human writing sample ${i}. I think this sounds more organic, with casual rhythm and mixed sentence flow.`);
  await page.getByRole("button", { name: /Extract DNA/i }).click();
  await page.waitForTimeout(3500);
}

async function main() {
  const out = {
    startedAt: new Date().toISOString(),
    customer: { email: CUSTOMER.email, id: CUSTOMER.id },
    admin: { email: ADMIN.email },
    usageSnapshots: [],
    dialogs: [],
    notes: [],
  };

  const browser = await chromium.launch({ headless: true });
  try {
    const customerCtx = await browser.newContext();
    const customerPage = await customerCtx.newPage();
    customerPage.on("dialog", async (d) => {
      out.dialogs.push(d.message());
      await d.accept();
    });

    out.usageSnapshots.push({ stage: "before_login", usage: await getUsage(CUSTOMER.id) });

    await login(customerPage, CUSTOMER.email, CUSTOMER.password);
    let writerOk = await ensureOnWriter(customerPage);
    if (!writerOk) {
      out.notes.push("Customer login did not create active session for /writer.");
      throw new Error("Customer unable to reach writer after login");
    }

    for (let i = 1; i <= 3; i++) {
      await doExtract(customerPage, i);
      out.usageSnapshots.push({ stage: `after_extract_${i}`, usage: await getUsage(CUSTOMER.id) });
    }

    await doExtract(customerPage, 4);
    const modalVisible = await customerPage.getByText("Upgrade Your Credits").isVisible().catch(() => false);
    out.notes.push(`Buy modal visible after 4th extract attempt: ${modalVisible}`);
    out.usageSnapshots.push({ stage: "after_extract_4_attempt", usage: await getUsage(CUSTOMER.id) });

    const trxId = `E2E${Date.now()}`;
    await customerPage.getByPlaceholder("Enter bKash TRXID").fill(trxId);
    await customerPage.getByRole("button", { name: /Submit Payment Proof/i }).click();
    await customerPage.waitForTimeout(2500);

    const createdOrder = await getLatestOrder(CUSTOMER.id);
    out.createdOrder = createdOrder;
    out.notes.push(`Created order status: ${createdOrder?.status || "none"}`);

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await login(adminPage, ADMIN.email, ADMIN.password);
    await adminPage.goto(`${BASE_URL}/admin/orders`, { waitUntil: "domcontentloaded" });
    await adminPage.waitForTimeout(2000);

    let row = adminPage.locator("tr, article, a").filter({ hasText: createdOrder.order_code }).first();
    if (!(await row.isVisible().catch(() => false))) {
      row = adminPage.locator("tr, article, a").filter({ hasText: trxId }).first();
    }
    await row.getByRole("button", { name: /APPROVE CREDITS/i }).click();
    await adminPage.getByRole("button", { name: /Approve Now/i }).click();
    await adminPage.waitForTimeout(2500);
    out.notes.push("Admin approval action executed from UI.");
    await adminCtx.close();

    out.orderAfterApproval = await getLatestOrder(CUSTOMER.id);
    out.usageSnapshots.push({ stage: "after_admin_approval", usage: await getUsage(CUSTOMER.id) });

    await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
    await doExtract(customerPage, "post_approval");
    out.usageSnapshots.push({ stage: "after_post_approval_extract", usage: await getUsage(CUSTOMER.id) });
    await customerPage.screenshot({ path: "tmp/visual-audit-2026-04-05/e2e-existing-final-writer.png", fullPage: true });
    await customerCtx.close();

    out.finishedAt = new Date().toISOString();
    out.success = true;
  } catch (err) {
    out.finishedAt = new Date().toISOString();
    out.success = false;
    out.error = String(err && err.stack ? err.stack : err);
  } finally {
    await browser.close();
  }

  fs.writeFileSync("tmp/visual-audit-2026-04-05/e2e-existing-result.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  if (!out.success) process.exit(1);
}

main();

