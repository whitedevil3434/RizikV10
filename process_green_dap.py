from PIL import Image, ImageDraw, ImageOps
import numpy as np

def process_green_circle(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # 1. Auto-crop to remove excess white space first
    bbox = ImageOps.invert(img.convert("RGB")).getbbox()
    if bbox:
        img = img.crop(bbox)
        
    width, height = img.size
    
    # 2. Create a circular mask
    # The user wants the "entire circle/green thing".
    # Assuming the image content is roughly centered and circular.
    # Let's detect the green circle bounds or just flood fill the outside white.
    
    # Flood fill approach is safer for non-perfect circles or contained shapes.
    # Fill from corners with transparency.
    # Target "white" background.
    
    # Convert to mutable
    data = np.array(img)
    
    # Standard floodfill using PIL ImageDraw
    # Fill (0,0) and other corners if they are white
    seed_points = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for point in seed_points:
        # Get pixel color at seed
        pixel = img.getpixel(point)
        # Check if it's near white (background)
        if sum(pixel[:3]) > 700: # 230*3 approx
            try:
                ImageDraw.floodfill(img, point, (0, 0, 0, 0), thresh=50)
            except:
                pass

    # Crop again to tight bounds of the visible circle
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path)
    print(f"Processed green circle and saved to {output_path}")

if __name__ == "__main__":
    input_file = "/Users/sabbir/.gemini/antigravity/brain/cf273d00-7e36-405e-bf76-a2e94f724f9f/uploaded_image_1768425187095.jpg"
    output_file = "/Users/sabbir/RizikV10/assets/icons/dap_green_circle.png"
    process_green_circle(input_file, output_file)
