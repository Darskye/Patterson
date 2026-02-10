# 🚀 Quick Start Guide - Tier II Compliance Dashboard

## Prerequisites
- **Node.js** version 14 or higher installed ([Download here](https://nodejs.org/))

## Installation (5 minutes)

### Option 1: Using the Batch File (Windows) ⭐ EASIEST
1. Open File Explorer
2. Navigate to: `c:\Users\darr6\Projects\Patterson\`
3. Double-click **start.bat**
4. Wait for dependencies to install automatically
5. Browser should open automatically to `http://localhost:5000`

### Option 2: Manual Installation (Windows PowerShell)
```powershell
cd c:\Users\darr6\Projects\Patterson\server
npm install
npm start
```

### Option 3: Manual Installation (macOS/Linux)
```bash
cd ~/Patterson/server
chmod +x ../start.sh  # Make script executable
../start.sh
```

## First Time Setup

Once the server is running and you see:
```
🚀 Tier II Compliance Dashboard Server running on http://localhost:5000
```

1. **Open your browser** to `http://localhost:5000`
2. **You'll see the welcome screen** with an upload button
3. **Click "Upload Your Excel File"** or drag and drop your `Summary Test.xlsx`
4. **The dashboard loads automatically** with all your data

## What You Get

After uploading your Excel file, you'll see:

### 📊 Dashboard Overview
- **Summary Cards** - Total plants, completed reports, in-progress, and overdue items
- **4 Interactive Charts** - Status distribution, reporter status, filing fees, plants by state
- **Live US Map** - Color-coded plant locations (green = complete, orange = in progress, red = not started)
- **Searchable Table** - All 60+ plants with ability to filter and edit

### ✏️ Edit Plant Records
- Click "Edit" on any plant row
- Update reporting status, filing fees, and notes
- Changes are saved instantly

### 📥 Export Data
- Click "Export Excel" to download updated data
- Perfect for sharing with your team

## File Structure
```
Patterson/
├── start.bat               ← Run this on Windows
├── start.sh                ← Run this on macOS/Linux
├── README.md               ← Full documentation
├── Summary Test.xlsx       ← Your compliance data
│
├── server/
│   ├── server.js          ← Backend
│   ├── package.json       ← Dependencies
│   └── .env               ← Configuration
│
└── client/
    ├── index.html         ← Dashboard UI
    ├── styles.css         ← Styling
    ├── app.js             ← Logic
    └── state-coordinates.js ← Map data
```

## Troubleshooting

### Port 5000 Already In Use
1. Close any other applications using port 5000
2. Or change PORT in `server/.env` to `3000` and restart

### Dependencies Won't Install
```bash
# Delete node_modules and try again
rm -r node_modules      # macOS/Linux
rmdir /s node_modules   # Windows PowerShell

npm install
```

### "Node is not recognized" (Windows)
- Restart PowerShell/Command Prompt after installing Node.js
- Or restart your computer

### Map Not Showing
- Check your internet connection (map tiles load from CDN)
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser

## Features Overview

| Feature | Description |
|---------|------------|
| 📤 **Upload Excel** | Import your compliance data in seconds |
| 📊 **Charts & Graphs** | Visual analysis of reporting status |
| 🗺️ **Interactive Map** | See all plants color-coded by status |
| 🔍 **Search & Filter** | Find plants instantly |
| ✏️ **Edit Records** | Update plant data in real-time |
| 📥 **Export Excel** | Download updated data anytime |
| 🎨 **Professional Design** | US Compliance branding and colors |

## Next Steps

1. **Start the server** using one of the methods above
2. **Upload your Excel file** with your compliance data
3. **Explore the dashboard** - interact with charts and map
4. **Edit plant records** as needed
5. **Export updated data** to share with your team

## Need Help?

1. Check the full [README.md](README.md) for detailed documentation
2. Look at the server console for error messages
3. Open browser Developer Tools (F12) to check for errors

---

**Version:** 1.0.0 | **Updated:** February 2026
