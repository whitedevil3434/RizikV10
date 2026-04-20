# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tmp_e2e_writer_live.spec.js >> Live E2E: signup -> writer credits -> buy -> admin approve -> re-test
- Location: tmp_e2e_writer_live.spec.js:126:1

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "Rizik logo" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Rizik logo" [ref=e6]
      - generic [ref=e8]:
        - generic [ref=e9]:
          - link "Global" [ref=e10] [cursor=pointer]:
            - /url: /
          - link "B2B" [ref=e11] [cursor=pointer]:
            - /url: /b2b
          - link "Subsidiaries" [ref=e12] [cursor=pointer]:
            - /url: /subsidiaries
          - link "Impact" [ref=e13] [cursor=pointer]:
            - /url: /impact
        - generic [ref=e14]:
          - link "Rizik Fair" [ref=e15] [cursor=pointer]:
            - /url: /fair
          - link "Community" [ref=e16] [cursor=pointer]:
            - /url: /community
          - link "Trust" [ref=e17] [cursor=pointer]:
            - /url: /trust
          - link "Rizik Writer" [ref=e18] [cursor=pointer]:
            - /url: /writer
          - link "E-Commerce" [ref=e19] [cursor=pointer]:
            - /url: /store
          - link "Cart" [ref=e20] [cursor=pointer]:
            - /url: /cart
            - img [ref=e21]
            - text: Cart
          - link "Login" [ref=e23] [cursor=pointer]:
            - /url: /login
  - main [ref=e24]:
    - generic [ref=e26]:
      - generic [ref=e27]:
        - img "Rizik logo" [ref=e28]
        - heading "Create Your Rizik Account" [level=1] [ref=e30]
        - paragraph [ref=e31]: Create an account to access store and business services.
      - generic [ref=e32]:
        - generic [ref=e33]: email rate limit exceeded
        - generic [ref=e34]:
          - generic [ref=e35]:
            - generic [ref=e36]: Full Name
            - generic [ref=e37]:
              - img [ref=e38]
              - textbox "Your full name" [ref=e40]
          - generic [ref=e41]:
            - generic [ref=e42]: Email Address
            - generic [ref=e43]:
              - img [ref=e44]
              - textbox "you@rizik.io" [ref=e46]
          - generic [ref=e47]:
            - generic [ref=e49]: Password
            - generic [ref=e50]:
              - img [ref=e51]
              - textbox "••••••••" [ref=e53]
              - button [ref=e54]:
                - img [ref=e55]
          - button "Create Account" [active] [ref=e58]
        - generic [ref=e61]: OR
        - button "Continue with Google" [ref=e63]:
          - img [ref=e64]
          - text: Continue with Google
      - paragraph [ref=e69]:
        - text: Already have an account?
        - button "Sign In" [ref=e70]
  - contentinfo [ref=e71]:
    - paragraph [ref=e73]: © 2026 Rizik Global. All rights reserved.
  - alert [ref=e74]
```

# Test source

```ts
  65  |   const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?on_conflict=id`, {
  66  |     method: "POST",
  67  |     headers: {
  68  |       ...authHeaders,
  69  |       Prefer: "resolution=merge-duplicates,return=representation",
  70  |     },
  71  |     body: JSON.stringify({
  72  |       id: userId,
  73  |       role,
  74  |       full_name: fullName,
  75  |     }),
  76  |   });
  77  |   if (!res.ok) throw new Error(`updateUserRole failed: ${res.status} ${await res.text()}`);
  78  | }
  79  | 
  80  | async function ensureAdminUser(email, password, fullName) {
  81  |   let user = await findUserByEmail(email);
  82  |   if (!user) {
  83  |     const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  84  |       method: "POST",
  85  |       headers: authHeaders,
  86  |       body: JSON.stringify({
  87  |         email,
  88  |         password,
  89  |         email_confirm: true,
  90  |         user_metadata: { full_name: fullName },
  91  |       }),
  92  |     });
  93  |     if (!createRes.ok) throw new Error(`create admin user failed: ${createRes.status} ${await createRes.text()}`);
  94  |     const payload = await createRes.json();
  95  |     user = payload.user;
  96  |   } else {
  97  |     const updRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
  98  |       method: "PUT",
  99  |       headers: authHeaders,
  100 |       body: JSON.stringify({
  101 |         password,
  102 |         email_confirm: true,
  103 |         user_metadata: { full_name: fullName },
  104 |       }),
  105 |     });
  106 |     if (!updRes.ok) throw new Error(`update admin user failed: ${updRes.status} ${await updRes.text()}`);
  107 |   }
  108 | 
  109 |   await updateUserRole(user.id, "SUPER_ADMIN", fullName);
  110 |   return user;
  111 | }
  112 | 
  113 | async function forceConfirmUserAndPassword(userId, password, fullName) {
  114 |   const updRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
  115 |     method: "PUT",
  116 |     headers: authHeaders,
  117 |     body: JSON.stringify({
  118 |       password,
  119 |       email_confirm: true,
  120 |       user_metadata: { full_name: fullName },
  121 |     }),
  122 |   });
  123 |   if (!updRes.ok) throw new Error(`forceConfirmUserAndPassword failed: ${updRes.status} ${await updRes.text()}`);
  124 | }
  125 | 
  126 | test("Live E2E: signup -> writer credits -> buy -> admin approve -> re-test", async ({ browser }) => {
  127 |   test.setTimeout(10 * 60 * 1000);
  128 |   const ts = Date.now();
  129 |   const customerEmail = `e2e.rizik.customer.${ts}@gmail.com`;
  130 |   const customerPassword = `Rizik!${ts}`;
  131 |   const adminEmail = `e2e.rizik.admin.${ts}@gmail.com`;
  132 |   const adminPassword = `RizikAdmin!${ts}`;
  133 |   const customerName = `E2E Customer ${ts}`;
  134 |   const adminName = `E2E Admin ${ts}`;
  135 |   const trxId = `E2E${String(ts).slice(-8)}`;
  136 | 
  137 |   const customerContext = await browser.newContext();
  138 |   const customerPage = await customerContext.newPage();
  139 |   const dialogs = [];
  140 |   customerPage.on("dialog", async (dialog) => {
  141 |     dialogs.push(dialog.message());
  142 |     await dialog.accept();
  143 |   });
  144 | 
  145 |   await test.step("Customer signup on live login page", async () => {
  146 |     await customerPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  147 |     await expect(customerPage.getByText("Sign in to Rizik Ecosystem")).toBeVisible();
  148 |     const createToggle = customerPage.getByRole("button", { name: "Create Account" }).last();
  149 |     await createToggle.click();
  150 |     if (!(await customerPage.locator('input[name="fullName"]').isVisible().catch(() => false))) {
  151 |       await customerPage.waitForTimeout(500);
  152 |       await createToggle.click();
  153 |     }
  154 |     await expect(customerPage.locator('input[name="fullName"]')).toBeVisible({ timeout: 15000 });
  155 |     await customerPage.locator('input[name="fullName"]').fill(customerName);
  156 |     await customerPage.locator('input[name="email"]').fill(customerEmail);
  157 |     await customerPage.locator('input[name="password"]').fill(customerPassword);
  158 |     await customerPage.getByRole("button", { name: "Create Account" }).click();
  159 |     await customerPage.waitForTimeout(2500);
  160 |   });
  161 | 
  162 |   let customerUser = null;
  163 |   await test.step("Resolve created user in Supabase admin API", async () => {
  164 |     customerUser = await waitForUserByEmail(customerEmail, 60000);
> 165 |     expect(customerUser).not.toBeNull();
      |                              ^ Error: expect(received).not.toBeNull()
  166 |     await forceConfirmUserAndPassword(customerUser.id, customerPassword, customerName);
  167 |   });
  168 | 
  169 |   await test.step("If session missing after signup, login with same credentials", async () => {
  170 |     await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  171 |     const onLogin = await customerPage.getByText("Sign in to Rizik Ecosystem").isVisible().catch(() => false);
  172 |     if (onLogin) {
  173 |       await customerPage.locator('input[name="email"]').fill(customerEmail);
  174 |       await customerPage.locator('input[name="password"]').fill(customerPassword);
  175 |       await customerPage.getByRole("button", { name: "Sign In" }).click();
  176 |       await customerPage.waitForTimeout(2500);
  177 |       await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  178 |     }
  179 |     await expect(customerPage.getByText("Upload Your DNA")).toBeVisible({ timeout: 15000 });
  180 |   });
  181 | 
  182 |   const usageSnapshots = [];
  183 | 
  184 |   await test.step("Verify initial free credits from DB", async () => {
  185 |     const usage = await getUsage(customerUser.id);
  186 |     usageSnapshots.push({ stage: "initial", usage });
  187 |   });
  188 | 
  189 |   await test.step("Consume credits via Extract DNA (3 times)", async () => {
  190 |     await customerPage.getByRole("button", { name: /Paste Text/i }).click();
  191 |     const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
  192 |     for (let i = 1; i <= 3; i++) {
  193 |       await refInput.fill(`This is my original writing sample number ${i}. I usually write with mixed sentence lengths, maybe some casual fillers, and natural flow.`);
  194 |       await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
  195 |       await customerPage.waitForTimeout(3500);
  196 |       const usage = await getUsage(customerUser.id);
  197 |       usageSnapshots.push({ stage: `after_extract_${i}`, usage });
  198 |     }
  199 |   });
  200 | 
  201 |   await test.step("Attempt 4th extract and expect buy modal", async () => {
  202 |     const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
  203 |     await refInput.fill("Fourth attempt should trigger insufficient credits and open buy modal.");
  204 |     await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
  205 |     await expect(customerPage.getByText("Upgrade Your Credits")).toBeVisible({ timeout: 15000 });
  206 |     const usage = await getUsage(customerUser.id);
  207 |     usageSnapshots.push({ stage: "after_extract_4_attempt", usage });
  208 |   });
  209 | 
  210 |   let createdOrder = null;
  211 |   await test.step("Submit buy-credit request from writer modal", async () => {
  212 |     await customerPage.getByPlaceholder("Enter bKash TRXID").fill(trxId);
  213 |     await customerPage.getByRole("button", { name: /Submit Payment Proof/i }).click();
  214 |     await customerPage.waitForTimeout(2500);
  215 |     createdOrder = await getLatestDigitalOrder(customerUser.id);
  216 |     expect(createdOrder).not.toBeNull();
  217 |   });
  218 | 
  219 |   let adminUser = null;
  220 |   await test.step("Create dedicated SUPER_ADMIN test account", async () => {
  221 |     adminUser = await ensureAdminUser(adminEmail, adminPassword, adminName);
  222 |     expect(adminUser).not.toBeNull();
  223 |   });
  224 | 
  225 |   await test.step("Admin login and approve the pending writer credit order", async () => {
  226 |     const adminContext = await browser.newContext();
  227 |     const adminPage = await adminContext.newPage();
  228 | 
  229 |     await adminPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  230 |     await adminPage.locator('input[name="email"]').fill(adminEmail);
  231 |     await adminPage.locator('input[name="password"]').fill(adminPassword);
  232 |     await adminPage.getByRole("button", { name: "Sign In" }).click();
  233 |     await adminPage.waitForTimeout(2500);
  234 |     await adminPage.goto(`${BASE_URL}/admin/orders`, { waitUntil: "domcontentloaded" });
  235 |     await expect(adminPage.getByText("Unified Order Queue")).toBeVisible({ timeout: 15000 });
  236 | 
  237 |     const orderContainer = adminPage.locator("tr, article, a").filter({ hasText: createdOrder.order_code }).first();
  238 |     await expect(orderContainer).toBeVisible({ timeout: 15000 });
  239 |     await orderContainer.getByRole("button", { name: /APPROVE CREDITS/i }).click();
  240 |     await adminPage.getByRole("button", { name: /Approve Now/i }).click();
  241 |     await expect(adminPage.getByText("Approved!")).toBeVisible({ timeout: 15000 });
  242 |     await adminContext.close();
  243 |   });
  244 | 
  245 |   let orderAfterApproval = null;
  246 |   await test.step("Verify DB status after approval", async () => {
  247 |     orderAfterApproval = await getLatestDigitalOrder(customerUser.id);
  248 |     const usage = await getUsage(customerUser.id);
  249 |     usageSnapshots.push({ stage: "after_admin_approval", usage });
  250 |     expect(orderAfterApproval.status).toBe("COMPLETED");
  251 |     expect((usage?.paid_credits || 0) > 0).toBeTruthy();
  252 |   });
  253 | 
  254 |   await test.step("Return to customer and verify writer works again post-approval", async () => {
  255 |     await customerPage.goto(`${BASE_URL}/writer`, { waitUntil: "domcontentloaded" });
  256 |     await customerPage.getByRole("button", { name: /Paste Text/i }).click();
  257 |     const refInput = customerPage.getByPlaceholder("Paste an old essay, WhatsApp chat history, or anything written purely by you...");
  258 |     await refInput.fill("Post approval run should pass and deduct from paid credits.");
  259 |     await customerPage.getByRole("button", { name: /Extract DNA/i }).click();
  260 |     await customerPage.waitForTimeout(3500);
  261 |     const usage = await getUsage(customerUser.id);
  262 |     usageSnapshots.push({ stage: "after_post_approval_extract", usage });
  263 |   });
  264 | 
  265 |   await customerPage.screenshot({ path: "tmp/visual-audit-2026-04-05/e2e-final-customer-writer.png", fullPage: true });
```