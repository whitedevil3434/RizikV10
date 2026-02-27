#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════╗
║          RIZIK AUTO-AGENCY - QUICK TEST SCRIPT                   ║
║                                                                   ║
║  This script lets you test the agency pipeline locally           ║
║  before deploying to Modal.                                      ║
╚═══════════════════════════════════════════════════════════════════╝

Usage:
    1. Test Qwen Vision only:
       python test_agency.py --test-vision my_product.jpg
       
    2. Test DuckDuckGo scraping only:
       python test_agency.py --test-ddg "luxury perfume"
       
    3. Full pipeline (requires Modal):
       modal run rizik_auto_agency.py
"""

import os
import sys
import argparse
import requests
import json
from io import BytesIO
from PIL import Image

# SiliconFlow API
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_BASE_URL = "https://api.siliconflow.com/v1"


def test_qwen_vision(image_path: str):
    """Test Qwen Vision analysis locally."""
    import base64
    
    print("👁️ Testing Qwen2.5-VL Vision Analysis...")
    print("-" * 50)
    
    # Load and encode image
    if image_path.startswith("http"):
        print(f"⬇️ Downloading: {image_path}")
        response = requests.get(image_path)
        img_bytes = response.content
    else:
        with open(image_path, "rb") as f:
            img_bytes = f.read()
    
    # Show image info
    img = Image.open(BytesIO(img_bytes))
    print(f"📷 Image Size: {img.size}")
    
    # Encode to base64
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
    
    # Build prompt
    prompt = """You are an expert marketing analyst and creative director.

Look at this product image.

Analyze it and provide:
1. PRODUCT_NAME: What is this product? (brief, 2-3 words)
2. SEARCH_QUERY: A Google search query to find luxury advertisement background images that would suit this product (include "4k cinematic" and relevant keywords)
3. MUSIC_PROMPT: A prompt for AI music generation that matches this product's vibe (mood, instruments, tempo)
4. VISUAL_STYLE: The recommended visual style (e.g., "Dark & Moody", "Bright & Fresh", "Elegant Minimal")

Output ONLY valid JSON in this format:
{
    "product_name": "...",
    "search_query": "...",
    "music_prompt": "...",
    "visual_style": "..."
}"""

    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "Qwen/Qwen2.5-VL-7B-Instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "max_tokens": 500,
        "temperature": 0.3
    }
    
    print("🌐 Calling SiliconFlow API...")
    
    try:
        response = requests.post(
            f"{SILICONFLOW_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        print("\n📝 Raw Response:")
        print(content)
        
        # Parse JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            analysis = json.loads(json_match.group())
            print("\n✅ Parsed Analysis:")
            print(json.dumps(analysis, indent=2))
            return analysis
        else:
            print("❌ No JSON found in response")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def test_ddg_search(query: str, max_images: int = 5):
    """Test DuckDuckGo image scraping."""
    from duckduckgo_search import DDGS
    
    print(f"🕵️ Testing DuckDuckGo Image Scraping...")
    print(f"   Query: {query}")
    print("-" * 50)
    
    try:
        with DDGS() as ddgs:
            results = ddgs.images(
                query,
                region="wt-wt",
                safesearch="off",
                size="Large",
                max_results=max_images
            )
            
        print(f"\n✅ Found {len(list(results))} images:")
        
        # Create output folder
        os.makedirs("test_images", exist_ok=True)
        
        for i, result in enumerate(results):
            url = result.get('image', 'N/A')
            title = result.get('title', 'N/A')[:50]
            print(f"   {i+1}. {title}...")
            print(f"      URL: {url[:80]}...")
            
            # Download image
            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    path = f"test_images/ref_{i+1}.jpg"
                    with open(path, "wb") as f:
                        f.write(response.content)
                    print(f"      ✅ Saved: {path}")
            except Exception as e:
                print(f"      ❌ Download failed: {e}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Rizik Agency Test Script")
    parser.add_argument("--test-vision", type=str, help="Test Qwen vision with image path/URL")
    parser.add_argument("--test-ddg", type=str, help="Test DuckDuckGo with search query")
    parser.add_argument("--test-flux", type=str, help="Test Flux image generation with prompt")
    parser.add_argument("--sample", action="store_true", help="Run with sample perfume image")
    
    args = parser.parse_args()
    
    if args.sample:
        sample_url = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"
        test_qwen_vision(sample_url)
        
    elif args.test_vision:
        test_qwen_vision(args.test_vision)
        
    elif args.test_ddg:
        test_ddg_search(args.test_ddg)
        
    elif args.test_flux:
        test_flux_image(args.test_flux)
        
    else:
        parser.print_help()
        print("\n" + "=" * 50)
        print("💡 Quick Test Examples:")
        print("=" * 50)
        print("\n1. Test Vision with sample:")
        print("   python3 test_agency.py --sample")
        print("\n2. Test Image Scraping:")
        print('   python3 test_agency.py --test-ddg "luxury perfume"')
        print("\n3. Test Flux Image Gen:")
        print('   python3 test_agency.py --test-flux "luxury perfume on water"')
        print("\n4. Full Pipeline (Modal):")
        print("   modal run rizik_auto_agency.py")


def test_flux_image(prompt: str):
    """Test SiliconFlow Flux image generation."""
    import base64
    
    print("🎨 Testing SiliconFlow Flux Image Generation...")
    print(f"   Prompt: {prompt}")
    print("-" * 50)
    
    headers = {
        "Authorization": f"Bearer {SILICONFLOW_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Correct format per SiliconFlow docs:
    # image_size is a STRING like "768x1024"
    payload = {
        "model": "black-forest-labs/FLUX.1-schnell",
        "prompt": f"{prompt}, professional advertising photography, 8k, cinematic lighting",
        "image_size": "768x1024"  # String format, not object!
    }
    
    print("🌐 Calling SiliconFlow Flux API...")
    print(f"   Model: {payload['model']}")
    print(f"   Size: {payload['image_size']}")
    
    try:
        response = requests.post(f"{SILICONFLOW_BASE_URL}/images/generations", headers=headers, json=payload, timeout=120)
        
        print(f"\n📡 Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Error: {response.text}")
            return
            
        result = response.json()
        print(f"📝 Response Keys: {result.keys()}")
        
        # SiliconFlow returns 'images' not 'data'
        if 'images' in result and len(result['images']) > 0:
            img_data = result['images'][0]
            
            if 'url' in img_data:
                print(f"✅ Image URL: {img_data['url']}")
                img_bytes = requests.get(img_data['url']).content
                with open("test_flux_output.jpg", "wb") as f:
                    f.write(img_bytes)
                print("✅ Downloaded: test_flux_output.jpg")
            else:
                print(f"⚠️ Response data: {img_data}")
        else:
            print(f"❌ Unexpected response: {result}")
            
    except Exception as e:
        print(f"❌ Flux Error: {e}")


if __name__ == "__main__":
    main()
