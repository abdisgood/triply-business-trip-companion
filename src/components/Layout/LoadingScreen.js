import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
} from '@mui/material';
import { Flight as FlightIcon } from '@mui/icons-material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d32f2f 0%, #ffc107 100%)',
        color: 'white',
      }}
    >
      <Fade in timeout={1000}>
        <Box sx={{ textAlign: 'center' }}>
          <FlightIcon
            sx={{
              fontSize: 80,
              mb: 2,
              animation: 'bounce 2s infinite',
              '@keyframes bounce': {
                '0%, 20%, 50%, 80%, 100%': {
                  transform: 'translateY(0)',
                },
                '40%': {
                  transform: 'translateY(-10px)',
                },
                '60%': {
                  transform: 'translateY(-5px)',
                },
              },
            }}
          />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Triply
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 300,
            }}
          >
            Preparing your business trip companion...
          </Typography>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'white',
            }}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default LoadingScreen; 