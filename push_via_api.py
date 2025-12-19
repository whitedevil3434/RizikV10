import os
import requests
import base64
import json

REPO = "whitedevil3434/RizikV10"
TOKEN = os.environ.get("GITHUB_ACCESS_TOKEN")
BRANCH = "main"

HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def get_file_sha(path):
    url = f"https://api.github.com/repos/{REPO}/contents/{path}?ref={BRANCH}"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        return resp.json()["sha"]
    return None

def upload_file(local_path, remote_path):
    print(f"🚀 Uploading {local_path} to {remote_path}...")

    with open(local_path, "rb") as f:
        content = f.read()

    encoded_content = base64.b64encode(content).decode("utf-8")

    sha = get_file_sha(remote_path)

    url = f"https://api.github.com/repos/{REPO}/contents/{remote_path}"
    data = {
        "message": f"chore: Update {remote_path} via API (God Mode)",
        "content": encoded_content,
        "branch": BRANCH
    }

    if sha:
        data["sha"] = sha
        print(f"   ℹ️  File exists (SHA: {sha}), updating...")
    else:
        print("   ℹ️  File does not exist, creating...")

    resp = requests.put(url, headers=HEADERS, json=data)

    if resp.status_code in [200, 201]:
        print(f"✅ Successfully uploaded {remote_path}")
    else:
        print(f"❌ Failed to upload {remote_path}: {resp.status_code} {resp.text}")

if __name__ == "__main__":
    if not TOKEN:
        print("❌ GITHUB_ACCESS_TOKEN is missing!")
        exit(1)

    files_to_push = [
        (".github/workflows/deploy_web.yml", ".github/workflows/deploy_web.yml"),
        (".gitignore", ".gitignore")
    ]

    for local, remote in files_to_push:
        if os.path.exists(local):
            upload_file(local, remote)
        else:
            print(f"⚠️ Local file {local} not found, skipping.")
