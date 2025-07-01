import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Flight as FlightIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  Map as MapIcon,
  BugReport as TestIcon
} from '@mui/icons-material';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';
import CreateTripDialog from './CreateTripDialog';
import ExpenseOverview from './ExpenseOverview';
import TripCard from './TripCard';
import InvitationNotifications from './InvitationNotifications';
import CreditPurchaseDialog from './CreditPurchaseDialog';
import { testOpenAIConnection } from '../services/testOpenAI';

const TripDashboard = () => {
  const { user } = useAuth();
  const { 
    trips, 
    pendingInvitations, 
    loading, 
    currentTrip,
    setCurrentTrip 
  } = useTrip();
  const { credits, processing } = useAI();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creditPurchaseDialogOpen, setCreditPurchaseDialogOpen] = useState(false);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Quick stats calculation
  const stats = React.useMemo(() => {
    const activeTrips = trips.filter(trip => trip.status === 'active').length;
    const plannedTrips = trips.filter(trip => trip.status === 'planning').length;
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.totalBudget || 0), 0);
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.spentAmount || 0), 0);
    
    return {
      activeTrips,
      plannedTrips,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [trips]);

  const handleCreateTrip = () => {
    setCreateDialogOpen(true);
  };

  const handleCreditPurchase = () => {
    setCreditPurchaseDialogOpen(true);
  };

  const handleTripSelect = (tripId) => {
    setCurrentTrip(tripId);
    setSelectedTripId(tripId);
  };

  const handleNotificationClick = (event) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationMenuAnchor(null);
  };

  const handleTestOpenAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testOpenAIConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.displayName || user?.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your business trips and collaborate with your team
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* AI Credits Display */}
          <Card 
            sx={{ 
              px: 2, 
              py: 1, 
              backgroundColor: 'primary.main', 
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'primary.dark',
                transform: 'translateY(-2px)',
                boxShadow: 3
              }
            }}
            onClick={handleCreditPurchase}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon />
              <Typography variant="body2">
                {credits.available} AI Credits
              </Typography>
            </Box>
          </Card>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationClick}
            sx={{ color: 'primary.main' }}
          >
            <Badge badgeContent={pendingInvitations.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Create Trip Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTrip}
            size="large"
          >
            New Trip
          </Button>

          {/* Temporary OpenAI Test Button */}
          <Button
            variant="outlined"
            startIcon={<TestIcon />}
            onClick={handleTestOpenAI}
            disabled={testing}
            size="small"
            color="secondary"
          >
            {testing ? 'Testing...' : 'Test AI'}
          </Button>
        </Box>
      </Box>

      {/* Test Result Display */}
      {testResult && (
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity={testResult.success ? 'success' : 'error'}
            onClose={() => setTestResult(null)}
          >
            {testResult.success 
              ? `✅ OpenAI API Working: ${testResult.message}` 
              : `❌ OpenAI API Error: ${testResult.error}`
            }
          </Alert>
        </Box>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <FlightIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.activeTrips}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Trips
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.plannedTrips}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Planned Trips
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">${stats.totalBudget.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Budget
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{stats.budgetUtilization.toFixed(1)}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Budget Used
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(stats.budgetUtilization, 100)}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Trips */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Trips</Typography>
                <Button size="small">View All</Button>
              </Box>
              
              {loading ? (
                <LinearProgress />
              ) : trips.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FlightIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No trips yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                    Create your first business trip to get started
                  </Typography>
                  <Button variant="contained" onClick={handleCreateTrip}>
                    Create Trip
                  </Button>
                </Box>
              ) : (
                <List>
                  {trips.slice(0, 5).map((trip) => (
                    <TripCard 
                      key={trip.id} 
                      trip={trip} 
                      onSelect={() => handleTripSelect(trip.id)}
                      isSelected={selectedTripId === trip.id}
                    />
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Expense Overview */}
            <Grid item xs={12}>
              <ExpenseOverview />
            </Grid>

            {/* AI Features Quick Access */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI-Powered Features
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Company Enrichment"
                        secondary="5 credits"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <MapIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Itinerary Planning"
                        secondary="10 credits"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <MoneyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Receipt OCR"
                        secondary="3 credits"
                      />
                    </ListItem>
                  </List>

                  {Object.values(processing).some(p => p) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="primary" gutterBottom>
                        AI Processing...
                      </Typography>
                      <LinearProgress />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<BusinessIcon />}
                        size="small"
                        onClick={() => {/* Navigate to companies */}}
                      >
                        Companies
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<MoneyIcon />}
                        size="small"
                        onClick={() => {/* Navigate to expenses */}}
                      >
                        Expenses
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CalendarIcon />}
                        size="small"
                        onClick={() => {/* Navigate to calendar */}}
                      >
                        Calendar
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<MapIcon />}
                        size="small"
                        onClick={() => {/* Navigate to maps */}}
                      >
                        Maps
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Floating Action Button for Quick Trip Creation */}
      <Fab
        color="primary"
        aria-label="add trip"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateTrip}
      >
        <AddIcon />
      </Fab>

      {/* Create Trip Dialog */}
      <CreateTripDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={creditPurchaseDialogOpen}
        onClose={() => setCreditPurchaseDialogOpen(false)}
      />

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationMenuAnchor}
        open={Boolean(notificationMenuAnchor)}
        onClose={handleNotificationClose}
      >
        <InvitationNotifications onClose={handleNotificationClose} />
      </Menu>
    </Box>
  );
};

export default TripDashboard; 