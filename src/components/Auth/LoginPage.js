import React, { useState, forwardRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Fade,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Map as MapIcon,
  ContactPhone as ContactIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const FeatureCard = forwardRef(({ icon, title, description }, ref) => (
  <Card ref={ref} sx={{ height: '100%', textAlign: 'center' }}>
    <CardContent>
      <Box sx={{ color: 'primary.main', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
));

FeatureCard.displayName = 'FeatureCard';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d32f2f 0%, #ffc107 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Branding and Features */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box sx={{ color: 'white', mb: 4 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  Triply
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                  }}
                >
                  Your Ultimate Business Trip Companion
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    opacity: 0.8,
                  }}
                >
                  Plan, organize, and execute successful business trips with ease.
                  Manage companies, contacts, schedules, and travel itineraries all in one place.
                </Typography>
              </Box>
            </Fade>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1200}>
                  <FeatureCard
                    icon={<BusinessIcon sx={{ fontSize: 40 }} />}
                    title="Company Profiles"
                    description="Comprehensive company information and contact management"
                  />
                </Fade>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1400}>
                  <FeatureCard
                    icon={<ScheduleIcon sx={{ fontSize: 40 }} />}
                    title="Smart Scheduling"
                    description="Plan meetings, calls, and visits with intelligent scheduling"
                  />
                </Fade>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1600}>
                  <FeatureCard
                    icon={<MapIcon sx={{ fontSize: 40 }} />}
                    title="Trip Itineraries"
                    description="Create detailed travel plans with locations and directions"
                  />
                </Fade>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1800}>
                  <FeatureCard
                    icon={<ContactIcon sx={{ fontSize: 40 }} />}
                    title="Contact Network"
                    description="Build and maintain your business relationship network"
                  />
                </Fade>
              </Grid>
            </Grid>
          </Grid>

          {/* Right side - Login Form */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={2000}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <BusinessIcon
                    sx={{
                      fontSize: 60,
                      color: 'primary.main',
                      mb: 2,
                    }}
                  />
                  <Typography variant="h4" gutterBottom>
                    Welcome to Triply
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sign in to start planning your business trips
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={
                    isLoggingIn ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <GoogleIcon />
                    )
                  }
                  onClick={handleGoogleLogin}
                  disabled={loading || isLoggingIn}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #4285f4 30%, #34a853 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #3367d6 30%, #2d8e47 90%)',
                    },
                  }}
                >
                  {isLoggingIn ? 'Signing in...' : 'Continue with Google'}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 3, display: 'block' }}
                >
                  Secure authentication powered by Google
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoginPage; 