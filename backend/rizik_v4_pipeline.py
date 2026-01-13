"""
╔══════════════════════════════════════════════════════════════════════════════╗
║         RIZIK VIDEO PIPELINE v4 - "Best of Both Worlds"                     ║
║                                                                              ║
║  🧠 SiliconFlow = Brain (Vision + Image Gen)                                 ║
║  ⚡ Fal.ai = Media Factory (Video + Audio + BG Removal)                      ║
║  📱 Flutter = Stitcher (Local Image Merging)                                 ║
║                                                                              ║
║  Total Cost: ~৳1.15 per video!                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import requests
import base64
import json
import time
from io import BytesIO
from PIL import Image

# ============================================================================
# API CONFIGURATION
# ============================================================================

SILICONFLOW_API_KEY = "sk-avpyqvixenjmljtfibazyinfprceikgdjiwvnyucqchuwqdp"
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"

FAL_API_KEY = "7abe11c6-cb33-4379-b15f-051c26dfe66b:d5a74954580c7e91d1253045065aa622"
FAL_BASE_URL = "https://fal.run"

# ============================================================================
# SILICONFLOW: QWEN VISION (The Brain)
# ============================================================================

def qwen_analyze_product(image_bytes: bytes, product_hint: str = "") -> dict:
    """
    Step 1: Use Qwen 2.5-VL to analyze product image.
    Returns: product_name, context_prompt, audio_prompt
    Cost: ~৳0.05
    """
    print("🧠 [SiliconFlow] Qwen Vision analyzing...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = f"""You are an expert advertising creative director.

Look at this product image{f' (hint: {product_hint})' if product_hint else ''}.

Provide JSON with:
1. product_name: What is this product? (2-4 words)
2. context_prompt: A detailed prompt to generate a BACKGROUND SCENE for this product advertisement. 
   - The scene should NOT include the product itself
   - Focus on environment, lighting, mood (e.g., "wooden table with biryani plates, bokeh restaurant background, warm lighting")
3. audio_prompt: A music generation prompt matching the product vibe

Output ONLY valid JSON:
{{"product_name": "...", "context_prompt": "...", "audio_prompt": "..."}}"""

    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-72B-Instruct",  # 72B for best quality
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}},
            {"type": "text", "text": prompt}
        ]}],
        "max_tokens": 500,
        "temperature": 0.3
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        
        content = response.json()['choices'][0]['message']['content']
        
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            analysis = json.loads(json_match.group())
            print(f"✅ Product: {analysis['product_name']}")
            return analysis
    except Exception as e:
        print(f"❌ Qwen Error: {e}")
    
    return {
        "product_name": product_hint or "Product",
        "context_prompt": "professional studio setup with dramatic lighting",
        "audio_prompt": "upbeat modern advertising music"
    }


# ============================================================================
# SILICONFLOW: FLUX SCHNELL (Background Generator)
# ============================================================================

def flux_generate_background(context_prompt: str) -> bytes:
    """
    Step 2: Generate background image using Flux Schnell.
    Returns: Image bytes (background without product)
    Cost: ~৳0.05
    """
    print(f"🎨 [SiliconFlow] Flux generating background...")
    
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    # Add quality modifiers
    full_prompt = f"{context_prompt}, professional advertising photography, 8k, cinematic lighting, shallow depth of field"
    
    payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": full_prompt,
        "image_size": "768x1024"  # Portrait for video
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=payload, timeout=90)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                img_url = result['images'][0].get('url')
                if img_url:
                    img_bytes = requests.get(img_url, timeout=30).content
                    print("✅ Background generated!")
                    return img_bytes
    except Exception as e:
        print(f"❌ Flux Error: {e}")
    
    return None


# ============================================================================
# FAL.AI: BIREFNET (Background Removal)
# ============================================================================

def fal_remove_background(image_bytes: bytes) -> bytes:
    """
    Step 3: Remove background using BiRefNet.
    Returns: Transparent PNG bytes
    Cost: ~৳0.10
    """
    print("✂️ [Fal.ai] BiRefNet removing background...")
    
    # Upload image first
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    img_url = f"data:image/jpeg;base64,{img_base64}"
    
    headers = {
        "Authorization": f"Key {FAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "image_url": img_url,
        "model": "General Use (Light)",  # Fast model
        "operating_resolution": "1024x1024",
        "output_format": "png"
    }
    
    try:
        # Submit request
        response = requests.post(
            f"{FAL_BASE_URL}/fal-ai/birefnet",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'image' in result and 'url' in result['image']:
                img_bytes = requests.get(result['image']['url'], timeout=30).content
                print("✅ Background removed!")
                return img_bytes
        else:
            print(f"❌ BiRefNet Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ BiRefNet Error: {e}")
    
    return None


# ============================================================================
# FAL.AI: WAN 2.1 (Image to Video)
# ============================================================================

def fal_generate_video(image_bytes: bytes, motion_prompt: str = "") -> str:
    """
    Step 5: Generate video from merged image using Wan 2.1.
    Returns: Video URL
    Cost: ~৳0.80
    """
    print("🎬 [Fal.ai] Wan 2.1 generating video...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    img_url = f"data:image/jpeg;base64,{img_base64}"
    
    headers = {
        "Authorization": f"Key {FAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "image_url": img_url,
        "prompt": motion_prompt or "Cinematic product showcase with subtle motion, professional advertisement",
        "negative_prompt": "blurry, low quality, distorted, watermark",
        "num_frames": 81,
        "num_inference_steps": 20,
        "guidance_scale": 5.0
    }
    
    try:
        # Correct endpoint: fal-ai/wan-i2v
        response = requests.post(
            f"{FAL_BASE_URL}/fal-ai/wan-i2v",
            headers=headers,
            json=payload,
            timeout=180
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'video' in result and 'url' in result['video']:
                print(f"✅ Video generated!")
                return result['video']['url']
        else:
            print(f"❌ Wan Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Wan Error: {e}")
    
    return None


# ============================================================================
# FAL.AI: MUSICGEN (Audio Generation)
# ============================================================================

def fal_generate_music(audio_prompt: str, duration_sec: int = 5) -> str:
    """
    Step 6: Generate music using CassetteAI.
    Returns: Audio URL
    Cost: ~৳0.15
    """
    print("🎵 [Fal.ai] CassetteAI composing...")
    
    headers = {
        "Authorization": f"Key {FAL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "prompt": audio_prompt,
        "seconds": duration_sec
    }
    
    try:
        # Correct endpoint: cassetteai/music-generator
        response = requests.post(
            f"{FAL_BASE_URL}/cassetteai/music-generator",
            headers=headers,
            json=payload,
            timeout=90
        )
        
        if response.status_code == 200:
            result = response.json()
            # Check different response structures
            audio_url = None
            if 'audio_file' in result and 'url' in result['audio_file']:
                audio_url = result['audio_file']['url']
            elif 'audio' in result and 'url' in result['audio']:
                audio_url = result['audio']['url']
            elif 'url' in result:
                audio_url = result['url']
            
            if audio_url:
                print(f"✅ Music generated!")
                return audio_url
            else:
                print(f"⚠️ Response: {result}")
        else:
            print(f"❌ Music Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Music Error: {e}")
    
    return None


# ============================================================================
# LOCAL: IMAGE MERGER (Simulates Flutter Stitcher)
# ============================================================================

def merge_images(background_bytes: bytes, product_png_bytes: bytes) -> bytes:
    """
    Step 4: Merge background + product PNG locally.
    This simulates what Flutter will do with Stack + RepaintBoundary.
    Cost: ৳0.00 (Local)
    """
    print("🔀 [Local] Merging images...")
    
    try:
        # Open images
        background = Image.open(BytesIO(background_bytes)).convert("RGBA")
        product = Image.open(BytesIO(product_png_bytes)).convert("RGBA")
        
        # Resize product to fit nicely on background (center, 60% height)
        bg_w, bg_h = background.size
        
        # Calculate product size (maintain aspect ratio, 60% of background height)
        prod_w, prod_h = product.size
        target_height = int(bg_h * 0.6)
        aspect = prod_w / prod_h
        target_width = int(target_height * aspect)
        
        product_resized = product.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Center the product on background
        x = (bg_w - target_width) // 2
        y = (bg_h - target_height) // 2 + int(bg_h * 0.1)  # Slightly lower
        
        # Paste product on background
        background.paste(product_resized, (x, y), product_resized)
        
        # Convert to bytes
        buffer = BytesIO()
        background.convert("RGB").save(buffer, format="JPEG", quality=95)
        
        print("✅ Images merged!")
        return buffer.getvalue()
        
    except Exception as e:
        print(f"❌ Merge Error: {e}")
        return None


# ============================================================================
# FULL PIPELINE TEST
# ============================================================================

def test_full_pipeline(image_path: str = None, product_hint: str = ""):
    """Test the complete pipeline."""
    
    print("=" * 60)
    print("🚀 RIZIK VIDEO PIPELINE v4 - FULL TEST")
    print("=" * 60)
    
    total_start = time.time()
    costs = {}
    
    # Get test image
    if image_path:
        with open(image_path, "rb") as f:
            product_img = f.read()
    else:
        # Download sample
        print("\n📥 Downloading sample product image...")
        product_img = requests.get("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600").content
        product_hint = "Luxury Backpack"
    
    # ========================================
    # PHASE 1: SILICONFLOW (Brain)
    # ========================================
    print("\n🧠 PHASE 1: SiliconFlow (Brain)")
    print("-" * 40)
    
    # Step 1: Qwen Vision
    start = time.time()
    analysis = qwen_analyze_product(product_img, product_hint)
    costs['qwen'] = time.time() - start
    print(f"   Time: {costs['qwen']:.1f}s | Cost: ৳0.05")
    print(f"   Product: {analysis['product_name']}")
    print(f"   Context: {analysis['context_prompt'][:60]}...")
    
    # Step 2: Flux Background
    start = time.time()
    background_bytes = flux_generate_background(analysis['context_prompt'])
    costs['flux'] = time.time() - start
    print(f"   Time: {costs['flux']:.1f}s | Cost: ৳0.05")
    
    if background_bytes:
        with open("test_background.jpg", "wb") as f:
            f.write(background_bytes)
        print("   Saved: test_background.jpg")
    
    # ========================================
    # PHASE 2: FAL.AI (Media Factory)
    # ========================================
    print("\n⚡ PHASE 2: Fal.ai (Media Factory)")
    print("-" * 40)
    
    # Step 3: BiRefNet Background Removal
    start = time.time()
    product_png = fal_remove_background(product_img)
    costs['birefnet'] = time.time() - start
    print(f"   Time: {costs['birefnet']:.1f}s | Cost: ৳0.10")
    
    if product_png:
        with open("test_product_cutout.png", "wb") as f:
            f.write(product_png)
        print("   Saved: test_product_cutout.png")
    
    # ========================================
    # PHASE 3: LOCAL (Stitcher)
    # ========================================
    print("\n📱 PHASE 3: Local (Stitcher)")
    print("-" * 40)
    
    if background_bytes and product_png:
        start = time.time()
        merged_img = merge_images(background_bytes, product_png)
        costs['merge'] = time.time() - start
        print(f"   Time: {costs['merge']:.1f}s | Cost: ৳0.00")
        
        if merged_img:
            with open("test_merged.jpg", "wb") as f:
                f.write(merged_img)
            print("   Saved: test_merged.jpg")
    else:
        merged_img = product_img
        costs['merge'] = 0
    
    # ========================================
    # PHASE 4: FAL.AI (Video + Audio)
    # ========================================
    print("\n🎬 PHASE 4: Fal.ai (Video + Audio)")
    print("-" * 40)
    
    # Step 5: Wan 2.1 Video
    start = time.time()
    video_url = fal_generate_video(
        merged_img,
        f"Cinematic slow pan around {analysis['product_name']}, professional advertisement, soft motion"
    )
    costs['wan'] = time.time() - start
    print(f"   Time: {costs['wan']:.1f}s | Cost: ৳0.80")
    if video_url:
        print(f"   Video: {video_url}")
    
    # Step 6: MusicGen Audio
    start = time.time()
    audio_url = fal_generate_music(analysis['audio_prompt'], 5)
    costs['music'] = time.time() - start
    print(f"   Time: {costs['music']:.1f}s | Cost: ৳0.15")
    if audio_url:
        print(f"   Audio: {audio_url}")
    
    # ========================================
    # FINAL SUMMARY
    # ========================================
    total_time = time.time() - total_start
    total_cost = 0.05 + 0.05 + 0.10 + 0.80 + 0.15
    
    print("\n" + "=" * 60)
    print("🎉 PIPELINE COMPLETE!")
    print("=" * 60)
    print(f"\n⏱️ Total Time: {total_time:.1f}s")
    print(f"💰 Total Cost: ৳{total_cost:.2f}")
    print(f"\n📊 Breakdown:")
    for step, t in costs.items():
        print(f"   {step}: {t:.1f}s")
    
    print(f"\n📹 Video URL: {video_url}")
    print(f"🎵 Audio URL: {audio_url}")
    
    return {
        "video_url": video_url,
        "audio_url": audio_url,
        "analysis": analysis,
        "total_time": total_time,
        "total_cost": total_cost
    }


# ============================================================================
# INDIVIDUAL API TESTS
# ============================================================================

def test_qwen():
    """Test Qwen Vision only."""
    print("🧪 Testing Qwen Vision...")
    img = requests.get("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400").content
    result = qwen_analyze_product(img, "Backpack")
    print(json.dumps(result, indent=2))


def test_flux():
    """Test Flux only."""
    print("🧪 Testing Flux Schnell...")
    result = flux_generate_background("wooden table with coffee cup, morning light, cozy cafe bokeh")
    if result:
        with open("test_flux.jpg", "wb") as f:
            f.write(result)
        print("Saved: test_flux.jpg")


def test_birefnet():
    """Test BiRefNet only."""
    print("🧪 Testing BiRefNet...")
    img = requests.get("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400").content
    result = fal_remove_background(img)
    if result:
        with open("test_birefnet.png", "wb") as f:
            f.write(result)
        print("Saved: test_birefnet.png")


def test_musicgen():
    """Test MusicGen only."""
    print("🧪 Testing MusicGen...")
    result = fal_generate_music("upbeat pop music with funky bass", 5)
    print(f"Audio URL: {result}")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "--qwen":
            test_qwen()
        elif cmd == "--flux":
            test_flux()
        elif cmd == "--birefnet":
            test_birefnet()
        elif cmd == "--musicgen":
            test_musicgen()
        elif cmd == "--full":
            test_full_pipeline()
        else:
            print("Usage:")
            print("  python rizik_v4_pipeline.py --qwen     # Test Qwen Vision")
            print("  python rizik_v4_pipeline.py --flux     # Test Flux Image")
            print("  python rizik_v4_pipeline.py --birefnet # Test BG Removal")
            print("  python rizik_v4_pipeline.py --musicgen # Test Music Gen")
            print("  python rizik_v4_pipeline.py --full     # Full Pipeline")
    else:
        # Default: Run full pipeline
        test_full_pipeline()
