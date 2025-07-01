import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

const getStatusColor = (status) => {
  switch (status) {
    case 'interested':
      return 'success';
    case 'contacted':
      return 'info';
    case 'scheduled':
      return 'warning';
    case 'visited':
      return 'primary';
    case 'not_interested':
      return 'error';
    default:
      return 'default';
  }
};

const CompanyCard = ({ company, onEdit, onDelete, onClick }) => {
  const {
    name,
    industry,
    location,
    description,
    status = 'new',
    tags = [],
    phone,
    email,
    website,
  } = company;

  const handleCardClick = () => {
    if (onClick) {
      onClick(company);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(company);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(company);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <BusinessIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h2" noWrap>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {industry}
            </Typography>
          </Box>
          <Chip
            label={status.replace('_', ' ').toUpperCase()}
            color={getStatusColor(status)}
            size="small"
          />
        </Box>

        {location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {location}
            </Typography>
          </Box>
        )}

        {phone && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {phone}
            </Typography>
          </Box>
        )}

        {email && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {email}
            </Typography>
          </Box>
        )}

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>
        )}

        {tags.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                color="secondary"
              />
            ))}
            {tags.length > 3 && (
              <Chip
                label={`+${tags.length - 3} more`}
                size="small"
                variant="outlined"
                color="default"
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton
          size="small"
          onClick={handleEdit}
          color="primary"
          aria-label="edit company"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleDelete}
          color="error"
          aria-label="delete company"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default CompanyCard; 