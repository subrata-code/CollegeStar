# CollegeStar Deployment Guide

## Vercel Deployment Fix for 404 Errors

### Problem
When refreshing pages like `/dashboard` on Vercel, you get a 404 error because Vercel tries to find a physical file at that route instead of serving the SPA.

### Solution
The `vercel.json` file has been created to handle this issue by redirecting all routes to `index.html`.

## Deployment Steps

### 1. Environment Variables
Make sure these environment variables are set in your Vercel dashboard:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Files Created for Fix
- `vercel.json` - Main configuration for SPA routing
- `public/_redirects` - Backup redirect file
- `DEPLOYMENT.md` - This guide

### 4. Deploy
1. Push your changes to your Git repository
2. Vercel will automatically detect the changes and redeploy
3. The 404 errors should now be resolved

### 5. Testing
After deployment, test these scenarios:
- Navigate to `/dashboard` and refresh the page
- Navigate to `/profile` and refresh the page
- Navigate to any other route and refresh the page
- All should work without 404 errors

## Troubleshooting

If you still get 404 errors:
1. Check that `vercel.json` is in the root directory
2. Verify the build output includes `index.html`
3. Check Vercel's function logs for any errors
4. Ensure environment variables are properly set

## Additional Notes

- The `vercel.json` configuration excludes `/api/*` routes from the rewrite rule
- Security headers have been added for better protection
- The configuration is optimized for React Router DOM
