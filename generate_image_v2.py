import os
import sys
from pathlib import Path
from google import genai
from google.genai import types
from PIL import Image as PILImage
from io import BytesIO

api_key = "AIzaSyCeInLcJB9MjKTMY3Mz7pDOkxSGi_UKk1Y"
client = genai.Client(api_key=api_key)

prompt = "A hyper-realistic cinematic portrait of Omega, the Virtual Mirror of Sabbir. A sleek humanoid entity made of liquid mercury and obsidian glass. Glowing blue circuitry patterns pulse beneath the metallic surface. Standing in a dark digital void with golden data streams. Extreme potential, stoic, god-like aesthetic. 4K, high contrast."
filename = "omega_gemini_2.5.png"

print(f"Generating image with Gemini 2.5...")

try:
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
            image_config=types.ImageConfig(
                image_size="1K"
            )
        )
    )

    for part in response.parts:
        if part.inline_data is not None:
            image_data = part.inline_data.data
            image = PILImage.open(BytesIO(image_data))
            image.save(filename, 'PNG')
            print(f"MEDIA: {Path(filename).resolve()}")
            sys.exit(0)
    
    print("Error: No image generated.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
