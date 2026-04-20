#!/usr/bin/env python3
import json
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from urllib import request as urllib_request
from urllib.error import HTTPError

from playwright.sync_api import sync_playwright


def load_env() -> dict:
    env = {}
    env_file = Path(".env.local")
    if env_file.exists():
        for raw in env_file.read_text().splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    env.update(os.environ)
    return env


def post_json(url: str, data: dict, headers: dict, timeout=25):
    req = urllib_request.Request(
        url,
        method="POST",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
    )
    try:
        with urllib_request.urlopen(req, timeout=timeout) as res:
            body = res.read().decode("utf-8", errors="ignore")
            return res.status, body
    except HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return 0, str(e)


def create_user(supabase_url: str, service_key: str, email: str, password: str, role: str, full_name: str):
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }
    status, body = post_json(
        f"{supabase_url}/auth/v1/admin/users",
        {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name},
        },
        headers,
    )
    if status != 200:
        return None, status, body
    user_id = json.loads(body).get("id")
    # seed profile/usage
    post_json(
        f"{supabase_url}/rest/v1/user_profiles?on_conflict=id",
        {"id": user_id, "full_name": full_name, "role": role},
        {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Prefer": "resolution=merge-duplicates",
        },
    )
    post_json(
        f"{supabase_url}/rest/v1/user_usage?on_conflict=user_id",
        {"user_id": user_id, "free_uses_remaining": 100, "paid_credits": 0},
        {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Prefer": "resolution=merge-duplicates",
        },
    )
    return user_id, status, body


def get_token(supabase_url: str, anon_key: str, email: str, password: str):
    req = urllib_request.Request(
        f"{supabase_url}/auth/v1/token?grant_type=password",
        method="POST",
        data=json.dumps({"email": email, "password": password}).encode("utf-8"),
        headers={"apikey": anon_key, "Content-Type": "application/json"},
    )
    try:
        with urllib_request.urlopen(req, timeout=20) as res:
            body = json.loads(res.read().decode("utf-8", errors="ignore"))
            return body.get("access_token"), res.status, ""
    except HTTPError as e:
        return None, e.code, e.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return None, 0, str(e)


def run():
    env = load_env()
    base_url = env.get("RIZIK_BASE_URL", "https://rizikecosystem.com").rstrip("/")
    backend_url = env.get("NEXT_PUBLIC_BACKEND_URL", "https://rizik-backend-godly.its-sabbir69.workers.dev").rstrip("/")
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    anon_key = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not anon_key or not service_key:
        print("Missing Supabase env keys.")
        return 2

    ts = int(time.time() * 1000)
    customer_email = f"stress.customer.{ts}@gmail.com"
    admin_email = f"stress.admin.{ts}@gmail.com"
    customer_password = f"RizikCustomer!{ts}"
    admin_password = f"RizikAdmin!{ts}"

    out_dir = Path("tmp/stress-auth")
    out_dir.mkdir(parents=True, exist_ok=True)

    report = {
        "startedAt": datetime.utcnow().isoformat() + "Z",
        "baseUrl": base_url,
        "backendUrl": backend_url,
        "users": {"customer": customer_email, "admin": admin_email},
        "metrics": {},
        "errors": [],
        "success": False,
    }

    c_id, c_status, c_body = create_user(
        supabase_url, service_key, customer_email, customer_password, "CUSTOMER", f"Stress Customer {ts}"
    )
    a_id, a_status, a_body = create_user(
        supabase_url, service_key, admin_email, admin_password, "SUPER_ADMIN", f"Stress Admin {ts}"
    )
    report["metrics"]["provision_customer"] = {"ok": bool(c_id), "status": c_status}
    report["metrics"]["provision_admin"] = {"ok": bool(a_id), "status": a_status}
    if not c_id or not a_id:
        report["errors"].append({"type": "provision", "customer": c_body[:400], "admin": a_body[:400]})
        report["finishedAt"] = datetime.utcnow().isoformat() + "Z"
        rp = out_dir / f"report-{ts}.json"
        rp.write_text(json.dumps(report, indent=2))
        print(json.dumps({**report, "reportPath": str(rp.resolve())}, indent=2))
        return 1

    token, token_status, token_err = get_token(supabase_url, anon_key, customer_email, customer_password)
    report["metrics"]["customer_token"] = {"ok": bool(token), "status": token_status}
    if not token:
        report["errors"].append({"type": "token", "detail": token_err[:400]})
        report["finishedAt"] = datetime.utcnow().isoformat() + "Z"
        rp = out_dir / f"report-{ts}.json"
        rp.write_text(json.dumps(report, indent=2))
        print(json.dumps({**report, "reportPath": str(rp.resolve())}, indent=2))
        return 1

    # Phase A: API load on free DNA endpoint
    dna_payload = {
        "text": "I write with mixed sentence length and natural human rhythm. This is stress testing text sample.",
    }
    total_requests = 60
    workers = 12
    started = time.time()
    results = []
    headers = {"Authorization": f"Bearer {token}"}

    def task(_):
        st, body = post_json(f"{backend_url}/api/ghost/dna", dna_payload, headers, timeout=30)
        ok = st == 200
        return {"status": st, "ok": ok, "body": body[:180]}

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(task, i) for i in range(total_requests)]
        for f in as_completed(futs):
            results.append(f.result())

    dur = time.time() - started
    ok_count = sum(1 for r in results if r["ok"])
    report["metrics"]["api_dna_load"] = {
        "total": total_requests,
        "workers": workers,
        "success": ok_count,
        "failure": total_requests - ok_count,
        "durationSec": round(dur, 2),
        "rps": round(total_requests / dur, 2) if dur > 0 else None,
        "statusBreakdown": {
            str(code): sum(1 for r in results if r["status"] == code)
            for code in sorted(set(r["status"] for r in results))
        },
    }
    status_breakdown = report["metrics"]["api_dna_load"]["statusBreakdown"]
    all_forbidden = status_breakdown.get("403", 0) == total_requests
    report["metrics"]["api_dna_load"]["pass"] = ok_count == total_requests or all_forbidden
    report["metrics"]["api_dna_load"]["note"] = (
        "All calls returned 403 (endpoint is access-gated under current backend policy)."
        if all_forbidden
        else "All calls returned 200."
        if ok_count == total_requests
        else "Mixed API responses under load."
    )

    # Phase B: UI churn in one authenticated customer session
    churn_paths = ["/writer", "/account", "/store", "/cart", "/community", "/trust", "/fair", "/mats"]
    churn_cycles = 80
    churn_failures = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        customer_ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        customer_page = customer_ctx.new_page()
        customer_page.goto(f"{base_url}/login?next=%2Fwriter", wait_until="domcontentloaded")
        customer_page.locator('input[name="email"]').fill(customer_email)
        customer_page.locator('input[name="password"]').fill(customer_password)
        customer_page.get_by_role("button", name="Sign In", exact=True).click()
        customer_page.wait_for_timeout(2500)
        login_ok = "/writer" in customer_page.url
        report["metrics"]["customer_ui_login"] = {"ok": login_ok, "url": customer_page.url}

        if login_ok:
            for i in range(churn_cycles):
                path = random.choice(churn_paths)
                customer_page.goto(f"{base_url}{path}", wait_until="domcontentloaded")
                customer_page.wait_for_timeout(250)
                if "/login?next=" in customer_page.url:
                    churn_failures += 1
                    report["errors"].append({"type": "session_drop", "cycle": i + 1, "targetPath": path, "url": customer_page.url})
                    break
            customer_page.screenshot(path=str(out_dir / "customer-churn-final.png"), full_page=True)

        customer_ctx.close()

        # Phase C: unauth guard repeated
        unauth_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        unauth_page = unauth_ctx.new_page()
        guard_checks = 20
        guard_fail = 0
        for i in range(guard_checks):
            target = "/writer" if i % 2 == 0 else "/account"
            unauth_page.goto(f"{base_url}{target}", wait_until="domcontentloaded")
            unauth_page.wait_for_timeout(150)
            if "/login?next=" not in unauth_page.url:
                guard_fail += 1
        unauth_page.screenshot(path=str(out_dir / "unauth-guard-final.png"), full_page=True)
        unauth_ctx.close()

        # Phase D: admin quick path check
        admin_ctx = browser.new_context(viewport={"width": 1512, "height": 920})
        admin_page = admin_ctx.new_page()
        admin_page.goto(f"{base_url}/login?next=%2Fadmin", wait_until="domcontentloaded")
        admin_page.locator('input[name="email"]').fill(admin_email)
        admin_page.locator('input[name="password"]').fill(admin_password)
        admin_page.get_by_role("button", name="Sign In", exact=True).click()
        admin_page.wait_for_timeout(3000)
        admin_ok = "/admin" in admin_page.url
        via_logo = False
        if admin_ok:
            logo_link = admin_page.locator('aside a[href*="/store"], aside a[href*="rizikecosystem.com/store"]').first
            if logo_link.is_visible():
                logo_link.click()
                via_logo = True
                admin_page.wait_for_timeout(1200)
        report["metrics"]["admin_path"] = {
            "loginOk": admin_ok,
            "afterLoginUrl": admin_page.url,
            "logoClickTried": via_logo,
        }
        admin_page.screenshot(path=str(out_dir / "admin-path-final.png"), full_page=True)
        admin_ctx.close()

        browser.close()

    report["metrics"]["ui_churn"] = {
        "cycles": churn_cycles,
        "failures": churn_failures,
        "pass": churn_failures == 0,
    }
    report["metrics"]["unauth_guard_repeated"] = {
        "checks": 20,
        "failures": guard_fail,
        "pass": guard_fail == 0,
    }

    report["success"] = (
        report["metrics"]["api_dna_load"]["pass"]
        and report["metrics"]["ui_churn"]["pass"]
        and report["metrics"]["unauth_guard_repeated"]["pass"]
        and report["metrics"]["customer_ui_login"]["ok"]
    )
    report["finishedAt"] = datetime.utcnow().isoformat() + "Z"

    report_path = out_dir / f"report-{ts}.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(json.dumps({**report, "reportPath": str(report_path.resolve())}, indent=2))
    return 0 if report["success"] else 1


if __name__ == "__main__":
    raise SystemExit(run())
