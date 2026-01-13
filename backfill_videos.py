import requests
import json
import time

SUPABASE_URL = 'https://dxekolvveoadbaftfsmy.supabase.co'
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg'

headers = {
    'apikey': KEY,
    'Authorization': f'Bearer {KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

# Old videos that are physically in R2 but missing from DB
old_videos = [
  {
    "video_url": "https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768173813.mp4",
    "product_name": "PRAN Bangladesh",
    "product_type": "beverage",
    "video_prompt": "Cinematic shot of mango juice bottle, fresh mangoes splashing water, sunny orchard background, slow motion",
    "image_edit_prompt": "PRAN Logo with fresh mangoes"
  },
  {
    "video_url": "https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768172687.mp4",
    "product_name": "Chillox Burger",
    "product_type": "food",
    "video_prompt": "Delicious gourmet burger rotating, steam rising, cheese melting, dark moody lighting, 4k food commercial",
    "image_edit_prompt": "Chillox branding, burger close up"
  },
  {
    "video_url": "https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768171454.mp4",
    "product_name": "Night Food Market",
    "product_type": "lifestyle",
    "video_prompt": "Bustling night market food stall, smoke rising from grill, neon lights, crowd moving in background",
    "image_edit_prompt": "Night market atmosphere"
  },
  {
    "video_url": "https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768169688.mp4",
    "product_name": "Food Commercial",
    "product_type": "food",
    "video_prompt": "Sizzling steak on grill, flames licking up, salt sprinkling in slow motion, professional food videography",
    "image_edit_prompt": "Steak plating"
  },
  {
    "video_url": "https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan2gp/1768164188.mp4",
    "product_name": "Biryani Special",
    "product_type": "food",
    "video_prompt": "Traditional Biryani pot opening, steam revealing colorful rice and meat, star anise and spices flying",
    "image_edit_prompt": "Biryani pot top view"
  }
]

print(f"🚀 Starting backfill of {len(old_videos)} videos...")

for video in old_videos:
    payload = {
        "video_url": video["video_url"],
        "product_name": video["product_name"],
        "product_type": video["product_type"],
        "video_prompt": video["video_prompt"],
        "image_edit_prompt": video["image_edit_prompt"],
        # Created in the past to maintain order (mock timestamps)
        "created_at": "2024-01-01T12:00:00Z" 
    }
    
    # Check if already exists to avoid duplicates
    check_url = f"{SUPABASE_URL}/rest/v1/generated_videos?video_url=eq.{video['video_url']}"
    check = requests.get(check_url, headers=headers)
    
    if len(check.json()) == 0:
        r = requests.post(f"{SUPABASE_URL}/rest/v1/generated_videos", headers=headers, json=payload)
        if r.status_code == 201:
            print(f"✅ Added: {video['product_name']}")
        else:
            print(f"❌ Failed: {video['product_name']} - {r.text}")
    else:
        print(f"⚠️ Skipped (Already exists): {video['product_name']}")

print("🎉 Backfill complete!")
