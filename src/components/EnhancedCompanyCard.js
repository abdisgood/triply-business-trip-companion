import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Button,
  Tooltip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Tag as TagIcon,
} from '@mui/icons-material';

const statusConfig = {
  new: { color: 'primary', label: 'New Lead' },
  interested: { color: 'info', label: 'Interested' },
  contacted: { color: 'warning', label: 'Contacted' },
  scheduled: { color: 'secondary', label: 'Meeting Scheduled' },
  visited: { color: 'success', label: 'Visited' },
  partnership: { color: 'success', label: 'Partnership' },
  not_interested: { color: 'error', label: 'Not Interested' },
};

const EnhancedCompanyCard = ({ company, onEdit, onDelete, onView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit(company);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(company.id);
    setDeleteDialogOpen(false);
  };

  const handleView = () => {
    onView(company);
  };

  const status = statusConfig[company.status] || statusConfig.new;
  const initials = company.name?.substring(0, 2).toUpperCase() || 'CO';

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            '& .card-actions': {
              opacity: 1,
            },
          },
        }}
        onClick={handleView}
      >
        {/* Header with company info and status */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${status.color === 'primary' ? '#d32f2f' : 
              status.color === 'info' ? '#2196f3' : 
              status.color === 'warning' ? '#ff9800' : 
              status.color === 'secondary' ? '#ffc107' : 
              status.color === 'success' ? '#4caf50' : '#f44336'} 0%, 
              ${status.color === 'primary' ? '#b71c1c' : 
              status.color === 'info' ? '#1565c0' : 
              status.color === 'warning' ? '#ef6c00' : 
              status.color === 'secondary' ? '#ff8f00' : 
              status.color === 'success' ? '#2e7d32' : '#c62828'} 100%)`,
            color: 'white',
            p: 2,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'inherit',
                  mr: 2,
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {company.name}
                </Typography>
                {company.industry && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {company.industry}
                  </Typography>
                )}
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ 
                color: 'white',
                opacity: 0.8,
                '&:hover': { opacity: 1 },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'inherit',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        <CardContent sx={{ flex: 1, pt: 2 }}>
          {/* Location */}
          {(company.city || company.country) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {[company.city, company.country].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          )}

          {/* Contact Info */}
          {company.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {company.phone}
              </Typography>
            </Box>
          )}

          {company.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {company.email}
              </Typography>
            </Box>
          )}

          {company.website && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WebsiteIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
              <Typography 
                variant="body2" 
                color="primary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(company.website.startsWith('http') ? company.website : `https://${company.website}`, '_blank');
                }}
              >
                Visit Website
              </Typography>
            </Box>
          )}

          {/* Description */}
          {company.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}
            >
              {company.description}
            </Typography>
          )}

          {/* Tags */}
          {company.tags && company.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {company.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {company.tags.length > 3 && (
                <Chip
                  label={`+${company.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}
        </CardContent>

        {/* Footer with stats */}
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {company.contacts && company.contacts.length > 0 && (
                <Tooltip title={`${company.contacts.length} contacts`}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {company.contacts.length}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
              {company.scheduledActions && company.scheduledActions.length > 0 && (
                <Tooltip title={`${company.scheduledActions.length} scheduled actions`}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {company.scheduledActions.length}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              {company.updatedAt && new Date(company.updatedAt.seconds * 1000).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 160 }
          }}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{company.name}</strong>? 
            This action cannot be undone and will also delete all associated contacts, comments, and scheduled actions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedCompanyCard; 