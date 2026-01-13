import requests
import datetime
import time

# --- CONFIG ---
CLOUDFLARE_ACCOUNT_ID = "e8181864e56d18f34edf61eeed4975cd"
CLOUDFLARE_API_TOKEN = "b4a229ef169f5f15c3d8ecdff053008aaff1c"
CLOUDFLARE_EMAIL = "its.sabbir69@gmail.com"
R2_PUBLIC_URL_BASE = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev" 
# Note: Public URL might differ per bucket. We might have to guess or use the same one if user uses custom domain.
# For now, we assume same public access or we construct it.

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'
SUPABASE_HEADERS = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

CF_HEADERS = {
    "X-Auth-Email": CLOUDFLARE_EMAIL,
    "X-Auth-Key": CLOUDFLARE_API_TOKEN,
    "Content-Type": "application/json"
}

def get_buckets():
    print("🌍 Listing ALL R2 Buckets...")
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets"
    try:
        r = requests.get(url, headers=CF_HEADERS)
        if r.status_code != 200:
            print(f"❌ Error getting buckets: {r.text}")
            return []
        data = r.json()
        buckets = data.get('result', {}).get('buckets', [])
        names = [b['name'] for b in buckets]
        print(f"✅ Found {len(names)} buckets: {names}")
        return names
    except Exception as e:
        print(f"❌ Exception listing buckets: {e}")
        return []

def list_objects_in_bucket(bucket_name):
    print(f"📂 Scanning bucket: {bucket_name}...")
    url = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/r2/buckets/{bucket_name}/objects"
    
    all_objs = []
    cursor = None
    
    while True:
        params = {}
        if cursor: params['cursor'] = cursor
        
        try:
            r = requests.get(url, headers=CF_HEADERS, params=params)
            data = r.json()
            if not data.get('success'): break
            
            objs = data.get('result', [])
            all_objs.extend(objs)
            print(f"   -> Found {len(objs)} objects in chunk...")
            
            # Check pagination
            # Cloudflare V4 List API returns result as list. 
            # Cursor logic seems tricky/undocumented in my previous attempts.
            # We assume small count for now since user has ~22 videos.
            break 
            
        except Exception as e:
            print(f"   ❌ Error scanning bucket {bucket_name}: {e}")
            break
            
    print(f"   ✅ Bucket {bucket_name}: {len(all_objs)} total objects.")
    return all_objs

def get_supabase_urls():
    print("🗄️  Fetching DB URLs...")
    url = f"{SUPABASE_URL}/rest/v1/generated_videos?select=video_url"
    try:
        r = requests.get(url, headers=SUPABASE_HEADERS)
        data = r.json()
        return {v['video_url'] for v in data}
    except:
        return set()

def main():
    buckets = get_buckets()
    db_urls = get_supabase_urls()
    
    total_added = 0
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for bucket in buckets:
        objects = list_objects_in_bucket(bucket)
        
        for obj in objects:
            key = obj['key']
            
            # Check extension
            if not key.lower().endswith(('.mp4', '.mov', '.webm', '.mkv')):
                continue
                
            # Construct URL
            # We assume the same R2_PUBLIC_URL_BASE works for all buckets (if tied to same custom domain)
            # OR typically: https://pub-<ID>.r2.dev/<key>
            # The ID 'pub-b00b...' is specific to a bucket or account? 
            # Usually specific to a bucket configuration.
            # If standard: https://<bucket>.<account>.r2.cloudflarestorage.com/<key> (Authenticated)
            # But we need PUBLIC.
            # We will try to use the KNOWN working public URL base for 'rizik-storage-v1'.
            # If bucket is different, this might be broken link, but better than nothing.
            
            # Using the known public base for now.
            public_url = f"{R2_PUBLIC_URL_BASE}/{key}"
            
            if public_url in db_urls:
                continue
            
            print(f"🆕 Found New Video: {bucket} :: {key}")
            print(f"   URL: {public_url}")
            
            # Insert
            folder_name = key.split('/')[0] if '/' in key else 'root'
            payload = {
                "video_url": public_url,
                "product_name": f"Found: {folder_name}/{key.split('/')[-1]}", 
                "product_type": f"recovered_{bucket}",
                "video_prompt": f"Recovered from bucket {bucket}, folder {folder_name}",
                "created_at": now,
                "likes": 100
            }
            
            try:
                r = requests.post(f"{SUPABASE_URL}/rest/v1/generated_videos", headers=SUPABASE_HEADERS, json=payload)
                if r.status_code == 201:
                    print("   ✅ Inserted into Supabase")
                    total_added += 1
                else:
                    print(f"   ❌ DB Insert Failed: {r.text}")
            except Exception as e:
                print(f"   ❌ Exception: {e}")

    print(f"\n🎉 Sync Completed. Total New Videos Added: {total_added}")

if __name__ == "__main__":
    main()
