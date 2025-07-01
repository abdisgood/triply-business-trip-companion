import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Psychology as AIIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import paymentService from '../services/paymentService';
import { useAI } from '../contexts/AIContext';

const CreditPurchaseDialog = ({ open, onClose }) => {
  const { loadCredits } = useAI();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const creditPackages = paymentService.getCreditPackages();

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
    setError(null);
  };

  const handlePayPalCreateOrder = async (data, actions) => {
    try {
      setProcessing(true);
      setError(null);

      const orderData = await paymentService.createPayPalOrder(selectedPackage.id);
      
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: orderData.amount.toString(),
            currency_code: orderData.currency
          },
          description: `${selectedPackage.name} - ${selectedPackage.credits} AI Credits`,
          custom_id: orderData.orderId
        }]
      });
    } catch (error) {
      setError(error.message);
      setProcessing(false);
      throw error;
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      
      const paymentDetails = {
        paymentID: order.id,
        payerEmail: order.payer.email_address,
        payerName: `${order.payer.name.given_name} ${order.payer.name.surname}`,
        orderId: order.purchase_units[0].custom_id
      };

      const result = await paymentService.processPayPalPayment(
        paymentDetails.orderId,
        paymentDetails
      );

      if (result.success) {
        setSuccess({
          message: `Successfully purchased ${result.creditsAdded} credits!`,
          package: result.packageName
        });
        
        // Refresh user credits
        await loadCredits();
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalError = (error) => {
    console.error('PayPal error:', error);
    setError('Payment failed. Please try again.');
    setProcessing(false);
  };

  const handleClose = () => {
    setSelectedPackage(null);
    setError(null);
    setSuccess(null);
    setProcessing(false);
    onClose();
  };

  const renderPackageCard = (pkg) => (
    <Grid item xs={12} sm={6} md={3} key={pkg.id}>
      <Card 
        sx={{ 
          height: '100%',
          cursor: 'pointer',
          border: selectedPackage?.id === pkg.id ? 2 : 1,
          borderColor: selectedPackage?.id === pkg.id ? 'primary.main' : 'divider',
          position: 'relative',
          '&:hover': {
            boxShadow: 3
          }
        }}
        onClick={() => handlePackageSelect(pkg)}
      >
        {pkg.popular && (
          <Chip
            label="POPULAR"
            color="primary"
            size="small"
            icon={<StarIcon />}
            sx={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            }}
          />
        )}
        
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <AIIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              {pkg.name}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {pkg.credits}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI Credits
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              ${pkg.price}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ${(pkg.price / pkg.credits).toFixed(3)} per credit
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {pkg.description}
          </Typography>

          {selectedPackage?.id === pkg.id && (
            <CheckIcon sx={{ color: 'success.main', fontSize: 30 }} />
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" component="div" gutterBottom>
          Purchase AI Credits
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose a credit package to unlock powerful AI features for your business trips
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            <Typography variant="subtitle1" fontWeight="bold">
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body2">
              {success.message}
            </Typography>
          </Alert>
        )}

        {/* Credit Packages */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {creditPackages.map(renderPackageCard)}
        </Grid>

        {/* PayPal Payment Section */}
        {selectedPackage && !success && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon />
              Complete Your Purchase
            </Typography>
            
            <Card sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedPackage.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPackage.credits} AI Credits
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    ${selectedPackage.price}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            {/* PayPal Integration */}
            <PayPalScriptProvider 
              options={{ 
                "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test", // You'll need to add this
                currency: "USD" 
              }}
            >
              <PayPalButtons
                style={{ 
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "paypal"
                }}
                createOrder={handlePayPalCreateOrder}
                onApprove={handlePayPalApprove}
                onError={handlePayPalError}
                disabled={processing}
              />
            </PayPalScriptProvider>

            {processing && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Processing payment...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={processing}>
          {success ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreditPurchaseDialog; 