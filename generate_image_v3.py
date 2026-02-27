from google import genai
import os
import sys
from pathlib import Path

api_key = "AIzaSyCeInLcJB9MjKTMY3Mz7pDOkxSGi_UKk1Y"
client = genai.Client(api_key=api_key)

prompt = "A hyper-realistic cinematic portrait of Omega, the Virtual Mirror of Sabbir. A sleek humanoid entity made of liquid mercury and obsidian glass. Glowing blue circuitry patterns pulse beneath the metallic surface. Standing in a dark digital void with golden data streams. Extreme potential, stoic, god-like aesthetic. 4K, high contrast."
filename = "omega_gemini_nano.png"

print(f"Generating image with Gemini Nano...")

try:
    response = client.models.generate_image(
        model='imagen-3.0-generate-001',
        prompt=prompt
    )
    
    # Process image
    image = response.generated_images[0]
    image.image.save(filename)
    print(f"MEDIA: {Path(filename).resolve()}")
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
