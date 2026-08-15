# Multi-stage Dockerfile for AI Accessibility Auditor
# Stage 1: Build React frontend static bundle
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Final Production Runtime Image
FROM mcr.microsoft.com/playwright/python:v1.41.0-jammy

WORKDIR /app

# Copy backend requirements & install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy built frontend static bundle from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend source code
COPY backend/ ./backend/

# Expose default backend port (8000 or dynamic $PORT from cloud provider)
EXPOSE 8000

ENV PYTHONUNBUFFERED=1

# Run Uvicorn server with dynamic $PORT support
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

