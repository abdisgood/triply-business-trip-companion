import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Lock as LockIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { deleteUser } from 'firebase/auth';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    tripReminders: true,
    expenseAlerts: true,
    invitationNotifications: true,
    marketingEmails: false,

    // Privacy Settings
    profileVisibility: 'team', // 'public', 'team', 'private'
    shareTripsWithTeam: true,
    allowInvitations: true,

    // App Preferences
    theme: 'light', // 'light', 'dark', 'system'
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York',

    // Calendar Integration
    calendarSync: false,
    calendarProvider: 'google', // 'google', 'outlook', 'apple'
    syncFrequency: 'daily', // 'realtime', 'daily', 'weekly'
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings) {
          setSettings(prevSettings => ({
            ...prevSettings,
            ...userData.settings,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    }
  };

  const handleSettingChange = (category, setting) => (event) => {
    const value = event.target.checked !== undefined ? event.target.checked : event.target.value;
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: value,
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        settings,
        updatedAt: new Date(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    setLoading(true);
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Delete the user account
      await deleteUser(user);
      
      // Logout and redirect
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // In a real app, this would gather all user data and create a downloadable file
      const userData = {
        profile: {
          name: user.displayName,
          email: user.email,
        },
        settings,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `triply-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <NotificationsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText
              primary="Email Notifications"
              secondary="Receive important updates via email"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSettingChange('notifications', 'emailNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Trip Reminders"
              secondary="Get reminded about upcoming trips and tasks"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.tripReminders}
                onChange={handleSettingChange('notifications', 'tripReminders')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Expense Alerts"
              secondary="Notifications about expense submissions and approvals"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.expenseAlerts}
                onChange={handleSettingChange('notifications', 'expenseAlerts')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Trip Invitations"
              secondary="Get notified when someone invites you to a trip"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.invitationNotifications}
                onChange={handleSettingChange('notifications', 'invitationNotifications')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Marketing Emails"
              secondary="Receive news and promotional offers"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.marketingEmails}
                onChange={handleSettingChange('notifications', 'marketingEmails')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Privacy Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Privacy</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText
              primary="Profile Visibility"
              secondary="Control who can see your profile information"
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.profileVisibility}
                  onChange={handleSettingChange('privacy', 'profileVisibility')}
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="team">Team Only</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Share Trips with Team"
              secondary="Allow team members to view your trip details"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.shareTripsWithTeam}
                onChange={handleSettingChange('privacy', 'shareTripsWithTeam')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Allow Trip Invitations"
              secondary="Let others invite you to collaborate on trips"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.allowInvitations}
                onChange={handleSettingChange('privacy', 'allowInvitations')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* App Preferences */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PaletteIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">App Preferences</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText
              primary="Theme"
              secondary="Choose your preferred color scheme"
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.theme}
                  onChange={handleSettingChange('preferences', 'theme')}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Language"
              secondary="Select your preferred language"
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.language}
                  onChange={handleSettingChange('preferences', 'language')}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Currency"
              secondary="Default currency for expenses"
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={settings.currency}
                  onChange={handleSettingChange('preferences', 'currency')}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="JPY">JPY (¥)</MenuItem>
                  <MenuItem value="CNY">CNY (¥)</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Calendar Integration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Calendar Integration</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText
              primary="Sync Calendar"
              secondary="Automatically sync trips with your calendar"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.calendarSync}
                onChange={handleSettingChange('calendar', 'calendarSync')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          {settings.calendarSync && (
            <>
              <ListItem>
                <ListItemText
                  primary="Calendar Provider"
                  secondary="Choose your calendar service"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.calendarProvider}
                      onChange={handleSettingChange('calendar', 'calendarProvider')}
                    >
                      <MenuItem value="google">Google</MenuItem>
                      <MenuItem value="outlook">Outlook</MenuItem>
                      <MenuItem value="apple">Apple</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Sync Frequency"
                  secondary="How often to sync calendar events"
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={settings.syncFrequency}
                      onChange={handleSettingChange('calendar', 'syncFrequency')}
                    >
                      <MenuItem value="realtime">Real-time</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}
        </List>
      </Paper>

      {/* Data Management */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Data Management</Typography>
        </Box>
        <List>
          <ListItem>
            <ListItemText
              primary="Export My Data"
              secondary="Download all your data in JSON format"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportData}
                disabled={loading}
              >
                Export
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Delete Account"
              secondary="Permanently delete your account and all data"
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={loadSettings}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={saveSettings}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 1 }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This action cannot be undone. All your data including trips, companies, 
            and settings will be permanently deleted.
          </DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            To confirm, type <strong>DELETE</strong> below:
          </DialogContentText>
          <TextField
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            error={deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteConfirmation !== 'DELETE' || loading}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingsPage;