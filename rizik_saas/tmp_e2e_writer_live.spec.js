const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.RIZIK_BASE_URL || "https://rizikecosystem.com";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://yhwhkwveupjzrwdljivn.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in environment");
}

const authHeaders = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function adminListUsers(page = 1, perPage = 200) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`adminListUsers failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function findUserByEmail(email) {
  const needle = email.trim().toLowerCase();
  for (let page = 1; page <= 30; page++) {
    const data = await adminListUsers(page, 200);
    const users = data.users || [];
    const match = users.find((u) => (u.email || "").toLowerCase() === needle);
    if (match) return match;
    if (users.length < 200) break;
  }
  return null;
}

async function waitForUserByEmail(email, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const user = await findUserByEmail(email);
    if (user) return user;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

async function getUsage(userId) {
  const url = `${SUPABASE_URL}/rest/v1/user_usage?user_id=eq.${userId}&select=user_id,free_uses_remaining,paid_credits,total_transformations,updated_at`;
  const res = await fetch(url, { headers: authHeaders });
  if (!res.ok) throw new Error(`getUsage failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function getLatestDigitalOrder(userId) {
  const url = `${SUPABASE_URL}/rest/v1/rizik_order_records?user_id=eq.${userId}&channel=eq.DIGITAL&order=created_at.desc&limit=1&select=id,order_code,trxid,status,quantity,created_at,user_id,channel`;
  const res = await fetch(url, { headers: authHeaders });
  if (!res.ok) throw new Error(`getLatestDigitalOrder failed: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function updateUserRole(userId, role, fullName) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      ...authHeaders,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      id: userId,
      role,
      full_name: fullName,
    }),
  });
  if (!res.ok) throw new Error(`updateUserRole failed: ${res.status} ${await res.text()}`);
}

async function ensureAdminUser(email, password, fullName) {
  let user = await findUserByEmail(email);
  if (!user) {
    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });
    if (!createRes.ok) throw new Error(`create admin user failed: ${createRes.status} ${await createRes.text()}`);
    const payload = await createRes.json();
    user = payload.user;
  } else {
    const updRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      }),
    });
    if (!updRes.ok) throw new Error(`update admin user failed: ${updRes.status} ${await updRes.text()}`);
  }

  await updateUserRole(user.id, "SUPER_ADMIN", fullName);
  return user;
}

async function forceConfirmUserAndPassword(userId, password, fullName) {
  const updRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  if (!updRes.ok) throw new Error(`forceConfirmUserAndPassword failed: ${updRes.status} ${await updRes.text()}`);
}

test("Live E2E: signup -> writer credits -> buy -> admin approve -> re-test", async ({ browser }) => {
  test.setTimeout(10 * 60 * 1000);
  const ts = Date.now();
  const customerEmail = `e2e.rizik.customer.${ts}@gmail.com`;
  const customerPassword = `Rizik!${ts}`;
  const adminEmail = `e2e.rizik.admin.${ts}@gmail.com`;
  const adminPassword = `RizikAdmin!${ts}`;
  const customerName = `E2E Customer ${ts}`;
  const adminName = `E2E Admin ${ts}`;
  const trxId = `E2E${String(ts).slice(-8)}`;

  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  const dialogs = [];
  customerPage.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.accept();
  });

  await test.step("Customer signup on live login page", async () => {
    await customerPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await expect(customerPage.getByText("Sign in to Rizik Ecosystem")).toBeVisible();
    const createToggle = customerPage.getByRole("button", { name: "Create Account" }).last();
    await createToggle.click();
    if (!(await customerPage.locator('input[name="fullName"]').isVisible().catch(() => false))) {
      await customerPage.waitForTimeout(500);
      await createToggle.click();
    }
    await expect(customerPage.locator('input[name="fullName"]')).toBeVisible({ timeout: 15000 });
    await customerPage.locator('input[name="fullName"]').fill(customerName);
    await customerPage.locator('input[name="email"]').fill(customerEmail);
    await customerPage.locator('input[name="password"]').fill(customerPassword);
    await customerPage.getByRole("button", { name: "Create Account" }).click();
    await customerPage.waitForTimeout(2500);
  });

  let customerUser = null;
  await test.step("Resolve created user in Supabase admin API", async () => {
    customerUser = await waitForUserByEmail(customerEmail, 60000);
    expect(customerUser).not.toBeNull();
    await forceConfirmUserAndPassword(customerUser.id, customerPassword, customerName);
  });

  await test.step("If session missing after signup, login with same credentials", async () => {
    await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
    const onLogin = await customerPage.getByText("Sign in to Rizik Ecosystem").isVisible().catch(() => false);
    if (onLogin) {
      await customerPage.locator('input[name="email"]').fill(customerEmail);
      await customerPage.locator('input[name="password"]').fill(customerPassword);
      await customerPage.getByRole("button", { name: "Sign In" }).click();
      await customerPage.waitForTimeout(2500);
      await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
    }
    await expect(customerPage.getByText("Upload Your DNA")).toBeVisible({ timeout: 15000 });
  });

  const usageSnapshots = [];

  await test.step("Verify initial free credits from DB", async () => {
    const usage = await getUsage(customerUser.id);
    usageSnapshots.push({ stage: "initial", usage });
  });

  await test.step("Consume credits via Extract DNA (3 times)", async () => {
    await customerPage.getByRole("button", { name: /Paste Text/i }).click();
    const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
    for (let i = 1; i <= 3; i++) {
      await refInput.fill(`This is my original writing sample number ${i}. I usually write with mixed sentence lengths, maybe some casual fillers, and natural flow.`);
      await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
      await customerPage.waitForTimeout(3500);
      const usage = await getUsage(customerUser.id);
      usageSnapshots.push({ stage: `after_extract_${i}`, usage });
    }
  });

  await test.step("Attempt 4th extract and expect buy modal", async () => {
    const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
    await refInput.fill("Fourth attempt should trigger insufficient credits and open buy modal.");
    await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
    await expect(customerPage.getByText("Upgrade Your Credits")).toBeVisible({ timeout: 15000 });
    const usage = await getUsage(customerUser.id);
    usageSnapshots.push({ stage: "after_extract_4_attempt", usage });
  });

  let createdOrder = null;
  await test.step("Submit buy-credit request from writer modal", async () => {
    await customerPage.getByPlaceholder("Enter bKash TRXID").fill(trxId);
    await customerPage.getByRole("button", { name: /Submit Payment Proof/i }).click();
    await customerPage.waitForTimeout(2500);
    createdOrder = await getLatestDigitalOrder(customerUser.id);
    expect(createdOrder).not.toBeNull();
  });

  let adminUser = null;
  await test.step("Create dedicated SUPER_ADMIN test account", async () => {
    adminUser = await ensureAdminUser(adminEmail, adminPassword, adminName);
    expect(adminUser).not.toBeNull();
  });

  await test.step("Admin login and approve the pending writer credit order", async () => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
    await adminPage.locator('input[name="email"]').fill(adminEmail);
    await adminPage.locator('input[name="password"]').fill(adminPassword);
    await adminPage.getByRole("button", { name: "Sign In" }).click();
    await adminPage.waitForTimeout(2500);
    await adminPage.goto(`${BASE_URL}/admin/orders`, { waitUntil: "domcontentloaded" });
    await expect(adminPage.getByText("Unified Order Queue")).toBeVisible({ timeout: 15000 });

    const orderContainer = adminPage.locator("tr, article, a").filter({ hasText: createdOrder.order_code }).first();
    await expect(orderContainer).toBeVisible({ timeout: 15000 });
    await orderContainer.getByRole("button", { name: /APPROVE CREDITS/i }).click();
    await adminPage.getByRole("button", { name: /Approve Now/i }).click();
    await expect(adminPage.getByText("Approved!")).toBeVisible({ timeout: 15000 });
    await adminContext.close();
  });

  let orderAfterApproval = null;
  await test.step("Verify DB status after approval", async () => {
    orderAfterApproval = await getLatestDigitalOrder(customerUser.id);
    const usage = await getUsage(customerUser.id);
    usageSnapshots.push({ stage: "after_admin_approval", usage });
    expect(orderAfterApproval.status).toBe("COMPLETED");
    expect((usage?.paid_credits || 0) > 0).toBeTruthy();
  });

  await test.step("Return to customer and verify writer works again post-approval", async () => {
    await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
    await customerPage.getByRole("button", { name: /Paste Text/i }).click();
    const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
    await refInput.fill("Post approval run should pass and deduct from paid credits.");
    await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
    await customerPage.waitForTimeout(3500);
    const usage = await getUsage(customerUser.id);
    usageSnapshots.push({ stage: "after_post_approval_extract", usage });
  });

  await customerPage.screenshot({ path: "tmp/visual-audit-2026-04-05/e2e-final-customer-writer.png", fullPage: true });
  await customerContext.close();

  console.log(JSON.stringify({
    baseUrl: BASE_URL,
    customerEmail,
    adminEmail,
    trxId,
    createdOrder,
    orderAfterApproval,
    usageSnapshots,
    dialogs,
  }, null, 2));
});
