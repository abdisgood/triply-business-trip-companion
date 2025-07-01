import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
  IconButton,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Notes as NotesIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { countries } from 'country-list';

const statusOptions = [
  { value: 'new', label: 'New Lead' },
  { value: 'interested', label: 'Interested' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Meeting Scheduled' },
  { value: 'visited', label: 'Visited' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'not_interested', label: 'Not Interested' },
];

const actionTypes = [
  { value: 'visit', label: 'Schedule Visit' },
  { value: 'call', label: 'Schedule Call' },
  { value: 'meeting', label: 'Schedule Meeting' },
  { value: 'email', label: 'Send Email' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'research', label: 'Research' },
];

const predefinedTags = [
  'Technology', 'Manufacturing', 'E-commerce', 'Fintech', 'Healthcare',
  'Energy', 'Automotive', 'Real Estate', 'Education', 'Food & Beverage',
  'Textiles', 'Electronics', 'Pharmaceuticals', 'Logistics', 'Renewable Energy',
  'AI/ML', 'Blockchain', 'IoT', 'Green Technology', 'Export/Import',
  'Fortune 500', 'Startup', 'SME', 'Government', 'SOE'
];

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`company-tabpanel-${index}`}
    aria-labelledby={`company-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const EnhancedCompanyForm = ({ open, onClose, onSubmit, company = null, existingTags = [] }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    industry: '',
    description: '',
    status: 'new',
    tags: [],
    
    // Location
    country: '',
    city: '',
    address: '',
    postalCode: '',
    coordinates: { lat: null, lng: null },
    
    // Contact Info
    phone: '',
    email: '',
    website: '',
    
    // Rich text notes
    notes: '',
    
    // Contacts
    contacts: [],
    
    // Scheduled Actions
    scheduledActions: [],
  });

  // Temporary states for adding contacts and actions
  const [newContact, setNewContact] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    notes: '',
    isPrimary: false,
  });

  const [newAction, setNewAction] = useState({
    type: '',
    description: '',
    scheduledDate: dayjs(),
    priority: 'medium',
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        description: company.description || '',
        status: company.status || 'new',
        tags: company.tags || [],
        country: company.country || '',
        city: company.city || '',
        address: company.address || '',
        postalCode: company.postalCode || '',
        coordinates: company.coordinates || { lat: null, lng: null },
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        notes: company.notes || '',
        contacts: company.contacts || [],
        scheduledActions: company.scheduledActions || [],
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
      country: '',
      city: '',
      address: '',
      postalCode: '',
      coordinates: { lat: null, lng: null },
      phone: '',
      email: '',
      website: '',
      notes: '',
      contacts: [],
      scheduledActions: [],
    });
    setActiveStep(0);
    setTabValue(0);
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

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddContact = () => {
    if (newContact.name.trim()) {
      setFormData(prev => ({
        ...prev,
        contacts: [...prev.contacts, { ...newContact, id: Date.now() }]
      }));
      setNewContact({
        name: '',
        position: '',
        email: '',
        phone: '',
        notes: '',
        isPrimary: false,
      });
    }
  };

  const handleRemoveContact = (contactId) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }));
  };

  const handleAddAction = () => {
    if (newAction.type && newAction.description.trim()) {
      setFormData(prev => ({
        ...prev,
        scheduledActions: [...prev.scheduledActions, { 
          ...newAction, 
          id: Date.now(),
          scheduledDate: newAction.scheduledDate.toDate(),
          status: 'pending'
        }]
      }));
      setNewAction({
        type: '',
        description: '',
        scheduledDate: dayjs(),
        priority: 'medium',
      });
    }
  };

  const handleRemoveAction = (actionId) => {
    setFormData(prev => ({
      ...prev,
      scheduledActions: prev.scheduledActions.filter(action => action.id !== actionId)
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

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const steps = ['Basic Information', 'Location & Contact', 'Additional Details'];

  const allTags = Array.from(new Set([...predefinedTags, ...existingTags]));

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
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
          <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ minHeight: 400 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Step 0: Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Company Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Industry"
                    value={formData.industry}
                    onChange={handleInputChange('industry')}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={formData.website}
                    onChange={handleInputChange('website')}
                    variant="outlined"
                    placeholder="https://example.com"
                  />
                </Grid>
                
                <Grid item xs={12}>
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
                </Grid>

                <Grid item xs={12}>
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
                </Grid>
              </Grid>
            )}

            {/* Step 1: Location & Contact */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={countries.getNames()}
                    value={formData.country}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, country: newValue || '' }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Country" variant="outlined" />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    variant="outlined"
                    placeholder="Street address, building, district..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange('postalCode')}
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
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Phone Number
                  </Typography>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Additional Details */}
            {activeStep === 2 && (
              <Box>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                  <Tab label="Notes" icon={<NotesIcon />} />
                  <Tab label="Contacts" icon={<PersonIcon />} />
                  <Tab label="Scheduled Actions" icon={<ScheduleIcon />} />
                </Tabs>

                {/* Notes Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Typography variant="subtitle2" gutterBottom>
                    Company Notes (Rich Text)
                  </Typography>
                  <ReactQuill
                    theme="snow"
                    value={formData.notes}
                    onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                    modules={quillModules}
                    style={{ height: '200px', marginBottom: '50px' }}
                    placeholder="Add detailed notes about the company, meetings, opportunities..."
                  />
                </TabPanel>

                {/* Contacts Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Add New Contact</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={newContact.name}
                            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Position"
                            value={newContact.position}
                            onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={newContact.email}
                            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={newContact.phone}
                            onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Notes"
                            value={newContact.notes}
                            onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            onClick={handleAddContact}
                            startIcon={<AddIcon />}
                            disabled={!newContact.name.trim()}
                          >
                            Add Contact
                          </Button>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <List>
                    {formData.contacts.map((contact) => (
                      <ListItem key={contact.id} divider>
                        <ListItemText
                          primary={contact.name}
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={
                            <Box>
                              {contact.position && <Typography variant="body2">{contact.position}</Typography>}
                              {contact.email && <Typography variant="body2">{contact.email}</Typography>}
                              {contact.phone && <Typography variant="body2">{contact.phone}</Typography>}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleRemoveContact(contact.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>

                {/* Scheduled Actions Tab */}
                <TabPanel value={tabValue} index={2}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Schedule New Action</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Action Type</InputLabel>
                            <Select
                              value={newAction.type}
                              onChange={(e) => setNewAction(prev => ({ ...prev, type: e.target.value }))}
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
                        <Grid item xs={12} md={6}>
                          <DatePicker
                            label="Scheduled Date"
                            value={newAction.scheduledDate}
                            onChange={(date) => setNewAction(prev => ({ ...prev, scheduledDate: date }))}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                variant: 'outlined'
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Description"
                            value={newAction.description}
                            onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            onClick={handleAddAction}
                            startIcon={<AddIcon />}
                            disabled={!newAction.type || !newAction.description.trim()}
                          >
                            Schedule Action
                          </Button>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  <List>
                    {formData.scheduledActions.map((action) => (
                      <ListItem key={action.id} divider>
                        <ListItemText
                          primary={actionTypes.find(t => t.value === action.type)?.label}
                          primaryTypographyProps={{ component: 'div' }}
                          secondaryTypographyProps={{ component: 'div' }}
                          secondary={
                            <Box>
                              <Typography variant="body2">{action.description}</Typography>
                              <Typography variant="caption">
                                {dayjs(action.scheduledDate).format('MMM DD, YYYY')}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleRemoveAction(action.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button 
                onClick={onClose} 
                color="inherit"
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                )}
                
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading || !formData.name.trim()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.name.trim()}
                  >
                    {loading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
                  </Button>
                )}
              </Box>
            </Box>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EnhancedCompanyForm; 