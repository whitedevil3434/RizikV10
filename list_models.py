from google import genai
import os

api_key = "AIzaSyCeInLcJB9MjKTMY3Mz7pDOkxSGi_UKk1Y"
client = genai.Client(api_key=api_key)

print("Listing models...")
for model in client.models.list():
    print(f"Model: {model.name}")
