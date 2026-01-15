import cv2
import numpy as np
import sys

def image_to_svg_path(image_path, invert=False):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        return "Error: Could not load image"

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Threshold
    # If background is black and icon is white: default usage
    # If invert=True, we seek black icon on white background
    if invert:
        _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    else:
        # Assume black background, white icon -> Threshold to get white parts
        _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)

    # Find contours
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    print(f"Found {len(contours)} contours")

    svg_path = ""
    height, width = thresh.shape

    # Iterate contours
    for cnt in contours:
        # Approximate contour to reduce points
        epsilon = 0.005 * cv2.arcLength(cnt, True) # High precision
        approx = cv2.approxPolyDP(cnt, epsilon, True)

        if len(approx) < 3: continue 

        # Build path data
        # Scale to 0..1 range or keep pixel coords?
        # User wants "Same to same", so path data relative to viewbox is best.
        # But for Flutter CustomPainter, 0..width is standard.
        
        # Move to start
        start = approx[0][0]
        p = f"M {start[0]} {start[1]} "
        
        for point in approx[1:]:
            pt = point[0]
            p += f"L {pt[0]} {pt[1]} "
        
        p += "Z " # Close path
        svg_path += p

    return svg_path, width, height

if __name__ == "__main__":
    files = [
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_2_1768507186262.png", "DAP"), # Fist
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_0_1768507186262.png", "SAY"), # Say
        ("/Users/sabbir/.gemini/antigravity/brain/5465fb79-bb06-4040-8409-2dcb0401e83c/uploaded_image_1_1768507186262.jpg", "SHARE") # Share logic?
    ]

    for f, name in files:
        print(f"\n--- PROCESSING {name} ---")
        try:
            path_data, w, h = image_to_svg_path(f)
            print(f"Original Size: {w}x{h}")
            print("SVG Path Data:")
            print(path_data)
        except Exception as e:
            print(f"Failed: {e}")
