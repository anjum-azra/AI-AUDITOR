"""
Windows-compatible uvicorn launcher.
Must set WindowsProactorEventLoopPolicy BEFORE uvicorn imports asyncio internals.
"""
import sys
import asyncio

# CRITICAL: Must be set before uvicorn starts on Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        loop="asyncio",   # Forces asyncio loop (ProactorEventLoop on Win)
        reload=False,     # reload=True spawns subprocess that loses the policy
    )
