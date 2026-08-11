import asyncio
import json
import logging
import os
from scanner import scan_url_with_playwright
from fix_generator import generate_ai_fix
from screenshot import annotate_screenshot
from scoring import calculate_score_and_grade

logging.basicConfig(level=logging.INFO)

LOCAL_HTML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_accessibility_page.html"))
LOCAL_FILE_URL = f"file:///{LOCAL_HTML_PATH.replace('\\', '/')}"

TEST_SITES = [
    LOCAL_FILE_URL,
    "https://news.ycombinator.com/",
    "https://www.w3.org/WAI/demos/bad/2011/home/"
]

async def run_verification():
    results = []
    
    for url in TEST_SITES:
        print(f"\n==========================================")
        print(f"Verifying Target Site: {url}")
        print(f"==========================================")
        
        try:
            scan_res = await scan_url_with_playwright(url)
            violations = scan_res["violations"]
            
            # Generate AI fixes
            critical_count = 0
            serious_count = 0
            moderate_count = 0
            minor_count = 0
            valid_bboxes = 0
            sample_fixes = []
            
            for v in violations:
                impact = (v.get("impact") or "moderate").lower()
                if impact == "critical": critical_count += 1
                elif impact == "serious": serious_count += 1
                elif impact == "moderate": moderate_count += 1
                elif impact == "minor": minor_count += 1
                
                bbox = v.get("bounding_box")
                if bbox and bbox.get("width", 0) > 0 and bbox.get("height", 0) > 0:
                    valid_bboxes += 1
                    
                fix = generate_ai_fix(v)
                v["ai_fix"] = fix
                if len(sample_fixes) < 3:
                    sample_fixes.append({
                        "rule_id": v["rule_id"],
                        "selector": v["target_selector"],
                        "explanation": fix["plain_english_explanation"][:120] + "...",
                        "corrected_code": fix["corrected_code"][:150]
                    })
                    
            scoring = calculate_score_and_grade(violations)
            annotated_bytes = annotate_screenshot(scan_res["screenshot_bytes"], violations)
            
            results.append({
                "url": url,
                "status": "PASS",
                "total_violations": len(violations),
                "severity_breakdown": f"Critical: {critical_count}, Serious: {serious_count}, Moderate: {moderate_count}, Minor: {minor_count}",
                "score": scoring["score"],
                "grade": scoring["grade"],
                "grade_label": scoring["grade_label"],
                "valid_bounding_boxes": f"{valid_bboxes}/{len(violations)}",
                "screenshot_size_kb": round(len(annotated_bytes) / 1024, 1),
                "sample_fixes": sample_fixes
            })
            
        except Exception as e:
            print(f"Error scanning {url}: {e}")
            results.append({
                "url": url,
                "status": f"FAILED: {str(e)}"
            })
            
    print("\n\n==========================================")
    print("      FINAL 3-SITE VERIFICATION TABLE     ")
    print("==========================================")
    print(json.dumps(results, indent=2))
    
    with open("verification_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_verification())
