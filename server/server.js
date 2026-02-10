const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static('uploads'));

// Configure multer for Excel and general file uploads
const excelUpload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Configure multer for plant files (any file type)
const plantFileUpload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

let cachedData = null;
const DATA_FILE = 'compliance_data.json';

// Load data from file on startup
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    cachedData = JSON.parse(fileContent);
    return cachedData;
  }
  return null;
}

// Save data to file
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  cachedData = data;
}

// Extract first address from potentially multi-address field
function getFirstAddress(fullAddress) {
  if (!fullAddress) return '';
  // Split by comma and take first part
  return fullAddress.split(',')[0].trim();
}

// Routes

// Upload and parse Excel file
app.post('/api/upload', excelUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Parse the data
    const parsedData = jsonData.map((row, index) => ({
      id: index + 1,
      plant_name: row['PLANT_LOCATION_NAME'] || '',
      full_address: row['FULL_ADDRESS'] || '',
      address_only: getFirstAddress(row['FULL_ADDRESS'] || ''),
      city: row['CITY'] || '',
      state: row['STATE'] || '',
      reporter_2025: row['2025 Reporter?'] || 'Pending',
      reporting_status: row['Reporting Status'] || 'Not Started',
      filing_fee: parseFloat(row['Filing Fee']) || 0, // Convert to number
      filing_fee_paid: parseFloat(row['Filing Fee']) > 0 ? 'Completed' : 'Not Completed', // Track payment status
      additional_fee: row['Additional Fee/ Unpaid Fee'] || 'None',
      additional_steps: row['Additional Steps'] || 'None',
      notes: row['Notes'] || '',
      client_notes: '', // New field for client notes
      files: [] // New field for uploaded files
    }));

    // Save data
    saveData(parsedData);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      message: `Successfully uploaded ${parsedData.length} plants`,
      data: parsedData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all compliance data
app.get('/api/data', (req, res) => {
  const data = cachedData || loadData();
  if (!data) {
    return res.status(404).json({ error: 'No data available. Please upload an Excel file first.' });
  }
  res.json(data);
});

// Get summary statistics
app.get('/api/summary', (req, res) => {
  const data = cachedData || loadData();
  if (!data) {
    return res.status(404).json({ error: 'No data available' });
  }

  const summary = {
    total_plants: data.length,
    reporting_status: {
      completed: data.filter(p => p.reporting_status === 'Completed' || p.reporting_status === 'Complete').length,
      in_progress: data.filter(p => p.reporting_status === 'In Progress' || p.reporting_status === 'Pending').length,
      not_started: data.filter(p => p.reporting_status === 'Not Started' || !p.reporting_status).length,
      overdue: 0 // No plants are overdue - all due March 1st
    },
    filing_fee_status: {
      paid: data.filter(p => p.filing_fee && p.filing_fee > 0).length,
      pending: data.filter(p => !p.filing_fee || p.filing_fee === 0).length
    },
    filing_fee_total: data.reduce((sum, p) => sum + (parseFloat(p.filing_fee) || 0), 0),
    reporter_2025: {
      yes: data.filter(p => p.reporter_2025 && String(p.reporter_2025).toLowerCase().includes('yes')).length,
      no: data.filter(p => p.reporter_2025 && String(p.reporter_2025).toLowerCase().includes('no')).length,
      unknown: data.filter(p => !p.reporter_2025 || (String(p.reporter_2025).toLowerCase() !== 'yes' && String(p.reporter_2025).toLowerCase() !== 'no')).length
    },
    states: [...new Set(data.map(p => p.state))].length
  };

  res.json(summary);
});

// Update a plant record
app.put('/api/data/:id', (req, res) => {
  const data = cachedData || loadData();
  if (!data) {
    return res.status(404).json({ error: 'No data available' });
  }

  const plant = data.find(p => p.id === parseInt(req.params.id));
  if (!plant) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  Object.assign(plant, req.body);
  saveData(data);
  res.json(plant);
});

// Export data as Excel
app.get('/api/export', (req, res) => {
  const data = cachedData || loadData();
  if (!data) {
    return res.status(404).json({ error: 'No data available' });
  }

  // Convert data back to sheet format
  const ws = XLSX.utils.json_to_sheet(data.map(p => ({
    'PLANT_LOCATION_NAME': p.plant_name,
    'FULL_ADDRESS': p.full_address,
    'CITY': p.city,
    'STATE': p.state,
    '2025 Reporter?': p.reporter_2025,
    'Reporting Status': p.reporting_status,
    'Filing Fee': p.filing_fee,
    'Additional Fee/ Unpaid Fee': p.additional_fee,
    'Additional Steps': p.additional_steps,
    'Notes': p.notes,
    'Client Notes': p.client_notes
  })));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Compliance Data');

  // Set column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 15 },
    { wch: 8 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 }
  ];

  const filename = `Tier2_Compliance_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.write(wb, { bookType: 'xlsx', type: 'array', filename });
  
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
});

// Export all plants as a ZIP file with individual reports and files
app.get('/api/export-all-plants', (req, res) => {
  try {
    const data = cachedData || loadData();
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `All_Plants_${new Date().toISOString().split('T')[0]}.zip`;
    const zipPath = path.join(tempDir, zipFilename);
    const output = fs.createWriteStream(zipPath);

    archive.pipe(output);

    // Add individual plant reports and files
    data.forEach(plant => {
      // Create individual plant report
      const ws = XLSX.utils.json_to_sheet([{
        'Plant Name': plant.plant_name,
        'Address': plant.address_only,
        'State': plant.state,
        '2025 Reporter': plant.reporter_2025,
        'Reporting Status': plant.reporting_status,
        'Filing Fee': plant.filing_fee ? `$${plant.filing_fee.toFixed(2)}` : '',
        'Additional Fee': plant.additional_fee,
        'Additional Steps': plant.additional_steps,
        'Notes': plant.notes,
        'Client Notes': plant.client_notes
      }]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Plant Report');

      const reportPath = path.join(tempDir, `${plant.plant_name}_Report.xlsx`);
      XLSX.writeFile(wb, reportPath);
      archive.file(reportPath, { name: `reports/${plant.plant_name}_Report.xlsx` });

      // Add plant files
      const plantFileDir = path.join(__dirname, '../uploads', `plant_${plant.id}`);
      if (fs.existsSync(plantFileDir)) {
        const files = fs.readdirSync(plantFileDir);
        files.forEach(file => {
          const filePath = path.join(plantFileDir, file);
          archive.file(filePath, { name: `files/${plant.plant_name}/${file}` });
        });
      }
    });

    output.on('close', () => {
      res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
      res.setHeader('Content-Type', 'application/zip');
      res.download(zipPath, zipFilename, () => {
        // Clean up temp files
        fs.rm(tempDir, { recursive: true, force: true }, (err) => {
          if (err) console.error('Error cleaning temp files:', err);
        });
      });
    });

    archive.on('error', (err) => {
      res.status(500).json({ error: 'Failed to create archive' });
    });

    archive.finalize();
  } catch (error) {
    console.error('Error exporting all plants:', error);
    res.status(500).json({ error: 'Failed to export all plants' });
  }
});

// Upload file to specific plant
app.post('/api/plant/:id/files', plantFileUpload.single('file'), (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create plant-specific directory
    const plantFileDir = path.join('uploads', `plant_${plantId}`);
    if (!fs.existsSync(plantFileDir)) {
      fs.mkdirSync(plantFileDir, { recursive: true });
    }

    // Generate unique filename to avoid conflicts
    const fileExt = path.extname(req.file.originalname);
    const fileNameWithoutExt = path.basename(req.file.originalname, fileExt);
    const uniqueName = `${fileNameWithoutExt}_${Date.now()}${fileExt}`;
    const finalPath = path.join(plantFileDir, uniqueName);

    // Move file to plant directory
    fs.renameSync(req.file.path, finalPath);

    // Create file metadata
    const fileMetadata = {
      id: Date.now(),
      originalName: req.file.originalname,
      fileName: uniqueName,
      fileSize: req.file.size,
      uploadDate: new Date().toISOString(),
      path: `uploads/plant_${plantId}/${uniqueName}`
    };

    // Add to plant's files array
    if (!plant.files) {
      plant.files = [];
    }
    plant.files.push(fileMetadata);

    // Save updated data
    saveData(data);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get plant files
app.get('/api/plant/:id/files', (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(plant.files || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete plant file
app.delete('/api/plant/:id/files/:fileId', (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const fileId = parseInt(req.params.fileId);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const fileIndex = plant.files.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = plant.files[fileIndex];
    
    // Delete from filesystem
    const filePath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from data
    plant.files.splice(fileIndex, 1);
    saveData(data);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download plant file
app.get('/api/plant/:id/files/:fileId/download', (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const fileId = parseInt(req.params.fileId);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const file = plant.files.find(f => f.id === fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate and download plant report
app.get('/api/plant/:id/report', (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Create report data
    const reportData = [{
      'Plant Information': '',
      'Value': ''
    }];

    // Add plant details
    reportData.push({
      'Plant Name': plant.plant_name,
      'Value': ''
    });
    reportData.push({
      'Address': plant.address_only || plant.full_address,
      'Value': ''
    });
    reportData.push({
      'City': plant.city,
      'Value': ''
    });
    reportData.push({
      'State': plant.state,
      'Value': ''
    });

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({ 'Plant Information': 'Reporting Details', 'Value': '' });

    reportData.push({
      'Reporting Status': plant.reporting_status || 'Not Started',
      'Value': ''
    });
    reportData.push({
      '2025 Reporter?': plant.reporter_2025 || 'Unknown',
      'Value': ''
    });
    reportData.push({
      'Filing Fee': '$' + (plant.filing_fee || 0).toFixed(2),
      'Value': ''
    });
    reportData.push({
      'Additional Fee/Unpaid Fee': plant.additional_fee || 'None',
      'Value': ''
    });
    reportData.push({
      'Additional Steps': plant.additional_steps || 'None',
      'Value': ''
    });

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({ 'Plant Information': 'Notes', 'Value': '' });

    reportData.push({
      'Internal Notes': plant.notes || 'None',
      'Value': ''
    });
    reportData.push({
      'Client Notes': plant.client_notes || 'None',
      'Value': ''
    });

    if (plant.files && plant.files.length > 0) {
      reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
      reportData.push({ 'Plant Information': 'Attached Files', 'Value': '' });
      
      plant.files.forEach(file => {
        reportData.push({
          'File': file.originalName,
          'Size': (file.fileSize / 1024).toFixed(1) + ' KB'
        });
      });
    }

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({
      'Report Generated': new Date().toLocaleString(),
      'Value': ''
    });

    // Create Excel workbook
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plant Report');

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 40 }
    ];

    const filename = `${plant.plant_name}_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download plant report + all attached files as ZIP
app.get('/api/plant/:id/download-all', (req, res) => {
  try {
    const plantId = parseInt(req.params.id);
    const data = cachedData || loadData();
    
    if (!data) {
      return res.status(404).json({ error: 'No data available' });
    }

    const plant = data.find(p => p.id === plantId);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `${plant.plant_name}_Complete_${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    // Add report to ZIP
    const reportData = [{
      'Plant Information': '',
      'Value': ''
    }];

    // Add plant details
    reportData.push({
      'Plant Name': plant.plant_name,
      'Value': ''
    });
    reportData.push({
      'Address': plant.address_only || plant.full_address,
      'Value': ''
    });
    reportData.push({
      'City': plant.city,
      'Value': ''
    });
    reportData.push({
      'State': plant.state,
      'Value': ''
    });

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({ 'Plant Information': 'Reporting Details', 'Value': '' });

    reportData.push({
      'Reporting Status': plant.reporting_status || 'Not Started',
      'Value': ''
    });
    reportData.push({
      '2025 Reporter?': plant.reporter_2025 || 'Unknown',
      'Value': ''
    });
    reportData.push({
      'Filing Fee': '$' + (plant.filing_fee || 0).toFixed(2),
      'Value': ''
    });
    reportData.push({
      'Additional Fee/Unpaid Fee': plant.additional_fee || 'None',
      'Value': ''
    });
    reportData.push({
      'Additional Steps': plant.additional_steps || 'None',
      'Value': ''
    });

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({ 'Plant Information': 'Notes', 'Value': '' });

    reportData.push({
      'Internal Notes': plant.notes || 'None',
      'Value': ''
    });
    reportData.push({
      'Client Notes': plant.client_notes || 'None',
      'Value': ''
    });

    if (plant.files && plant.files.length > 0) {
      reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
      reportData.push({ 'Plant Information': 'Attached Files', 'Value': '' });
      
      plant.files.forEach(file => {
        reportData.push({
          'File': file.originalName,
          'Size': (file.fileSize / 1024).toFixed(1) + ' KB'
        });
      });
    }

    reportData.push({ 'Plant Information': '', 'Value': '' }); // Spacer
    reportData.push({
      'Report Generated': new Date().toLocaleString(),
      'Value': ''
    });

    // Create report Excel
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plant Report');
    ws['!cols'] = [{ wch: 30 }, { wch: 40 }];

    const reportBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    archive.append(reportBuffer, { name: `${plant.plant_name}_Report.xlsx` });

    // Add all plant files to ZIP
    if (plant.files && plant.files.length > 0) {
      const filesDir = path.join(__dirname, '..', 'uploads', `plant_${plantId}`);
      
      plant.files.forEach(file => {
        const filePath = path.join(filesDir, file.fileName);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `Files/${file.originalName}` });
        }
      });
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Tier II Compliance Dashboard Server running on http://localhost:${PORT}`);
  loadData();
});
