import io
from typing import List, Dict, Any, Optional
from PIL import Image, ImageDraw, ImageFont

SEVERITY_COLORS = {
    "critical": {
        "stroke": (239, 68, 68, 255),       # #EF4444
        "fill": (239, 68, 68, 50),          # Translucent red
        "badge_bg": (220, 38, 38, 240),     # Dark red badge
        "text": (255, 255, 255, 255)
    },
    "serious": {
        "stroke": (249, 115, 22, 255),      # #F97316
        "fill": (249, 115, 22, 50),         # Translucent orange
        "badge_bg": (234, 88, 12, 240),     # Dark orange badge
        "text": (255, 255, 255, 255)
    },
    "moderate": {
        "stroke": (245, 158, 11, 255),      # #F59E0B
        "fill": (245, 158, 11, 50),         # Translucent amber
        "badge_bg": (217, 119, 6, 240),     # Dark amber badge
        "text": (255, 255, 255, 255)
    },
    "minor": {
        "stroke": (59, 130, 246, 255),      # #3B82F6
        "fill": (59, 130, 246, 50),         # Translucent blue
        "badge_bg": (37, 99, 235, 240),     # Dark blue badge
        "text": (255, 255, 255, 255)
    }
}

def annotate_screenshot(screenshot_bytes: bytes, violations: List[Dict[str, Any]]) -> bytes:
    """
    Overlays color-coded bounding boxes and numbered markers on the screenshot.
    """
    image = Image.open(io.BytesIO(screenshot_bytes)).convert("RGBA")
    
    # Create transparent overlay for alpha drawing
    overlay = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    
    img_width, img_height = image.size
    
    # Try to load a default font
    try:
        font = ImageFont.truetype("arial.ttf", 16)
        small_font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()
        small_font = ImageFont.load_default()
        
    for v in violations:
        bbox = v.get("bounding_box")
        if not bbox:
            continue
            
        x = bbox.get("x", 0)
        y = bbox.get("y", 0)
        w = bbox.get("width", 0)
        h = bbox.get("height", 0)
        
        # Skip invalid bounding boxes
        if w <= 0 or h <= 0:
            continue
            
        # Clamp bounds to image size
        x1 = max(0, min(x, img_width - 1))
        y1 = max(0, min(y, img_height - 1))
        x2 = max(x1 + 1, min(x + w, img_width - 1))
        y2 = max(y1 + 1, min(y + h, img_height - 1))
        
        impact = (v.get("impact") or "moderate").lower()
        style = SEVERITY_COLORS.get(impact, SEVERITY_COLORS["moderate"])
        
        # Draw translucent fill
        draw.rectangle([x1, y1, x2, y2], fill=style["fill"])
        
        # Draw 3px outline border
        draw.rectangle([x1, y1, x2, y2], outline=style["stroke"], width=3)
        
        # Draw numbered badge
        violation_num = str(v.get("violation_number", "#"))
        badge_text = f" #{violation_num} {v.get('rule_id', '')} "
        
        # Measure badge dimensions
        try:
            bbox_text = draw.textbbox((0, 0), badge_text, font=small_font)
            bw = bbox_text[2] - bbox_text[0] + 8
            bh = bbox_text[3] - bbox_text[1] + 6
        except Exception:
            bw, bh = 70, 20
            
        badge_x1 = x1
        badge_y1 = max(0, y1 - bh - 2) if y1 >= bh + 2 else y1
        badge_x2 = min(img_width - 1, badge_x1 + bw)
        badge_y2 = badge_y1 + bh
        
        # Badge background
        draw.rectangle([badge_x1, badge_y1, badge_x2, badge_y2], fill=style["badge_bg"])
        draw.rectangle([badge_x1, badge_y1, badge_x2, badge_y2], outline=(255, 255, 255, 200), width=1)
        
        # Badge text
        draw.text((badge_x1 + 4, badge_y1 + 2), badge_text, fill=style["text"], font=small_font)

    # Composite overlay onto main image
    final_image = Image.alpha_composite(image, overlay)
    
    # Save output as PNG
    output_io = io.BytesIO()
    final_image.convert("RGB").save(output_io, format="PNG")
    return output_io.getvalue()
