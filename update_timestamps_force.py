import requests
import datetime
import urllib.parse

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'

headers = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

print("🔄 FORCE Updating timestamps for ALL old videos...")

now = datetime.datetime.now(datetime.timezone.utc).isoformat()

# Update videos created before 2025
url = f"{SUPABASE_URL}/rest/v1/generated_videos?created_at=lt.2025-01-01"
payload = {
    "created_at": now
}

r = requests.patch(url, headers=headers, json=payload)
print(f"Status: {r.status_code}")
if r.status_code in [200, 204]:
    print("✅ Successfully bumped old videos to NOW!")
else:
    print(f"❌ Failed: {r.text}")
