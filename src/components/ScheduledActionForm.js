import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Close as CloseIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { addScheduledAction } from '../services/companyService';

const actionTypes = [
  { value: 'visit', label: 'Schedule Visit' },
  { value: 'call', label: 'Schedule Call' },
  { value: 'meeting', label: 'Schedule Meeting' },
  { value: 'email', label: 'Send Email' },
  { value: 'follow_up', label: 'Follow Up' },
];

const ScheduledActionForm = ({ open, onClose, onSubmit, companyId }) => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    scheduledDate: dayjs(),
    status: 'pending',
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      scheduledDate: date
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const actionData = {
        ...formData,
        scheduledDate: formData.scheduledDate.toDate(),
      };
      await addScheduledAction(companyId, actionData);
      onSubmit(actionData);
      onClose();
      // Reset form
      setFormData({
        type: '',
        description: '',
        scheduledDate: dayjs(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error adding scheduled action:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      type: '',
      description: '',
      scheduledDate: dayjs(),
      status: 'pending',
    });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Schedule Action</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleInputChange('type')}
                    label="Action Type"
                  >
                    {actionTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <DatePicker
                  label="Scheduled Date"
                  value={formData.scheduledDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  variant="outlined"
                  placeholder="Add details about this scheduled action..."
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!formData.type || !formData.description.trim()}
            >
              Schedule Action
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduledActionForm; 