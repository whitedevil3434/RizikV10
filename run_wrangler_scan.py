import subprocess
import json
import os
import requests
import datetime

# --- CONFIG ---
CLOUDFLARE_ACCOUNT_ID = "e8181864e56d18f34edf61eeed4975cd"
CLOUDFLARE_API_TOKEN = "b4a229ef169f5f15c3d8ecdff053008aaff1c"
BUCKET_NAME = "rizik-storage-v1"
R2_PUBLIC_URL_BASE = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'
SUPABASE_HEADERS = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def run_wrangler():
    print("🚀 Running Wrangler Object List...")
    env = os.environ.copy()
    env["CLOUDFLARE_API_TOKEN"] = CLOUDFLARE_API_TOKEN
    env["CLOUDFLARE_ACCOUNT_ID"] = CLOUDFLARE_ACCOUNT_ID
    
    # Try listing with recursive hint? No, just list.
    cmd = ["npx", "wrangler", "r2", "object", "list", BUCKET_NAME]
    
    try:
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Wrangler Command Failed!")
            print(f"Stderr: {result.stderr}")
            print(f"Stdout: {result.stdout}")
            return None
            
        print("✅ Wrangler Success!")
        # Wrangler output might be just JSON, or have some logs.
        # We try to find the JSON array in output.
        output = result.stdout
        try:
            # Finding first '['
            start = output.find('[')
            if start == -1:
                print("❌ No JSON array found in output")
                return None
            json_str = output[start:]
            return json.loads(json_str)
        except Exception as e:
            print(f"❌ JSON Parse Error: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Subprocess Error: {e}")
        return None

def get_supabase_urls():
    print("🗄️ Fetching existing DB URLs...")
    try:
        r = requests.get(f"{SUPABASE_URL}/rest/v1/generated_videos?select=video_url", headers=SUPABASE_HEADERS)
        return {v['video_url'] for v in r.json()}
    except:
        return set()

def main():
    objects = run_wrangler()
    if objects is None:
        print("⚠️ Scan aborted due to Wrangler failure.")
        return
        
    print(f"📦 Found {len(objects)} objects in bucket.")
    
    db_urls = get_supabase_urls()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    added = 0
    
    for obj in objects:
        key = obj['key']
        # Filter videos
        if not key.lower().endswith(('.mp4', '.mov', '.webm', '.mkv', '.avi')):
            continue
            
        public_url = f"{R2_PUBLIC_URL_BASE}/{key}"
        
        if public_url in db_urls:
            continue
            
        print(f"🆕 NEW FOUND: {key}")
        
        # Insert
        folder = key.split('/')[0] if '/' in key else 'root'
        payload = {
            "video_url": public_url,
            "product_name": f"Deep Scan: {key}",
            "product_type": f"recovered_{folder}",
            "video_prompt": "Recovered via Wrangler Deep Scan",
            "created_at": now,
            "likes": 50
        }
        
        try:
            r = requests.post(f"{SUPABASE_URL}/rest/v1/generated_videos", headers=SUPABASE_HEADERS, json=payload)
            if r.status_code == 201:
                print("   ✅ Inserted!")
                added += 1
            else:
                print(f"   ❌ Insert failed: {r.text}")
        except:
            pass

    print(f"\n🎉 Total New Videos Added: {added}")

if __name__ == "__main__":
    main()
