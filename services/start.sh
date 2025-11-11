#!/bin/bash
# Start script for Render deployment
# Render will automatically set the PORT environment variable

echo "Starting BenchWise AI Chatbot Service..."
echo "Port: $PORT"
echo "MongoDB URI: ${MONGODB_URI:0:50}..."
echo "OpenAI Model: ${DEPLOYMENT_NAME:-Not set}"

# Use uvicorn to run the FastAPI app
# Render provides PORT env var, but we'll use it from environment
exec uvicorn chatbot_service:app --host 0.0.0.0 --port ${PORT:-8001}

