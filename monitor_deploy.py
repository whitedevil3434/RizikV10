import os
import requests
import time
import sys

REPO = "whitedevil3434/RizikV10"
TOKEN = os.environ.get("GITHUB_ACCESS_TOKEN")
BRANCH = "main"

HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def get_latest_run():
    url = f"https://api.github.com/repos/{REPO}/actions/runs"
    params = {"branch": BRANCH, "event": "push", "per_page": 1}
    resp = requests.get(url, headers=HEADERS, params=params)

    if resp.status_code == 200:
        runs = resp.json()["workflow_runs"]
        if runs:
            return runs[0]
    return None

def monitor_run(run_id):
    print(f"👀 Monitoring Run ID: {run_id}")
    print(f"🔗 View Live: https://github.com/{REPO}/actions/runs/{run_id}")

    while True:
        url = f"https://api.github.com/repos/{REPO}/actions/runs/{run_id}"
        resp = requests.get(url, headers=HEADERS)

        if resp.status_code == 200:
            run_data = resp.json()
            status = run_data["status"]
            conclusion = run_data["conclusion"]

            print(f"   Status: {status} | Conclusion: {conclusion}")

            if status == "completed":
                return conclusion

        time.sleep(10)

if __name__ == "__main__":
    print("⏳ Waiting for workflow run to start...")
    # Wait a moment for GitHub to trigger the action
    time.sleep(15)

    latest_run = get_latest_run()

    if not latest_run:
        print("❌ No workflow run found.")
        exit(1)

    print(f"🚀 Found Run: {latest_run['name']} (#{latest_run['run_number']})")

    final_status = monitor_run(latest_run["id"])

    if final_status == "success":
        print("\n🎉 Deployment Successful!")
        print("🌍 Live URL: https://rizik-web.pages.dev")
    else:
        print(f"\n❌ Deployment Failed with status: {final_status}")
        print(f"🔗 Check logs: {latest_run['html_url']}")
