import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Fade,
  Slide,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getCompanies, createCompany, updateCompany, deleteCompany, getUserTags } from '../services/companyService';
import EnhancedCompanyForm from './EnhancedCompanyForm';
import EnhancedCompanyCard from './EnhancedCompanyCard';
import CompanyDetail from './CompanyDetail';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New Lead' },
  { value: 'interested', label: 'Interested' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Meeting Scheduled' },
  { value: 'visited', label: 'Visited' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'not_interested', label: 'Not Interested' },
];

const EnhancedCompanyList = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [existingTags, setExistingTags] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load companies and tags
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [companiesData, tagsData] = await Promise.all([
        getCompanies(user),
        getUserTags(user)
      ]);
      setCompanies(companiesData);
      setExistingTags(tagsData);
    } catch (error) {
      console.error('Error loading companies:', error);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user, loadCompanies]);

  // Filter companies based on search and filters
  const filterCompanies = useCallback(() => {
    let filtered = companies;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(company =>
        company.name?.toLowerCase().includes(search) ||
        company.industry?.toLowerCase().includes(search) ||
        company.city?.toLowerCase().includes(search) ||
        company.country?.toLowerCase().includes(search) ||
        company.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    if (tagFilter) {
      filtered = filtered.filter(company => 
        company.tags?.includes(tagFilter)
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter, tagFilter]);

  useEffect(() => {
    filterCompanies();
  }, [filterCompanies]);

  const handleAddCompany = async (companyData) => {
    try {
      await createCompany(user, companyData);
      setSnackbar({ open: true, message: 'Company created successfully!', severity: 'success' });
      await loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const handleUpdateCompany = async (companyData) => {
    try {
      await updateCompany(user, selectedCompany.id, companyData);
      setSnackbar({ open: true, message: 'Company updated successfully!', severity: 'success' });
      await loadCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await deleteCompany(user, companyId);
      setSnackbar({ open: true, message: 'Company deleted successfully!', severity: 'success' });
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      setSnackbar({ open: true, message: 'Failed to delete company', severity: 'error' });
    }
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setShowForm(true);
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCompany(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedCompany(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTagFilter('');
  };

  const getStatusStats = () => {
    const stats = companies.reduce((acc, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6">Loading your companies...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header and Stats */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Your Business Network
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Manage companies, contacts, and plan your business trips with Triply
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)', color: 'white' }}>
              <CardContent>
                <BusinessIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{companies.length}</Typography>
                <Typography variant="body2">Total Companies</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)', color: 'white' }}>
              <CardContent>
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{stats.interested || 0}</Typography>
                <Typography variant="body2">Interested</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: 'white' }}>
              <CardContent>
                <ScheduleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{stats.scheduled || 0}</Typography>
                <Typography variant="body2">Scheduled</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)', color: 'white' }}>
              <CardContent>
                <GroupIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight={700}>{stats.partnership || 0}</Typography>
                <Typography variant="body2">Partnerships</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search companies, industries, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter by Tag</InputLabel>
                <Select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  label="Filter by Tag"
                >
                  <MenuItem value="">All Tags</MenuItem>
                  {existingTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Tooltip title="Clear all filters">
                <IconButton onClick={clearFilters} color="primary" size="large">
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          {(searchTerm || statusFilter || tagFilter) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Active filters:
                </Typography>
                {searchTerm && (
                  <Chip 
                    label={`Search: "${searchTerm}"`} 
                    onDelete={() => setSearchTerm('')} 
                    size="small" 
                  />
                )}
                {statusFilter && (
                  <Chip 
                    label={`Status: ${statusOptions.find(s => s.value === statusFilter)?.label}`} 
                    onDelete={() => setStatusFilter('')} 
                    size="small" 
                  />
                )}
                {tagFilter && (
                  <Chip 
                    label={`Tag: ${tagFilter}`} 
                    onDelete={() => setTagFilter('')} 
                    size="small" 
                  />
                )}
                <Chip 
                  label="Clear all" 
                  onClick={clearFilters} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
        </Typography>
      </Box>

      {/* Company Grid */}
      {filteredCompanies.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {companies.length === 0 ? 'Start Building Your Network' : 'No companies match your search'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {companies.length === 0 
              ? 'Add your first company to begin planning your business trips'
              : 'Try adjusting your search criteria or filters'
            }
          </Typography>
          {companies.length === 0 && (
            <Fab
              variant="extended"
              color="primary"
              onClick={() => setShowForm(true)}
              sx={{ mt: 2 }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add Your First Company
            </Fab>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCompanies.map((company) => (
            <Grid item xs={12} sm={6} lg={4} key={company.id}>
              <Fade in timeout={300}>
                <div>
                  <EnhancedCompanyCard
                    company={company}
                    onEdit={handleEditCompany}
                    onDelete={handleDeleteCompany}
                    onView={handleViewCompany}
                  />
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Slide direction="up" in={!showForm} mountOnEnter unmountOnExit>
        <Fab
          color="primary"
          aria-label="add company"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'linear-gradient(45deg, #d32f2f 30%, #ffc107 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #b71c1c 30%, #ff8f00 90%)',
            },
          }}
          onClick={() => setShowForm(true)}
        >
          <AddIcon />
        </Fab>
      </Slide>

      {/* Enhanced Company Form */}
      <EnhancedCompanyForm
        open={showForm}
        onClose={handleCloseForm}
        onSubmit={selectedCompany ? handleUpdateCompany : handleAddCompany}
        company={selectedCompany}
        existingTags={existingTags}
      />

      {/* Company Detail Dialog */}
      <CompanyDetail
        open={showDetail}
        onClose={handleCloseDetail}
        company={selectedCompany}
        onEdit={handleEditCompany}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EnhancedCompanyList; 