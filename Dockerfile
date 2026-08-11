# Multi-stage Dockerfile for AI Accessibility Auditor
# Base image with Python 3.11 and Playwright Chromium pre-installed
FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy

# Install Node.js 20.x for building frontend
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend requirements & install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt
RUN playwright install chromium

# Copy frontend package.json & install dependencies
COPY frontend/package.json frontend/package-lock.json* ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy frontend source code & build production static assets
COPY frontend/ ./
RUN npm run build

# Reset working dir to app root
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Expose port 8000
EXPOSE 8000

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Run Uvicorn server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
