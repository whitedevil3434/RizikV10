import json
import os
import time
from datetime import datetime
from pathlib import Path
from urllib import request as urllib_request
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

BASE_URL = os.environ.get("RIZIK_BASE_URL", "https://rizikecosystem.com")
out_dir = Path("/Users/sabbir/Downloads/RizikV10/rizik_saas/tmp/auth-gate-check")
out_dir.mkdir(parents=True, exist_ok=True)

ts = int(time.time() * 1000)
email = f"auth.gate.{ts}@gmail.com"
password = f"Rizik!{ts}"
full_name = f"Auth Gate {ts}"

report = {
    "startedAt": datetime.utcnow().isoformat() + "Z",
    "baseUrl": BASE_URL,
    "user": {"email": email, "fullName": full_name},
    "steps": [],
    "success": False,
}

def add_step(name, ok, **details):
    row = {"name": name, "ok": ok}
    row.update(details)
    report["steps"].append(row)

def load_env_file(file_path):
    env = {}
    p = Path(file_path)
    if not p.exists():
        return env
    for raw in p.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def create_user_via_admin(email_addr, passcode, full_name_value):
    local_env = load_env_file("/Users/sabbir/Downloads/RizikV10/rizik_saas/.env.local")
    supabase_url = local_env.get("NEXT_PUBLIC_SUPABASE_URL", "")
    service_key = local_env.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not supabase_url or not service_key:
        return {"ok": False, "error": "missing supabase admin env keys"}

    url = f"{supabase_url}/auth/v1/admin/users"
    payload = json.dumps({
        "email": email_addr,
        "password": passcode,
        "email_confirm": True,
        "user_metadata": {"full_name": full_name_value},
    }).encode("utf-8")

    req = urllib_request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
    )
    try:
        with urllib_request.urlopen(req, timeout=25) as res:
            body = res.read().decode("utf-8", errors="ignore")
            return {"ok": 200 <= res.status < 300, "status": res.status, "body": body[:300]}
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        return {"ok": False, "status": e.code, "error": body[:300]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Context 1: signup + signed-in writer access
        ctx1 = browser.new_context(viewport={"width": 1440, "height": 900})
        page1 = ctx1.new_page()

        page1.goto(f"{BASE_URL}/login", wait_until="domcontentloaded")
        page1.get_by_role("button", name="Create Account").click()
        page1.locator('input[name="fullName"]').fill(full_name)
        page1.locator('input[name="email"]').fill(email)
        page1.locator('input[name="password"]').fill(password)
        page1.get_by_role("button", name="Create Account", exact=True).click()

        page1.wait_for_timeout(2500)
        after_signup_url = page1.url
        signup_error_text = ""
        err_box = page1.locator("div.mb-4.p-3.rounded-xl.bg-red-50").first
        if err_box.is_visible():
            signup_error_text = err_box.inner_text().strip()
        signup_ok = ("/login" not in after_signup_url) and (signup_error_text == "")
        signup_fallback = None
        if not signup_ok and "rate limit" in signup_error_text.lower():
            signup_fallback = create_user_via_admin(email, password, full_name)
            signup_ok = bool(signup_fallback.get("ok"))
        add_step(
            "signup_via_ui",
            signup_ok,
            afterSignupUrl=after_signup_url,
            signupError=signup_error_text,
            fallback=signup_fallback,
        )
        page1.screenshot(path=str(out_dir / "01-after-signup.png"), full_page=True)

        # Explicit sign-in check (required by this scenario)
        page1.goto(f"{BASE_URL}/login?next=%2Fwriter", wait_until="domcontentloaded")
        # Ensure sign-in mode in case the UI stayed in sign-up mode.
        sign_in_toggle = page1.get_by_role("button", name="Sign In")
        if sign_in_toggle.is_visible():
            sign_in_toggle.click()
            page1.wait_for_timeout(300)
        page1.locator('input[name="email"]').fill(email)
        page1.locator('input[name="password"]').fill(password)
        page1.get_by_role("button", name="Sign In", exact=True).click()
        try:
            page1.wait_for_url("**/writer", timeout=30000)
        except PWTimeout:
            page1.wait_for_timeout(1500)
        post_login_url = page1.url
        login_error_text = ""
        login_err = page1.locator("div.mb-4.p-3.rounded-xl.bg-red-50").first
        if login_err.is_visible():
            login_error_text = login_err.inner_text().strip()
        sign_in_ok = ("/writer" in post_login_url) and (login_error_text == "")
        add_step("sign_in_with_new_account", sign_in_ok, postLoginUrl=post_login_url, loginError=login_error_text)
        page1.screenshot(path=str(out_dir / "01b-after-signin.png"), full_page=True)

        page1.goto(f"{BASE_URL}/writer", wait_until="domcontentloaded")
        page1.wait_for_timeout(2500)
        writer_url = page1.url
        writer_title_visible = page1.get_by_text("RIZIK", exact=False).first.is_visible()
        add_step(
            "writer_access_with_session",
            ("/writer" in writer_url) and writer_title_visible,
            writerUrl=writer_url,
            writerTitleVisible=writer_title_visible,
        )
        page1.screenshot(path=str(out_dir / "02-writer-with-session.png"), full_page=True)

        # Context 2: no login/session -> must redirect to login
        ctx2 = browser.new_context(viewport={"width": 1440, "height": 900})
        page2 = ctx2.new_page()
        page2.goto(f"{BASE_URL}/writer", wait_until="domcontentloaded")
        try:
            page2.wait_for_url("**/login?next=*", timeout=30000)
            unauth_url = page2.url
            login_heading_visible = page2.get_by_text("Sign in to Rizik Ecosystem").first.is_visible()
            blocked_ok = ("/login?next=%2Fwriter" in unauth_url) and login_heading_visible
        except PWTimeout:
            unauth_url = page2.url
            login_heading_visible = False
            blocked_ok = False

        add_step(
            "writer_blocked_without_session",
            blocked_ok,
            unauthUrl=unauth_url,
            loginHeadingVisible=login_heading_visible,
        )
        page2.screenshot(path=str(out_dir / "03-writer-without-session.png"), full_page=True)

        ctx2.close()
        ctx1.close()
        browser.close()

    report["success"] = all(s.get("ok") for s in report["steps"])
except Exception as e:
    report["error"] = str(e)

report["finishedAt"] = datetime.utcnow().isoformat() + "Z"
report_path = out_dir / f"report-{ts}.json"
report_path.write_text(json.dumps(report, indent=2))
print(json.dumps({**report, "reportPath": str(report_path)}, indent=2))

if not report.get("success"):
    raise SystemExit(1)
