import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import expenseService from '../services/expenseService';

const TripExport = ({ trip, open, onClose }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeItinerary: true,
    includeExpenses: true,
    includeBookings: true,
    includeObjectives: true,
    includeSummary: true
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      if (exportFormat === 'csv' && exportOptions.includeExpenses) {
        // Export expenses to CSV
        const expenses = await expenseService.getTripExpenses(trip.id);
        const csv = expenseService.exportToCSV(expenses);
        downloadFile(csv, `${trip.title}_expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
      } else if (exportFormat === 'pdf') {
        // Generate PDF
        await generatePDF();
      } else if (exportFormat === 'excel') {
        // Generate Excel
        await generateExcel();
      }
      
      onClose();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const generatePDF = async () => {
    // In a real implementation, you would use a library like jsPDF or pdfmake
    // For now, we'll create a formatted HTML and trigger print
    const content = generateHTMLContent();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const generateExcel = async () => {
    // In a real implementation, you would use a library like xlsx
    // For now, we'll create a CSV with all data
    const data = await generateExportData();
    const csv = convertToCSV(data);
    downloadFile(csv, `${trip.title}_complete_${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const generateHTMLContent = () => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${trip.title} - Trip Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .section { margin-bottom: 30px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
    `;

    // Header
    html += `
      <div class="header">
        <h1>${trip.title}</h1>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Dates:</strong> ${format(new Date(trip.startDate), 'MMM dd, yyyy')} - ${format(new Date(trip.endDate), 'MMM dd, yyyy')}</p>
        <p><strong>Total Budget:</strong> $${trip.totalBudget || 0}</p>
      </div>
    `;

    // Summary
    if (exportOptions.includeSummary) {
      html += `
        <div class="section">
          <h2>Trip Summary</h2>
          <p>${trip.description || 'No description provided.'}</p>
          <p><strong>Purpose:</strong> ${trip.purpose || 'Business development'}</p>
          <p><strong>Status:</strong> ${trip.status}</p>
        </div>
      `;
    }

    // Objectives
    if (exportOptions.includeObjectives && trip.objectives?.length > 0) {
      html += `
        <div class="section">
          <h2>Objectives</h2>
          <ul>
            ${trip.objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Itinerary
    if (exportOptions.includeItinerary && trip.itinerary?.length > 0) {
      html += `
        <div class="section">
          <h2>Itinerary</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>Location</th>
                <th>Duration</th>
                <th>Agenda</th>
              </tr>
            </thead>
            <tbody>
              ${trip.itinerary.map(item => `
                <tr>
                  <td>${item.scheduledDate ? format(new Date(item.scheduledDate), 'MMM dd, yyyy') : 'TBD'}</td>
                  <td>${item.company.name}</td>
                  <td>${item.company.location}</td>
                  <td>${Math.floor(item.proposedDuration / 60)}h ${item.proposedDuration % 60}m</td>
                  <td>${item.agendaItems?.filter(a => a).join(', ') || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Bookings
    if (exportOptions.includeBookings) {
      const allBookings = Object.values(trip.bookings || {}).flat();
      if (allBookings.length > 0) {
        html += `
          <div class="section">
            <h2>Bookings</h2>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Dates</th>
                  <th>Confirmation</th>
                  <th>Provider</th>
                </tr>
              </thead>
              <tbody>
                ${allBookings.map(booking => `
                  <tr>
                    <td>${booking.type}</td>
                    <td>${booking.name}</td>
                    <td>${format(new Date(booking.startDate), 'MMM dd')} - ${format(new Date(booking.endDate), 'MMM dd')}</td>
                    <td>${booking.confirmationNumber || 'N/A'}</td>
                    <td>${booking.provider || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    html += `
      </body>
      </html>
    `;

    return html;
  };

  const generateExportData = async () => {
    const data = {
      tripInfo: {
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.totalBudget,
        status: trip.status
      }
    };

    if (exportOptions.includeItinerary) {
      data.itinerary = trip.itinerary || [];
    }

    if (exportOptions.includeExpenses) {
      data.expenses = await expenseService.getTripExpenses(trip.id);
    }

    if (exportOptions.includeBookings) {
      data.bookings = Object.values(trip.bookings || {}).flat();
    }

    if (exportOptions.includeObjectives) {
      data.objectives = trip.objectives || [];
    }

    return data;
  };

  const convertToCSV = (data) => {
    // Simple CSV conversion - in production, use a proper CSV library
    let csv = 'Trip Export\n\n';
    
    // Trip Info
    csv += 'Trip Information\n';
    csv += `Title,${data.tripInfo.title}\n`;
    csv += `Destination,${data.tripInfo.destination}\n`;
    csv += `Start Date,${format(new Date(data.tripInfo.startDate), 'yyyy-MM-dd')}\n`;
    csv += `End Date,${format(new Date(data.tripInfo.endDate), 'yyyy-MM-dd')}\n`;
    csv += `Budget,$${data.tripInfo.budget}\n`;
    csv += `Status,${data.tripInfo.status}\n\n`;

    // Add other sections as needed
    return csv;
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleOptionChange = (option) => {
    setExportOptions({
      ...exportOptions,
      [option]: !exportOptions[option]
    });
  };

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h6">Export successful!</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Trip Data</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Export Format</FormLabel>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <FormControlLabel 
                value="pdf" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon />
                    <Box>
                      <Typography>PDF Report</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Comprehensive formatted report
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel 
                value="excel" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ExcelIcon />
                    <Box>
                      <Typography>Excel Spreadsheet</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Detailed data in spreadsheet format
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel 
                value="csv" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CsvIcon />
                    <Box>
                      <Typography>CSV (Expenses Only)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Simple expense report for accounting
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {exportFormat !== 'csv' && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Include in Export:
            </Typography>
            <List dense>
              <ListItem>
                <Checkbox
                  checked={exportOptions.includeSummary}
                  onChange={() => handleOptionChange('includeSummary')}
                />
                <ListItemText primary="Trip Summary" />
              </ListItem>
              <ListItem>
                <Checkbox
                  checked={exportOptions.includeObjectives}
                  onChange={() => handleOptionChange('includeObjectives')}
                />
                <ListItemText primary="Objectives" />
              </ListItem>
              <ListItem>
                <Checkbox
                  checked={exportOptions.includeItinerary}
                  onChange={() => handleOptionChange('includeItinerary')}
                />
                <ListItemText primary="Company Itinerary" />
              </ListItem>
              <ListItem>
                <Checkbox
                  checked={exportOptions.includeExpenses}
                  onChange={() => handleOptionChange('includeExpenses')}
                />
                <ListItemText primary="Expense Report" />
              </ListItem>
              <ListItem>
                <Checkbox
                  checked={exportOptions.includeBookings}
                  onChange={() => handleOptionChange('includeBookings')}
                />
                <ListItemText primary="Bookings" />
              </ListItem>
            </List>
          </Box>
        )}

        {exporting && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Generating export...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleExport} 
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={exporting}
        >
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripExport;