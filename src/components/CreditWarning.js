import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Typography,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Warning as WarningIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useAI } from '../contexts/AIContext';
import CreditPurchaseDialog from './CreditPurchaseDialog';

const CreditWarning = ({ threshold = 10 }) => {
  const { credits } = useAI();
  const [dismissed, setDismissed] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  // Reset dismissed state when credits change significantly
  useEffect(() => {
    if (credits.available > threshold) {
      setDismissed(false);
    }
  }, [credits.available, threshold]);

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage with timestamp
    localStorage.setItem('creditWarningDismissed', JSON.stringify({
      timestamp: Date.now(),
      creditLevel: credits.available
    }));
  };

  // Check if warning was recently dismissed
  useEffect(() => {
    const dismissedData = localStorage.getItem('creditWarningDismissed');
    if (dismissedData) {
      const { timestamp, creditLevel } = JSON.parse(dismissedData);
      const hoursSinceDismissal = (Date.now() - timestamp) / (1000 * 60 * 60);
      
      // Don't show warning if dismissed less than 24 hours ago at similar credit level
      if (hoursSinceDismissal < 24 && Math.abs(creditLevel - credits.available) < 5) {
        setDismissed(true);
      }
    }
  }, [credits.available]);

  const severity = credits.available === 0 ? 'error' : 'warning';
  const showWarning = credits.available <= threshold && !dismissed;

  if (!showWarning) {
    return null;
  }

  return (
    <>
      <Collapse in={showWarning}>
        <Alert 
          severity={severity}
          icon={<WarningIcon />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color={severity}
                startIcon={<ShoppingCartIcon />}
                onClick={() => setPurchaseOpen(true)}
              >
                Buy Credits
              </Button>
              <IconButton
                size="small"
                onClick={handleDismiss}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
          sx={{ mb: 2 }}
        >
          <AlertTitle>
            {credits.available === 0 
              ? 'No AI Credits Remaining' 
              : `Low AI Credits (${credits.available} remaining)`
            }
          </AlertTitle>
          <Typography variant="body2">
            {credits.available === 0 
              ? 'You need credits to use AI features. Purchase more to continue.'
              : `You're running low on AI credits. Consider purchasing more to avoid interruption.`
            }
          </Typography>
        </Alert>
      </Collapse>

      <CreditPurchaseDialog
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
      />
    </>
  );
};

export default CreditWarning;