import os
import requests
import json
import time

REPO = "whitedevil3434/RizikV10"
TOKEN = os.environ.get("GITHUB_ACCESS_TOKEN")
HEAD_BRANCH = "god-mode-deploy"
BASE_BRANCH = "main"

HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def create_pr():
    url = f"https://api.github.com/repos/{REPO}/pulls"
    data = {
        "title": "feat: God Mode Production Deployment Pipeline",
        "body": "Automated PR for God Mode Deployment",
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

def merge_pr(pr_number):
    url = f"https://api.github.com/repos/{REPO}/pulls/{pr_number}/merge"
    data = {
        "commit_title": "Merge God Mode Deployment",
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
        success = merge_pr(pr_number)
        if not success:
            exit(1)
    else:
        exit(1)
