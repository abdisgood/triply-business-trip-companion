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
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getCompanies, createCompany, updateCompany, deleteCompany, getUserTags } from '../services/companyService';
import CompanyForm from './CompanyForm';
import CompanyCard from './CompanyCard';
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

const CompanyList = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [existingTags, setExistingTags] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load companies and tags
  const loadCompanies = useCallback(async () => {
    if (!user) return;
    
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

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, statusFilter]);

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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography variant="h6">Loading your companies...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          Your Business Network
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Manage companies and plan your business trips with Triply
        </Typography>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={2}>
              <Typography variant="h6" color="primary">
                {filteredCompanies.length} companies
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCompanies.map((company) => (
            <Grid item xs={12} sm={6} lg={4} key={company.id}>
              <Box>
                <CompanyCard
                  company={company}
                  onEdit={handleEditCompany}
                  onDelete={handleDeleteCompany}
                  onView={handleViewCompany}
                />
              </Box>
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

      {/* Company Form */}
      <CompanyForm
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

export default CompanyList; 