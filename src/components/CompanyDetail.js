import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Grid,
  Paper,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { 
  getContacts, 
  getComments, 
  getScheduledActions,
  addComment,
  deleteComment 
} from '../services/companyService';
import ContactForm from './ContactForm';
import CommentForm from './CommentForm';
import ScheduledActionForm from './ScheduledActionForm';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const CompanyDetail = ({ open, onClose, company, onEdit }) => {
  const [tabValue, setTabValue] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [comments, setComments] = useState([]);
  const [scheduledActions, setScheduledActions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [commentFormOpen, setCommentFormOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);

  useEffect(() => {
    if (company && open) {
      loadCompanyData();
    }
  }, [company, open]);

  const loadCompanyData = async () => {
    if (!company?.id) return;
    
    setLoading(true);
    try {
      const [contactsData, commentsData, actionsData] = await Promise.all([
        getContacts(company.id),
        getComments(company.id),
        getScheduledActions(company.id)
      ]);
      
      setContacts(contactsData);
      setComments(commentsData);
      setScheduledActions(actionsData);
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddComment = async (commentData) => {
    try {
      await addComment(company.id, commentData);
      setCommentFormOpen(false);
      loadCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      loadCompanyData(); // Refresh data
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'interested': return 'success';
      case 'contacted': return 'info';
      case 'scheduled': return 'warning';
      case 'visited': return 'primary';
      case 'not_interested': return 'error';
      default: return 'default';
    }
  };

  if (!company) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h5">{company.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {company.industry}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => onEdit(company)}
                size="small"
              >
                Edit
              </Button>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Company Information */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  Company Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={company.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                    color={getStatusColor(company.status)}
                    sx={{ mb: 2 }}
                  />
                </Box>

                <List dense>
                  {company.location && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText primary={company.location} />
                    </ListItem>
                  )}
                  {company.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary={company.phone} />
                    </ListItem>
                  )}
                  {company.email && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText primary={company.email} />
                    </ListItem>
                  )}
                  {company.website && (
                    <ListItem>
                      <ListItemIcon>
                        <WebsiteIcon />
                      </ListItemIcon>
                      <ListItemText primary={company.website} />
                    </ListItem>
                  )}
                </List>

                {company.description && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {company.description}
                    </Typography>
                  </Box>
                )}

                {company.tags && company.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {company.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Tabs Section */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ height: 500 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab
                      label={`Contacts (${contacts.length})`}
                      icon={<PersonIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label={`Comments (${comments.length})`}
                      icon={<CommentIcon />}
                      iconPosition="start"
                    />
                    <Tab
                      label={`Scheduled (${scheduledActions.length})`}
                      icon={<ScheduleIcon />}
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    {/* Contacts Tab */}
                    <TabPanel value={tabValue} index={0}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Key Contacts</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setContactFormOpen(true)}
                          size="small"
                        >
                          Add Contact
                        </Button>
                      </Box>
                      <List>
                        {contacts.map((contact) => (
                          <ListItem key={contact.id} divider>
                            <ListItemIcon>
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={contact.name}
                              secondary={
                                <Box>
                                  {contact.position && (
                                    <Typography variant="body2">
                                      {contact.position}
                                    </Typography>
                                  )}
                                  {contact.email && (
                                    <Typography variant="body2" color="text.secondary">
                                      {contact.email}
                                    </Typography>
                                  )}
                                  {contact.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                      {contact.phone}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                        {contacts.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No contacts added yet.
                          </Typography>
                        )}
                      </List>
                    </TabPanel>

                    {/* Comments Tab */}
                    <TabPanel value={tabValue} index={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Comments & Notes</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setCommentFormOpen(true)}
                          size="small"
                        >
                          Add Comment
                        </Button>
                      </Box>
                      <List>
                        {comments.map((comment) => (
                          <ListItem key={comment.id} divider alignItems="flex-start">
                            <ListItemText
                              primary={comment.content}
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                                </Typography>
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteComment(comment.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                        {comments.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No comments added yet.
                          </Typography>
                        )}
                      </List>
                    </TabPanel>

                    {/* Scheduled Actions Tab */}
                    <TabPanel value={tabValue} index={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Scheduled Actions</Typography>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setActionFormOpen(true)}
                          size="small"
                        >
                          Schedule Action
                        </Button>
                      </Box>
                      <List>
                        {scheduledActions.map((action) => (
                          <ListItem key={action.id} divider>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={action.type?.toUpperCase()}
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    {action.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {action.scheduledDate?.toDate?.()?.toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Chip
                              label={action.status || 'pending'}
                              size="small"
                              color={action.status === 'completed' ? 'success' : 'default'}
                            />
                          </ListItem>
                        ))}
                        {scheduledActions.length === 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                            No scheduled actions yet.
                          </Typography>
                        )}
                      </List>
                    </TabPanel>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Contact Form Dialog */}
      <ContactForm
        open={contactFormOpen}
        onClose={() => setContactFormOpen(false)}
        onSubmit={(contactData) => {
          // Handle contact submission
          setContactFormOpen(false);
          loadCompanyData();
        }}
        companyId={company?.id}
      />

      {/* Comment Form Dialog */}
      <CommentForm
        open={commentFormOpen}
        onClose={() => setCommentFormOpen(false)}
        onSubmit={handleAddComment}
      />

      {/* Scheduled Action Form Dialog */}
      <ScheduledActionForm
        open={actionFormOpen}
        onClose={() => setActionFormOpen(false)}
        onSubmit={(actionData) => {
          // Handle action submission
          setActionFormOpen(false);
          loadCompanyData();
        }}
        companyId={company?.id}
      />
    </>
  );
};

export default CompanyDetail; 