# Backend Dockerfile for Cloud Run
# Use a slim Python base image
FROM python:3.12-slim

# Prevent Python from writing .pyc files and enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (ca-certificates, curl for debugging)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements and install
# IMPORTANT: Run Cloud Build from the REPO ROOT so the build context includes requirements.txt and backend/
# Example:
#   gcloud builds submit --tag <registry>/legalclear-backend:latest --project <PROJECT_ID> .
# and ensure --file backend/Dockerfile (or cloudbuild.yaml) is used.
# When context is repo root, the path is just requirements.txt (no ../)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source code
COPY backend /app/backend

# Set working dir to backend so module imports like `from models import ...` work
WORKDIR /app/backend

# Do NOT set GOOGLE_APPLICATION_CREDENTIALS here. Cloud Run will use
# Application Default Credentials (ADC) from the service account.
# If you really need to use a JSON key locally, pass it at runtime only.

# Expose the port (Cloud Run will set $PORT)
EXPOSE 8080

# Start the server (use PORT env var in Cloud Run, default 8000 for local)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8080}"]
