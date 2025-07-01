import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Hotel as HotelIcon,
  Flight as FlightIcon,
  Receipt as ReceiptIcon,
  Map as MapIcon,
  Psychology as AIIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useTrip } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../contexts/AIContext';
import CompanyList from './CompanyList';
import ExpenseList from './ExpenseList';
import BookingList from './BookingList';
import TripItinerary from './TripItinerary';
import TripExport from './TripExport';
import TripObjectives from './TripObjectives';
import { format } from 'date-fns';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`trip-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

const TripDetailView = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trips, loading: tripsLoading, getTrip } = useTrip();
  const { credits } = useAI();
  
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const tripData = await getTrip(tripId);
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = () => {
    setShowExport(true);
    handleMenuClose();
  };

  const getBudgetUtilization = () => {
    if (!trip?.totalBudget || trip.totalBudget === 0) return 0;
    return Math.min((trip.spentAmount || 0) / trip.totalBudget * 100, 100);
  };

  if (loading || tripsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Trip not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const budgetUtilization = getBudgetUtilization();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {trip.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Chip 
                        label={trip.status} 
                        color={trip.status === 'active' ? 'success' : 'primary'}
                        size="small"
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body1">{trip.destination}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body1">
                          {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    {trip.description && (
                      <Typography variant="body2" color="text.secondary">
                        {trip.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={handleMenuClick}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Collaborators */}
                {trip.collaboratorEmails?.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Team:
                    </Typography>
                    <AvatarGroup max={4}>
                      {trip.collaboratorEmails.map((email) => (
                        <Avatar key={email} sx={{ width: 32, height: 32 }}>
                          {email[0].toUpperCase()}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Spent
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${trip.spentAmount || 0} / ${trip.totalBudget || 0}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={budgetUtilization}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: budgetUtilization > 90 ? 'error.main' : 
                                 budgetUtilization > 75 ? 'warning.main' : 'success.main'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {budgetUtilization.toFixed(0)}% utilized
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    AI Credits Available
                  </Typography>
                  <Chip 
                    label={`${credits.available} credits`}
                    color="primary"
                    size="small"
                    icon={<AIIcon />}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Overview" icon={<MapIcon />} iconPosition="start" />
            <Tab label="Companies" icon={<BusinessIcon />} iconPosition="start" />
            <Tab label="Itinerary" icon={<CalendarIcon />} iconPosition="start" />
            <Tab label="Expenses" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Bookings" icon={<HotelIcon />} iconPosition="start" />
            <Tab label="Objectives" icon={<AIIcon />} iconPosition="start" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <TripOverview trip={trip} onUpdate={loadTrip} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <CompanyList tripId={tripId} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <TripItinerary trip={trip} onUpdate={loadTrip} />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <ExpenseList tripId={tripId} />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <BookingList tripId={tripId} />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <TripObjectives trip={trip} onUpdate={loadTrip} />
            </TabPanel>
          </Box>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => navigate(`/trips/${tripId}/edit`)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Trip
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Export
        </MenuItem>
        <MenuItem onClick={() => navigate(`/trips/${tripId}/share`)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Share
        </MenuItem>
      </Menu>

      {/* Export Dialog */}
      {showExport && (
        <TripExport 
          trip={trip} 
          open={showExport} 
          onClose={() => setShowExport(false)} 
        />
      )}
    </Box>
  );
};

// Trip Overview Component
const TripOverview = ({ trip, onUpdate }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trip Statistics
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Companies"
                  secondary={`${trip.itinerary?.length || 0} scheduled visits`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Expenses"
                  secondary={`${trip.expenses?.length || 0} recorded`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HotelIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Bookings"
                  secondary={`${Object.values(trip.bookings || {}).flat().length} confirmed`}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BusinessIcon />}
                >
                  Add Company
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ReceiptIcon />}
                >
                  Add Expense
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HotelIcon />}
                >
                  Add Booking
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AIIcon />}
                  color="primary"
                >
                  AI Assistant
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TripDetailView;