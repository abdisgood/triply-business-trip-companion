import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Badge,
  Popover,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Flight as FlightIcon,
  CreditCard as CreditCardIcon,
  Notifications as NotificationsIcon,
  Psychology as AIIcon,
  Dashboard as DashboardIcon,
  Help as HelpIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useAI } from '../../contexts/AIContext';
import { useTrip } from '../../contexts/TripContext';
import { useNavigate } from 'react-router-dom';
import InvitationNotifications from '../InvitationNotifications';
import CreditPurchaseDialog from '../CreditPurchaseDialog';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { credits } = useAI();
  const { pendingInvitations } = useTrip();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <FlightIcon sx={{ mr: 2, fontSize: 28 }} />
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #fff 30%, #ffc107 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/dashboard')}
            >
              Triply
            </Typography>
            <Chip
              label="Business Trip Companion"
              size="small"
              sx={{
                ml: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Box>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* AI Credits Chip */}
              <Chip
                icon={<AIIcon />}
                label={`${credits || 0} Credits`}
                size="small"
                sx={{
                  mr: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
                onClick={() => setCreditDialogOpen(true)}
              />

              {/* Notifications Icon */}
              <IconButton
                onClick={handleNotificationOpen}
                color="inherit"
                sx={{ mr: 2 }}
              >
                <Badge badgeContent={pendingInvitations?.length || 0} color="warning">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Typography
                variant="body2"
                sx={{
                  mr: 2,
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Welcome, {user.displayName?.split(' ')[0]}
              </Typography>
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {user.displayName?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 8,
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 2,
                    '& .MuiMenuItem-root': {
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => handleNavigation('/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/companies')}>
                  <ListItemIcon>
                    <BusinessIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Companies</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/expenses')}>
                  <ListItemIcon>
                    <ReceiptIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Expenses</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setCreditDialogOpen(true)}>
                  <ListItemIcon>
                    <CreditCardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Buy Credits</ListItemText>
                  <Chip label={credits || 0} size="small" color="primary" />
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/help')}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Help & Support</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <InvitationNotifications onClose={handleNotificationClose} />
      </Popover>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog 
        open={creditDialogOpen} 
        onClose={() => setCreditDialogOpen(false)} 
      />
    </>
  );
};

export default Navbar; 