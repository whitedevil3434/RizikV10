"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              RIZIK AUTO-AGENCY v3 - OPTIMIZED ARCHITECTURE                  ║
║                                                                              ║
║  SPLIT EXECUTION:                                                            ║
║  ══════════════════════════════════════════════════════════════════════════  ║
║  🌐 LOCAL (SiliconFlow API - No Modal overhead):                             ║
║     1. Qwen Vision Analysis                                                  ║
║     2. Flux Image Generation                                                 ║
║                                                                              ║
║  🖥️ MODAL (GPU - Parallel execution):                                        ║
║     3. DuckDuckGo Search (CPU)                                               ║
║     4. Wan 2.2 TURBO Video (H100)                                            ║
║     5. MusicGen Audio (A10G)                                                 ║
║     6. FFmpeg Merge + R2 Upload                                              ║
║                                                                              ║
║  TARGET: 30-50 seconds total!                                               ║
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
from pathlib import Path
from io import BytesIO
from PIL import Image

# ============================================================================
# SILICONFLOW API CONFIG (Global - NOT .cn)
# ============================================================================

SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"

# R2 Storage
R2_PUBLIC_URL = "https://pub-b00b750231d04ca29f9683a360790349.r2.dev"

# ============================================================================
# LOCAL FUNCTIONS (SiliconFlow API - Run before Modal)
# ============================================================================

def qwen_vision_analyze(image_bytes: bytes, product_hint: str = "") -> dict:
    """
    [LOCAL] Uses Qwen2.5-VL via SiliconFlow API.
    Returns analysis dict with prompts.
    """
    print("👁️ [LOCAL] Qwen Vision analyzing...")
    
    img_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    prompt = f"""You are an expert marketing analyst.

Look at this product image{f' (hint: {product_hint})' if product_hint else ''}.

Provide:
1. PRODUCT_NAME: What is this? (2-3 words)
2. VIDEO_PROMPT: A cinematic video prompt for Wan AI
3. MUSIC_PROMPT: A music generation prompt

Output ONLY valid JSON:
{{"product_name": "...", "video_prompt": "...", "music_prompt": "..."}}"""

    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-7B-Instruct",
        "messages": [{"role": "user", "content": [
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}},
            {"type": "text", "text": prompt}
        ]}],
        "max_tokens": 400,
        "temperature": 0.3
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        content = response.json()['choices'][0]['message']['content']
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            analysis = json.loads(json_match.group())
            print(f"✅ [LOCAL] Product: {analysis['product_name']}")
            return analysis
    except Exception as e:
        print(f"❌ Qwen Error: {e}")
    
    return {
        "product_name": product_hint or "Product",
        "video_prompt": f"Cinematic advertisement for {product_hint or 'product'}, professional lighting",
        "music_prompt": "Modern upbeat advertising music"
    }


def flux_generate_scene(prompt: str) -> bytes:
    """
    [LOCAL] Uses Flux via SiliconFlow API.
    Returns image bytes.
    """
    print(f"🎨 [LOCAL] Flux generating scene...")
    
    headers = {"Authorization": f"Bearer {SILICONFLOW_API_KEY}", "Content-Type": "application/json"}
    
    payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": f"{prompt}, professional product photography, cinematic, 8k quality",
        "image_size": "768x1024"
    }
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            if 'images' in result and len(result['images']) > 0:
                img_url = result['images'][0].get('url')
                if img_url:
                    img_bytes = requests.get(img_url, timeout=30).content
                    print("✅ [LOCAL] Flux scene ready!")
                    return img_bytes
    except Exception as e:
        print(f"❌ Flux Error: {e}")
    
    return None


# ============================================================================
# MODAL APP SETUP
# ============================================================================

app = modal.App("rizik-agency-v3-fast")

model_volume = modal.Volume.from_name("rizik-wan22-v3-cache", create_if_missing=True)

# Lighter image - only what Modal needs
modal_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "packaging", "setuptools",
    )
    .pip_install(
        "torch>=2.4.0",
        "diffusers>=0.33.0",
        "transformers>=4.40.0",
        "accelerate>=0.28.0",
        "sentencepiece",
        "ftfy",  # Required by WanPipeline!
        "xformers",
        "imageio[ffmpeg]",
        "scipy",
        "Pillow",
        "requests",
        "duckduckgo-search>=6.0.0",
    )
)

# ============================================================================
# MODAL: DDG SEARCH (Runs in parallel with GPU tasks)
# ============================================================================

@app.function(image=modal_image, timeout=60)
def ddg_search(query: str, max_images: int = 3) -> list:
    """Search reference images."""
    from duckduckgo_search import DDGS
    
    print(f"🕵️ [MODAL] DDG searching...")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, size="Large", max_results=max_images))
            urls = [r['image'] for r in results if 'image' in r]
            print(f"✅ Found {len(urls)} images")
            return urls
    except:
        return []


# ============================================================================
# MODAL: WAN 2.2 TURBO (H100)
# ============================================================================

@app.cls(
    gpu="H100",
    image=modal_image,
    volumes={"/cache": model_volume},
    timeout=300,
    scaledown_window=300,  # Keep warm 5 min
)
class Wan22Turbo:
    """Wan 2.2 TURBO - Fast 1.3B model."""
    
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import WanPipeline
        
        print("🎬 [MODAL] Loading Wan 2.2 TURBO...")
        print(f"🖥️ GPU: {torch.cuda.get_device_name(0)}")
        
        os.environ["HF_HOME"] = "/cache/hf"
        
        self.pipe = WanPipeline.from_pretrained(
            "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
            torch_dtype=torch.bfloat16,
            cache_dir="/cache/wan",
        ).to("cuda")
        
        self.pipe.vae.enable_tiling()
        
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("✅ Flash Attention ON")
        except:
            pass
        
        print("✅ Wan 2.2 TURBO Ready!")
    
    @modal.method()
    def generate(self, prompt: str, duration_sec: int = 5) -> bytes:
        """Generate video."""
        import torch
        from diffusers.utils import export_to_video
        
        start = time.time()
        print(f"🎬 Generating {duration_sec}s video...")
        
        # Optimized settings
        fps = 16
        num_frames = min(duration_sec * fps + 1, 81)
        num_frames = ((num_frames - 1) // 4) * 4 + 1
        
        with torch.inference_mode():
            output = self.pipe(
                prompt=prompt,
                negative_prompt="blurry, low quality, distorted",
                height=832,
                width=480,
                num_frames=num_frames,
                num_inference_steps=20,
                guidance_scale=5.0,
                generator=torch.Generator("cuda").manual_seed(42),
            )
        
        frames = output.frames[0]
        
        output_path = "/tmp/video.mp4"
        export_to_video(frames, output_path, fps=fps)
        
        with open(output_path, "rb") as f:
            video_bytes = f.read()
        
        print(f"✅ Video: {time.time()-start:.1f}s")
        return video_bytes


# ============================================================================
# MODAL: MUSICGEN (A10G)
# ============================================================================

@app.cls(
    gpu="A10G",
    image=modal_image,
    volumes={"/cache": model_volume},
    timeout=120,
    scaledown_window=120,
)
class MusicGen:
    """MusicGen Audio Composer."""
    
    @modal.enter()
    def load_model(self):
        from transformers import MusicgenForConditionalGeneration, AutoProcessor
        
        print("🎵 [MODAL] Loading MusicGen...")
        os.environ["HF_HOME"] = "/cache/hf"
        
        self.processor = AutoProcessor.from_pretrained("facebook/musicgen-small", cache_dir="/cache/music")
        self.model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small", cache_dir="/cache/music").to("cuda")
        
        print("✅ MusicGen Ready!")
    
    @modal.method()
    def compose(self, prompt: str, duration_sec: int = 7) -> bytes:
        """Generate audio."""
        import scipy.io.wavfile
        
        print(f"🎵 Composing {duration_sec}s audio...")
        
        inputs = self.processor(text=[prompt], padding=True, return_tensors="pt").to("cuda")
        audio_values = self.model.generate(**inputs, max_new_tokens=int(duration_sec * 50))
        
        sampling_rate = self.model.config.audio_encoder.sampling_rate
        audio_data = audio_values[0, 0].cpu().numpy()
        
        buffer = BytesIO()
        scipy.io.wavfile.write(buffer, rate=sampling_rate, data=audio_data)
        
        print("✅ Audio done!")
        return buffer.getvalue()


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
    timeout=120,
)
def merge_and_upload(video_bytes: bytes, audio_bytes: bytes) -> str:
    """Merge video+audio and upload to R2."""
    import subprocess
    
    print("🎚️ Merging...")
    
    video_path = "/tmp/v.mp4"
    audio_path = "/tmp/a.wav"
    output_path = "/tmp/final.mp4"
    
    with open(video_path, "wb") as f:
        f.write(video_bytes)
    with open(audio_path, "wb") as f:
        f.write(audio_bytes)
    
    subprocess.run(["ffmpeg", "-y", "-i", video_path, "-i", audio_path, 
                   "-c:v", "copy", "-c:a", "aac", "-shortest", output_path],
                  capture_output=True)
    
    with open(output_path, "rb") as f:
        final_bytes = f.read()
    
    # Upload to R2
    filename = f"v3/{int(time.time())}.mp4"
    account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
    api_key = os.environ["CLOUDFLARE_API_TOKEN"]
    
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/rizik-storage-v1/objects/{filename}"
    headers = {"X-Auth-Email": os.environ["CLOUDFLARE_EMAIL"], "X-Auth-Key": api_key}
    
    requests.put(url, headers=headers, data=final_bytes, timeout=60)
    
    public_url = f"{R2_PUBLIC_URL}/{filename}"
    print(f"✅ Uploaded: {public_url}")
    return public_url


# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

@app.local_entrypoint()
def main():
    print("=" * 60)
    print("🚀 RIZIK AUTO-AGENCY v3 - FAST MODE")
    print("=" * 60)
    
    total_start = time.time()
    
    # Download sample image
    sample_url = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
    img_bytes = requests.get(sample_url).content
    
    # ========================================
    # PHASE 1: LOCAL (SiliconFlow API)
    # ========================================
    print("\n📡 PHASE 1: SiliconFlow API (Local)")
    print("-" * 40)
    
    local_start = time.time()
    
    # 1. Qwen Vision
    analysis = qwen_vision_analyze(img_bytes, "Luxury Backpack")
    
    # 2. Flux Scene (can be skipped if using product image directly)
    # scene_bytes = flux_generate_scene("professional backpack advertisement")
    
    local_time = time.time() - local_start
    print(f"⏱️ Local phase: {local_time:.1f}s")
    
    # ========================================
    # PHASE 2: MODAL (GPU - Parallel)
    # ========================================
    print("\n🖥️ PHASE 2: Modal GPU (Parallel)")
    print("-" * 40)
    
    modal_start = time.time()
    
    # Create instances
    wan = Wan22Turbo()
    music = MusicGen()
    
    # Start PARALLEL execution
    video_future = wan.generate.spawn(analysis['video_prompt'], 5)
    audio_future = music.compose.spawn(analysis['music_prompt'], 7)
    ddg_future = ddg_search.spawn("luxury backpack 4k", 3)
    
    # Wait for results
    video_bytes = video_future.get()
    audio_bytes = audio_future.get()
    ref_images = ddg_future.get()
    
    modal_time = time.time() - modal_start
    print(f"⏱️ Modal phase: {modal_time:.1f}s")
    
    # ========================================
    # PHASE 3: MERGE & UPLOAD
    # ========================================
    print("\n☁️ PHASE 3: Merge & Upload")
    print("-" * 40)
    
    video_url = merge_and_upload.remote(video_bytes, audio_bytes)
    
    # ========================================
    # FINAL RESULT
    # ========================================
    total_time = time.time() - total_start
    
    print("\n" + "=" * 60)
    print("🎉 PRODUCTION COMPLETE!")
    print("=" * 60)
    print(f"⏱️ Total Time: {total_time:.1f}s")
    print(f"   - Local (SiliconFlow): {local_time:.1f}s")
    print(f"   - Modal (GPU): {modal_time:.1f}s")
    print(f"📹 Video: {video_url}")
    print(f"📊 Analysis: {analysis}")
    print(f"🖼️ References: {ref_images}")
