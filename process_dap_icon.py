from PIL import Image
import numpy as np

def process_icon(input_path, output_path):
    # Open image
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)

    # Calculate brightness to distinguish white background from black content
    # R, G, B channels
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Simple threshold: if pixel is bright (near white), make it transparent
    # Using 200 as threshold (0-255)
    mask = (r > 200) & (g > 200) & (b > 200)
    
    # Make background transparent
    data[mask] = [255, 255, 255, 0]
    
    # Make foreground (black content) WHITE (so it can be tinted in Flutter)
    # Non-mask pixels are the content
    content_mask = ~mask
    # Check alpha channel too - if original alpha was 0, keep it 0
    # But this is likely valid overlapping logic. 
    # Just set RGB to 255 for content, keep alpha 255
    data[content_mask, 0:3] = 255
    # Ensure alpha is 255 for content
    data[content_mask, 3] = 255

    # Create new image
    new_img = Image.fromarray(data)
    
    # Crop to content
    bbox = new_img.getbbox()
    if bbox:
        new_img = new_img.crop(bbox)
        
    # Save
    new_img.save(output_path)
    print(f"Processed and saved to {output_path}")

if __name__ == "__main__":
    input_file = "/Users/sabbir/.gemini/antigravity/brain/cf273d00-7e36-405e-bf76-a2e94f724f9f/uploaded_image_1768423214178.png"
    output_file = "/Users/sabbir/RizikV10/assets/icons/dap_fist_bump.png"
    try:
        process_icon(input_file, output_file)
    except Exception as e:
        print(f"Error: {e}")
