import asyncio
import json
import logging
from scanner import scan_url_with_playwright
from fix_generator import generate_ai_fix
from screenshot import annotate_screenshot
from scoring import calculate_score_and_grade

logging.basicConfig(level=logging.INFO)

async def main():
    test_url = "https://www.w3.org/WAI/demos/bad/"
    print(f"--- Running Test Scan for {test_url} ---")
    
    scan_res = await scan_url_with_playwright(test_url)
    violations = scan_res["violations"]
    print(f"Total Violations Detected: {len(violations)}")
    print(f"Page Dimensions: {scan_res['page_dimensions']}")
    
    # Generate fixes
    for v in violations[:3]:
        fix = generate_ai_fix(v)
        v["ai_fix"] = fix
        print(f"\nRule: {v['rule_id']} (Impact: {v['impact']})")
        print(f"Selector: {v['target_selector']}")
        print(f"Bounding Box: {v['bounding_box']}")
        print(f"Explanation: {fix['plain_english_explanation']}")
        print(f"Corrected Code:\n{fix['corrected_code']}")

    scoring = calculate_score_and_grade(violations)
    print(f"\nScoring Results: Score={scoring['score']}, Grade={scoring['grade']} ({scoring['grade_label']})")
    
    # Test screenshot annotation
    annotated = annotate_screenshot(scan_res["screenshot_bytes"], violations)
    print(f"Annotated screenshot generated successfully! Size: {len(annotated)} bytes")

if __name__ == "__main__":
    asyncio.run(main())
