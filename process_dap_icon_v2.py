from PIL import Image, ImageDraw

def process_icon_flood(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Assumption: Corners are background.
    # ImageDraw.floodfill fills a region of similar color.
    # We want to make the white background transparent.
    # Target color: (0, 0, 0, 0)
    # Threshold: 50 (to catch near-white pixels)
    
    # We can try flood filling from all 4 corners to be safe
    width, height = img.size
    seed_points = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for point in seed_points:
        try:
            ImageDraw.floodfill(img, point, (0, 0, 0, 0), thresh=50)
        except Exception as e:
            print(f"Floodfill error at {point}: {e}")
            # Fallback: Simple threshold if floodfill fails or old Pillow
            pass

    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path)
    print(f"Processed (flood fill) and saved to {output_path}")

if __name__ == "__main__":
    input_file = "/Users/sabbir/.gemini/antigravity/brain/cf273d00-7e36-405e-bf76-a2e94f724f9f/uploaded_image_1768423214178.png"
    output_file = "/Users/sabbir/RizikV10/assets/icons/dap_fist_bump.png"
    process_icon_flood(input_file, output_file)
