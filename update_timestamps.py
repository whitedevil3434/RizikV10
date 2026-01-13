import requests
import datetime

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'

headers = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

print("🔄 Updating timestamps for recovered videos...")

# Update all videos where product_name starts with "Recovered"
# Setting created_at to now
now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# Filter by product_name like 'Recovered%'
url = f"{SUPABASE_URL}/rest/v1/generated_videos?product_name=like.Recovered*"
payload = {
    "created_at": now
}

r = requests.patch(url, headers=headers, json=payload)

if r.status_code in [200, 204]:
    print("✅ Successfully updated timestamps!")
else:
    print(f"❌ Failed: {r.status_code} - {r.text}")
