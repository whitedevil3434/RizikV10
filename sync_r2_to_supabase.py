import requests
import json
import os
import time

# ============================================================================
# CONFIG
# ============================================================================
CLOUDFLARE_ACCOUNT_ID = "e8181864e56d18f34edf61eeed4975cd"
CLOUDFLARE_API_TOKEN = "b4a229ef169f5f15c3d8ecdff053008aaff1c"
CLOUDFLARE_EMAIL = "its.sabbir69@gmail.com"
BUCKET_NAME = "rizik-storage-v1"
R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'

# ============================================================================
# MAIN
# ============================================================================
def main():
    print(f"🚀 Starting Sync: R2 ({BUCKET_NAME}) -> Supabase")
    
    # 1. Fetch all objects from R2
    print("📋 Listing R2 objects...")
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets/{BUCKET_NAME}/objects"
    headers = {
        "X-Auth-Email": CLOUDFLARE_EMAIL,
        "X-Auth-Key": CLOUDFLARE_API_TOKEN,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code != 200:
            print(f"❌ Failed to list R2 objects: {response.text}")
            return
            
        data = response.json()
        if not data.get("success"):
            print(f"❌ API Error: {data.get('errors')}")
            return
            
        objects = data.get("result", [])
        print(f"✅ Found {len(objects)} objects in bucket.")
        
        # Filter .mp4 files
        videos = [obj for obj in objects if obj["key"].endswith(".mp4")]
        print(f"🎥 Found {len(videos)} video files.")
        
    except Exception as e:
        print(f"❌ Exception listing R2: {e}")
        return

    # 2. Check existing videos in Supabase
    print("🗄️ Checking Supabase...")
    sb_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    existing_urls = set()
    try:
        # Fetch all video URLs (pagination might be needed if > 1000, but fine for now)
        r = requests.get(f"{SUPABASE_URL}/rest/v1/generated_videos?select=video_url", headers=sb_headers)
        if r.status_code == 200:
            existing = r.json()
            existing_urls = {v["video_url"] for v in existing}
            print(f"✅ Found {len(existing_urls)} existing videos in Supabase.")
        else:
            print(f"⚠️ Failed to fetch Supabase videos: {r.text}")
            
    except Exception as e:
        print(f"❌ Exception checking Supabase: {e}")

    # 3. Sync missing videos
    print("🔄 Syncing...")
    added_count = 0
    
    for vid in videos:
        key = vid["key"]
        public_url = f"{R2_PUBLIC_URL}/{key}"
        
        if public_url in existing_urls:
            continue
            
        # Determine metadata from filename or generic
        # Filename format: qwen-v6/TIMESTAMP.mp4 or similar
        created_at = vid.get("uploaded", "2024-01-01T00:00:00Z")
        
        # Heuristic for product type based on folder
        folder = key.split('/')[0] if '/' in key else 'misc'
        
        payload = {
            "video_url": public_url,
            "product_name": f"Recovered Video ({folder})",
            "product_type": "recovered",
            "video_prompt": "Recovered from R2 storage",
            "image_edit_prompt": "Recovered from R2 storage",
            "created_at": created_at
        }
        
        try:
            r = requests.post(f"{SUPABASE_URL}/rest/v1/generated_videos", headers=sb_headers, json=payload)
            if r.status_code == 201:
                print(f"✅ Added: {key}")
                added_count += 1
            else:
                print(f"❌ Failed to add {key}: {r.text}")
        except Exception as e:
            print(f"❌ Error adding {key}: {e}")
            
    print(f"🎉 Sync Complete! Added {added_count} new videos.")

if __name__ == "__main__":
    main()
