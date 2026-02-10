# Tier II Compliance Reporting Dashboard

A professional browser-based dashboard for tracking Tier II environmental compliance reporting for multiple plant locations across the United States.

## Features

✨ **Core Features:**
- 📤 **Excel Import** - Upload your compliance data from Excel files
- 📊 **Data Visualizations** - Pie charts, bar charts, and doughnut charts showing compliance status
- 🗺️ **Interactive US Map** - Visual representation of all plant locations with status indicators
- 📋 **Detailed Plant Table** - Comprehensive view of all 60+ plants with searchable/filterable data
- ✏️ **Edit Functionality** - Update plant records directly from the dashboard
- 📥 **Excel Export** - Download updated data back to Excel format
- 🎨 **Professional Branding** - Uses US Compliance colors and design system

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation & Setup

1. **Navigate to the project directory:**
   ```bash
   cd c:\Users\darr6\Projects\Patterson\server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5000`

4. **Open in browser:**
   - Navigate to `http://localhost:5000` in your web browser

5. **Upload your Excel file:**
   - Click "Upload Your Excel File" or drag and drop your Excel file
   - The system will parse and display your compliance data

## File Structure

```
Patterson/
├── server/
│   ├── server.js           # Express backend server
│   ├── package.json        # Node.js dependencies
│   ├── .env               # Environment variables
│   └── uploads/           # Temporary upload directory
│
├── client/
│   ├── index.html         # Main dashboard HTML
│   ├── styles.css         # Dashboard styling (US Compliance theme)
│   ├── app.js            # Main dashboard logic
│   └── state-coordinates.js  # US state location data
│
├── Summary Test.xlsx       # Your compliance data file
└── README.md              # This file
```

## Dashboard Components

### Summary Cards
- **Total Plants** - Count of all tracked facilities
- **Completed Reports** - Number of submitted reports with completion percentage
- **In Progress** - Reports currently being processed
- **Overdue/Not Started** - Items requiring immediate attention
- **States Covered** - Geographic diversity of operations

### Visualizations
1. **Reporting Status Chart** (Doughnut) - Distribution of completion status
2. **2025 Reporter Chart** (Pie) - Yes/No/Pending reporter status
3. **Filing Fee Chart** (Bar) - Payment status overview
4. **States Chart** (Horizontal Bar) - Top 15 states by plant count

### Interactive Map
- Shows all plant locations on a US map
- Color-coded markers:
  - 🟢 Green - Completed
  - 🟠 Orange - In Progress
  - 🔴 Red - Not Started
  - 🔴 Dark Red - Overdue
- Click markers for detailed plant information

### Plants Table
- Searchable by plant name, city, or state
- Filterable by reporting status
- Direct edit access for each plant
- Quick view of filing and reporting status

## Data Management

### Uploading Data
- Click the "Upload Excel" button or upload area
- Drag and drop your .xlsx or .xls file
- System automatically parses and displays data

### Editing Plant Records
1. Click the "Edit" button on any plant row
2. Update the fields as needed
3. Click "Save Changes"
4. Changes are saved immediately in the system

### Exporting Data
- Click the "Export Excel" button
- A new Excel file with current data is downloaded
- Perfect for sharing updates with stakeholders

## Excel File Format

Your Excel file should contain these columns:
- **PLANT_LOCATION_NAME** - Name of the facility
- **FULL_ADDRESS** - Complete street address
- **CITY** - City name
- **STATE** - State abbreviation (e.g., TX, CA)
- **2025 Reporter?** - Yes/No/Pending
- **Reporting Status** - Not Started/In Progress/Completed/Overdue
- **Filing Fee** - Payment status
- **Additional Fee/ Unpaid Fee** - Outstanding fees
- **Additional Steps** - Remaining tasks
- **Notes** - Additional information

## API Endpoints

### Server Routes
- `POST /api/upload` - Upload and parse Excel file
- `GET /api/data` - Get all compliance data
- `GET /api/summary` - Get summary statistics
- `PUT /api/data/:id` - Update a plant record
- `GET /api/export` - Export data to Excel
- `GET /api/health` - Health check

## Color Scheme (US Compliance)

```
Primary Teal:     #1A9B8E
Dark Teal:        #0F6B63
Dark Background:  #0F1415
Card Background:  #1A2126
Text Primary:     #FFFFFF
Text Secondary:   #B0B8C1
Border:           #2D3A44

Status Colors:
Success/Completed: #27ae60 (Green)
In Progress:       #f39c12 (Orange)
Not Started:       #e74c3c (Red)
Overdue:           #c0392b (Dark Red)
```

## Troubleshooting

### Server won't start
- Check that port 5000 is not in use
- Verify Node.js is installed: `node --version`
- Re-run `npm install` to ensure dependencies are installed

### File upload fails
- Ensure file is in Excel format (.xlsx or .xls)
- File should follow the structure outlined above
- Check file size is reasonable (not corrupted)

### Map not showing
- Verify internet connection (map tiles load from CDN)
- Check browser console for errors
- Clear browser cache and refresh

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to auto-restart the server on file changes

### Changing the Port
Edit `server/.env`:
```
PORT=3000
```

## Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Data Handling:** XLSX.js for Excel parsing
- **Visualizations:** Chart.js for charts
- **Mapping:** Leaflet.js for interactive maps
- **Styling:** Custom CSS with US Compliance color scheme

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server console logs
3. Check browser developer console for errors

## License

Proprietary - US Compliance

---

**Version:** 1.0.0  
**Last Updated:** February 2026
