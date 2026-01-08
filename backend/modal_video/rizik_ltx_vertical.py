"""
Rizik LTX-Video Pipeline - AI Video Generation for Feed Backdrops

Uses:
- Flux (SCHNELL) for image generation
- LTX-Video for animation (image-to-video)
- FFmpeg for WebP conversion
- Cloudflare R2 for storage

Run: python3 -m modal run rizik_ltx_vertical.py
"""

import modal
import tempfile
import time
import os
import gc

# Modal App
app = modal.App("rizik-ltx-engine")

# GPU Image with all dependencies
ltx_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg", "git")
    .pip_install(
        "torch>=2.1.0",
        "diffusers>=0.32.0",
        "transformers>=4.36.0",
        "accelerate>=0.25.0",
        "sentencepiece",
        "protobuf",
        "imageio[ffmpeg]",
        "requests",
    )
)

# Configuration
LTX_CONFIG = {
    "flux_model": "black-forest-labs/FLUX.1-schnell",
    "ltx_model": "Lightricks/LTX-Video",
    "width": 480,
    "height": 848,  # 9:16 vertical
    "num_frames": 65,  # ~5 seconds
    "fps": 15,
    "flux_steps": 4,
    "ltx_steps": 30,
    "ltx_guidance": 3.0,
}

@app.cls(
    image=ltx_image,
    gpu="A100",
    timeout=600,
    secrets=[modal.Secret.from_name("cloudflare-secrets")],
    volumes={"/model_cache": modal.Volume.from_name("rizik-model-cache", create_if_missing=True)},
    scaledown_window=300,
)
class RizikLTXEngine:
    
    @modal.enter()
    def setup(self):
        import torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Rizik LTX Engine initialized on {self.device}")
        
        # Check for Cloudflare secrets
        if not os.environ.get("CLOUDFLARE_ACCOUNT_ID") or not os.environ.get("CLOUDFLARE_API_TOKEN"):
            print("⚠️ Cloudflare Secrets Missing! Upload will fail.")

    def _convert_to_webp(self, mp4_path: str) -> str:
        """Convert MP4 to animated WebP for Flutter Image widget."""
        import subprocess
        
        webp_path = mp4_path.replace(".mp4", ".webp")
        print(f"🔄 Converting {mp4_path} to animated WebP...")
        
        cmd = [
            "ffmpeg", "-y", "-i", mp4_path,
            "-vf", "fps=15,scale=480:-2:flags=lanczos",
            "-c:v", "libwebp_anim",
            "-quality", "75",
            "-lossless", "0",
            "-loop", "0",
            "-an",
            webp_path
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            if os.path.exists(webp_path):
                size = os.path.getsize(webp_path) / 1024
                print(f"✅ Conversion Complete. WebP Size: {size:.2f} KB")
                return webp_path
            else:
                raise Exception("FFmpeg failed to generate WebP file")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg Error: {e.stderr.decode()}")
            raise e

    def _upload_to_r2(self, file_path: str) -> str:
        """Upload file to Cloudflare R2 using S3-compatible API."""
        import requests
        
        account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
        api_key = os.environ.get("CLOUDFLARE_API_TOKEN")
        email = os.environ.get("CLOUDFLARE_EMAIL")
        
        if not account_id or not api_key:
            print("❌ Upload skipped: Missing Cloudflare secrets.")
            return None
        
        bucket_name = "rizik-storage-v1"
        timestamp = int(time.time())
        ext = file_path.split('.')[-1]
        filename = f"feed_videos/rizik_reel_{timestamp}.{ext}"
        
        content_type = "image/webp" if ext == "webp" else "video/avif"
        
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/{bucket_name}/objects/{filename}"
        
        headers = {
            "X-Auth-Email": email,
            "X-Auth-Key": api_key,
            "Content-Type": content_type
        }
        
        print(f"☁️ Uploading to R2: {filename}...")
        try:
            with open(file_path, "rb") as f:
                file_data = f.read()
                response = requests.put(url, headers=headers, data=file_data)
                
            if response.status_code in [200, 201]:
                public_url = f"https://pub-b00b750231d04ca29f9683a360790349.r2.dev/{filename}"
                print(f"✨ R2 Upload Success: {public_url}")
                return public_url
            else:
                print(f"❌ R2 Upload Failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Upload Error: {e}")
            return None

    @modal.method()
    def generate_and_publish(
        self,
        image_prompt: str,
        motion_prompt: str,
    ) -> dict:
        """Generate AI video and publish to R2."""
        import torch
        import imageio
        from diffusers import FluxPipeline, LTXImageToVideoPipeline
        from PIL import Image
        
        start_time = time.time()
        print(f"🎬 Starting Rizik Flow Generation...")
        print(f"📝 Image: {image_prompt[:50]}...")
        print(f"🎥 Motion: {motion_prompt[:50]}...")
        
        # Step 1: Flux Image Generation
        print("🖼️ [1/4] Flux Image Generation...")
        img_pipe = FluxPipeline.from_pretrained(
            LTX_CONFIG["flux_model"],
            torch_dtype=torch.bfloat16,
            cache_dir="/model_cache",
        )
        img_pipe.enable_model_cpu_offload()
        
        with torch.inference_mode():
            image = img_pipe(
                prompt=image_prompt,
                width=LTX_CONFIG["width"],
                height=LTX_CONFIG["height"],
                num_inference_steps=LTX_CONFIG["flux_steps"],
                guidance_scale=0.0,
            ).images[0]
            
        del img_pipe
        gc.collect()
        torch.cuda.empty_cache()
        
        # Step 2: LTX Video Animation
        print("🎥 [2/4] LTX Animation...")
        vid_pipe = LTXImageToVideoPipeline.from_pretrained(
            LTX_CONFIG["ltx_model"],
            torch_dtype=torch.bfloat16,
            cache_dir="/model_cache",
        )
        vid_pipe.enable_model_cpu_offload()
        
        negative_prompt = "worst quality, low quality, jittery, distorted, watermark"
        
        with torch.inference_mode():
            video_output = vid_pipe(
                image=image,
                prompt=motion_prompt,
                negative_prompt=negative_prompt,
                width=LTX_CONFIG["width"],
                height=LTX_CONFIG["height"],
                num_frames=LTX_CONFIG["num_frames"],
                num_inference_steps=LTX_CONFIG["ltx_steps"],
                guidance_scale=LTX_CONFIG["ltx_guidance"],
                generator=torch.Generator("cpu").manual_seed(42),
                output_type="np",
            ).frames[0]
            
        del vid_pipe
        gc.collect()
        torch.cuda.empty_cache()
        
        # Step 3: Save MP4 & Convert to WebP
        print("🔄 [3/4] FFmpeg Optimization...")
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_mp4:
            imageio.mimwrite(
                tmp_mp4.name,
                video_output,
                fps=LTX_CONFIG["fps"],
                codec="libx264",
                quality=8,
            )
            mp4_path = tmp_mp4.name
            
        webp_path = self._convert_to_webp(mp4_path)
        
        # Step 4: R2 Upload
        print("☁️ [4/4] Publishing to R2 Edge...")
        public_url = self._upload_to_r2(webp_path)
        upload_success = public_url is not None
        
        if not public_url:
            print("⚠️ Returning local fallback since cloud upload failed.")
            
        # Clean up
        if os.path.exists(mp4_path): os.remove(mp4_path)
        if os.path.exists(webp_path): os.remove(webp_path)
        
        total_time = time.time() - start_time
        
        return {
            "success": True,
            "cf_url": public_url,
            "upload_success": upload_success,
            "timing": f"{total_time:.2f}s",
        }


# API Endpoint
@app.function(image=ltx_image)
@modal.web_endpoint(method="POST")
def api(data: dict):
    """API endpoint for generating feed items."""
    engine = RizikLTXEngine()
    return engine.generate_and_publish.remote(
        image_prompt=data.get("image_prompt", "A beautiful sunset"),
        motion_prompt=data.get("motion_prompt", "gentle camera pan"),
    )


# Local test
@app.local_entrypoint()
def main():
    print("🚀 Triggering Rizik Cloud Pipeline...")
    engine = RizikLTXEngine()
    
    result = engine.generate_and_publish.remote(
        image_prompt="A stunning cyberpunk street food vendor cart at night, neon lights reflecting on wet streets, steam rising from sizzling food, ultra realistic, 8K quality",
        motion_prompt="slow camera dolly in, steam gently rising, neon lights flickering subtly, cinematic smooth movement",
    )
    
    print(f"\n🎉 Result: {result}")
