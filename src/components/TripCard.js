import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  AvatarGroup,
  Chip,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  Flight as FlightIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

const TripCard = ({ trip, onSelect, isSelected = false }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDaysUntilTrip = () => {
    try {
      const startDate = new Date(trip.startDate);
      const today = new Date();
      const days = differenceInDays(startDate, today);
      
      if (days < 0) return null;
      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      return `In ${days} days`;
    } catch {
      return null;
    }
  };

  const getBudgetUtilization = () => {
    if (!trip.totalBudget || trip.totalBudget === 0) return 0;
    return Math.min((trip.spentAmount || 0) / trip.totalBudget * 100, 100);
  };

  const daysUntil = getDaysUntilTrip();
  const budgetUtilization = getBudgetUtilization();

  return (
    <>
      <ListItem disablePadding divider>
        <ListItemButton
          onClick={() => onSelect(trip.id)}
          selected={isSelected}
          sx={{ py: 2 }}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <FlightIcon />
            </Avatar>
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {trip.title}
                </Typography>
                <Chip 
                  label={getStatusText(trip.status)} 
                  size="small" 
                  color={getStatusColor(trip.status)}
                />
              </Box>
            }
            primaryTypographyProps={{ component: 'div' }}
            secondaryTypographyProps={{ component: 'div' }}
            secondary={
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {trip.destination}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </Typography>
                  </Box>
                  
                  {daysUntil && (
                    <Chip 
                      label={daysUntil} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Collaborators */}
                  {trip.collaboratorEmails && trip.collaboratorEmails.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {trip.collaboratorEmails.length} member{trip.collaboratorEmails.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}

                  {/* Budget info */}
                  {trip.totalBudget > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        ${trip.spentAmount || 0} / ${trip.totalBudget}
                      </Typography>
                    </Box>
                  )}

                  {/* Companies count */}
                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      {trip.itinerary.length} compan{trip.itinerary.length === 1 ? 'y' : 'ies'}
                    </Typography>
                  )}
                </Box>

                {/* Budget utilization bar */}
                {trip.totalBudget > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={budgetUtilization}
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: budgetUtilization > 90 ? 'error.main' : 
                                   budgetUtilization > 75 ? 'warning.main' : 'success.main'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {budgetUtilization.toFixed(0)}% budget used
                    </Typography>
                  </Box>
                )}
              </Box>
            }
          />
          
          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          // Navigate to trip details
        }}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Edit trip
        }}>
          Edit Trip
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Duplicate trip
        }}>
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          // Export trip
        }} sx={{ color: 'primary.main' }}>
          Export
        </MenuItem>
        {trip.status === 'planning' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            // Start trip
          }} sx={{ color: 'success.main' }}>
            Start Trip
          </MenuItem>
        )}
        {trip.status === 'active' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            // Complete trip
          }} sx={{ color: 'info.main' }}>
            Complete Trip
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleMenuClose();
          // Delete trip
        }} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default TripCard; 