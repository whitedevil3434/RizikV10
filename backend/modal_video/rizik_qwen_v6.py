"""
🚀 RIZIK QWEN PIPELINE v6 - Clean Architecture
==============================================

SiliconFlow (Local):
- Qwen VL Vision: Analyze image, detect product, generate prompts
- Qwen Image Edit: Create marketing image (keep subject, add design)

Modal (GPU):
- Wan I2V: Generate video from marketing image
- MusicGen: Generate audio

NO Flux, NO Rembg, NO Search - Pure Qwen Intelligence!
"""

import os
import json
import base64
import time
import requests
import modal

# ============================================================================
# SILICONFLOW CONFIG
# ============================================================================
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"

# R2 Config
R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

# Supabase Config (for Flutter app sync)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


def save_to_supabase(video_url: str, analysis: dict):
    """Save video metadata to Supabase for Flutter app sync."""
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("⚠️ Supabase env not configured; skipping sync.")
        return
    print("📱 Saving to Supabase for Flutter app...")
    
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    payload = {
        "video_url": video_url,
        "product_name": analysis.get("product_name", "Unknown"),
        "product_type": analysis.get("product_type", "unknown"),
        "image_edit_prompt": analysis.get("image_edit_prompt", "")[:500],
        "video_prompt": analysis.get("video_prompt", "")[:500],
        "music_prompt": analysis.get("music_prompt", "")[:500]
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/generated_videos",
            headers=headers,
            json=payload,
            timeout=10
        )
        if response.status_code in [200, 201]:
            print("✅ Saved to Supabase! Flutter app will auto-sync.")
        else:
            print(f"⚠️ Supabase save warning: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Supabase save failed: {e}")


# ============================================================================
# STEP 1: QWEN VL VISION - Analyze & Generate Prompts
# ============================================================================
def qwen_analyze_and_prompt(image_bytes: bytes) -> dict:
    """
    Qwen VL Vision analyzes user's image and generates ALL prompts.
    Detects: speaker, burger, pizza, phone, clothes, etc.
    Generates: marketing prompt, video prompt, music prompt, image edit prompt
    """
    print("🧠 [Qwen VL] Analyzing image and generating prompts...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = """You are an ELITE CREATIVE DIRECTOR from MIT Media Lab + Wieden+Kennedy (Nike/Apple/Coca-Cola ads).

Analyze this product image and generate WORLD-CLASS advertising content.

## 1. product_type
Identify: power_bank, speaker, headphones, phone, burger, pizza, clothing, shoes, watch, etc.

## 2. product_name
Extract: Brand name + Model (e.g., "Awei P100 Power Bank", "JBL Flip 6")

## 3. image_edit_prompt (FOR QWEN IMAGE EDIT)

**CRITICAL RULES:**
- Keep the EXACT product UNCHANGED - same angle, same shape, same colors
- ONLY change: background, surroundings, lighting, add text banners

**MUST INCLUDE MARKETING TEXT BANNERS (English):**
Based on product type, add CREATIVE text banners:
- Power Bank: "⚡ POWERHOUSE", "UNLIMITED ENERGY", "NEVER DIE", "HOT DEAL 🔥", "22.5W FAST CHARGE"
- Speaker: "🔊 BOOM!", "FEEL THE BASS", "PARTY STARTER", "SOUND REVOLUTION"
- Headphones: "🎧 PURE SOUND", "NOISE CANCELLED", "IMMERSIVE AUDIO"
- Phone: "📱 FLAGSHIP KILLER", "PRO MAX POWER", "FUTURE IN HAND"
- Food: "😋 TASTE EXPLOSION", "FRESH & HOT", "ORDER NOW", "LIMITED TIME"

**BACKGROUND DESIGN:**
- Gradient backgrounds (dark to accent color matching product)
- Neon glow effects around product
- Geometric shapes, triangles, circles
- Light rays, lens flares
- Smoke/particle effects

**Example prompts:**
- Power Bank: "Keep the power bank exactly as shown. Dark gradient background (black to electric blue). Add glowing neon text banner 'POWERHOUSE' at top. Add '22.5W FAST CHARGE' text below product. Electric sparks and energy particles around the device. Premium tech advertisement style. Add 'HOT DEAL 🔥' badge in corner."
- Speaker: "Keep the speaker exactly as shown. Vibrant gradient background (purple to orange). Add bold text 'FEEL THE BASS' at top. Sound wave graphics emanating from speaker. Add 'BUY NOW' button style banner. Party lights bokeh in background. Add 'LIMITED EDITION' badge."

## 4. video_prompt (FOR WAN VIDEO - SLOW-MO SEAMLESS LOOP!)

**Create SMOOTH, HYPNOTIC, LOOPABLE motion for infinite playback:**

**CRITICAL FOR SEAMLESS LOOP:**
- Motion must be SLOW and SMOOTH - no sudden movements
- Camera movement should be CIRCULAR or OSCILLATING (returns to start)
- End frame should naturally connect to start frame
- Use SLOW-MOTION for everything
- Gentle floating particles, soft light shifts

Elements to include:
- **Slow 360° Orbit:** Camera slowly rotates around product, completing partial or full circle
- **Gentle Particle Float:** Soft glowing particles, dust motes, or bokeh floating slowly
- **Subtle Light Pulse:** Soft breathing light effect, gentle glow shifts
- **Smooth Zoom Breathe:** Very slow push-in then pull-out (breathing effect)
- **NO SUDDEN CUTS or FAST MOTION** - everything slow and dreamy

**Example prompts (SLOW-MO LOOP):**
- "Ultra smooth slow-motion: Camera slowly orbits 180 degrees around product, floating dust particles, soft pulsing glow, gentle light rays shifting, hypnotic dreamy atmosphere, seamless loop motion"
- "Dreamy slow-motion hover: Product gently floating, subtle bokeh particles, camera slowly breathing in and out, soft ambient light shifts, mesmerizing infinite loop feel"

## 5. music_prompt (AMBIENT LOOP-FRIENDLY SOUNDTRACK)

**Create AMBIENT, SMOOTH music perfect for infinite loop:**
- Subtle, atmospheric, hypnotic vibe
- NO sudden drops or changes
- Seamless loop-friendly (end blends to start)
- Soft beat, ambient pads, gentle rhythm
- 80-90 BPM (slow and chill)

**Match to product:**
- **Tech:** "Ambient electronic, soft synth pads, gentle pulsing beat, futuristic chill vibes, 85 BPM, seamless loop"
- **Fashion/Watch:** "Sophisticated ambient, soft piano notes, subtle rhythm, luxury feel, 80 BPM, endless loop"
- **Food:** "Warm ambient, soft acoustic guitar, gentle rhythm, cozy vibes, 85 BPM, seamless"
- **General:** "Dreamy ambient soundscape, soft pulsing synths, gentle beat, 85 BPM, perfect for infinite loop"

## OUTPUT (ONLY VALID JSON - NO EXTRA TEXT):
{"product_type": "...", "product_name": "...", "image_edit_prompt": "...", "video_prompt": "...", "music_prompt": "..."}"""

    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-72B-Instruct",
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}},
            {"type": "text", "text": prompt}
        ]}],
        "max_tokens": 1000,
        "temperature": 0.4
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        
        content = response.json()['choices'][0]['message']['content']
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            analysis = json.loads(json_match.group())
            print(f"✅ Detected: {analysis['product_type']} - {analysis['product_name']}")
            print(f"📝 Edit prompt: {analysis['image_edit_prompt'][:80]}...")
            print(f"🎬 Video prompt: {analysis['video_prompt'][:60]}...")
            print(f"🎵 Music prompt: {analysis['music_prompt'][:60]}...")
            return analysis
    except Exception as e:
        print(f"❌ Qwen VL Error: {e}")
    
    # Fallback
    return {
        "product_type": "product",
        "product_name": "Premium Product",
        "image_edit_prompt": "Keep the product exactly as shown. Place on premium studio background with professional lighting.",
        "video_prompt": "Static product in center, camera slowly panning right, cinematic lighting",
        "music_prompt": "Modern electronic beat, 100 BPM, premium advertisement energy"
    }


# ============================================================================
# STEP 2: QWEN IMAGE EDIT - Create Marketing Image (Keep Subject, Change Rest)
# ============================================================================
def qwen_image_edit(image_bytes: bytes, edit_prompt: str) -> bytes:
    """
    Qwen Image Edit creates the final marketing image.
    KEEPS the original subject EXACTLY but transforms background/surroundings.
    
    Model: Qwen/Qwen-Image-Edit (20B parameters)
    - Semantic Editing: object insertion, style transfer
    - Appearance Editing: retouching, texture modification
    - PRESERVES the main subject while changing everything else
    """
    print("🎨 [Qwen Image Edit] Creating marketing image...")
    print(f"   Subject: KEEP EXACT | Background: CHANGE")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    # Qwen Image Edit API payload
    payload = {
        "model": "Qwen/Qwen-Image-Edit",
        "prompt": edit_prompt,
        "image": f"data:image/jpeg;base64,{img_base64}",
        "negative_prompt": "change product, modify subject, distorted product, different product, blurry, low quality",
        "image_size": "768x1024",
        "num_inference_steps": 30,
        "guidance_scale": 7.5,
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=payload, timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                img_url = result['images'][0].get('url')
                if img_url:
                    edited_bytes = requests.get(img_url, timeout=30).content
                    print(f"✅ Marketing image created! ({len(edited_bytes)/1024:.1f}KB)")
                    return edited_bytes
        else:
            print(f"⚠️ Qwen Image Edit error: {response.status_code}")
            print(f"   Response: {response.text[:200] if response.text else 'No response'}")
    except Exception as e:
        print(f"⚠️ Qwen Image Edit error: {e}")
    
    # Fallback: Return original
    print("⚠️ Using original image (Qwen Image Edit failed)")
    return image_bytes


# ============================================================================
# MODAL APP SETUP
# ============================================================================
app = modal.App("rizik-qwen-v6")

model_volume = modal.Volume.from_name("rizik-qwen-v6-cache", create_if_missing=True)

# Shared image for Modal functions
modal_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git", "pkg-config", "libavformat-dev", "libavcodec-dev", "libavdevice-dev", "libavutil-dev", "libswscale-dev", "libswresample-dev", "libavfilter-dev")
    .pip_install(
        "torch>=2.4.0", "Pillow", "numpy", "requests", "ftfy",
        "diffusers>=0.33.0", "transformers>=4.40.0",
        "accelerate", "sentencepiece", "audiocraft", "torchcodec",
        "imageio", "imageio-ffmpeg",
    )
)


# ============================================================================
# MODAL: WAN 2.2 TI2V-5B (Text/Image to Video - FAST!)
# ============================================================================
@app.cls(
    gpu="H100",
    image=modal_image,
    volumes={"/cache": model_volume},
    timeout=600,
    scaledown_window=300,  # Keep warm for 5 min to avoid cold starts
)
class WanTurbo:
    """Wan 2.2 TI2V-5B - Faster, 720P, optimized for H100."""
    
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import WanImageToVideoPipeline
        
        print("🎬 [Modal] Loading Wan 2.2 TI2V-5B (720P, FAST!)...")
        print(f"🖥️ GPU: {torch.cuda.get_device_name()}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory // 1e9:.0f} GB")
        
        # Wan 2.2 TI2V-5B - much faster than 14B!
        self.pipe = WanImageToVideoPipeline.from_pretrained(
            "Wan-AI/Wan2.2-TI2V-5B-Diffusers",
            torch_dtype=torch.bfloat16,
            cache_dir="/cache"
        ).to("cuda")
        
        # H100 has enough VRAM - no need for CPU offload
        # self.pipe.enable_model_cpu_offload()  # Disabled for speed
        
        if hasattr(self.pipe, 'enable_flash_attention'):
            self.pipe.enable_flash_attention()
            print("✅ Flash Attention ON")
        
        print("✅ Wan 2.2 TI2V-5B Ready! (720P, ~2x faster)")
    
    @modal.method()
    def generate(self, image_bytes: bytes, prompt: str, duration_sec: int = 5) -> bytes:
        import torch
        from PIL import Image
        from io import BytesIO
        from diffusers.utils import export_to_video
        
        start = time.time()
        print(f"🎬 Animating for {duration_sec}s...")
        print(f"   Prompt: {prompt[:60]}...")
        
        input_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        input_image = input_image.resize((704, 1280), Image.Resampling.LANCZOS)  # Wan 2.2 native 720P
        
        fps = 24  # Higher FPS for 720P
        num_frames = min(duration_sec * fps + 1, 97)  # Wan 2.2 supports more frames
        num_frames = ((num_frames - 1) // 4) * 4 + 1
        
        # Cinematic prompt - no need to add "static" for TI2V
        safe_prompt = prompt
        
        with torch.inference_mode():
            output = self.pipe(
                image=input_image,
                prompt=safe_prompt,
                negative_prompt="morphing, changing shape, distorted, blurry, low quality",
                height=1280, width=704,  # Wan 2.2 native 720P resolution
                num_frames=num_frames,
                num_inference_steps=15,  # 5B model needs fewer steps
                guidance_scale=4.0,
                generator=torch.Generator("cuda").manual_seed(42),
            )
        
        frames = output.frames[0]
        output_path = "/tmp/video.mp4"
        export_to_video(frames, output_path, fps=fps)
        
        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        print(f"✅ Video: {len(video_bytes)/1e6:.1f}MB in {time.time()-start:.1f}s")
        return video_bytes


# ============================================================================
# MODAL: MUSICGEN
# ============================================================================
@app.cls(
    gpu="A10G",
    image=modal_image,
    volumes={"/cache": model_volume},
    timeout=300,
)
class MusicGenerator:
    """MusicGen for audio."""
    
    @modal.enter()
    def load_model(self):
        from audiocraft.models import MusicGen
        print("🎵 [Modal] Loading MusicGen...")
        self.model = MusicGen.get_pretrained('facebook/musicgen-small', device='cuda')
        self.model.set_generation_params(duration=10)
        print("✅ MusicGen Ready!")
    
    @modal.method()
    def compose(self, prompt: str, duration: int = 7) -> bytes:
        import torchaudio
        
        print(f"🎵 Composing {duration}s audio...")
        self.model.set_generation_params(duration=duration)
        wav = self.model.generate([prompt])
        
        # Save to temp file (torchcodec can't write to BytesIO)
        temp_path = "/tmp/audio_out.wav"
        torchaudio.save(temp_path, wav[0].cpu(), 32000, format="wav")
        
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
        
        print("✅ Audio composed!")
        return audio_bytes


# ============================================================================
# MODAL: MERGE & UPLOAD
# ============================================================================
@app.function(
    image=modal_image,
    secrets=[modal.Secret.from_dict({
        "CLOUDFLARE_ACCOUNT_ID": "e8181864e56d18f34edf61eeed4975cd",
        "CLOUDFLARE_API_TOKEN": "b4a229ef169f5f15c3d8ecdff053008aaff1c",
        "CLOUDFLARE_EMAIL": "its.sabbir69@gmail.com",
    })],
)
def merge_and_upload(video_bytes: bytes, audio_bytes: bytes) -> str:
    """FFmpeg merge + R2 upload."""
    import subprocess
    
    print("🎚️ [Modal] Merging video + audio...")
    
    with open("/tmp/video.mp4", "wb") as f:
        f.write(video_bytes)
    with open("/tmp/audio.wav", "wb") as f:
        f.write(audio_bytes)
    
    output_path = "/tmp/final.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-i", "/tmp/video.mp4", "-i", "/tmp/audio.wav",
        "-c:v", "copy", "-c:a", "aac", "-shortest", output_path
    ], capture_output=True)
    
    with open(output_path, "rb") as f:
        final_bytes = f.read()
    
    # Upload to R2
    filename = f"qwen-v6/{int(time.time())}.mp4"
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    api_key = os.environ["CLOUDFLARE_API_TOKEN"]
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/rizik-storage-v1/objects/{filename}"
    headers = {"X-Auth-Email": os.environ["CLOUDFLARE_EMAIL"], "X-Auth-Key": api_key}
    
    requests.put(url, headers=headers, data=final_bytes, timeout=60)
    
    public_url = f"{R2_PUBLIC_URL}/{filename}"
    print(f"✅ Uploaded: {public_url}")
    return public_url


# ============================================================================
# MAIN PIPELINE
# ============================================================================
@app.local_entrypoint()
def main():
    """
    CLEAN QWEN PIPELINE:
    1. Qwen VL Vision → Analyze + Generate all prompts
    2. Qwen Image Edit (via Flux) → Create marketing image
    3. Wan I2V → Generate video
    4. MusicGen → Generate audio
    5. Merge & Upload
    """
    print("=" * 60)
    print("🚀 RIZIK QWEN PIPELINE v6 - Clean Architecture")
    print("   Qwen VL + Qwen Image Edit → Wan + MusicGen")
    print("=" * 60)
    
    # Load image
    custom_image_path = os.environ.get("PRODUCT_IMAGE", None)
    
    if custom_image_path and os.path.exists(custom_image_path):
        print(f"\n📸 Loading: {custom_image_path}")
        with open(custom_image_path, "rb") as f:
            user_image = f.read()
    else:
        print("\n📥 Using sample image...")
        user_image = requests.get("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600").content
    
    # ========================================
    # PHASE 1: SILICONFLOW (Qwen Intelligence)
    # ========================================
    print("\n" + "=" * 60)
    print("🧠 PHASE 1: Qwen Intelligence (SiliconFlow)")
    print("=" * 60)
    
    phase1_start = time.time()
    
    # Step 1: Qwen VL analyzes and generates all prompts
    analysis = qwen_analyze_and_prompt(user_image)
    
    # Step 2: Create marketing image with Qwen's instructions
    marketing_image = qwen_image_edit(user_image, analysis['image_edit_prompt'])
    
    with open("output_marketing_image.jpg", "wb") as f:
        f.write(marketing_image)
    print("   Saved: output_marketing_image.jpg")
    
    phase1_time = time.time() - phase1_start
    print(f"\n⏱️ Phase 1 Time: {phase1_time:.1f}s | Cost: ~৳0.10")
    
    # ========================================
    # PHASE 2: MODAL (Video + Audio)
    # ========================================
    print("\n" + "=" * 60)
    print("🎬 PHASE 2: Video + Audio Generation (Modal)")
    print("=" * 60)
    
    phase2_start = time.time()
    
    wan = WanTurbo()
    music = MusicGenerator()
    
    # Parallel generation
    video_future = wan.generate.spawn(marketing_image, analysis['video_prompt'], 7)  # 7s for loop
    audio_future = music.compose.spawn(analysis['music_prompt'], 7)  # Match video duration
    
    video_bytes = video_future.get()
    audio_bytes = audio_future.get()
    
    phase2_time = time.time() - phase2_start
    print(f"\n⏱️ Phase 2 Time: {phase2_time:.1f}s | Cost: ~৳1.00")
    
    # ========================================
    # PHASE 3: MERGE & UPLOAD
    # ========================================
    print("\n" + "=" * 60)
    print("☁️ PHASE 3: Merge & Upload")
    print("=" * 60)
    
    phase3_start = time.time()
    
    final_url = merge_and_upload.remote(video_bytes, audio_bytes)
    
    # Save to Supabase for Flutter app
    save_to_supabase(final_url, analysis)
    
    phase3_time = time.time() - phase3_start
    print(f"\n⏱️ Phase 3 Time: {phase3_time:.1f}s | Cost: ~৳0.05")
    
    # ========================================
    # COMPLETE
    # ========================================
    total_time = phase1_time + phase2_time + phase3_time
    
    print("\n" + "=" * 60)
    print("🎉 PIPELINE COMPLETE!")
    print("=" * 60)
    print(f"\n⏱️ Total Time: {total_time:.1f}s")
    print(f"💰 Estimated Cost: ৳1.15")
    print(f"\n🎬 Video URL: {final_url}")
    print(f"\n📊 Product: {analysis['product_name']}")
