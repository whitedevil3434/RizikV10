from PIL import Image, ImageOps
import os

def remove_black_background(input_path, output_path):
    try:
        print(f"Processing: {input_path}")
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # If pixel is near black, make transparent
            # Threshold: < 30 on all channels
            if item[0] < 30 and item[1] < 30 and item[2] < 30:
                newData.append((0, 0, 0, 0))
            else:
                # Keep original color (should be white/grey)
                newData.append(item)

        img.putdata(newData)
        
        # Crop
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"✅ Saved to: {output_path}")
    except Exception as e:
        print(f"❌ Failed to process {input_path}: {e}")

if __name__ == "__main__":
    assets_dir = "assets/icons"
    if not os.path.exists(assets_dir):
        os.makedirs(assets_dir)
        
    tasks = [
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_2_1768507186262.png", f"{assets_dir}/dap_icon_v3.png"),
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_0_1768507186262.png", f"{assets_dir}/say_icon.png"),
        # First image (Share/Spread? uploaded_image_1 is .jpg)
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_1_1768507186262.jpg", f"{assets_dir}/spread_icon.png"),
    ]

    for inp, out in tasks:
        remove_black_background(inp, out)
