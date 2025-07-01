import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Psychology as AIIcon,
  Flight as FlightIcon,
  Receipt as ReceiptIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  CameraAlt as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAI } from '../../contexts/AIContext';
import { useTrip } from '../../contexts/TripContext';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { updateProfile } from 'firebase/auth';

const ProfilePage = () => {
  const { user } = useAuth();
  const { credits } = useAI();
  const { trips } = useTrip();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    company: '',
    position: '',
    location: '',
    bio: '',
  });
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalExpenses: 0,
    companiesVisited: 0,
    creditsUsed: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(profileData);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    loadProfileData();
    calculateStats();
  }, [user, trips]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData({
          displayName: user.displayName || userData.displayName || '',
          email: user.email || userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          position: userData.position || '',
          location: userData.location || '',
          bio: userData.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const calculateStats = async () => {
    if (!user) return;

    try {
      // Calculate trip stats
      const totalTrips = trips?.length || 0;
      
      // Get unique companies from trips
      const companies = new Set();
      trips?.forEach(trip => {
        if (trip.companies) {
          trip.companies.forEach(company => companies.add(company));
        }
      });

      // Calculate total expenses
      let totalExpenses = 0;
      const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', user.uid)
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().amount || 0;
      });

      setStats({
        totalTrips,
        totalExpenses,
        companiesVisited: companies.size,
        creditsUsed: 100 - (credits || 0), // Assuming starting credits were 100
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleEditClick = () => {
    setEditFormData(profileData);
    setEditDialogOpen(true);
    setSaveError(null);
  };

  const handleEditChange = (field) => (event) => {
    setEditFormData({
      ...editFormData,
      [field]: event.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveError(null);

    try {
      // Update Firebase Auth display name if changed
      if (editFormData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: editFormData.displayName,
        });
      }

      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editFormData.displayName,
        phone: editFormData.phone,
        company: editFormData.company,
        position: editFormData.position,
        location: editFormData.location,
        bio: editFormData.bio,
        updatedAt: new Date(),
      });

      setProfileData(editFormData);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="div">
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={user?.photoURL}
                  sx={{
                    width: 120,
                    height: 120,
                    mr: 3,
                    border: 4,
                    borderColor: 'primary.main',
                  }}
                >
                  {profileData.displayName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {profileData.displayName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profileData.position || 'Business Traveler'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    {profileData.company && (
                      <Chip
                        icon={<BusinessIcon />}
                        label={profileData.company}
                        variant="outlined"
                      />
                    )}
                    {profileData.location && (
                      <Chip
                        icon={<LocationIcon />}
                        label={profileData.location}
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
              >
                Edit Profile
              </Button>
            </Box>

            {profileData.bio && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {profileData.bio}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<FlightIcon />}
            title="Total Trips"
            value={stats.totalTrips}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<ReceiptIcon />}
            title="Total Expenses"
            value={`$${stats.totalExpenses.toFixed(2)}`}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<BusinessIcon />}
            title="Companies Visited"
            value={stats.companiesVisited}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<AIIcon />}
            title="AI Credits Used"
            value={stats.creditsUsed}
            color="info"
          />
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={profileData.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={profileData.phone || 'Not provided'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Company"
                  secondary={profileData.company || 'Not provided'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Position"
                  secondary={profileData.position || 'Not provided'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Account Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Account Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body2">
                  {user?.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <Typography variant="body2">
                  {user?.metadata?.lastSignInTime 
                    ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Account Status
                </Typography>
                <Chip label="Active" color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  AI Credits Remaining
                </Typography>
                <Chip 
                  label={credits || 0} 
                  color="primary" 
                  size="small" 
                  icon={<AIIcon />}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Name"
                value={editFormData.displayName}
                onChange={handleEditChange('displayName')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={handleEditChange('phone')}
                placeholder="+1 (555) 123-4567"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={editFormData.company}
                onChange={handleEditChange('company')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Position"
                value={editFormData.position}
                onChange={handleEditChange('position')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={editFormData.location}
                onChange={handleEditChange('location')}
                placeholder="City, Country"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Bio"
                value={editFormData.bio}
                onChange={handleEditChange('bio')}
                placeholder="Tell us about yourself..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;