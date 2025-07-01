import React, { useState, useEffect } from 'react';
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
  Chip,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const statusOptions = [
  { value: 'new', label: 'New Lead' },
  { value: 'interested', label: 'Interested' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Meeting Scheduled' },
  { value: 'visited', label: 'Visited' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'not_interested', label: 'Not Interested' },
];

const predefinedTags = [
  'Technology', 'Manufacturing', 'E-commerce', 'Fintech', 'Healthcare',
  'Energy', 'Automotive', 'Real Estate', 'Education', 'Food & Beverage',
  'Textiles', 'Electronics', 'Pharmaceuticals', 'Logistics', 'Renewable Energy',
  'AI/ML', 'Blockchain', 'IoT', 'Green Technology', 'Export/Import',
  'Fortune 500', 'Startup', 'SME', 'Government', 'SOE'
];

const CompanyForm = ({ open, onClose, onSubmit, company = null, existingTags = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    status: 'new',
    tags: [],
    phone: '',
    email: '',
    website: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        description: company.description || '',
        status: company.status || 'new',
        tags: company.tags || [],
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        city: company.city || '',
        country: company.country || '',
      });
    } else {
      resetForm();
    }
  }, [company, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      description: '',
      status: 'new',
      tags: [],
      phone: '',
      email: '',
      website: '',
      city: '',
      country: '',
    });
    setError(null);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'Failed to save company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(new Set([...predefinedTags, ...existingTags]));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={600}>
            {company ? 'Edit Company' : 'Add New Company'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              fullWidth
              label="Company Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Industry"
              value={formData.industry}
              onChange={handleInputChange('industry')}
              variant="outlined"
            />
            
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleInputChange('status')}
                label="Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange('city')}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleInputChange('country')}
                variant="outlined"
              />
            </Box>
            
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Website"
              value={formData.website}
              onChange={handleInputChange('website')}
              variant="outlined"
              placeholder="https://example.com"
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleInputChange('description')}
              variant="outlined"
              placeholder="Brief description of the company and business focus..."
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                value={formData.tags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      color="secondary"
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select or type tags..."
                    variant="outlined"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button 
            onClick={onClose} 
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
            sx={{
              background: 'linear-gradient(45deg, #d32f2f 30%, #ffc107 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #b71c1c 30%, #ff8f00 90%)',
              },
            }}
          >
            {loading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CompanyForm; 