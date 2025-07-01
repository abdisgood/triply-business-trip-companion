import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Paper,
  Avatar,
  Divider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Psychology as AIIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../contexts/AIContext';
import aiService from '../services/aiService';
import companyService from '../services/companyService';

const TripItinerary = ({ trip, onUpdate }) => {
  const { addCompanyToItinerary, updateItineraryItem, removeCompanyFromItinerary } = useTrip();
  const { credits } = useAI();
  
  const [itinerary, setItinerary] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [itemForm, setItemForm] = useState({
    companyId: '',
    agendaItems: [''],
    proposedDuration: 120,
    scheduledDate: null,
    scheduledTime: null,
    notes: ''
  });

  useEffect(() => {
    if (trip && trip.itinerary) {
      // Sort itinerary by scheduled date/time
      const sorted = [...trip.itinerary].sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      });
      setItinerary(sorted);
    }
  }, [trip]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        companyId: item.companyId,
        agendaItems: item.agendaItems || [''],
        proposedDuration: item.proposedDuration || 120,
        scheduledDate: item.scheduledDate ? new Date(item.scheduledDate) : null,
        scheduledTime: item.scheduledTime,
        notes: item.notes || ''
      });
      setSelectedCompany(item.company);
    } else {
      setEditingItem(null);
      setItemForm({
        companyId: '',
        agendaItems: [''],
        proposedDuration: 120,
        scheduledDate: null,
        scheduledTime: null,
        notes: ''
      });
      setSelectedCompany(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setSelectedCompany(null);
  };

  const handleCompanySelect = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company);
    setItemForm({ ...itemForm, companyId });
  };

  const handleAddAgendaItem = () => {
    setItemForm({
      ...itemForm,
      agendaItems: [...itemForm.agendaItems, '']
    });
  };

  const handleUpdateAgendaItem = (index, value) => {
    const updated = [...itemForm.agendaItems];
    updated[index] = value;
    setItemForm({ ...itemForm, agendaItems: updated });
  };

  const handleRemoveAgendaItem = (index) => {
    const updated = itemForm.agendaItems.filter((_, i) => i !== index);
    setItemForm({ ...itemForm, agendaItems: updated });
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateItineraryItem(trip.id, editingItem.id, {
          ...itemForm,
          scheduledDate: itemForm.scheduledDate?.toISOString()
        });
      } else {
        await addCompanyToItinerary(trip.id, selectedCompany, itemForm.agendaItems);
      }
      await onUpdate();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving itinerary item:', error);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this company from the itinerary?')) {
      try {
        await removeCompanyFromItinerary(trip.id, itemId);
        await onUpdate();
      } catch (error) {
        console.error('Error removing itinerary item:', error);
      }
    }
  };

  const handleAIPlanner = async () => {
    if (credits.available < 10) {
      alert('Insufficient AI credits. Need 10 credits to generate an optimized itinerary.');
      return;
    }

    setLoadingAI(true);
    try {
      const itineraryData = await aiService.generateItinerary(trip, itinerary.map(i => i.company));
      
      // Update itinerary with AI suggestions
      // This is a simplified version - in production, you'd have a more sophisticated update mechanism
      console.log('AI Generated Itinerary:', itineraryData);
      
      setAiPlannerOpen(false);
      alert('AI itinerary generated successfully! Check the console for details.');
    } catch (error) {
      console.error('Error generating AI itinerary:', error);
      alert('Failed to generate itinerary. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Box>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Trip Itinerary
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={() => setAiPlannerOpen(true)}
            disabled={itinerary.length === 0}
          >
            AI Planner
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Company
          </Button>
        </Box>
      </Box>

      {/* Itinerary Timeline */}
      {itinerary.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MapIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No companies in itinerary
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
            Start building your trip itinerary by adding companies to visit
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add First Company
          </Button>
        </Paper>
      ) : (
        <Timeline position="alternate">
          {itinerary.map((item, index) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent sx={{ m: 'auto 0' }}>
                {item.scheduledDate && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(item.scheduledDate), 'MMM dd, yyyy')}
                    </Typography>
                    {item.scheduledTime && (
                      <Typography variant="body2" color="text.secondary">
                        {item.scheduledTime}
                      </Typography>
                    )}
                  </Box>
                )}
                <Chip 
                  label={formatDuration(item.proposedDuration)}
                  size="small"
                  icon={<TimeIcon />}
                />
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineConnector sx={{ bgcolor: index === 0 ? 'transparent' : 'grey.400' }} />
                <TimelineDot color="primary">
                  <BusinessIcon />
                </TimelineDot>
                <TimelineConnector sx={{ bgcolor: index === itinerary.length - 1 ? 'transparent' : 'grey.400' }} />
              </TimelineSeparator>
              
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="span">
                          {item.company.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {item.company.location}
                          </Typography>
                        </Box>
                        
                        {item.agendaItems && item.agendaItems.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Agenda:
                            </Typography>
                            <List dense>
                              {item.agendaItems.filter(a => a).map((agenda, idx) => (
                                <ListItem key={idx} sx={{ pl: 0 }}>
                                  <ListItemText 
                                    primary={`• ${agenda}`}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                        
                        {item.notes && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Note: {item.notes}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}

      {/* Add/Edit Company Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Itinerary Item' : 'Add Company to Itinerary'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {!editingItem && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Company</InputLabel>
                  <Select
                    value={itemForm.companyId}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                    label="Select Company"
                  >
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        <Box>
                          <Typography>{company.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {company.location} • {company.industry}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selectedCompany && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Company
                  </Typography>
                  <Typography variant="body1">{selectedCompany.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCompany.location} • {selectedCompany.industry}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Agenda Items
              </Typography>
              {itemForm.agendaItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Agenda item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleUpdateAgendaItem(index, e.target.value)}
                  />
                  <IconButton 
                    onClick={() => handleRemoveAgendaItem(index)}
                    disabled={itemForm.agendaItems.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAgendaItem}
                size="small"
              >
                Add Agenda Item
              </Button>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration"
                type="number"
                value={itemForm.proposedDuration}
                onChange={(e) => setItemForm({ ...itemForm, proposedDuration: parseInt(e.target.value) || 0 })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">minutes</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <DateTimePicker
                label="Scheduled Date & Time"
                value={itemForm.scheduledDate}
                onChange={(date) => setItemForm({ ...itemForm, scheduledDate: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={2}
                value={itemForm.notes}
                onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!selectedCompany && !editingItem}
          >
            {editingItem ? 'Update' : 'Add'} to Itinerary
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Planner Dialog */}
      <Dialog open={aiPlannerOpen} onClose={() => setAiPlannerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>AI Trip Planner</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            The AI planner will optimize your itinerary based on:
            • Company locations and travel times
            • Recommended duration for each visit
            • Local business hours and traffic patterns
            • Your trip dates and objectives
          </Alert>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This will use 10 AI credits
          </Typography>
          
          {loadingAI && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiPlannerOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAIPlanner} 
            variant="contained"
            startIcon={<AIIcon />}
            disabled={loadingAI || credits.available < 10}
          >
            Generate Optimized Itinerary
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripItinerary;