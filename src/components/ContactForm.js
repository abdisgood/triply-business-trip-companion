import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { addContact } from '../services/companyService';

const ContactForm = ({ open, onClose, onSubmit, companyId, contact = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        position: contact.position || '',
        email: contact.email || '',
        phone: contact.phone || '',
        notes: contact.notes || '',
      });
    } else {
      setFormData({
        name: '',
        position: '',
        email: '',
        phone: '',
        notes: '',
      });
    }
  }, [contact, open]);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addContact(companyId, formData);
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position/Title"
                value={formData.position}
                onChange={handleInputChange('position')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {contact ? 'Update' : 'Add'} Contact
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactForm; 