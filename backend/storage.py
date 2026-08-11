import os
import json
import uuid
import datetime
from typing import Dict, Any, Optional, List

STORAGE_DIR = os.path.join(os.path.dirname(__file__), "data")
REPORTS_DIR = os.path.join(STORAGE_DIR, "reports")
SCREENSHOTS_DIR = os.path.join(STORAGE_DIR, "screenshots")

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

# In-memory quick lookup cache
IN_MEMORY_REPORTS: Dict[str, Dict[str, Any]] = {}
IN_MEMORY_SCREENSHOTS: Dict[str, bytes] = {}

def save_report(report_data: Dict[str, Any], screenshot_bytes: bytes) -> str:
    scan_id = report_data.get("id") or str(uuid.uuid4())[:8]
    report_data["id"] = scan_id
    report_data["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Store in memory
    IN_MEMORY_REPORTS[scan_id] = report_data
    IN_MEMORY_SCREENSHOTS[scan_id] = screenshot_bytes
    
    # Store on disk
    try:
        json_path = os.path.join(REPORTS_DIR, f"{scan_id}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2)
            
        img_path = os.path.join(SCREENSHOTS_DIR, f"{scan_id}.png")
        with open(img_path, "wb") as f:
            f.write(screenshot_bytes)
    except Exception as e:
        print(f"Warning: Failed to write report to disk: {e}")
        
    return scan_id

def get_report(scan_id: str) -> Optional[Dict[str, Any]]:
    if scan_id in IN_MEMORY_REPORTS:
        return IN_MEMORY_REPORTS[scan_id]
        
    json_path = os.path.join(REPORTS_DIR, f"{scan_id}.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                IN_MEMORY_REPORTS[scan_id] = data
                return data
        except Exception:
            pass
    return None

def get_screenshot(scan_id: str) -> Optional[bytes]:
    if scan_id in IN_MEMORY_SCREENSHOTS:
        return IN_MEMORY_SCREENSHOTS[scan_id]
        
    img_path = os.path.join(SCREENSHOTS_DIR, f"{scan_id}.png")
    if os.path.exists(img_path):
        try:
            with open(img_path, "rb") as f:
                data = f.read()
                IN_MEMORY_SCREENSHOTS[scan_id] = data
                return data
        except Exception:
            pass
    return None

def list_reports() -> List[Dict[str, Any]]:
    summaries = []
    for scan_id, data in IN_MEMORY_REPORTS.items():
        summaries.append({
            "id": scan_id,
            "url": data.get("url"),
            "score": data.get("score"),
            "grade": data.get("grade"),
            "total_violations": data.get("total_violations"),
            "timestamp": data.get("timestamp")
        })
        
    # Also scan disk if memory is empty
    if not summaries and os.path.exists(REPORTS_DIR):
        for fname in os.listdir(REPORTS_DIR):
            if fname.endswith(".json"):
                sid = fname[:-5]
                data = get_report(sid)
                if data:
                    summaries.append({
                        "id": sid,
                        "url": data.get("url"),
                        "score": data.get("score"),
                        "grade": data.get("grade"),
                        "total_violations": data.get("total_violations"),
                        "timestamp": data.get("timestamp")
                    })
                    
    summaries.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return summaries
