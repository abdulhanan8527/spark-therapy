# Cloudinary Video Storage Setup Guide

## 1. Create Cloudinary Account (FREE)

1. Go to https://cloudinary.com/users/register_free
2. Sign up for a free account
3. Verify your email address
4. Login to your dashboard at https://cloudinary.com/console

## 2. Get Your Cloudinary Credentials

After logging in, you'll see your dashboard with:

```
Cloud name: [your_cloud_name]
API Key: [your_api_key]
API Secret: [your_api_secret] (Click "Reveal" to see it)
```

**Copy these three values - you'll need them!**

## 3. Configure Local Development

### Backend Configuration

1. Open `/backend/.env` file
2. Replace the placeholder values with your actual Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Example:
```env
CLOUDINARY_CLOUD_NAME=spark-therapy-dev
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef123456ABCDEF789012
```

## 4. Configure Production (Render)

### On Render Dashboard:

1. Go to your backend service on Render
2. Click on **"Environment"** tab
3. Add these three new environment variables:

```
CLOUDINARY_CLOUD_NAME = your_actual_cloud_name
CLOUDINARY_API_KEY = your_actual_api_key
CLOUDINARY_API_SECRET = your_actual_api_secret
```

4. Click **"Save Changes"**
5. Your service will automatically redeploy

## 5. Test the Integration

### Local Testing:

1. Restart your backend server
2. Login as therapist
3. Go to Weekly Videos
4. Record or upload a video
5. The video will now be uploaded to Cloudinary
6. Check your Cloudinary dashboard to see the uploaded video

### Production Testing:

1. After Render redeploys (takes ~2-3 minutes)
2. Access your production app
3. Upload a video as therapist
4. Parent should see and play the video immediately

## 6. Cloudinary Free Tier Limits

Your free account includes:
- ✅ 25GB storage
- ✅ 25GB bandwidth per month
- ✅ 25k transformations per month
- ✅ CDN delivery worldwide

**This is more than enough for:**
- ~500 videos (assuming 50MB each)
- Several hundred video views per month

## 7. Video Storage Location

Videos will be stored at:
```
Cloudinary → Media Library → spark-therapy/videos/
```

## 8. Security

✅ **API Secret is kept secure** - only stored in backend environment
✅ **Videos use signed URLs** - authenticated access only
✅ **Automatic video optimization** - Cloudinary compresses videos
✅ **CDN delivery** - Fast loading worldwide

## 9. Troubleshooting

### Error: "Missing required configuration"
- Check all three Cloudinary variables are set in .env
- Restart backend server after adding variables

### Error: "Upload failed"
- Verify API credentials are correct
- Check internet connection
- Ensure file size is under 100MB

### Videos not displaying
- Check Cloudinary dashboard to confirm upload
- Verify videoUrl in database contains cloudinary.com URL
- Check browser console for CORS errors

## 10. Cost Estimation

**Free Tier (Current):**
- Cost: $0/month
- Suitable for: Testing, small deployments

**If you exceed free tier:**
- Cost: ~$0.023/GB storage + bandwidth
- Example: 50GB = ~$1.15/month

## Next Steps

1. ✅ Create Cloudinary account
2. ✅ Copy credentials
3. ✅ Update `/backend/.env` file
4. ✅ Restart backend server
5. ✅ Test video upload locally
6. ✅ Add credentials to Render environment
7. ✅ Push code to GitHub
8. ✅ Wait for Render to redeploy
9. ✅ Test on production

---

**Questions?** Check Cloudinary docs: https://cloudinary.com/documentation
