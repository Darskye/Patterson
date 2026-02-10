# Netlify + Railway Deployment Guide

## Free Hosting Setup
This guide deploys your Tier II Compliance Dashboard for **free** using:
- **Netlify** for the frontend (static hosting)
- **Railway** for the backend Node.js server

## Step 1: Deploy Backend to Railway

### 1.1 Create a Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)

### 1.2 Create New Project
1. Click "New Project" → "Deploy from GitHub"
2. Connect your GitHub repository containing this code
3. Select the repository and branch

### 1.3 Configure Environment Variables
In Railway dashboard, go to **Variables** and add:
```
PORT=5000
NODE_ENV=production
```

### 1.4 Set Build Command
Go to **Settings** → **Build** and ensure:
- **Build Command**: (leave empty - Node.js auto-detects)
- **Start Command**: `node server/server.js`

### 1.5 Get Your Backend URL
Once deployed, Railway provides a public URL like: `https://your-app-name.railway.app`

**Copy this URL** - you'll need it for the frontend!

---

## Step 2: Deploy Frontend to Netlify

### 2.1 Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub

### 2.2 Update API URL in Frontend
Before pushing to GitHub, update the API URL in `client/app.js`:

Find this line in the constructor:
```javascript
this.apiBaseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : localStorage.getItem('apiBaseUrl') || 'https://your-railway-url.railway.app';
```

Replace `https://your-railway-url.railway.app` with your actual Railway URL from Step 1.5

### 2.3 New Site from Git
1. Click "Add new site" → "Import an existing project"
2. Connect GitHub and select your repository
3. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `client`
   - Click "Deploy site"

### 2.4 Verify Deployment
- Netlify provides a URL like: `https://your-site-name.netlify.app`
- Test the dashboard by uploading your Excel file

---

## Step 3: Update Production API URL (if needed)

If you need to change the backend URL after deployment:

### Option A: Update in Code (Recommended)
Edit `client/app.js` constructor and redeploy:
```javascript
this.apiBaseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://your-railway-url.railway.app';
```

### Option B: Use Browser Console (Temporary)
In Netlify site console:
```javascript
localStorage.setItem('apiBaseUrl', 'https://your-railway-url.railway.app');
```

---

## Troubleshooting

### "Cannot reach backend" error
- Verify Railway deployment is running (check Railway dashboard)
- Confirm API URL in `client/app.js` matches your Railway URL
- Check CORS is enabled in `server/server.js`

### File uploads not working
- Ensure Railway has write permissions (temp directories created automatically)
- Check Railway logs for upload errors

### Excel references wrong URL
- This is normal - downloaded files contain no URL references
- Just verify on-page functionality works

---

## Free Tier Limits

**Netlify Free:**
- 100 GB/month bandwidth
- Unlimited sites
- Automatic HTTPS

**Railway Free:**
- $5/month credits (usually sufficient for low-traffic app)
- Monitor usage in Railway dashboard
- Add payment method if you exceed credits

---

## Environment Variables Cheat Sheet

| Service | Variable | Value |
|---------|----------|-------|
| Railway | `NODE_ENV` | `production` |
| Railway | `PORT` | `5000` |
| Client | `apiBaseUrl` | Your Railway URL |

---

## Next Steps
1. Push your code to GitHub
2. Deploy backend to Railway first
3. Get Railway URL
4. Update `client/app.js` with Railway URL
5. Deploy frontend to Netlify
6. Test the live dashboard!

