# 🚀 BenchWise Deployment Guide for Render

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas cluster (already set up)

## Step 1: Deploy Backend Server

### 1.1 Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select your repository

### 1.2 Configure Backend Service
- **Name**: `benchwise-server`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `BenchWise/server`

### 1.3 Set Environment Variables
Add these in Render's Environment Variables section:

```
MONGODB_URI=mongodb+srv://gautam:1234@benchwisecluster.osuhtnq.mongodb.net/benchwise?retryWrites=true&w=majority
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
FRONTEND_URL=https://benchwise-client.onrender.com
```

### 1.4 Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note the URL (e.g., `https://benchwise-server.onrender.com`)

## Step 2: Deploy Frontend Client

### 2.1 Create Static Site on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Static Site"
3. Connect your GitHub repository

### 2.2 Configure Frontend Service
- **Name**: `benchwise-client`
- **Root Directory**: `BenchWise/client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### 2.3 Set Environment Variables
Add these in Render's Environment Variables section:

```
REACT_APP_API_URL=https://benchwise-server.onrender.com/api
```

### 2.4 Deploy
- Click "Create Static Site"
- Wait for deployment to complete
- Note the URL (e.g., `https://benchwise-client.onrender.com`)

## Step 3: Update OAuth Redirect URIs

### 3.1 Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth client
3. Add authorized redirect URI: `https://benchwise-server.onrender.com/api/auth/google/callback`

### 3.2 Update Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to your app registration
3. Add redirect URI: `https://benchwise-server.onrender.com/api/auth/microsoft/callback`

## Step 4: Update Environment Variables

After getting your actual URLs, update:

### Backend Environment Variables in Render:
```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
```

### Frontend Environment Variables in Render:
```
REACT_APP_API_URL=https://your-actual-backend-url.onrender.com/api
```

## Step 5: Test Deployment

1. Visit your frontend URL
2. Try registering a new user
3. Test OAuth login (Google/Microsoft)
4. Verify all features work

## Troubleshooting

### Common Issues:
- **CORS errors**: Check FRONTEND_URL in backend environment
- **OAuth redirect errors**: Verify redirect URIs match exactly
- **Build failures**: Check build logs in Render dashboard
- **Database connection**: Verify MongoDB Atlas IP whitelist

### Debug Steps:
1. Check Render service logs
2. Verify environment variables are set
3. Test API endpoints directly
4. Check browser console for errors

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] OAuth redirect URIs updated
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] All features tested
- [ ] Custom domain configured (optional)

## Cost Considerations

- **Free Tier**: 750 hours/month for web services
- **Static Sites**: Free with custom domain
- **Database**: MongoDB Atlas free tier (512MB)
- **Total Cost**: $0/month on free tier

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Render)
3. Set up monitoring and logging
4. Configure CI/CD for automatic deployments
