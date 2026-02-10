# Quick Deployment Checklist

## Before You Deploy

- [ ] Code pushed to GitHub repository
- [ ] All dependencies in `package.json`
- [ ] `.env.example` created with all required vars
- [ ] `.gitignore` configured (excludes node_modules, uploads, etc.)
- [ ] README updated with deployment info

## Step 1: Deploy Backend (5 mins)

1. **Create Railway Account** → [railway.app](https://railway.app)
2. **Connect GitHub** → Import repository
3. **Add Variables:** (Settings → Variables)
   - `PORT=5000`
   - `NODE_ENV=production`
4. **Set Start Command:** `node server/server.js`
5. **Deploy** → Get public URL (e.g., `https://app-prod-xyz123.railway.app`)
6. **Copy URL** → Save for next step

## Step 2: Update Frontend URL

Edit `client/app.js` line ~11:
```javascript
this.apiBaseUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://your-railway-url.railway.app';  // ← PASTE YOUR RAILWAY URL HERE
```

Push to GitHub.

## Step 3: Deploy Frontend (5 mins)

1. **Create Netlify Account** → [netlify.com](https://netlify.com)
2. **Connect GitHub** → Import repository
3. **Build Settings:**
   - Build command: (leave empty)
   - Publish dir: `client`
4. **Deploy** → Get Netlify URL

## Done! 🎉

Your dashboard is live at `https://your-site.netlify.app`

## Testing Checklist

- [ ] Upload Excel file works
- [ ] Dashboard displays with data
- [ ] Charts render correctly
- [ ] Download individual plant reports
- [ ] Download all plants as ZIP
- [ ] Edit plant data saves
- [ ] Upload files to plants

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot reach backend" | Check Railway URL in `client/app.js` |
| Files won't upload | Check Railway has temp directory write access |
| Blank dashboard | Open browser console (F12) for errors |
| 404 errors | Verify Railway deployment is running |

