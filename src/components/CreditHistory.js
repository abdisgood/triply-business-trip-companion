import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ShoppingCart as PurchaseIcon,
  Psychology as AIIcon,
  Receipt as ReceiptIcon,
  Business as BusinessIcon,
  Map as MapIcon,
  TrendingDown as UsageIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';

const CreditHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadTransactionHistory();
    }
  }, [user]);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const history = await paymentService.getUserTransactions();
      setTransactions(history);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operation) => {
    const iconMap = {
      companyEnrichment: <BusinessIcon />,
      itineraryPlanning: <MapIcon />,
      ocrProcessing: <ReceiptIcon />,
      tripObjectives: <AIIcon />,
      expenseAnalysis: <UsageIcon />
    };
    return iconMap[operation] || <AIIcon />;
  };

  const getOperationLabel = (operation) => {
    const labelMap = {
      companyEnrichment: 'Company Enrichment',
      itineraryPlanning: 'Itinerary Planning',
      ocrProcessing: 'Receipt OCR',
      tripObjectives: 'Company Suggestions',
      expenseAnalysis: 'Expense Analysis'
    };
    return labelMap[operation] || operation;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    handleFilterClose();
  };

  const exportHistory = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Description,Credits,Amount\n"
      + transactions.map(t => 
          `"${formatDate(t.createdAt)}","${t.status === 'completed' ? 'Purchase' : 'Usage'}","${t.packageName || getOperationLabel(t.operation)}","${t.credits || t.creditsUsed}","$${t.amount || 0}"`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "credit_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions based on tab and filter
  const filteredTransactions = transactions.filter(transaction => {
    if (tabValue === 1 && transaction.status !== 'completed') return false;
    if (tabValue === 2 && !transaction.operation) return false;
    
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(transaction.createdAt) >= weekAgo;
    } else if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(transaction.createdAt) >= monthAgo;
    }
    
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Credit History</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleFilterClick} size="small">
              <FilterIcon />
            </IconButton>
            <IconButton onClick={exportHistory} size="small">
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All Activity" />
          <Tab label="Purchases" />
          <Tab label="Usage" />
        </Tabs>

        {filteredTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No transactions found
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <ListItem>
                  <ListItemIcon>
                    {transaction.status === 'completed' ? (
                      <PurchaseIcon color="success" />
                    ) : (
                      getOperationIcon(transaction.operation)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      transaction.status === 'completed' 
                        ? transaction.packageName
                        : getOperationLabel(transaction.operation)
                    }
                    secondary={formatDate(transaction.createdAt)}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {transaction.status === 'completed' ? (
                        <>
                          <Chip 
                            label={`+${transaction.credits} credits`}
                            color="success"
                            size="small"
                          />
                          <Typography variant="body2">
                            ${transaction.amount}
                          </Typography>
                        </>
                      ) : (
                        <Chip 
                          label={`-${transaction.creditsUsed} credits`}
                          color="default"
                          size="small"
                        />
                      )}
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredTransactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterChange('all')}>All Time</MenuItem>
          <MenuItem onClick={() => handleFilterChange('week')}>Last Week</MenuItem>
          <MenuItem onClick={() => handleFilterChange('month')}>Last Month</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default CreditHistory;