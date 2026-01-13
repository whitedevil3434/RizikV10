import requests
import json
import os
import datetime

# --- CONFIG ---
CLOUDFLARE_ACCOUNT_ID = "e8181864e56d18f34edf61eeed4975cd"
CLOUDFLARE_API_TOKEN = "b4a229ef169f5f15c3d8ecdff053008aaff1c"
CLOUDFLARE_EMAIL = "its.sabbir69@gmail.com"
BUCKET_NAME = "rizik-storage-v1"
R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'
SUPABASE_HEADERS = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

def list_r2_objects():
    print(f"📡 Listing objects in bucket: {BUCKET_NAME}...")
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets/{BUCKET_NAME}/objects"
    headers = {
        "X-Auth-Email": CLOUDFLARE_EMAIL,
        "X-Auth-Key": CLOUDFLARE_API_TOKEN,
        "Content-Type": "application/json"
    }
    
    all_objects = []
    cursor = None
    
    while True:
        params = {}
        if cursor:
            params['cursor'] = cursor
            
        try:
            r = requests.get(url, headers=headers, params=params)
            if r.status_code != 200:
                print(f"❌ Error listing R2: {r.text}")
                break
                
            data = r.json()
            if not data['success']:
                print(f"❌ API Error: {data['errors']}")
                break
                
            # Cloudflare R2 list API returns the list directly in 'result'
            objs = data.get('result', [])
            all_objects.extend(objs)
            print(f"   Found {len(objs)} items in this page.")
            
            # DEBUG: Print first 5 keys to see what we are getting
            for o in objs[:5]:
                print(f"   - Key: {o.get('key')} | Size: {o.get('size')}")
                
            # DEBUG: Print response keys to find cursor
            # print(f"   Response Keys: {list(data.keys())}")
            # if 'result_info' in data:
            #    print(f"   Result Info: {data['result_info']}")
            
            # Pagination Logic
            # R2 V4 typically uses 'cursor' in result_info? 
            # Or standard S3 usage.
            # Let's check 'result_info'
            
            res_info = data.get('result_info', {})
            cursor = res_info.get('cursor')
            
            if not cursor:
                print("   ✅ No more pages (no cursor).")
                break
            
            print(f"   🔄 Fetching next page (Cursor: {cursor[:10]}...)...")

                 
        except Exception as e:
            print(f"⚠️ Exception: {e}")
            break

    print(f"✅ Total R2 Objects: {len(all_objects)}")
    return all_objects

def get_supabase_videos():
    print("📡 Fetching existing videos from Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/generated_videos?select=video_url"
    r = requests.get(url, headers=SUPABASE_HEADERS)
    if r.status_code != 200:
        print(f"❌ Supabase Error: {r.text}")
        return []
    data = r.json()
    urls = [v['video_url'] for v in data]
    print(f"✅ Supabase video count: {len(urls)}")
    return urls

def main():
    r2_objs = list_r2_objects()
    db_urls = get_supabase_videos()
    
    # Normalize DB URLs for comparison (decode %20 etc if needed, but simple check first)
    db_urls_set = set(db_urls)
    
    missing_in_db = []
    
    print("\n🔎 Analyzing...")
    for obj in r2_objs:
        key = obj['key']
        # Construct public URL
        # Logic from rizik_qwen_v6.py: f"{R2_PUBLIC_URL}/{params['object_name']}" -> which is the Key
        public_url = f"{R2_PUBLIC_URL}/{key}"
        
        # Check if already in DB
        if public_url in db_urls_set:
            continue
            
        # If not in DB, it's a candidate
        # Filter for video files only?
        lower_key = key.lower()
        # Add .avif as user confirmed they are video/reels
        if lower_key.endswith(('.mp4', '.mov', '.webm', '.mkv', '.avif')):
            uploaded_date = obj.get('uploaded', datetime.datetime.now(datetime.timezone.utc).isoformat())
            missing_in_db.append({'key': key, 'url': public_url, 'size': obj.get('size', 0), 'uploaded': uploaded_date})

    print(f"\n🚨 FOUND {len(missing_in_db)} ORPHANED VIDEOS IN R2!")
    
    if missing_in_db:
        print("📝 Orphaned Files:")
        for v in missing_in_db:
            print(f"- [Size: {v['size']}] {v['key']} (Uploaded: {v['uploaded']})")
        
        # INSERT THEM?
        # User wants them. Let's insert them as 'Recovered Video 2 (Missing)'
        # To avoid confusion with previous recovery.
        
        do_insert = True # Auto insert for user task
        if do_insert:
            print("\n🔄 Auto-inserting missing videos to Supabase...")
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            for v in missing_in_db:
                payload = {
                    "video_url": v['url'],
                    "product_name": f"Unknown Video ({v['key']})",
                    "product_type": "recovered_v2",
                    "video_prompt": f"Recovered from R2 scan ({v['key']})",
                    "created_at": now  # Show at top!
                }

                
                # Insert
                url = f"{SUPABASE_URL}/rest/v1/generated_videos"
                r = requests.post(url, headers=SUPABASE_HEADERS, json=payload)
                if r.status_code == 201:
                     print(f"   ✅ Inserted: {v['key']}")
                else:
                     print(f"   ❌ Failed to insert {v['key']}: {r.text}")

if __name__ == "__main__":
    main()
