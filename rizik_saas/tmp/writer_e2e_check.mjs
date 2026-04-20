import path from 'path';
import dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config({ path: path.resolve('/Users/sabbir/Downloads/RizikV10/rizik_saas/.env.local') });

const BASE_URL = 'https://rizikecosystem.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing env keys');

const id = Date.now();
const email = `writer.e2e.${id}@example.com`;
const password = `Rizik!${id}`;

async function adminFetch(pathname, init = {}) {
  return fetch(`${SUPABASE_URL}${pathname}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

const createRes = await adminFetch('/auth/v1/admin/users', {
  method: 'POST',
  body: JSON.stringify({ email, password, email_confirm: true }),
});
if (!createRes.ok) throw new Error(`create user failed ${createRes.status} ${await createRes.text()}`);
const created = await createRes.json();
const userId = created?.id;
if (!userId) throw new Error('missing user id');

await adminFetch('/rest/v1/user_profiles', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify([{ id: userId, full_name: 'Writer E2E', role: 'CUSTOMER' }]),
});

await adminFetch('/rest/v1/user_usage', {
  method: 'POST',
  headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify([{ user_id: userId, free_uses_remaining: 3, paid_credits: 0, total_transformations: 0 }]),
});

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const page = await context.newPage();
const ghostResponses = [];

page.on('response', async (res) => {
  if (!res.url().includes('/api/ghost/')) return;
  let body = '';
  try { body = await res.text(); } catch {}
  ghostResponses.push({ url: res.url(), status: res.status(), body: body.slice(0, 220) });
});

await page.goto(`${BASE_URL}/login?next=%2Fwriter`, { waitUntil: 'domcontentloaded' });
await page.locator('input[name="email"]').fill(email);
await page.locator('input[name="password"]').fill(password);
await page.getByRole('button', { name: /Sign In/i }).click();
await page.waitForURL(/\/writer/, { timeout: 45000 });

await page.locator('textarea[placeholder*="genuine writing"]').fill('This is my natural writing sample with clear rhythm and personal flow.');
await page.getByRole('button', { name: /ANALYZE WRITING DNA/i }).click();
await page.getByText('DNA_LOADED').waitFor({ timeout: 60000 });

await page.locator('textarea[placeholder*="AI generated text"]').fill('Artificial intelligence can improve productivity, but human style needs varied sentence rhythm and tone.');
await page.getByRole('button', { name: /GENERATE GODLY OUTPUT/i }).click();

await page.waitForTimeout(15000);

const outputText = await page.evaluate(() => {
  const title = Array.from(document.querySelectorAll('h2')).find((n) => n.textContent?.includes('Humanized Result'));
  const panel = title?.closest('.glass-panel');
  const output = panel?.querySelector('.input-field');
  return output?.textContent?.trim() || '';
});

const hasOutput = outputText.length > 30 && !outputText.includes('will appear here');
const shot = `/Users/sabbir/Downloads/RizikV10/rizik_saas/tmp/writer-e2e-${id}.png`;
await page.screenshot({ path: shot, fullPage: true });
await browser.close();

console.log(JSON.stringify({
  email,
  userId,
  hasOutput,
  outputLength: outputText.length,
  outputPreview: outputText.slice(0, 220),
  ghostResponses,
  screenshot: shot,
}, null, 2));
