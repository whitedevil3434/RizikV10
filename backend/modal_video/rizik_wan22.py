"""
Rizik Wan 2.2 TURBO Engine (Optimized)
=======================================
Model: Wan-AI/Wan2.1-T2V-1.3B-Diffusers (Fast distilled)
Optimizations:
  - Warm model caching (min_containers=1, keep_warm=True)
  - Distilled 1.3B model (10x faster than 14B)
  - Flash attention enabled
  - Reduced frames (5 seconds)
  - Reduced inference steps (20)
  
GPU: H100 80GB
Target: <60 seconds per video
"""

import modal
import os

# ------------------------------------------------------------------
# Persistent Storage for Model Caching
# ------------------------------------------------------------------

model_volume = modal.Volume.from_name("rizik-wan22-turbo-cache", create_if_missing=True)

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    .pip_install(
        "torch>=2.4.0",
        "diffusers>=0.33.0",
        "transformers>=4.40.0",
        "accelerate>=0.28.0",
        "sentencepiece",
        "ftfy",
        "imageio[ffmpeg]",
        "requests",
        "Pillow",
        "huggingface_hub",
        "xformers",  # Flash attention
    )
)

app = modal.App("rizik-wan22-turbo", image=image)

# ------------------------------------------------------------------
# Wan 2.2 TURBO Engine (Optimized)
# ------------------------------------------------------------------

@app.cls(
    gpu="H100",
    volumes={"/cache": model_volume},
    timeout=600,
    container_idle_timeout=300,  # Keep warm for 5 minutes
    min_containers=1,  # Always keep 1 container warm
    secrets=[modal.Secret.from_dict({
        "CLOUDFLARE_ACCOUNT_ID": "e8181864e56d18f34edf61eeed4975cd",
        "CLOUDFLARE_API_TOKEN": "b4a229ef169f5f15c3d8ecdff053008aaff1c",
        "CLOUDFLARE_EMAIL": "its.sabbir69@gmail.com",
    })],
)
class Wan22TurboEngine:
    
    @modal.enter()
    def preload(self):
        """Preload Wan 2.1 1.3B distilled pipeline (FAST)."""
        import torch
        from diffusers import WanPipeline
        
        os.environ["HF_HOME"] = "/cache/huggingface"
        os.environ["TRANSFORMERS_CACHE"] = "/cache/huggingface"
        
        print("🚀 Wan 2.2 TURBO Engine (Optimized)")
        print(f"🖥️ GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.0f} GB")
        
        # Use 1.3B distilled model (10x faster than 14B)
        print("📦 Loading Wan 2.1 T2V-1.3B (Distilled, Fast)...")
        
        self.pipe = WanPipeline.from_pretrained(
            "Wan-AI/Wan2.1-T2V-1.3B-Diffusers",
            torch_dtype=torch.bfloat16,
            cache_dir="/cache/models",
        )
        
        # Full GPU power
        self.pipe.to("cuda")
        
        # Enable memory optimizations
        self.pipe.vae.enable_tiling()
        
        # Enable flash attention (xformers)
        try:
            self.pipe.enable_xformers_memory_efficient_attention()
            print("✅ Flash Attention ENABLED!")
        except Exception as e:
            print(f"⚠️ Flash attention not available: {e}")
        
        print("✅ Wan 2.2 TURBO Pipeline READY!")

    @modal.method()
    def generate(self, prompt: str, duration_sec: int = 5) -> str:
        """Generate video FAST with optimized settings."""
        import time
        import torch
        import requests
        from diffusers.utils import export_to_video
        
        start = time.time()
        print(f"🎬 Prompt: {prompt[:80]}...")
        print(f"⏱️ Duration: {duration_sec} seconds (TURBO mode)")
        
        # Calculate frames (16fps) - optimized for 5 seconds
        num_frames = duration_sec * 16 + 1
        num_frames = ((num_frames - 1) // 4) * 4 + 1  # Valid frame count
        
        with torch.inference_mode():
            output = self.pipe(
                prompt=prompt,
                negative_prompt="blurry, low quality, distorted, watermark, text, logo, ugly, deformed",
                height=832,   # Vertical
                width=480,
                num_frames=num_frames,
                num_inference_steps=20,  # Reduced from 30 for speed
                guidance_scale=5.0,
                generator=torch.Generator(device="cuda").manual_seed(42),
            )
        
        frames = output.frames[0]
        infer_time = time.time() - start
        print(f"🔥 Inference: {infer_time:.1f}s ({len(frames)} frames)")
        
        # Export at 16fps
        output_path = "/tmp/wan22_turbo.mp4"
        export_to_video(frames, output_path, fps=16)
        
        # Upload to R2
        account_id = os.environ["CLOUDFLARE_ACCOUNT_ID"]
        api_key = os.environ["CLOUDFLARE_API_TOKEN"]
        filename = f"wan22_turbo/{int(time.time())}.mp4"
        
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/rizik-storage-v1/objects/{filename}"
        headers = {"X-Auth-Email": os.environ["CLOUDFLARE_EMAIL"], "X-Auth-Key": api_key}
        
        with open(output_path, "rb") as f:
            requests.put(url, headers=headers, data=f.read())
        
        os.remove(output_path)
        
        total = time.time() - start
        public_url = f"https://pub-b00b750231d04ca29f9683a360790349.r2.dev/{filename}"
        print(f"✅ Done in {total:.1f}s: {public_url}")
        
        return public_url

# ------------------------------------------------------------------
# Main
# ------------------------------------------------------------------

@app.local_entrypoint()
def main():
    print("🚀 Rizik Wan 2.2 TURBO Engine")
    print("=" * 50)
    
    engine = Wan22TurboEngine()
    
    # PRAN Bangladesh Production Marketing Ad
    prompt = """Cinematic beverage commercial for PRAN company Bangladesh, camera pans through modern kitchen scene, refreshing mango juice being poured into glass with ice cubes splashing, family sitting at dining table smiling and drinking PRAN juice, clean white text overlay saying PRAN appearing on screen, bright colorful packaging visible, fresh tropical fruits in background, warm golden hour lighting, happy children enjoying drinks, professional product photography style, appetizing advertisement, vertical mobile format"""
    
    url = engine.generate.remote(prompt, duration_sec=5)
    
    print("\n" + "=" * 50)
    print("🎉 COMPLETE!")
    print(f"📹 Video: {url}")
