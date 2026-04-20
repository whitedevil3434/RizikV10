#!/usr/bin/env python3
"""
Rizik SaaS auth persistence smoke test.

What it verifies:
1) Customer login -> /writer -> /account keeps session.
2) Admin login -> /admin -> click top logo -> /store -> /account keeps session.
3) Fresh unauthenticated context is blocked from /writer and /account.

Requirements:
- Python playwright package + browser binaries installed.
- .env.local (or env vars) containing:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  RIZIK_BASE_URL (optional, default https://rizikecosystem.com)
"""

import json
import os
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Tuple
from urllib import request as urllib_request
from urllib.error import HTTPError

from playwright.sync_api import TimeoutError as PWTimeout
from playwright.sync_api import sync_playwright


def load_env_file(file_path: Path) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not file_path.exists():
        return env
    for raw in file_path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def get_env() -> Dict[str, str]:
    cwd_env = load_env_file(Path(".env.local"))
    parent_env = load_env_file(Path(__file__).resolve().parents[1] / ".env.local")
    merged = {**parent_env, **cwd_env, **os.environ}
    return merged


def json_request(
    method: str,
    url: str,
    headers: Dict[str, str],
    payload: Dict,
    timeout: int = 30,
) -> Tuple[int, str]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib_request.urlopen(req, timeout=timeout) as res:
            return res.status, res.read().decode("utf-8", errors="ignore")
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        return e.code, body


def create_auth_user(supabase_url: str, service_key: str, email: str, password: str, full_name: str) -> Dict:
    status, body = json_request(
        "POST",
        f"{supabase_url}/auth/v1/admin/users",
        {
            "Content-Type": "application/json",
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
        {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name},
        },
    )
    parsed = {}
    try:
        parsed = json.loads(body)
    except Exception:
        parsed = {"raw": body[:400]}
    return {"status": status, "body": parsed}


def upsert_profile_and_usage(
    supabase_url: str,
    service_key: str,
    user_id: str,
    full_name: str,
    role: str,
) -> None:
    headers = {
        "Content-Type": "application/json",
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Prefer": "resolution=merge-duplicates",
    }
    json_request(
        "POST",
        f"{supabase_url}/rest/v1/user_profiles?on_conflict=id",
        headers,
        {"id": user_id, "full_name": full_name, "role": role},
    )
    json_request(
        "POST",
        f"{supabase_url}/rest/v1/user_usage?on_conflict=user_id",
        headers,
        {"user_id": user_id, "free_uses_remaining": 3, "paid_credits": 0},
    )


def safe_name(prefix: str, ts: int) -> str:
    return f"{prefix} {ts}"


def wait_for_any_url(page, patterns, timeout_ms=30000, initial_url: str = "", require_change: bool = False) -> str:
    start = time.time()
    while (time.time() - start) * 1000 < timeout_ms:
        u = page.url
        if any(re.search(p, u) for p in patterns):
            if not require_change or (initial_url and u != initial_url):
                return u
            if not initial_url:
                return u
        page.wait_for_timeout(200)
    return page.url


def run() -> int:
    env = get_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    base_url = env.get("RIZIK_BASE_URL", "https://rizikecosystem.com").strip().rstrip("/")

    if not supabase_url or not service_key:
        print("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return 2

    out_dir = Path("tmp/smoke-auth")
    out_dir.mkdir(parents=True, exist_ok=True)

    ts = int(time.time() * 1000)
    customer_email = env.get("SMOKE_CUSTOMER_EMAIL", f"smoke.customer.{ts}@gmail.com")
    admin_email = env.get("SMOKE_ADMIN_EMAIL", f"smoke.admin.{ts}@gmail.com")
    customer_password = env.get("SMOKE_CUSTOMER_PASSWORD", f"RizikCustomer!{ts}")
    admin_password = env.get("SMOKE_ADMIN_PASSWORD", f"RizikAdmin!{ts}")
    use_existing_users = all(
        [
            env.get("SMOKE_CUSTOMER_EMAIL"),
            env.get("SMOKE_CUSTOMER_PASSWORD"),
            env.get("SMOKE_ADMIN_EMAIL"),
            env.get("SMOKE_ADMIN_PASSWORD"),
        ]
    )

    report = {
        "startedAt": datetime.utcnow().isoformat() + "Z",
        "baseUrl": base_url,
        "users": {
            "customer": customer_email,
            "admin": admin_email,
        },
        "steps": [],
        "success": False,
    }

    def step(name: str, ok: bool, **details) -> None:
        row = {"name": name, "ok": ok}
        row.update(details)
        report["steps"].append(row)

    if use_existing_users:
        step("provision_customer", True, mode="existing-env-user")
        step("provision_admin", True, mode="existing-env-user")
    else:
        c_create = create_auth_user(supabase_url, service_key, customer_email, customer_password, safe_name("Smoke Customer", ts))
        a_create = create_auth_user(supabase_url, service_key, admin_email, admin_password, safe_name("Smoke Admin", ts))

        c_id = c_create.get("body", {}).get("id")
        a_id = a_create.get("body", {}).get("id")
        step("provision_customer", c_create.get("status") == 200 and bool(c_id), status=c_create.get("status"))
        step("provision_admin", a_create.get("status") == 200 and bool(a_id), status=a_create.get("status"))
        if not c_id or not a_id:
            report["finishedAt"] = datetime.utcnow().isoformat() + "Z"
            report_path = out_dir / f"report-{ts}.json"
            report_path.write_text(json.dumps(report, indent=2))
            print(json.dumps({**report, "reportPath": str(report_path.resolve())}, indent=2))
            return 1

        upsert_profile_and_usage(supabase_url, service_key, c_id, safe_name("Smoke Customer", ts), "CUSTOMER")
        upsert_profile_and_usage(supabase_url, service_key, a_id, safe_name("Smoke Admin", ts), "SUPER_ADMIN")
        step("seed_profiles_usage", True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Customer journey
        c_ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        c_page = c_ctx.new_page()
        c_page.goto(f"{base_url}/login?next=%2Fwriter", wait_until="domcontentloaded")
        c_page.locator('input[name="email"]').fill(customer_email)
        c_page.locator('input[name="password"]').fill(customer_password)
        c_page.get_by_role("button", name="Sign In", exact=True).click()
        c_page.wait_for_timeout(2500)
        c_error = ""
        c_err_el = c_page.locator("div.mb-4.p-3.rounded-xl.bg-red-50").first
        if c_err_el.is_visible():
            c_error = c_err_el.inner_text().strip()
        step("customer_login_to_writer", "/writer" in c_page.url, url=c_page.url, error=c_error)
        c_page.screenshot(path=str(out_dir / "customer-01-writer.png"), full_page=True)

        c_page.goto(f"{base_url}/account", wait_until="domcontentloaded")
        c_page.wait_for_timeout(1500)
        step("customer_writer_to_account_persist", "/account" in c_page.url and "/login" not in c_page.url, url=c_page.url)
        c_page.screenshot(path=str(out_dir / "customer-02-account.png"), full_page=True)
        c_ctx.close()

        # Admin journey
        a_ctx = browser.new_context(viewport={"width": 1512, "height": 950})
        a_page = a_ctx.new_page()
        a_page.goto(f"{base_url}/login?next=%2Fadmin", wait_until="domcontentloaded")
        a_page.locator('input[name="email"]').fill(admin_email)
        a_page.locator('input[name="password"]').fill(admin_password)
        admin_start_url = a_page.url
        a_page.get_by_role("button", name="Sign In", exact=True).click()
        admin_url = wait_for_any_url(
            a_page,
            [r"/admin($|/)", r"/login\?next="],
            35000,
            initial_url=admin_start_url,
            require_change=True,
        )
        admin_ok = "/admin" in admin_url
        a_error = ""
        a_err_el = a_page.locator("div.mb-4.p-3.rounded-xl.bg-red-50").first
        if a_err_el.is_visible():
            a_error = a_err_el.inner_text().strip()
        step("admin_login", admin_ok, url=admin_url, error=a_error)
        a_page.screenshot(path=str(out_dir / "admin-01-dashboard.png"), full_page=True)

        logo_link = a_page.locator('aside a[href*="/store"], aside a[href*="rizikecosystem.com/store"]').first
        logo_clicked = False
        if logo_link.is_visible():
            logo_link.click()
            logo_clicked = True
        else:
            a_page.goto(f"{base_url}/store", wait_until="domcontentloaded")

        a_page.wait_for_timeout(1800)
        step("admin_logo_to_store", "/store" in a_page.url, url=a_page.url, viaLogo=logo_clicked)
        a_page.screenshot(path=str(out_dir / "admin-02-store.png"), full_page=True)

        a_page.goto(f"{base_url}/account", wait_until="domcontentloaded")
        a_page.wait_for_timeout(1200)
        step("admin_store_to_account_persist", "/account" in a_page.url and "/login" not in a_page.url, url=a_page.url)
        a_page.screenshot(path=str(out_dir / "admin-03-account.png"), full_page=True)
        a_ctx.close()

        # Unauthenticated guard
        u_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        u_page = u_ctx.new_page()
        u_page.goto(f"{base_url}/writer", wait_until="domcontentloaded")
        u_page.wait_for_timeout(800)
        step("unauth_writer_blocked", "/login?next=" in u_page.url and "%2Fwriter" in u_page.url, url=u_page.url)

        u_page.goto(f"{base_url}/account", wait_until="domcontentloaded")
        u_page.wait_for_timeout(800)
        step(
            "unauth_account_blocked",
            "/login?next=" in u_page.url and ("/account" in u_page.url or "%2Faccount" in u_page.url),
            url=u_page.url,
        )
        u_page.screenshot(path=str(out_dir / "unauth-blocks.png"), full_page=True)
        u_ctx.close()

        browser.close()

    report["success"] = all(bool(s.get("ok")) for s in report["steps"])
    report["finishedAt"] = datetime.utcnow().isoformat() + "Z"
    report_path = out_dir / f"report-{ts}.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(json.dumps({**report, "reportPath": str(report_path.resolve())}, indent=2))
    return 0 if report["success"] else 1


if __name__ == "__main__":
    raise SystemExit(run())
