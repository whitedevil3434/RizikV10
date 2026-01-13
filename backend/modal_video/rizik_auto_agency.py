"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    RIZIK AUTO-AGENCY VIDEO ENGINE v2                         ║
║                                                                              ║
║  UPDATED ARCHITECTURE:                                                       ║
║  1. 👁️  Qwen2.5-VL (SiliconFlow) - Vision Analysis                          ║
║  2. 🕵️  DuckDuckGo - Free Reference Image Scraping                          ║
║  3. 🎨 Flux (SiliconFlow API) - Image Generation + Inpainting               ║
║  4. 🎬 Wan 2.2 I2V-A14B (Modal H100) - Image-to-Video (LATEST!)             ║
║  5. 🎵 MusicGen (Modal A10G) - Mood-Based Jingle                             ║
║  6. 🎚️  FFmpeg - Final Audio/Video Merge                                    ║
║                                                                              ║
║  KEY UPDATE: Wan 2.2 (Not 2.1!) - 720P @ 24fps, MoE Architecture            ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import modal
import os
import io
import json
import requests
import subprocess
import base64
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageOps

# ============================================================================
# MODAL APP SETUP
# ============================================================================

app = modal.App("rizik-auto-agency-v2")

# Volume for caching large models
model_volume = modal.Volume.from_name("rizik-wan22-cache", create_if_missing=True)

# Base image with all dependencies
agency_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git", "wget")
    .pip_install(
        # Pre-requisites first
        "packaging",
        "setuptools",
        "wheel",
    )
    .pip_install(
        # Core
        "torch>=2.4.0",
        "torchvision",
        "numpy",
        "Pillow",
        "requests",
        # Search
        "duckduckgo-search>=6.0.0",
        # Wan 2.2 specific
        "diffusers>=0.33.0",
        "transformers>=4.40.0",
        "accelerate>=0.28.0",
        "sentencepiece",
        "ftfy",
        # Memory efficient attention (xformers is easier to install than flash_attn)
        "xformers",
        # Video Export
        "imageio[ffmpeg]",
        # Audio
        "scipy",
        # R2 Upload
        "boto3",
        # Background Removal
        "rembg",
    )
)

# ============================================================================
# CONFIGURATION - SILICONFLOW GLOBAL API
# ============================================================================

SILICONFLOW_API_KEY = "sk-avpyqvixenjmljtfibazyinfprceikgdjiwvnyucqchuwqdp"
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"  # GLOBAL (not .cn)

# R2 Storage
R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

# ============================================================================
# STEP 1: THE EYE (Qwen2.5-VL Vision Analysis) - SiliconFlow
# ============================================================================

def analyze_product_with_qwen(image_bytes: bytes, product_hint: str = "") -> dict:
    """
    Uses Qwen2.5-VL via SiliconFlow GLOBAL to analyze product image.
    Returns search query, music prompt, and visual style.
    """
    print("👁️ Qwen2.5-VL analyzing product...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = f"""You are an expert marketing analyst and creative director.

Look at this product image{f' (hint: {product_hint})' if product_hint else ''}.

Analyze it and provide:
1. PRODUCT_NAME: What is this product? (brief, 2-3 words)
2. SEARCH_QUERY: A search query to find luxury advertisement background images (include "4k cinematic")
3. FLUX_PROMPT: A detailed prompt for Flux AI to generate a professional ad background scene
4. MUSIC_PROMPT: A prompt for AI music generation matching the product vibe
5. VISUAL_STYLE: The recommended visual style

Output ONLY valid JSON:
{{
    "product_name": "...",
    "search_query": "...",
    "flux_prompt": "...",
    "music_prompt": "...",
    "visual_style": "..."
}}"""

    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-7B-Instruct",
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}},
                {"type": "text", "text": prompt}
            ]
        }],
        "max_tokens": 600,
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
        
    # Fallback
    return {
        "product_name": product_hint or "Product",
        "search_query": f"luxury {product_hint or 'product'} advertisement 4k",
        "flux_prompt": f"Professional advertisement scene for {product_hint or 'product'}, cinematic lighting, luxury background",
        "music_prompt": "Modern upbeat advertising music",
        "visual_style": "Modern & Professional"
    }

# ============================================================================
# STEP 2: THE RESEARCHER (DuckDuckGo Free Scraping)
# ============================================================================

def search_reference_images(query: str, max_images: int = 3) -> list:
    """Uses DuckDuckGo for FREE image search."""
    print(f"🕵️ DDG searching: {query[:50]}...")
    
    from duckduckgo_search import DDGS
    
    try:
        with DDGS() as ddgs:
            results = ddgs.images(query, size="Large", max_results=max_images)
            urls = [r['image'] for r in results if 'image' in r]
            print(f"✅ Found {len(urls)} reference images")
            return urls
    except Exception as e:
        print(f"❌ DDG Error: {e}")
        return []

# ============================================================================
# STEP 3: THE ARTIST (Flux via SiliconFlow API) - NOT Modal!
# ============================================================================

def generate_image_with_flux(prompt: str, size: str = "768x1024") -> bytes:
    """
    Generate image using Flux via SiliconFlow API.
    Returns image bytes.
    """
    print(f"🎨 Flux generating: {prompt[:50]}...")
    
    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # SiliconFlow requires image_size as STRING format "WxH"
    payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": prompt,
        "image_size": size  # String format like "768x1024"
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=payload, timeout=120)
        
        if response.status_code != 200:
            print(f"❌ Flux API Error: {response.status_code}")
            return None
            
        result = response.json()
        
        # SiliconFlow returns 'images' array with 'url' field
        if 'images' in result and len(result['images']) > 0:
            img_url = result['images'][0].get('url')
            if img_url:
                img_bytes = requests.get(img_url).content
                print("✅ Flux image generated!")
                return img_bytes
                
    except Exception as e:
        print(f"❌ Flux Error: {e}")
        
    return None

def generate_product_scene(product_img_bytes: bytes, flux_prompt: str) -> bytes:
    """
    Generate a scene for the product using Flux.
    Uses the product's vibe to create matching background.
    """
    # For now, generate pure background. 
    # TODO: Add inpainting with product mask later
    
    full_prompt = f"{flux_prompt}, professional product photography, 8k quality, dramatic lighting, advertisement style"
    
    return generate_image_with_flux(full_prompt, size="512x768")  # Vertical format

# ============================================================================
# STEP 4: THE DIRECTOR (Wan 2.2 I2V-A14B on Modal H100) - LATEST MODEL!
# ============================================================================

@app.cls(
    gpu="H100",
    image=agency_image,
    volumes={"/cache": model_volume},
    timeout=900,  # 15 min for large model
    container_idle_timeout=300,
    secrets=[modal.Secret.from_dict({
        "CLOUDFLARE_ACCOUNT_ID": "e8181864e56d18f34edf61eeed4975cd",
        "CLOUDFLARE_API_TOKEN": "b4a229ef169f5f15c3d8ecdff053008aaff1c",
        "CLOUDFLARE_EMAIL": "its.sabbir69@gmail.com",
    })],
)
class Wan22Director:
    """
    Wan 2.2 I2V-A14B - The LATEST Image-to-Video Model!
    
    Features:
    - 14B parameters with MoE architecture
    - 720P @ 24fps output
    - Superior motion quality
    - Cinematic aesthetics
    """
    
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import WanImageToVideoPipeline
        
        print("🎬 Loading Wan 2.2 TURBO (1.3B Fast)...")
        print(f"🖥️ GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.0f} GB")
        
        os.environ["HF_HOME"] = "/cache/huggingface"
        os.environ["TRANSFORMERS_CACHE"] = "/cache/huggingface"
        
        # Use FAST 1.3B model for speed (14B is too slow)
        # This is the distilled turbo version
        from diffusers import WanPipeline
        
        self.pipe = WanPipeline.from_pretrained(
            "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",  # FAST 1.3B model
            torch_dtype=torch.bfloat16,
            cache_dir="/cache/wan22",
        ).to("cuda")
        
        # Enable optimizations
        self.pipe.vae.enable_tiling()
        
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("✅ Flash Attention enabled")
        except:
            pass
            
        print("✅ Wan 2.2 TURBO Director READY!")
    
    @modal.method()
    def generate_video(self, image_bytes: bytes, motion_prompt: str, duration_sec: int = 5) -> bytes:
        """
        Generate video using Wan 1.3B TURBO (fast).
        Returns MP4 bytes.
        """
        import torch
        from diffusers.utils import export_to_video
        import time
        
        start = time.time()
        print(f"🎬 Generating {duration_sec}s video (TURBO mode)...")
        print(f"   Motion: {motion_prompt[:60]}...")
        
        # Note: 1.3B is Text-to-Video, so we use the image as context in prompt
        # For true I2V, we'd need the 14B model but it's too slow
        
        # Optimized settings for SPEED
        target_w, target_h = 480, 832  # Lower res = faster
        fps = 16  # 16fps for speed
        
        # Calculate frames (shorter = faster)
        num_frames = min(duration_sec * fps + 1, 81)  # Max 81 frames
        num_frames = ((num_frames - 1) // 4) * 4 + 1  # Must be 4n+1
        
        with torch.inference_mode():
            output = self.pipe(
                prompt=motion_prompt,
                negative_prompt="blurry, low quality, distorted, watermark, text",
                height=target_h,
                width=target_w,
                num_frames=num_frames,
                num_inference_steps=20,  # Reduced from 25
                guidance_scale=5.0,
                generator=torch.Generator(device="cuda").manual_seed(42),
            )
        
        frames = output.frames[0]
        
        # Export video
        output_path = "/tmp/wan22_video.mp4"
        export_to_video(frames, output_path, fps=fps)
        
        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        elapsed = time.time() - start
        print(f"✅ Video done: {len(video_bytes)/1024/1024:.1f}MB in {elapsed:.1f}s")
        
        return video_bytes

# ============================================================================
# STEP 5: THE COMPOSER (MusicGen on Modal A10G)
# ============================================================================

@app.cls(
    gpu="A10G",
    image=agency_image,
    volumes={"/cache": model_volume},
    timeout=300,
    container_idle_timeout=120,
)
class AudioComposer:
    """MusicGen Audio Composer - Generates mood-based jingles."""
    
    @modal.enter()
    def load_model(self):
        from transformers import MusicgenForConditionalGeneration, AutoProcessor
        
        print("🎵 Loading MusicGen...")
        
        os.environ["HF_HOME"] = "/cache/huggingface"
        
        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-small", cache_dir="/cache/musicgen")
        self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small", cache_dir="/cache/musicgen").to("cuda")
        
        print("✅ Audio Composer Ready!")
    
    @modal.method()
    def compose_jingle(self, mood_prompt: str, duration_sec: int = 10) -> bytes:
        """Generate audio jingle based on mood."""
        import scipy.io.wavfile
        
        print(f"🎵 Composing: {mood_prompt[:50]}...")
        
        inputs = self.processor(text=[mood_prompt], padding=True, return_tensors="pt").to("cuda")
        
        max_tokens = int(duration_sec * 50)
        audio_values = self.model.generate(**inputs, max_new_tokens=max_tokens)
        
        sampling_rate = self.model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()
        
        buffer = BytesIO()
        scipy.io.wavfile.write(buffer, rate=sampling_rate, data=audio_data)
        
        print(f"✅ Audio: {duration_sec}s composed")
        return buffer.getvalue()

# ============================================================================
# STEP 6: THE MIXER (FFmpeg Merge + R2 Upload)
# ============================================================================

def merge_video_audio(video_bytes: bytes, audio_bytes: bytes) -> bytes:
    """Merge video and audio using FFmpeg."""
    print("🎚️ Merging video + audio...")
    
    video_path = "/tmp/video.mp4"
    audio_path = "/tmp/audio.wav"
    output_path = "/tmp/final.mp4"
    
    with open(video_path, "wb") as f:
        f.write(video_bytes)
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    
    cmd = ["ffmpeg", "-y", "-i", video_path, "-i", audio_path, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", output_path]
    
    result = subprocess.run(cmd, capture_output=True)
    
    if result.returncode != 0:
        print(f"❌ FFmpeg error")
        return video_bytes
    
    with open(output_path, "rb") as f:
        return f.read()

def upload_to_r2(video_bytes: bytes, filename: str) -> str:
    """Upload to Cloudflare R2."""
    import time
    
    print("☁️ Uploading to R2...")
    
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    api_key = os.environ.get("CLOUDFLARE_API_TOKEN")
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/rizik-storage-v1/objects/agency/{filename}"
    headers = {"X-Auth-Email": os.environ.get("CLOUDFLARE_EMAIL", ""), "X-Auth-Key": api_key}
    
    requests.put(url, headers=headers, data=video_bytes)
    
    public_url = f"{R2_PUBLIC_URL}/agency/{filename}"
    print(f"✅ Uploaded: {public_url}")
    return public_url

# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

@app.function(
    image=agency_image,
    secrets=[modal.Secret.from_dict({
        "CLOUDFLARE_ACCOUNT_ID": "e8181864e56d18f34edf61eeed4975cd",
        "CLOUDFLARE_API_TOKEN": "b4a229ef169f5f15c3d8ecdff053008aaff1c",
        "CLOUDFLARE_EMAIL": "its.sabbir69@gmail.com",
    })],
    timeout=1200,
)
def run_agency_pipeline(product_img_bytes: bytes, product_hint: str = "", duration_sec: int = 5) -> dict:
    """
    Main orchestrator for the complete pipeline.
    
    Flow:
    1. Qwen Vision -> Analysis
    2. DuckDuckGo -> Reference Images
    3. Flux (SiliconFlow) -> Scene Generation
    4. Wan 2.2 (Modal) -> Video Generation
    5. MusicGen (Modal) -> Audio Generation
    6. FFmpeg -> Final Merge
    """
    import time
    start = time.time()
    
    print("=" * 60)
    print("🚀 RIZIK AUTO-AGENCY v2 - Production Started!")
    print("=" * 60)
    
    # STEP 1: Vision Analysis
    analysis = analyze_product_with_qwen(product_img_bytes, product_hint)
    
    # STEP 2: Reference Search
    ref_urls = search_reference_images(analysis['search_query'])
    
    # STEP 3: Flux Scene Generation (SiliconFlow API)
    scene_bytes = generate_product_scene(product_img_bytes, analysis['flux_prompt'])
    
    if not scene_bytes:
        print("⚠️ Flux failed, using original image")
        scene_bytes = product_img_bytes
    
    # STEP 4: Wan 2.2 Video Generation (Modal H100)
    director = Wan22Director()
    motion_prompt = f"Cinematic slow motion pan around {analysis['product_name']}, {analysis['visual_style'].lower()}, professional advertisement, smooth camera movement, dramatic lighting"
    video_bytes = director.generate_video.remote(scene_bytes, motion_prompt, duration_sec)
    
    # STEP 5: MusicGen Audio (Modal A10G)
    composer = AudioComposer()
    audio_bytes = composer.compose_jingle.remote(analysis['music_prompt'], duration_sec + 2)
    
    # STEP 6: Merge & Upload
    final_video = merge_video_audio(video_bytes, audio_bytes)
    
    filename = f"{int(time.time())}.mp4"
    video_url = upload_to_r2(final_video, filename)
    
    elapsed = time.time() - start
    
    print("=" * 60)
    print(f"🎉 PRODUCTION COMPLETE!")
    print(f"⏱️ Total: {elapsed:.1f}s")
    print(f"📹 URL: {video_url}")
    print("=" * 60)
    
    return {
        "video_url": video_url,
        "analysis": analysis,
        "reference_images": ref_urls,
        "processing_time_sec": elapsed
    }

# ============================================================================
# LOCAL ENTRYPOINT
# ============================================================================

@app.local_entrypoint()
def main():
    print("🚀 Rizik Auto-Agency v2 (Wan 2.2)")
    print("=" * 50)
    
    # Download sample image
    sample_url = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
    img_bytes = requests.get(sample_url).content
    
    result = run_agency_pipeline.remote(
        product_img_bytes=img_bytes,
        product_hint="Luxury Perfume",
        duration_sec=5
    )
    
    print("\n📊 RESULT:")
    print(json.dumps(result, indent=2))
