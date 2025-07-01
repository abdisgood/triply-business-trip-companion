import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Flight as FlightIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTrip } from '../contexts/TripContext';
import { format, isAfter } from 'date-fns';

const InvitationNotifications = ({ onClose }) => {
  const { pendingInvitations, acceptInvitation, loading } = useTrip();

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await acceptInvitation(invitationId);
      onClose();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    // In a real implementation, you'd have a decline method
    console.log('Declining invitation:', invitationId);
    onClose();
  };

  const isInvitationExpired = (invitation) => {
    if (!invitation.expiresAt) return false;
    return isAfter(new Date(), invitation.expiresAt.toDate());
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(timestamp.toDate(), 'MMM dd, yyyy');
    } catch {
      return '';
    }
  };

  if (pendingInvitations.length === 0) {
    return (
      <Box sx={{ p: 2, minWidth: 300 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <FlightIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 400, maxWidth: 500 }}>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6">
          Trip Invitations ({pendingInvitations.length})
        </Typography>
      </Box>
      
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {pendingInvitations.map((invitation, index) => {
          const isExpired = isInvitationExpired(invitation);
          
          return (
            <React.Fragment key={invitation.id}>
              <ListItem sx={{ px: 2, py: 1, flexDirection: 'column', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isExpired ? 'grey.400' : 'primary.main' }}>
                      <FlightIcon />
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {invitation.tripTitle}
                        </Typography>
                        {isExpired && (
                          <Chip label="Expired" size="small" color="error" />
                        )}
                      </Box>
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 14 }} />
                          <Typography variant="body2">
                            Invited by {invitation.inviterName || invitation.inviterEmail}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 14 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(invitation.createdAt)}
                            {invitation.expiresAt && (
                              <span> • Expires {formatDate(invitation.expiresAt)}</span>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </Box>

                {isExpired ? (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    This invitation has expired
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={loading}
                      sx={{ flex: 1 }}
                    >
                      Decline
                    </Button>
                  </Box>
                )}
              </ListItem>
              
              {index < pendingInvitations.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default InvitationNotifications; 