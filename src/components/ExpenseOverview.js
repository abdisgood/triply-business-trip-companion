import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Restaurant as RestaurantIcon,
  Flight as FlightIcon,
  Hotel as HotelIcon,
  LocalGasStation as TransportIcon,
  ShoppingCart as SuppliesIcon,
  Phone as CommunicationIcon,
  Entertainment as EntertainmentIcon,
  Category as OtherIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTrip } from '../contexts/TripContext';
import expenseService from '../services/expenseService';

const ExpenseOverview = () => {
  const { currentTrip, expenses } = useTrip();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExpenseStats();
  }, [currentTrip, expenses]);

  const loadExpenseStats = async () => {
    try {
      setLoading(true);
      const expenseStats = await expenseService.getExpenseStats();
      setStats(expenseStats);
    } catch (error) {
      console.error('Error loading expense stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meals': return <RestaurantIcon sx={{ fontSize: 16 }} />;
      case 'transportation': return <TransportIcon sx={{ fontSize: 16 }} />;
      case 'accommodation': return <HotelIcon sx={{ fontSize: 16 }} />;
      case 'supplies': return <SuppliesIcon sx={{ fontSize: 16 }} />;
      case 'communication': return <CommunicationIcon sx={{ fontSize: 16 }} />;
      case 'entertainment': return <EntertainmentIcon sx={{ fontSize: 16 }} />;
      default: return <OtherIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      meals: '#FF6B6B',
      transportation: '#4ECDC4',
      accommodation: '#45B7D1',
      supplies: '#96CEB4',
      communication: '#FFEAA7',
      entertainment: '#DDA0DD',
      other: '#95A5A6'
    };
    return colors[category] || colors.other;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expense Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No expense data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(stats.categoryBreakdown)
    .filter(([_, data]) => data.total > 0)
    .map(([category, data]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: data.total,
      color: getCategoryColor(category)
    }));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Expense Overview
          </Typography>
          <Chip 
            label={stats.timeframe.charAt(0).toUpperCase() + stats.timeframe.slice(1)}
            size="small"
            color="primary"
          />
        </Box>

        {/* Summary Stats */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Spent
            </Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(stats.totalAmount)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Transactions
            </Typography>
            <Typography variant="body1">
              {stats.totalExpenses}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Average
            </Typography>
            <Typography variant="body1">
              {formatCurrency(stats.averageExpense)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Category Breakdown */}
        {chartData.length > 0 ? (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Spending by Category
            </Typography>
            
            <Box sx={{ height: 150, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <List dense>
              {chartData.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getCategoryIcon(item.name.toLowerCase())}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={formatCurrency(item.value)}
                  />
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%',
                      bgcolor: item.color 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <MoneyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No expenses recorded yet
            </Typography>
          </Box>
        )}

        {/* Recent Expenses */}
        {stats.recentExpenses && stats.recentExpenses.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Recent Expenses
            </Typography>
            <List dense>
              {stats.recentExpenses.slice(0, 3).map((expense, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getCategoryIcon(expense.category)}
                  </ListItemIcon>
                  <ListItemText
                    primary={expense.vendor || expense.description}
                    secondary={expense.date}
                  />
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(expense.amount)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        <Box sx={{ mt: 2 }}>
          <Button 
            size="small" 
            fullWidth 
            onClick={() => {/* Navigate to full expense view */}}
          >
            View All Expenses
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExpenseOverview; 