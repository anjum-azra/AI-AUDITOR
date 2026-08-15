import os
import sys
import uuid
import logging
import asyncio
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env file if present
load_dotenv()


# Fix Windows asyncio event loop for Playwright subprocess support
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from scanner import scan_url_with_playwright
from screenshot import annotate_screenshot
from fix_generator import generate_ai_fix
from scoring import calculate_score_and_grade
from storage import save_report, get_report, get_screenshot, list_reports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main_api")

app = FastAPI(
    title="AI Accessibility Auditor API",
    description="WCAG 2.1 automated accessibility scanner with AI code fix generator & visual bounding box annotation",
    version="1.0.0"
)

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str
    api_key: Optional[str] = None
    viewport_width: Optional[int] = 1280
    viewport_height: Optional[int] = 800

@app.get("/")
def read_root():
    return {
        "message": "AI Accessibility Auditor API is running",
        "endpoints": [
            "/api/scan (POST)",
            "/api/report/{id} (GET)",
            "/api/report/{id}/screenshot (GET)",
            "/api/reports (GET)",
            "/api/health (GET)"
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI Accessibility Auditor", "version": "1.0.0"}

@app.post("/api/scan")
async def create_scan(request: ScanRequest):
    raw_url = request.url.strip()
    if not raw_url.startswith("http://") and not raw_url.startswith("https://"):
        raw_url = "https://" + raw_url
        
    logger.info(f"Received scan request for URL: {raw_url}")
    
    try:
        # 1. Run Playwright scanner + axe-core
        scan_results = await scan_url_with_playwright(
            url=raw_url,
            viewport_width=request.viewport_width or 1280,
            viewport_height=request.viewport_height or 800
        )
        
        violations = scan_results.get("violations", [])
        logger.info(f"Scan complete. Generating AI code fixes for {len(violations)} violations...")
        
        # 2. Generate AI code fixes per violation
        for v in violations:
            ai_fix = generate_ai_fix(v, api_key=request.api_key)
            v["ai_fix"] = ai_fix
            
        # 3. Calculate accessibility score & WCAG grade
        scoring_res = calculate_score_and_grade(violations)
        
        # 4. Generate annotated screenshot
        screenshot_bytes = scan_results.get("screenshot_bytes", b"")
        annotated_bytes = screenshot_bytes
        if screenshot_bytes and violations:
            try:
                annotated_bytes = annotate_screenshot(screenshot_bytes, violations)
            except Exception as e:
                logger.error(f"Failed to annotate screenshot: {e}")
                
        scan_id = str(uuid.uuid4())[:8]
        
        report_data = {
            "id": scan_id,
            "url": raw_url,
            "score": scoring_res["score"],
            "grade": scoring_res["grade"],
            "grade_label": scoring_res["grade_label"],
            "severity_counts": scoring_res["severity_counts"],
            "total_violations": scoring_res["total_violations"],
            "passes_count": scan_results.get("passes_count", 0),
            "incomplete_count": scan_results.get("incomplete_count", 0),
            "page_dimensions": scan_results.get("page_dimensions", {}),
            "violations": violations
        }
        
        saved_id = save_report(report_data, annotated_bytes)
        logger.info(f"Report saved successfully with ID: {saved_id}")
        
        return report_data
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Scan failed with error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Accessibility scan failed: {str(e)}")

@app.get("/api/report/{scan_id}")
def get_report_by_id(scan_id: str):
    report = get_report(scan_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/api/report/{scan_id}/screenshot")
def get_report_screenshot(scan_id: str):
    img_bytes = get_screenshot(scan_id)
    if not img_bytes:
        raise HTTPException(status_code=404, detail="Screenshot not found for this report")
    return Response(content=img_bytes, media_type="image/png")

@app.get("/api/reports")
def get_all_reports():
    return list_reports()

# Mount frontend dist static files if built for single container deployment
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

