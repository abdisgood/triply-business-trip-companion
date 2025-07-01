import React from 'react';
import { 
  Snackbar, 
  Alert, 
  Slide,
  Stack
} from '@mui/material';
import { useAI } from '../contexts/AIContext';

const CreditNotifications = () => {
  const { notifications = [] } = useAI();

  // Get only the most recent 3 notifications
  const visibleNotifications = notifications.slice(-3);

  return (
    <Stack spacing={1} sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1400 }}>
      {visibleNotifications.map((notification, index) => (
        <Slide 
          key={notification.id} 
          direction="right" 
          in={true}
          timeout={300}
        >
          <Alert 
            severity={notification.severity || 'info'}
            variant="filled"
            sx={{ 
              minWidth: 250,
              boxShadow: 3,
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            {notification.message}
          </Alert>
        </Slide>
      ))}
    </Stack>
  );
};

export default CreditNotifications;