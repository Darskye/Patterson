# System Architecture - Tier II Compliance Dashboard

## Overview
A full-stack web application for managing and visualizing Tier II environmental compliance reporting across 60+ facilities in the United States.

## Technology Stack

```
Frontend (Client)           Backend (Server)           Database
├── HTML5                   ├── Node.js                └── JSON File
├── CSS3 (Dark Theme)       ├── Express.js                (compliance_data.json)
├── Vanilla JavaScript      ├── Multer (File Upload)
├── Chart.js                ├── XLSX (Excel I/O)
└── Leaflet.js              └── CORS
                                
External Services
├── CDN for Chart.js
├── CDN for Leaflet Maps
├── CartoDB for Map Tiles
└── OpenStreetMap Attribution
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Tier II Compliance Dashboard             │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Header with Logo & Action Buttons             │  │   │
│  │  │  (Upload, Export)                              │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Summary Cards (5 KPIs)                        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Charts Section (4 visualizations)             │  │   │
│  │  │  • Reporting Status (Doughnut)                 │  │   │
│  │  │  • 2025 Reporter (Pie)                         │  │   │
│  │  │  • Filing Fee (Bar)                            │  │   │
│  │  │  • States Distribution (Horizontal Bar)        │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Interactive US Map                            │  │   │
│  │  │  (Color-coded plant markers)                   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Searchable/Filterable Plants Table            │  │   │
│  │  │  (with Edit buttons)                           │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Edit Modal (Inline Form)                      │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                        HTTP/REST
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
    POST /api/upload                  GET /api/data
    PUT /api/data/:id                 GET /api/summary
    GET /api/export                   GET /api/health
                                      
│                          
└─────────────────────────────────────────────────────────┐
│                  NODE.JS/EXPRESS SERVER                 │
│                  (Port 5000)                            │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Route Handlers                                │   │
│  │  ├── POST /api/upload                          │   │
│  │  ├── GET /api/data                             │   │
│  │  ├── GET /api/summary                          │   │
│  │  ├── PUT /api/data/:id                         │   │
│  │  ├── GET /api/export                           │   │
│  │  └── GET /api/health                           │   │
│  └────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌──────────────────────┴───────────────────────┐     │
│  │  Middleware                                  │     │
│  │  ├── CORS                                    │     │
│  │  ├── JSON Parser                             │     │
│  │  ├── Static File Serving                     │     │
│  │  └── Multer (File Upload)                    │     │
│  └──────────────────────┬───────────────────────┘     │
│                         │                               │
│  ┌──────────────────────┴───────────────────────┐     │
│  │  Data Processing                             │     │
│  │  ├── XLSX.js (Excel Parsing)                 │     │
│  │  ├── Data Validation                         │     │
│  │  └── Status Calculation                      │     │
│  └──────────────────────┬───────────────────────┘     │
│                         │                               │
│  ┌──────────────────────┴───────────────────────┐     │
│  │  Persistent Storage                          │     │
│  │  └── compliance_data.json                    │     │
│  └──────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Upload Flow
```
User selects Excel File
         │
         ▼
Multer validates & stores file
         │
         ▼
XLSX.js parses Excel sheet
         │
         ▼
Data transformed to JSON format
         │
         ▼
Saved to compliance_data.json
         │
         ▼
Response sent to browser
         │
         ▼
Dashboard auto-refreshes with new data
```

### 2. Display Flow
```
User opens dashboard
         │
         ▼
Browser makes GET /api/data request
         │
         ▼
Server reads compliance_data.json
         │
         ▼
JSON data returned to browser
         │
         ▼
JavaScript renders:
├── Summary cards (calculations)
├── Charts (using Chart.js)
├── Map markers (using Leaflet)
└── Table rows (DOM manipulation)
```

### 3. Edit Flow
```
User clicks Edit button on plant row
         │
         ▼
Modal opens with pre-filled data
         │
         ▼
User updates fields
         │
         ▼
Submit form
         │
         ▼
PUT /api/data/:id request
         │
         ▼
Server updates compliance_data.json
         │
         ▼
Response sent to browser
         │
         ▼
Dashboard re-renders with new data
```

### 4. Export Flow
```
User clicks Export Excel
         │
         ▼
GET /api/export request
         │
         ▼
Server reads current compliance_data.json
         │
         ▼
XLSX.js converts JSON to Excel sheet
         │
         ▼
Excel file generated in memory
         │
         ▼
File downloaded to user's computer
```

## File Descriptions

### Server Files

**server.js**
- Main Express application
- Defines all API routes
- Handles file uploads with Multer
- Manages data persistence

**package.json**
- Node.js project configuration
- Lists all dependencies
- Defines npm scripts

**.env**
- Environment configuration
- PORT setting
- NODE_ENV mode

### Client Files

**index.html**
- Main page structure
- Imports external libraries (Chart.js, Leaflet, XLSX)
- Contains modal forms and empty states
- Semantic HTML5 markup

**styles.css**
- Complete dashboard styling
- US Compliance color scheme
- Responsive design (mobile, tablet, desktop)
- Dark theme with teal accents
- ~650 lines of custom CSS

**app.js**
- ComplianceDashboard class
- Event handling (uploads, searches, edits)
- Chart rendering with Chart.js
- Map rendering with Leaflet
- API communication

**state-coordinates.js**
- Latitude/longitude for all 50 US states
- Used for positioning markers on map

## API Specification

### POST /api/upload
**Purpose:** Upload and parse Excel file
```javascript
Request: FormData { file: File }
Response: {
  success: boolean,
  message: string,
  data: Plant[]
}
```

### GET /api/data
**Purpose:** Retrieve all compliance data
```javascript
Response: Plant[]
```

### GET /api/summary
**Purpose:** Get summary statistics
```javascript
Response: {
  total_plants: number,
  reporting_status: { completed, in_progress, not_started, overdue },
  filing_fee_status: { completed, pending },
  reporter_2025: { yes, no, unknown },
  states: number
}
```

### PUT /api/data/:id
**Purpose:** Update plant record
```javascript
Request: {
  reporting_status: string,
  filing_fee: string,
  reporter_2025: string,
  additional_fee: string,
  additional_steps: string,
  notes: string
}
Response: Plant (updated object)
```

### GET /api/export
**Purpose:** Export data to Excel
```
Response: Excel file (binary)
```

## Data Model

### Plant Object
```javascript
{
  id: number,              // Unique identifier
  plant_name: string,      // PLANT_LOCATION_NAME
  full_address: string,    // FULL_ADDRESS
  city: string,            // CITY
  state: string,           // STATE (2-letter code)
  reporter_2025: string,   // Yes/No/Pending
  reporting_status: string,// Not Started/In Progress/Completed/Overdue
  filing_fee: string,      // Payment status
  additional_fee: string,  // Outstanding fees
  additional_steps: string,// Remaining tasks
  notes: string           // Additional info
}
```

## Color Scheme

### Primary Colors
- Primary Teal: `#1A9B8E` - Main accent color
- Dark Teal: `#0F6B63` - Darker accent
- Dark Background: `#0F1415` - Main background
- Card Background: `#1A2126` - Secondary background

### Text Colors
- Primary Text: `#FFFFFF` - Main text
- Secondary Text: `#B0B8C1` - Muted text

### Status Colors
- Success/Completed: `#27ae60` (Green)
- In Progress: `#f39c12` (Orange)
- Not Started: `#e74c3c` (Red)
- Overdue: `#c0392b` (Dark Red)

## Deployment Considerations

### Local Development
- Run on localhost:5000
- Data stored in JSON file
- No database required

### Production
- Use environment variables for configuration
- Implement authentication
- Store data in proper database (MongoDB, PostgreSQL)
- Add HTTPS support
- Implement error logging
- Add backup/restore functionality
- Scale to multiple servers if needed

## Security Notes

**Current Implementation:**
- No authentication (shared dashboard)
- No input validation (assumes valid Excel)
- No HTTPS

**Recommendations for Production:**
- Add user authentication
- Validate all inputs server-side
- Implement HTTPS/TLS
- Add CSRF protection
- Sanitize user inputs
- Add audit logging
- Implement rate limiting
- Use environment variables for sensitive data

## Performance

- Chart rendering: ~500ms (with Chart.js)
- Map rendering: ~1-2 seconds (Leaflet with CDN tiles)
- Table rendering: ~200ms (60 rows)
- Excel export: ~1-2 seconds

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (uses ES6 features)

---

**Version:** 1.0.0 | **Created:** February 2026
