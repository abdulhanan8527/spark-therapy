# SPARKTherapy Backend Deployment Guide - Render.com

## Prerequisites
1. Create a free account at [render.com](https://render.com)
2. Have your MongoDB database ready (MongoDB Atlas recommended)

## Step-by-Step Deployment

### 1. Prepare Your Code
Make sure your backend code is in a Git repository:
```bash
cd /home/abdul-hanan/Downloads/New/SPARKTherapy
git init
git add .
git commit -m "Initial commit for Render deployment"
```

### 2. Create MongoDB Database (MongoDB Atlas - Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for testing
5. Get your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/spark_therapy
   ```

### 3. Deploy to Render
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Configure settings:
   - **Name**: sparktherapy-backend
   - **Region**: Choose closest to your users
   - **Branch**: main/master
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 4. Set Environment Variables
In Render dashboard, add these environment variables:
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=https://your-frontend-url.com
PORT=10000
```

### 5. Deploy
Click "Create Web Service" and wait for deployment to complete.

## Update Mobile App Configuration

Once deployed, update your mobile app to use the Render backend URL:

### For Production Builds:
1. Get your Render service URL (e.g., `https://sparktherapy-backend.onrender.com`)
2. Update your environment configuration:

**In your mobile app's .env file:**
```
REACT_APP_API_BASE_URL=https://sparktherapy-backend.onrender.com/api
```

**Or in your config file:**
```javascript
// src/config/env.js
const ENV = {
  API_BASE_URL: 'https://sparktherapy-backend.onrender.com/api',
  // ... other configs
};
```

## Testing Your Deployment

1. Visit your Render service URL + `/api/health`
2. You should see a health check response
3. Test API endpoints with Postman or curl

## Important Notes

- **Cold Starts**: Render free tier may have cold starts (30-60 seconds delay)
- **Auto Scaling**: Free tier shuts down after 15 minutes of inactivity
- **Database**: Use MongoDB Atlas free tier for production database
- **SSL**: Render provides SSL certificates automatically

## Troubleshooting

If deployment fails:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure package.json has correct dependencies
4. Check MongoDB connection string format

## Next Steps

1. Deploy your frontend to a hosting service (Netlify, Vercel, etc.)
2. Update mobile app with production API URLs
3. Test all features thoroughly
4. Monitor logs in Render dashboard