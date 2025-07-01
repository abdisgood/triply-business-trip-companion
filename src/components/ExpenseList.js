import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Paper,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Restaurant as RestaurantIcon,
  DirectionsCar as CarIcon,
  Hotel as HotelIcon,
  ShoppingCart as ShoppingIcon,
  AttachMoney as MoneyIcon,
  Psychology as AIIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAI } from '../contexts/AIContext';
import expenseService from '../services/expenseService';
import { format } from 'date-fns';

const ExpenseList = ({ tripId }) => {
  const { credits } = useAI();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  const [expenseForm, setExpenseForm] = useState({
    vendor: '',
    amount: '',
    currency: 'USD',
    category: 'other',
    date: new Date(),
    description: '',
    tripId: tripId
  });

  const categories = [
    { value: 'meals', label: 'Meals', icon: <RestaurantIcon /> },
    { value: 'transportation', label: 'Transportation', icon: <CarIcon /> },
    { value: 'accommodation', label: 'Accommodation', icon: <HotelIcon /> },
    { value: 'supplies', label: 'Supplies', icon: <ShoppingIcon /> },
    { value: 'entertainment', label: 'Entertainment', icon: <ReceiptIcon /> },
    { value: 'communication', label: 'Communication', icon: <ReceiptIcon /> },
    { value: 'other', label: 'Other', icon: <MoneyIcon /> }
  ];

  useEffect(() => {
    loadExpenses();
  }, [tripId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getTripExpenses(tripId);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setExpenseForm({
        vendor: expense.vendor,
        amount: expense.amount,
        currency: expense.currency || 'USD',
        category: expense.category,
        date: new Date(expense.date),
        description: expense.description || '',
        tripId: tripId
      });
    } else {
      setEditingExpense(null);
      setExpenseForm({
        vendor: '',
        amount: '',
        currency: 'USD',
        category: 'other',
        date: new Date(),
        description: '',
        tripId: tripId
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setReceiptFile(null);
    setReceiptPreview(null);
    setEditingExpense(null);
  };

  const handleReceiptUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessReceipt = async () => {
    if (!receiptFile || credits.available < 3) {
      alert('Insufficient AI credits. Need 3 credits to process receipt.');
      return;
    }

    setProcessingOCR(true);
    try {
      const extractedData = await expenseService.createExpense(
        { ...expenseForm, useOCR: true },
        receiptFile
      );
      
      // Update form with extracted data
      if (extractedData.extractedData) {
        setExpenseForm({
          ...expenseForm,
          vendor: extractedData.extractedData.vendor || expenseForm.vendor,
          amount: extractedData.extractedData.amount || expenseForm.amount,
          category: extractedData.extractedData.category || expenseForm.category,
          date: extractedData.extractedData.date ? new Date(extractedData.extractedData.date) : expenseForm.date,
          description: extractedData.extractedData.description || expenseForm.description
        });
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
    } finally {
      setProcessingOCR(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseForm);
      } else {
        await expenseService.createExpense(expenseForm, receiptFile);
      }
      await loadExpenses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        await loadExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : <MoneyIcon />;
  };

  const getTotalByCategory = () => {
    const totals = {};
    expenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    return totals;
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = getTotalByCategory();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                By Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(categoryTotals).map(([category, amount]) => {
                  const cat = categories.find(c => c.value === category);
                  return (
                    <Chip
                      key={category}
                      icon={cat?.icon}
                      label={`${cat?.label}: $${amount.toFixed(2)}`}
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Expenses
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Expense
            </Button>
          </Box>

          {expenses.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No expenses recorded yet
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                Start tracking your trip expenses
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add First Expense
              </Button>
            </Paper>
          ) : (
            <List>
              {expenses.map((expense) => (
                <ListItem key={expense.id} divider>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      {getCategoryIcon(expense.category)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={expense.vendor}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(expense.date), 'MMM dd, yyyy')} • {expense.description || 'No description'}
                        </Typography>
                        {expense.receiptUrl && (
                          <Chip
                            size="small"
                            label="Receipt attached"
                            icon={<PhotoCameraIcon />}
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Box>
                    }
                  />
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    ${expense.amount.toFixed(2)}
                  </Typography>
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenDialog(expense)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(expense.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense' : 'Add Expense'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vendor/Merchant"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || '' })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {cat.icon}
                        {cat.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <DatePicker
                label="Date"
                value={expenseForm.date}
                onChange={(date) => setExpenseForm({ ...expenseForm, date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (optional)"
                multiline
                rows={2}
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              />
            </Grid>

            {/* Receipt Upload */}
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center' }}>
                {receiptPreview ? (
                  <Box>
                    <img 
                      src={receiptPreview} 
                      alt="Receipt preview" 
                      style={{ maxWidth: '100%', maxHeight: 200, marginBottom: 8 }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AIIcon />}
                        onClick={handleProcessReceipt}
                        disabled={processingOCR || credits.available < 3}
                      >
                        {processingOCR ? 'Processing...' : 'Extract with AI (3 credits)'}
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptPreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <UploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload receipt for automatic data extraction
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="receipt-upload"
                      type="file"
                      onChange={handleReceiptUpload}
                    />
                    <label htmlFor="receipt-upload">
                      <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />}>
                        Upload Receipt
                      </Button>
                    </label>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!expenseForm.vendor || !expenseForm.amount}
          >
            {editingExpense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseList;