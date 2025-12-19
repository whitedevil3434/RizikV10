import os
import requests
import json
import time

REPO = "whitedevil3434/RizikV10"
TOKEN = os.environ.get("GITHUB_ACCESS_TOKEN")
HEAD_BRANCH = "god-mode-deploy-13338859358681146051"
BASE_BRANCH = "main"

HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def create_pr():
    url = f"https://api.github.com/repos/{REPO}/pulls"
    data = {
        "title": "chore: Final God Mode Submission Merge",
        "body": "Automated PR for final submission merge.",
        "head": HEAD_BRANCH,
        "base": BASE_BRANCH
    }

    print(f"Creating PR for {HEAD_BRANCH} -> {BASE_BRANCH}...")
    resp = requests.post(url, headers=HEADERS, json=data)

    if resp.status_code == 201:
        pr = resp.json()
        print(f"✅ PR Created: {pr['html_url']} (Number: {pr['number']})")
        return pr['number']
    elif resp.status_code == 422: # Likely PR already exists
        print("⚠️ PR might already exist. Fetching existing PRs...")
        resp = requests.get(url, headers=HEADERS, params={"head": f"whitedevil3434:{HEAD_BRANCH}", "base": BASE_BRANCH})
        if resp.status_code == 200 and len(resp.json()) > 0:
            pr = resp.json()[0]
            print(f"✅ Found Existing PR: {pr['html_url']} (Number: {pr['number']})")
            return pr['number']
        else:
            print(f"❌ Failed to find existing PR: {resp.text}")
            return None
    else:
        print(f"❌ Failed to create PR: {resp.status_code} {resp.text}")
        return None

def mark_ready_and_wait(pr_number):
    url = f"https://api.github.com/repos/{REPO}/pulls/{pr_number}"
    patch_url = url

    for i in range(5):
        print(f"🔄 Check #{i+1}: verifying PR status...")
        resp = requests.get(url, headers=HEADERS)

        if resp.status_code == 200:
            pr = resp.json()
            if pr.get('draft'):
                print(f"   📝 PR is draft. Sending PATCH...")
                requests.patch(patch_url, headers=HEADERS, json={"draft": False})
            else:
                print(f"   ✅ PR is READY.")
                return True
        else:
            print(f"   ❌ Error fetching PR: {resp.status_code}")

        time.sleep(5)

    return False

def merge_pr(pr_number):
    url = f"https://api.github.com/repos/{REPO}/pulls/{pr_number}/merge"
    data = {
        "commit_title": "Merge Final God Mode Submission",
        "merge_method": "merge"
    }

    print(f"Merging PR #{pr_number}...")
    resp = requests.put(url, headers=HEADERS, json=data)

    if resp.status_code == 200:
        print(f"✅ PR #{pr_number} Merged Successfully!")
        return True
    else:
        print(f"❌ Failed to merge PR: {resp.status_code} {resp.text}")
        return False

if __name__ == "__main__":
    if not TOKEN:
        print("❌ GITHUB_ACCESS_TOKEN is missing!")
        exit(1)

    pr_number = create_pr()
    if pr_number:
        if mark_ready_and_wait(pr_number):
            success = merge_pr(pr_number)
            if not success:
                exit(1)
        else:
            print("❌ Timeout waiting for PR to be ready.")
            exit(1)
    else:
        exit(1)
