# BenchWise Chatbot Service - Render Deployment Guide

## Quick Deploy to Render

### Option 1: Using Render Dashboard (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your repository** (GitHub/GitLab)
4. **Configure the service**:
   - **Name**: `benchwise-chatbot-service`
   - **Root Directory**: `services` (important!)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn chatbot_service:app --host 0.0.0.0 --port $PORT`

5. **Set Environment Variables** in Render dashboard:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=benchwise
   AZURE_OPENAI_API_KEY=your_azure_openai_key
   ENDPOINT_URL=https://your-resource.openai.azure.com/
   DEPLOYMENT_NAME=gpt-4  # or your model name
   ```
   Note: `PORT` is automatically set by Render - don't set it manually.

6. **Click "Create Web Service"**

### Option 2: Using render.yaml (Infrastructure as Code)

If you've added `render.yaml` to your repository:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and create the service
5. Set the environment variables in the dashboard (they won't be synced from yaml for security)

## Important Notes

### Root Directory
- **CRITICAL**: Set the root directory to `services` in Render dashboard
- This ensures Render looks for `requirements.txt` and `chatbot_service.py` in the right place

### Environment Variables
Make sure to set these in Render dashboard (under "Environment" tab):
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `MONGODB_DB_NAME` - Usually `benchwise`
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key
- `ENDPOINT_URL` - Your Azure OpenAI endpoint URL
- `DEPLOYMENT_NAME` - Your model deployment name (e.g., `gpt-4`)

### Port Configuration
- Render automatically sets the `PORT` environment variable
- The service code reads `PORT` from environment (defaults to 8001 for local dev)
- Don't manually set `PORT` in Render

### Update Node.js Server
After deploying, update your Node.js server's `.env` file:
```bash
PYTHON_AI_SERVICE_URL=https://benchwise-chatbot-service.onrender.com
```

Or if you have a custom domain:
```bash
PYTHON_AI_SERVICE_URL=https://your-custom-domain.com
```

## Health Check

After deployment, test the service:
```bash
curl https://benchwise-chatbot-service.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "BenchWise AI Chatbot",
  "timestamp": "2024-..."
}
```

## Troubleshooting

### Service won't start
- Check build logs in Render dashboard
- Verify `requirements.txt` is in the `services` directory
- Ensure root directory is set to `services`

### Connection errors
- Verify MongoDB URI is correct and accessible from Render
- Check Azure OpenAI credentials are set correctly
- Review service logs in Render dashboard

### Timeout issues
- Render free tier has 15-minute spin-down
- First request after spin-down may take longer
- Consider upgrading to paid plan for always-on service

## Cost Considerations

- **Free Tier**: 750 hours/month, spins down after 15 min inactivity
- **Starter Plan**: $7/month - Always on, better for production

## Next Steps

1. Deploy the service to Render
2. Get the service URL (e.g., `https://benchwise-chatbot-service.onrender.com`)
3. Update your Node.js server's `PYTHON_AI_SERVICE_URL` environment variable
4. Redeploy your Node.js server (if needed)
5. Test the chatbot in your deployed application

