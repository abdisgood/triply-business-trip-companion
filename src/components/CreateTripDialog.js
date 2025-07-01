import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../contexts/AIContext';

const steps = ['Basic Info', 'Objectives & AI', 'Collaboration', 'Review'];

const CreateTripDialog = ({ open, onClose }) => {
  const { createTrip, loading } = useTrip();
  const { generateCompanySuggestions, checkCredits, getCreditCost } = useAI();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: dayjs().add(1, 'week'),
    endDate: dayjs().add(1, 'week').add(3, 'days'),
    objectives: '',
    industry: null,
    totalBudget: '',
    collaboratorEmails: [],
    useAI: false,
    aiSuggestions: []
  });
  const [emailInput, setEmailInput] = useState('');
  const [errors, setErrors] = useState({});
  const [aiLoading, setAiLoading] = useState(false);

  const industries = [
    'Technology',
    'Manufacturing',
    'Healthcare',
    'Finance',
    'Retail',
    'Energy',
    'Automotive',
    'Telecommunications',
    'Real Estate',
    'Transportation',
    'Other'
  ];

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleDateChange = (field) => (newValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Trip title is required';
        if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.endDate && formData.startDate && formData.endDate.isBefore(formData.startDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;
      case 1: // Objectives
        if (!formData.objectives.trim()) newErrors.objectives = 'Trip objectives are required';
        break;
      case 2: // Collaboration - no required fields
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateAISuggestions = async () => {
    if (!formData.objectives.trim() || !formData.destination.trim()) {
      setErrors({
        objectives: !formData.objectives.trim() ? 'Objectives required for AI suggestions' : null,
        destination: !formData.destination.trim() ? 'Destination required for AI suggestions' : null
      });
      return;
    }

    const creditsNeeded = getCreditCost('tripObjectives');
    if (!checkCredits(creditsNeeded)) {
      setErrors({ ai: `Insufficient AI credits. Need ${creditsNeeded} credits.` });
      return;
    }

    try {
      setAiLoading(true);
      const suggestions = await generateCompanySuggestions(
        formData.objectives,
        formData.destination,
        formData.industry || null
      );
      setFormData(prev => ({ ...prev, aiSuggestions: suggestions }));
    } catch (error) {
      setErrors({ ai: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddEmail = () => {
    if (emailInput.trim() && !formData.collaboratorEmails.includes(emailInput.trim())) {
      setFormData(prev => ({
        ...prev,
        collaboratorEmails: [...prev.collaboratorEmails, emailInput.trim()]
      }));
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (emailToRemove) => {
    setFormData(prev => ({
      ...prev,
      collaboratorEmails: prev.collaboratorEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async () => {
    try {
      const tripData = {
        title: formData.title,
        destination: formData.destination,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
        objectives: formData.objectives,
        industry: formData.industry,
        totalBudget: parseFloat(formData.totalBudget) || 0,
        collaboratorEmails: formData.collaboratorEmails,
        aiSuggestions: formData.aiSuggestions
      };

      await createTrip(tripData);
      onClose();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      destination: '',
      startDate: dayjs().add(1, 'week'),
      endDate: dayjs().add(1, 'week').add(3, 'days'),
      objectives: '',
      industry: null,
      totalBudget: '',
      collaboratorEmails: [],
      useAI: false,
      aiSuggestions: []
    });
    setErrors({});
    setEmailInput('');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trip Title"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., China Business Development Trip 2024"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                onChange={handleInputChange('destination')}
                error={!!errors.destination}
                helperText={errors.destination}
                placeholder="e.g., Beijing, China"
              />
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={handleDateChange('endDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget (USD)"
                type="number"
                value={formData.totalBudget}
                onChange={handleInputChange('totalBudget')}
                placeholder="e.g., 5000"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Trip Objectives"
                value={formData.objectives}
                onChange={handleInputChange('objectives')}
                error={!!errors.objectives}
                helperText={errors.objectives || 'Describe what you want to achieve on this trip'}
                placeholder="e.g., Establish partnerships with Chinese manufacturers, explore new market opportunities, meet potential suppliers..."
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={industries}
                value={formData.industry}
                onChange={(event, newValue) => setFormData(prev => ({ ...prev, industry: newValue }))}
                getOptionLabel={(option) => option || ''}
                isOptionEqualToValue={(option, value) => option === value}
                clearOnBlur
                clearOnEscape
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Industry Focus (Optional)"
                    placeholder="Select relevant industry"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'primary.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI-Powered Company Suggestions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Use AI to automatically generate a list of relevant companies to visit based on your objectives.
                    Cost: {getCreditCost('tripObjectives')} AI credits
                  </Typography>
                  
                  {errors.ai && (
                    <Alert severity="error" sx={{ mt: 2 }}>{errors.ai}</Alert>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleGenerateAISuggestions}
                      disabled={aiLoading || !checkCredits(getCreditCost('tripObjectives'))}
                      startIcon={aiLoading ? <CircularProgress size={20} /> : null}
                    >
                      {aiLoading ? 'Generating...' : 'Generate Suggestions'}
                    </Button>
                    {!checkCredits(getCreditCost('tripObjectives')) && (
                      <Typography variant="body2" color="error">
                        Insufficient credits
                      </Typography>
                    )}
                  </Box>

                  {formData.aiSuggestions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        AI Suggested Companies ({formData.aiSuggestions.length}):
                      </Typography>
                      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {formData.aiSuggestions.map((company, index) => (
                          <Chip
                            key={index}
                            label={`${company.name} (${company.priority})`}
                            size="small"
                            sx={{ m: 0.5 }}
                            color={company.priority === 'high' ? 'primary' : 'default'}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invite Collaborators
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add team members who will collaborate on this trip. They'll receive email invitations.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  placeholder="colleague@company.com"
                />
                <Button variant="outlined" onClick={handleAddEmail}>
                  Add
                </Button>
              </Box>
            </Grid>
            {formData.collaboratorEmails.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Collaborators:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.collaboratorEmails.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveEmail(email)}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review Trip Details
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom><strong>Trip Overview</strong></Typography>
                  <Typography><strong>Title:</strong> {formData.title}</Typography>
                  <Typography><strong>Destination:</strong> {formData.destination}</Typography>
                  <Typography><strong>Dates:</strong> {formData.startDate.format('MMM DD, YYYY')} - {formData.endDate.format('MMM DD, YYYY')}</Typography>
                  <Typography><strong>Budget:</strong> ${formData.totalBudget || 'Not set'}</Typography>
                  {formData.industry && <Typography><strong>Industry:</strong> {formData.industry}</Typography>}
                  
                  <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom><strong>Objectives</strong></Typography>
                  <Typography variant="body2">{formData.objectives}</Typography>
                  
                  {formData.collaboratorEmails.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom><strong>Collaborators</strong></Typography>
                      <Typography variant="body2">{formData.collaboratorEmails.join(', ')}</Typography>
                    </>
                  )}

                  {formData.aiSuggestions.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom><strong>AI Suggestions</strong></Typography>
                      <Typography variant="body2">{formData.aiSuggestions.length} companies suggested</Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            {errors.submit && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create New Business Trip
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {renderStepContent()}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Trip'}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateTripDialog; 