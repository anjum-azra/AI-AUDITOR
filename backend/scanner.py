import os
import sys
import asyncio
import json
import logging
import requests
from typing import Dict, Any, List, Optional
from playwright.async_api import async_playwright

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

logger = logging.getLogger("axe_scanner")
logging.basicConfig(level=logging.INFO)

AXE_CDN_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js"
LOCAL_AXE_PATH = os.path.join(os.path.dirname(__file__), "axe.min.js")

def get_axe_script() -> str:
    """Returns axe-core JS source code, downloading and caching locally if needed."""
    if os.path.exists(LOCAL_AXE_PATH):
        try:
            with open(LOCAL_AXE_PATH, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Failed to read local axe.min.js: {e}")
            
    logger.info("Downloading axe-core script from CDN...")
    try:
        resp = requests.get(AXE_CDN_URL, timeout=15)
        if resp.status_code == 200 and "axe" in resp.text:
            script_text = resp.text
            with open(LOCAL_AXE_PATH, "w", encoding="utf-8") as f:
                f.write(script_text)
            return script_text
    except Exception as e:
        logger.error(f"Error fetching axe-core CDN: {e}")
        
    raise RuntimeError("Could not load axe-core script.")

async def scan_url_with_playwright(url: str, viewport_width: int = 1280, viewport_height: int = 800) -> Dict[str, Any]:
    """
    Renders the target URL using Playwright Chromium, injects axe-core,
    runs accessibility audit, measures bounding box coordinates for each violation,
    and returns full-page screenshot bytes alongside raw violation data.
    """
    axe_js = get_axe_script()

    async with async_playwright() as p:
        # Launch browser with headless Chromium
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        )
        
        context = await browser.new_context(
            viewport={"width": viewport_width, "height": viewport_height},
            device_scale_factor=1,
            ignore_https_errors=True,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 AI-Accessibility-Auditor/1.0"
        )
        
        page = await context.new_page()
        
        logger.info(f"Navigating to {url}...")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
        except Exception as e:
            logger.warning(f"Domcontentloaded timeout for {url}: {e}")
            try:
                await page.goto(url, timeout=15000)
            except Exception as e2:
                logger.error(f"Failed to navigate to {url}: {e2}")
                await browser.close()
                raise ValueError(f"Could not load website: {str(e2)}")

        # Wait extra time for JS rendering / hydration
        await page.wait_for_timeout(2000)
        
        # Get page dimensions
        page_dimensions = await page.evaluate("""() => {
            return {
                scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
                scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio || 1
            };
        }""")

        # Inject axe-core
        await page.evaluate(axe_js)
        
        # Run axe.run()
        logger.info("Executing axe.run() audit...")
        axe_results = await page.evaluate("""async () => {
            if (typeof axe === 'undefined') {
                return { error: 'axe-core not defined' };
            }
            return await axe.run(document, {
                runOnly: {
                    type: 'tag',
                    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
                },
                resultTypes: ['violations', 'passes', 'incomplete']
            });
        }""")
        
        if "error" in axe_results:
            await browser.close()
            raise RuntimeError(f"axe-core evaluation failed: {axe_results['error']}")

        violations = axe_results.get("violations", [])
        
        # Extract bounding box coordinates for each node in violations
        logger.info(f"Axe audit found {len(violations)} violation rules. Extracting bounding boxes...")
        processed_violations = []
        violation_index = 1
        
        for rule in violations:
            rule_id = rule.get("id")
            impact = rule.get("impact", "moderate")
            description = rule.get("description")
            help_url = rule.get("helpUrl")
            help_text = rule.get("help")
            tags = rule.get("tags", [])
            wcag_tags = [t for t in tags if t.startswith("wcag") or t.startswith("best-practice")]
            
            for node in rule.get("nodes", []):
                target_selectors = node.get("target", [])
                target_selector = target_selectors[0] if target_selectors else ""
                html_snippet = node.get("html", "")
                failure_summary = node.get("failureSummary", "")
                
                # Evaluate bounding rect for selector
                rect = None
                if target_selector:
                    try:
                        rect = await page.evaluate("""(sel) => {
                            try {
                                const el = document.querySelector(sel);
                                if (!el) return null;
                                const r = el.getBoundingClientRect();
                                return {
                                    x: Math.round(r.left + window.scrollX),
                                    y: Math.round(r.top + window.scrollY),
                                    width: Math.round(r.width),
                                    height: Math.round(r.height)
                                };
                            } catch (err) {
                                return null;
                            }
                        }""", target_selector)
                    except Exception as err:
                        logger.debug(f"Failed to get rect for {target_selector}: {err}")

                processed_violations.append({
                    "id": f"v-{violation_index}",
                    "rule_id": rule_id,
                    "impact": impact,
                    "description": description,
                    "help": help_text,
                    "help_url": help_url,
                    "tags": wcag_tags,
                    "target_selector": target_selector,
                    "html_snippet": html_snippet,
                    "failure_summary": failure_summary,
                    "bounding_box": rect, # {x, y, width, height} or None
                    "violation_number": violation_index
                })
                violation_index += 1

        # Capture full page screenshot
        logger.info("Capturing full page screenshot...")
        screenshot_bytes = await page.screenshot(full_page=True, type="png")
        
        await browser.close()
        
        return {
            "url": url,
            "page_dimensions": page_dimensions,
            "violations": processed_violations,
            "screenshot_bytes": screenshot_bytes,
            "passes_count": len(axe_results.get("passes", [])),
            "incomplete_count": len(axe_results.get("incomplete", []))
        }
