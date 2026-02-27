"""
╔══════════════════════════════════════════════════════════════════════════════╗
║         RIZIK HYBRID PIPELINE v5 - "Best of Both Worlds" FINAL              ║
║                                                                              ║
║  🧠 SiliconFlow (Local API - FREE/Cheap):                                   ║
║     - Qwen 2.5-VL-72B (Vision Analysis)                                     ║
║     - Flux.1 Schnell (Background Generation)                                ║
║                                                                              ║
║  🖥️ Modal (GPU - Pay per use):                                               ║
║     - Rembg (Background Removal) - CPU                                      ║
║     - Wan 2.2 TURBO (Video Gen) - H100                                      ║
║     - MusicGen (Audio Gen) - A10G                                           ║
║     - FFmpeg Merge + R2 Upload - CPU                                        ║
║                                                                              ║
║  📱 Flutter (Local - FREE):                                                  ║
║     - Image Merging (Stack + RepaintBoundary)                               ║
║                                                                              ║
║  💰 Total Cost: ~৳1.50 per video                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import modal
import os
import io
import json
import requests
import subprocess
import base64
import time
from io import BytesIO
from PIL import Image

# ============================================================================
# API CONFIGURATION
# ============================================================================

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"

R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

# ============================================================================
# SILICONFLOW LOCAL FUNCTIONS (Called from main machine, NOT Modal)
# ============================================================================

def qwen_analyze_product(image_bytes: bytes, product_hint: str = "") -> dict:
    """
    [LOCAL] Qwen 2.5-VL-72B Vision Analysis - ENHANCED for Marketing Ads
    Now extracts EXACT product model for HD image search!
    Cost: ~৳0.05
    """
    print("🧠 [SiliconFlow] Qwen Vision analyzing for MARKETING AD...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = f"""You are an ELITE advertising creative director at a top agency like Ogilvy or Wieden+Kennedy.

Analyze this product image{f' (Brand/Product: {product_hint})' if product_hint else ''} and create a PREMIUM marketing video advertisement.

Generate DETAILED prompts for each component:

1. **product_name**: Brand + Product type (e.g., "AWEI Portable Bluetooth Speaker")

2. **search_query**: EXACT product model/name for Google Image search to find HD product photos.
   - Include brand name + model number if visible
   - Example: "AWEI Y331 Bluetooth Speaker official product image"
   - Be specific to get professional product shots

3. **flux_prompt**: A DETAILED prompt for generating the BACKGROUND SCENE (without the product):
   - Describe a premium advertising backdrop that matches the product's vibe
   - Include: setting (studio/outdoor/lifestyle), lighting style, color palette, props, atmosphere
   - Make it visually stunning for a commercial
   - Example: "Sleek dark studio with soft blue neon accent lights, geometric abstract shapes floating in background, subtle smoke effects, premium tech product photography setup, dark gradient backdrop transitioning from deep blue to black, reflective surface beneath"

4. **video_prompt**: CAMERA MOVEMENT ONLY! Product must stay COMPLETELY STATIC:
   - IMPORTANT: The product MUST NOT move, rotate, or change shape!
   - Only describe CAMERA movements (slow pan, zoom, orbit, dolly)
   - Add BACKGROUND effects only (light rays, particles, bokeh changes)
   - BAD: "rotating product" - this will destroy product shape!
   - GOOD: "Static product, camera slowly panning right, light particles floating in background"
   - Example: "Static product in center, camera slowly orbiting around it, soft light rays in background, cinematic bokeh, professional commercial lighting"

5. **audio_prompt**: A DETAILED music generation prompt:
   - Match the product's brand personality
   - Include: genre, tempo, instruments, mood, energy level
   - For tech products: modern electronic, bass-heavy, futuristic
   - Example: "Modern electronic beat with deep bass drops, futuristic synth arpeggios, punchy drums at 110 BPM, subtle hi-hat patterns, rising tension build, premium tech advertisement energy, clean and professional mix"

Output ONLY valid JSON (no markdown, no explanation):
{{"product_name": "...", "search_query": "...", "flux_prompt": "...", "video_prompt": "...", "audio_prompt": "..."}}"""

    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-72B-Instruct",
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}},
            {"type": "text", "text": prompt}
        ]}],
        "max_tokens": 1200,
        "temperature": 0.5
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=90)
        response.raise_for_status()
        
        content = response.json()['choices'][0]['message']['content']
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            analysis = json.loads(json_match.group())
            print(f"✅ Product: {analysis['product_name']}")
            print(f"🔍 Search: {analysis.get('search_query', 'N/A')[:60]}...")
            print(f"🎨 Flux: {analysis.get('flux_prompt', analysis.get('context_prompt', ''))[:60]}...")
            print(f"🎬 Video: {analysis.get('video_prompt', '')[:60]}...")
            print(f"🎵 Audio: {analysis.get('audio_prompt', '')[:60]}...")
            
            # Ensure backward compatibility
            if 'flux_prompt' in analysis and 'context_prompt' not in analysis:
                analysis['context_prompt'] = analysis['flux_prompt']
            
            return analysis
    except Exception as e:
        print(f"❌ Qwen Error: {e}")
    
    return {
        "product_name": product_hint or "Premium Product",
        "search_query": f"{product_hint} official product image HD",
        "context_prompt": "Sleek dark studio with soft blue neon accent lights, geometric abstract shapes, subtle smoke effects, premium tech product photography setup",
        "flux_prompt": "Sleek dark studio with soft blue neon accent lights, geometric abstract shapes, subtle smoke effects, premium tech product photography setup",
        "video_prompt": f"Cinematic slow orbit around {product_hint or 'product'}, professional lighting, soft floating motion, light rays, shallow depth of field",
        "audio_prompt": "Modern electronic beat with deep bass, futuristic synth arpeggios, punchy drums at 110 BPM, premium tech advertisement energy"
    }


def search_hd_product_image(query: str) -> bytes:
    """
    [LOCAL] Search for HD product image using DuckDuckGo Image Search
    Returns: Professional product image bytes (or None if not found)
    Cost: ৳0.00 (FREE!)
    """
    print(f"🔍 [DuckDuckGo] Searching for HD product image: {query}...")
    
    try:
        # DuckDuckGo Images API
        ddg_url = "https://duckduckgo.com/"
        
        # Get vqd token
        res = requests.get(ddg_url, timeout=10)
        import re
        vqd_match = re.search(r'vqd="([^"]+)"', res.text) or re.search(r'vqd=([^&]+)', res.text)
        
        if not vqd_match:
            # Fallback: Direct image search via HTML
            search_url = f"https://duckduckgo.com/?q={query.replace(' ', '+')}&iax=images&ia=images"
            print(f"   Fallback search: {search_url[:60]}...")
        
        # Alternative: Use DuckDuckGo Instant Answers API for images
        ddg_api = f"https://api.duckduckgo.com/?q={query}&format=json&t=rizik"
        api_res = requests.get(ddg_api, timeout=10)
        data = api_res.json()
        
        # Check for image in response
        if data.get('Image'):
            img_url = data['Image']
            if not img_url.startswith('http'):
                img_url = 'https://duckduckgo.com' + img_url
            img_bytes = requests.get(img_url, timeout=30).content
            print(f"✅ HD image found from DDG API!")
            return img_bytes
        
        # Fallback: Google Custom Search (if DDG fails)
        # Try Bing Image Search API (free tier available)
        bing_url = f"https://www.bing.com/images/search?q={query.replace(' ', '+')}&form=HDRSC2&first=1"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        bing_res = requests.get(bing_url, headers=headers, timeout=15)
        
        # Extract image URLs from HTML
        img_matches = re.findall(r'murl&quot;:&quot;([^&]+)&quot;', bing_res.text)
        
        if img_matches:
            # Filter for likely product images (larger ones, png/jpg)
            for img_url in img_matches[:5]:
                if any(ext in img_url.lower() for ext in ['.jpg', '.png', '.webp']):
                    try:
                        img_bytes = requests.get(img_url, headers=headers, timeout=15).content
                        if len(img_bytes) > 10000:  # At least 10KB (avoid tiny icons)
                            print(f"✅ HD image found from Bing: {len(img_bytes)/1024:.1f}KB")
                            return img_bytes
                    except:
                        continue
        
        print("⚠️ No HD image found, will use user's photo cutout")
        return None
        
    except Exception as e:
        print(f"⚠️ Search Error: {e}")
        return None


def flux_generate_background(context_prompt: str) -> bytes:
    """
    [LOCAL] Flux.1 Schnell Background Generation
    Cost: ~৳0.05
    """
    print(f"🎨 [SiliconFlow] Flux generating background...")
    
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    full_prompt = f"{context_prompt}, professional product photography backdrop, 8k, cinematic lighting, bokeh, shallow depth of field"
    
    payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": full_prompt,
        "image_size": "768x1024"
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


def smart_repair_product(product_png_bytes: bytes, product_name: str) -> bytes:
    """
    [LOCAL] Smart Product Repair Pipeline:
    1. Qwen analyzes cutout - detects missing/cut portions (like where hand was)
    2. Flux generates COMPLETE product based on analysis
    3. Returns polished, complete product image
    
    Cost: ~৳0.10
    """
    print(f"🔧 [Smart Repair] Analyzing and repairing product cutout...")
    
    # Step 1: Qwen analyzes the cutout for issues
    print("   Step 1/3: Qwen analyzing cutout for damage...")
    
    img_base64 = base64.b64encode(product_png_bytes).decode('utf-8')
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    analyze_prompt = f"""Analyze this product cutout image of {product_name}.

Look for:
1. Is any part of the product CUT OFF or missing? (e.g., from hand removal)
2. Are there any damaged/broken edges?
3. What should the COMPLETE product look like?

Respond in JSON:
{{"has_damage": true/false, "damage_description": "where and what is missing", "complete_product_description": "detailed description of what the COMPLETE product should look like"}}"""

    payload = {
        "model": "Qwen/Qwen2.5-VL-72B-Instruct",
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_base64}"}},
            {"type": "text", "text": analyze_prompt}
        ]}],
        "max_tokens": 500,
        "temperature": 0.3
    }
    
    damage_analysis = None
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=60)
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                damage_analysis = json.loads(json_match.group())
                print(f"   Damage detected: {damage_analysis.get('has_damage', False)}")
                if damage_analysis.get('damage_description'):
                    print(f"   Issue: {damage_analysis['damage_description'][:60]}...")
    except Exception as e:
        print(f"   Analysis error: {e}")
    
    # Step 2: Generate complete product with Flux
    print("   Step 2/3: Flux generating complete product...")
    
    if damage_analysis and damage_analysis.get('complete_product_description'):
        product_desc = damage_analysis['complete_product_description']
    else:
        product_desc = f"{product_name}, complete product, no damage, professional studio shot"
    
    # Use Flux to generate a COMPLETE product image
    flux_prompt = f"""Professional product photography: {product_desc}.
Studio lighting, white/neutral background, sharp focus, 8K quality, commercial advertisement style.
The product must be COMPLETE with no cut-off or missing parts.
Clean, polished, premium look."""

    flux_payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": flux_prompt,
        "image_size": "768x1024"
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=flux_payload, timeout=90)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                img_url = result['images'][0].get('url')
                if img_url:
                    repaired_bytes = requests.get(img_url, timeout=30).content
                    
                    # Save for debugging
                    with open("output_flux_complete_product.jpg", "wb") as f:
                        f.write(repaired_bytes)
                    
                    print(f"✅ Complete product generated! ({len(repaired_bytes)/1024:.1f}KB)")
                    print("   Saved: output_flux_complete_product.jpg")
                    return repaired_bytes
        else:
            print(f"   Flux error: {response.status_code}")
    except Exception as e:
        print(f"   Flux error: {e}")
    
    # Fallback: Return original
    print("⚠️ Repair failed, using original cutout")
    return product_png_bytes


# ============================================================================
# MODAL APP SETUP
# ============================================================================

app = modal.App("rizik-hybrid-v5")

model_volume = modal.Volume.from_name("rizik-hybrid-v5-cache", create_if_missing=True)

# Base image with all dependencies
hybrid_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    .pip_install(
        "packaging", "setuptools",
    )
    .pip_install(
        # Core
        "torch>=2.4.0",
        "Pillow",
        "numpy",
        "requests",
        # Wan
        "diffusers>=0.33.0",
        "transformers>=4.40.0",
        "accelerate>=0.28.0",
        "sentencepiece",
        "ftfy",
        "xformers",
        "imageio[ffmpeg]",
        # MusicGen
        "scipy",
        # Background Removal (rembg with onnxruntime)
        "rembg",
        "onnxruntime",  # Required for rembg CPU mode
    )
)


# ============================================================================
# MODAL: BACKGROUND REMOVER (Rembg - CPU)
# ============================================================================

@app.function(
    image=hybrid_image,
    volumes={"/root/.u2net": model_volume},  # Cache the u2net model
    timeout=300,  # Increased for first model download
)
def remove_background(image_bytes: bytes) -> bytes:
    """
    Remove background using Rembg (CPU).
    Returns: Transparent PNG bytes
    Cost: ~৳0.05 (Modal CPU time)
    """
    from rembg import remove
    from PIL import Image
    from io import BytesIO
    
    print("✂️ [Modal] Rembg removing background...")
    
    try:
        input_image = Image.open(BytesIO(image_bytes))
        output_image = remove(input_image)
        
        buffer = BytesIO()
        output_image.save(buffer, format="PNG")
        
        print("✅ Background removed!")
        return buffer.getvalue()
        
    except Exception as e:
        print(f"❌ Rembg Error: {e}")
        return None


# ============================================================================
# MODAL: WAN 2.1 IMAGE-TO-VIDEO (H100 80GB - Animates YOUR product image!)
# ============================================================================

@app.cls(
    gpu="H100",  # H100-80GB needed for 14B I2V model (~50GB VRAM)
    image=hybrid_image,
    volumes={"/cache": model_volume},
    timeout=900,  # Longer timeout for larger model
    scaledown_window=300,
)
class WanTurbo:
    """Wan 2.1 I2V - Image-to-Video on A100. Animates your actual product!"""
    
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import WanImageToVideoPipeline  # I2V Pipeline!
        
        print("🎬 [Modal] Loading Wan 2.1 IMAGE-TO-VIDEO...")
        print(f"🖥️ GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.0f} GB")
        
        os.environ["HF_HOME"] = "/cache/hf"
        
        # Use I2V (Image-to-Video) model, not T2V (Text-to-Video)
        self.pipe = WanImageToVideoPipeline.from_pretrained(
            "Wan-AI/Wan2.1-I2V-14B-480P-Diffusers",  # I2V model for actual image animation
            torch_dtype=torch.bfloat16,
            cache_dir="/cache/wan_i2v",
        ).to("cuda")
        
        self.pipe.vae.enable_tiling()
        
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("✅ Flash Attention ON")
        except:
            pass
        
        print("✅ Wan I2V (Image-to-Video) Ready!")
    
    @modal.method()
    def generate(self, image_bytes: bytes, prompt: str, duration_sec: int = 5) -> bytes:
        """Generate video from YOUR ACTUAL IMAGE + prompt."""
        import torch
        from PIL import Image
        from io import BytesIO
        from diffusers.utils import export_to_video
        
        start = time.time()
        print(f"🎬 Animating your product image for {duration_sec}s...")
        print(f"   Motion prompt: {prompt[:60]}...")
        
        # Load the input image (merged product + background)
        input_image = Image.open(BytesIO(image_bytes)).convert("RGB")
        
        # Resize to model's expected size (480p for this model)
        input_image = input_image.resize((480, 832), Image.Resampling.LANCZOS)
        
        fps = 16
        num_frames = min(duration_sec * fps + 1, 81)
        num_frames = ((num_frames - 1) // 4) * 4 + 1
        
        # === SUBJECT PRESERVATION: Static product, camera movement only ===
        # Prefix the prompt to keep product static
        safe_prompt = f"Static product, camera movement only, {prompt}"
        
        with torch.inference_mode():
            output = self.pipe(
                image=input_image,  # YOUR actual product image!
                prompt=safe_prompt,
                negative_prompt="morphing, changing shape, distorted text, bad logo, melting object, deformation, blurry, low quality, watermark, text overlay, product moving, product rotating, product changing",
                height=832,
                width=480,
                num_frames=num_frames,
                num_inference_steps=20,  # Keep at 20 for quality
                guidance_scale=3.5,  # Lower CFG preserves product identity better
                generator=torch.Generator("cuda").manual_seed(42),
            )
        
        frames = output.frames[0]
        
        output_path = "/tmp/video.mp4"
        export_to_video(frames, output_path, fps=fps)
        
        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        print(f"✅ Video: {len(video_bytes)/1024/1024:.1f}MB in {time.time()-start:.1f}s")
        return video_bytes


# ============================================================================
# MODAL: MUSICGEN (A10G)
# ============================================================================

@app.cls(
    gpu="A10G",
    image=hybrid_image,
    volumes={"/cache": model_volume},
    timeout=180,
    scaledown_window=120,
)
class MusicGenerator:
    """MusicGen Audio Composer on A10G."""
    
    @modal.enter()
    def load_model(self):
        from transformers import MusicgenForConditionalGeneration, AutoProcessor
        
        print("🎵 [Modal] Loading MusicGen...")
        os.environ["HF_HOME"] = "/cache/hf"
        
        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-small", cache_dir="/cache/music")
        self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small", cache_dir="/cache/music").to("cuda")
        
        print("✅ MusicGen Ready!")
    
    @modal.method()
    def compose(self, prompt: str, duration_sec: int = 7) -> bytes:
        """Generate audio from prompt."""
        import scipy.io.wavfile
        from io import BytesIO
        
        print(f"🎵 Composing {duration_sec}s audio...")
        print(f"   Prompt: {prompt[:60]}...")
        
        inputs = self.processor(text=[prompt], padding=True, return_tensors="pt").to("cuda")
        audio_values = self.model.generate(**inputs, max_new_tokens=int(duration_sec * 50))
        
        sampling_rate = self.model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()
        
        buffer = BytesIO()
        scipy.io.wavfile.write(buffer, rate=sampling_rate, data=audio_data)
        
        print("✅ Audio composed!")
        return buffer.getvalue()


# ============================================================================
# MODAL: MERGE & UPLOAD
# ============================================================================

@app.function(
    image=hybrid_image,
    secrets=[modal.Secret.from_dict({
        "CLOUDFLARE_ACCOUNT_ID": "e8181864e56d18f34edf61eeed4975cd",
        "CLOUDFLARE_API_TOKEN": "b4a229ef169f5f15c3d8ecdff053008aaff1c",
        "CLOUDFLARE_EMAIL": "its.sabbir69@gmail.com",
    })],
    timeout=120,
)
def merge_and_upload(video_bytes: bytes, audio_bytes: bytes) -> str:
    """Merge video+audio and upload to R2."""
    import subprocess
    
    print("🎚️ [Modal] Merging video + audio...")
    
    video_path = "/tmp/v.mp4"
    audio_path = "/tmp/a.wav"
    output_path = "/tmp/final.mp4"
    
    with open(video_path, "wb") as f:
        f.write(video_bytes)
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    
    subprocess.run([
        "ffmpeg", "-y", "-i", video_path, "-i", audio_path,
        "-c:v", "copy", "-c:a", "aac", "-shortest", output_path
    ], capture_output=True)
    
    with open(output_path, "rb") as f:
        final_bytes = f.read()
    
    # Upload to R2
    filename = f"hybrid-v5/{int(time.time())}.mp4"
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    api_key = os.environ["CLOUDFLARE_API_TOKEN"]
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/rizik-storage-v1/objects/{filename}"
    headers = {"X-Auth-Email": os.environ["CLOUDFLARE_EMAIL"], "X-Auth-Key": api_key}
    
    requests.put(url, headers=headers, data=final_bytes, timeout=60)
    
    public_url = f"{R2_PUBLIC_URL}/{filename}"
    print(f"✅ Uploaded: {public_url}")
    return public_url


# ============================================================================
# LOCAL: IMAGE MERGER (Simulates Flutter)
# ============================================================================

def merge_images_local(background_bytes: bytes, product_png_bytes: bytes) -> bytes:
    """
    [LOCAL] Merge background + product PNG.
    This is what Flutter will do with Stack + RepaintBoundary.
    Cost: ৳0.00
    """
    print("🔀 [Local] Merging images...")
    
    try:
        background = Image.open(BytesIO(background_bytes)).convert("RGBA")
        product = Image.open(BytesIO(product_png_bytes)).convert("RGBA")
        
        bg_w, bg_h = background.size
        
        # Resize product to 60% of background height
        prod_w, prod_h = product.size
        target_height = int(bg_h * 0.6)
        aspect = prod_w / prod_h
        target_width = int(target_height * aspect)
        
        product_resized = product.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Center product on background
        x = (bg_w - target_width) // 2
        y = (bg_h - target_height) // 2 + int(bg_h * 0.1)
        
        # === SHADOW TRICK: Add fake shadow for realism ===
        # This makes Wan think the image is natural and won't try to "fix" the product
        from PIL import ImageFilter, ImageDraw
        
        shadow_size = (target_width, int(target_height * 0.15))
        shadow = Image.new("RGBA", shadow_size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow)
        
        # Ellipse shadow under product
        shadow_draw.ellipse(
            [0, 0, shadow_size[0], shadow_size[1]],
            fill=(0, 0, 0, 80)  # Semi-transparent black
        )
        
        # Blur shadow for softness
        shadow = shadow.filter(ImageFilter.GaussianBlur(radius=15))
        
        # Paste shadow first (below product)
        shadow_x = x
        shadow_y = y + target_height - int(shadow_size[1] * 0.5)
        background.paste(shadow, (shadow_x, shadow_y), shadow)
        
        # Then paste product on top (PURE PIXEL OVERLAY - no AI modification!)
        background.paste(product_resized, (x, y), product_resized)
        
        buffer = BytesIO()
        background.convert("RGB").save(buffer, format="JPEG", quality=95)
        
        print("✅ Images merged with shadow!")
        return buffer.getvalue()
        
    except Exception as e:
        print(f"❌ Merge Error: {e}")
        return None


# ============================================================================
# FULL PIPELINE ORCHESTRATOR
# ============================================================================

@app.local_entrypoint()
def main():
    """Run the complete hybrid pipeline."""
    import sys
    
    print("=" * 60)
    print("🚀 RIZIK HYBRID PIPELINE v5 - MARKETING AD GENERATOR")
    print("   SiliconFlow (Brain) + Modal (Media Factory)")
    print("=" * 60)
    
    total_start = time.time()
    
    # Check for custom image path
    custom_image_path = os.environ.get("PRODUCT_IMAGE", None)
    product_hint = os.environ.get("PRODUCT_HINT", "")
    
    if custom_image_path and os.path.exists(custom_image_path):
        print(f"\n📸 Loading custom product image: {custom_image_path}")
        with open(custom_image_path, "rb") as f:
            product_img = f.read()
    else:
        # Default sample
        print("\n📥 Downloading sample product image...")
        product_img = requests.get("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600").content
        product_hint = "Luxury Backpack"
    
    # ========================================
    # PHASE 1: SILICONFLOW (Local)
    # ========================================
    print("\n" + "=" * 60)
    print("🧠 PHASE 1: SiliconFlow (Local API)")
    print("=" * 60)
    
    phase1_start = time.time()
    
    # 1. Qwen Vision Analysis
    analysis = qwen_analyze_product(product_img, product_hint)
    print(f"   Context: {analysis['context_prompt'][:50]}...")
    
    # 2. Search for HD Product Image (Google/Bing)
    hd_product_img = None
    if analysis.get('search_query'):
        hd_product_img = search_hd_product_image(analysis['search_query'])
        if hd_product_img:
            with open("output_hd_product.jpg", "wb") as f:
                f.write(hd_product_img)
            print("   Saved: output_hd_product.jpg (HD from web)")
    
    # 3. Flux Background
    background_bytes = flux_generate_background(analysis['context_prompt'])
    
    if background_bytes:
        with open("output_background.jpg", "wb") as f:
            f.write(background_bytes)
        print("   Saved: output_background.jpg")
    
    phase1_time = time.time() - phase1_start
    print(f"\n⏱️ Phase 1 Time: {phase1_time:.1f}s | Cost: ~৳0.10")
    
    # ========================================
    # PHASE 2: SIMPLE FUSION (No Rembg, no complex steps)
    # User photo + Google HD images → Flux fusion → Wan Video
    # ========================================
    print("\n" + "=" * 60)
    print("� PHASE 2: Multi-Reference Product Fusion")
    print("=" * 60)
    
    phase2_start = time.time()
    
    # Flux will use user's image + HD references to create perfect product
    print("🎨 [Flux] Fusing user photo with HD references...")
    
    # Prepare prompt with product info from Qwen
    fusion_prompt = f"""Create a PERFECT professional product photo of {analysis['product_name']}.
The product should look exactly like the reference images but with:
- Studio lighting, clean white background
- Sharp focus, 8K quality  
- Commercial advertisement style
- No hands, no cut-off parts, complete product visible
- Premium polished look"""

    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    # Send user image + prompt to Flux
    img_base64 = base64.b64encode(product_img).decode('utf-8')
    
    flux_payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": fusion_prompt,
        "image_size": "768x1024"
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=flux_payload, timeout=90)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                img_url = result['images'][0].get('url')
                if img_url:
                    fused_product = requests.get(img_url, timeout=30).content
                    
                    with open("output_fused_product.jpg", "wb") as f:
                        f.write(fused_product)
                    print(f"✅ Product fused! ({len(fused_product)/1024:.1f}KB)")
                    print("   Saved: output_fused_product.jpg")
        else:
            print(f"⚠️ Flux error: {response.status_code}")
            fused_product = hd_product_img if hd_product_img else product_img
    except Exception as e:
        print(f"⚠️ Fusion error: {e}")
        fused_product = hd_product_img if hd_product_img else product_img
    
    # Use HD image if found, else user's photo
    final_product = hd_product_img if hd_product_img else product_img
    
    # Quick merge with background (simple)
    if background_bytes and final_product:
        # Remove background from HD product
        print("✂️ Quick background removal...")
        product_png = remove_background.remote(final_product)
        
        if product_png:
            merged_img = merge_images_local(background_bytes, product_png)
            if merged_img:
                with open("output_merged.jpg", "wb") as f:
                    f.write(merged_img)
                print("✅ Merged with background!")
        else:
            merged_img = final_product
    else:
        merged_img = final_product
    
    # 5 & 6. Video + Audio (Parallel on Modal)
    wan = WanTurbo()
    music = MusicGenerator()
    
    # Start parallel generation - Wan takes MERGED IMAGE (cutout + Flux background)!
    print("🎬 Passing MERGED image (cutout + Flux background) to Wan I2V...")
    video_future = wan.generate.spawn(merged_img, analysis['video_prompt'], 5)
    audio_future = music.compose.spawn(analysis['audio_prompt'], 7)
    
    # Wait for both
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
    
    video_url = merge_and_upload.remote(video_bytes, audio_bytes)
    
    phase3_time = time.time() - phase3_start
    print(f"\n⏱️ Phase 3 Time: {phase3_time:.1f}s | Cost: ~৳0.05")
    
    # ========================================
    # FINAL RESULT
    # ========================================
    total_time = time.time() - total_start
    total_cost = 0.10 + 1.00 + 0.05  # ৳1.15
    
    print("\n" + "=" * 60)
    print("🎉 PIPELINE COMPLETE!")
    print("=" * 60)
    print(f"\n⏱️ Total Time: {total_time:.1f}s")
    print(f"💰 Estimated Cost: ৳{total_cost:.2f}")
    print(f"\n📊 Breakdown:")
    print(f"   Phase 1 (SiliconFlow): {phase1_time:.1f}s")
    print(f"   Phase 2 (Modal GPU):   {phase2_time:.1f}s")
    print(f"   Phase 3 (Upload):      {phase3_time:.1f}s")
    print(f"\n🎬 Video URL: {video_url}")
    print(f"\n📊 Analysis:")
    print(f"   Product: {analysis['product_name']}")
    print(f"   Context: {analysis['context_prompt'][:60]}...")
    
    return {
        "video_url": video_url,
        "analysis": analysis,
        "total_time": total_time,
        "total_cost": total_cost
    }
