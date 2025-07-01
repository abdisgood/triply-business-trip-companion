import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Preset color palettes with gradients
const colorPalettes = {
  default: {
    name: 'Business Red',
    primary: { main: '#d32f2f', light: '#ff6659', dark: '#9a0007' },
    secondary: { main: '#ffc107', light: '#fffd61', dark: '#c68400' },
    gradients: {
      primary: 'linear-gradient(135deg, #d32f2f 0%, #ff6659 100%)',
      secondary: 'linear-gradient(135deg, #ffc107 0%, #fffd61 100%)',
      background: 'linear-gradient(135deg, #d32f2f 0%, #ffc107 100%)',
      card: 'linear-gradient(145deg, rgba(211, 47, 47, 0.05) 0%, rgba(255, 193, 7, 0.05) 100%)',
    },
  },
  ocean: {
    name: 'Ocean Blue',
    primary: { main: '#0288d1', light: '#5eb8ff', dark: '#005b9f' },
    secondary: { main: '#00acc1', light: '#5ddef4', dark: '#007c91' },
    gradients: {
      primary: 'linear-gradient(135deg, #0288d1 0%, #5eb8ff 100%)',
      secondary: 'linear-gradient(135deg, #00acc1 0%, #5ddef4 100%)',
      background: 'linear-gradient(135deg, #0288d1 0%, #00acc1 100%)',
      card: 'linear-gradient(145deg, rgba(2, 136, 209, 0.05) 0%, rgba(0, 172, 193, 0.05) 100%)',
    },
  },
  forest: {
    name: 'Forest Green',
    primary: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
    secondary: { main: '#81c784', light: '#b2fab4', dark: '#519657' },
    gradients: {
      primary: 'linear-gradient(135deg, #2e7d32 0%, #60ad5e 100%)',
      secondary: 'linear-gradient(135deg, #81c784 0%, #b2fab4 100%)',
      background: 'linear-gradient(135deg, #2e7d32 0%, #81c784 100%)',
      card: 'linear-gradient(145deg, rgba(46, 125, 50, 0.05) 0%, rgba(129, 199, 132, 0.05) 100%)',
    },
  },
  sunset: {
    name: 'Sunset Orange',
    primary: { main: '#f57c00', light: '#ffad42', dark: '#bb4d00' },
    secondary: { main: '#ff6f00', light: '#ffa040', dark: '#c43e00' },
    gradients: {
      primary: 'linear-gradient(135deg, #f57c00 0%, #ffad42 100%)',
      secondary: 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)',
      background: 'linear-gradient(135deg, #f57c00 0%, #ff6f00 100%)',
      card: 'linear-gradient(145deg, rgba(245, 124, 0, 0.05) 0%, rgba(255, 111, 0, 0.05) 100%)',
    },
  },
  lavender: {
    name: 'Lavender Purple',
    primary: { main: '#7b1fa2', light: '#ae52d4', dark: '#4a0072' },
    secondary: { main: '#ba68c8', light: '#ee98fb', dark: '#883997' },
    gradients: {
      primary: 'linear-gradient(135deg, #7b1fa2 0%, #ae52d4 100%)',
      secondary: 'linear-gradient(135deg, #ba68c8 0%, #ee98fb 100%)',
      background: 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)',
      card: 'linear-gradient(145deg, rgba(123, 31, 162, 0.05) 0%, rgba(186, 104, 200, 0.05) 100%)',
    },
  },
  midnight: {
    name: 'Midnight Dark',
    primary: { main: '#263238', light: '#4f5b62', dark: '#000a12' },
    secondary: { main: '#37474f', light: '#62727b', dark: '#102027' },
    gradients: {
      primary: 'linear-gradient(135deg, #263238 0%, #4f5b62 100%)',
      secondary: 'linear-gradient(135deg, #37474f 0%, #62727b 100%)',
      background: 'linear-gradient(135deg, #263238 0%, #37474f 100%)',
      card: 'linear-gradient(145deg, rgba(38, 50, 56, 0.05) 0%, rgba(55, 71, 79, 0.05) 100%)',
    },
  },
  coral: {
    name: 'Coral Pink',
    primary: { main: '#e91e63', light: '#ff6090', dark: '#b0003a' },
    secondary: { main: '#f06292', light: '#ff94c2', dark: '#ba2d65' },
    gradients: {
      primary: 'linear-gradient(135deg, #e91e63 0%, #ff6090 100%)',
      secondary: 'linear-gradient(135deg, #f06292 0%, #ff94c2 100%)',
      background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)',
      card: 'linear-gradient(145deg, rgba(233, 30, 99, 0.05) 0%, rgba(240, 98, 146, 0.05) 100%)',
    },
  },
  custom: {
    name: 'Custom',
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#dc004e', light: '#ff5b7c', dark: '#a00026' },
    gradients: {
      primary: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      secondary: 'linear-gradient(135deg, #dc004e 0%, #ff5b7c 100%)',
      background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
      card: 'linear-gradient(145deg, rgba(25, 118, 210, 0.05) 0%, rgba(220, 0, 78, 0.05) 100%)',
    },
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to generate gradient from colors
const generateGradient = (colors) => {
  return {
    primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.light} 100%)`,
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
    card: `linear-gradient(145deg, ${colors.primary.main}0D 0%, ${colors.secondary.main}0D 100%)`,
  };
};

export const ThemeProvider = ({ children }) => {
  const [selectedPalette, setSelectedPalette] = useState(() => {
    const saved = localStorage.getItem('triply-color-palette');
    return saved || 'default';
  });

  const [customColors, setCustomColors] = useState(() => {
    const saved = localStorage.getItem('triply-custom-colors');
    return saved ? JSON.parse(saved) : colorPalettes.custom;
  });

  useEffect(() => {
    localStorage.setItem('triply-color-palette', selectedPalette);
  }, [selectedPalette]);

  useEffect(() => {
    if (selectedPalette === 'custom') {
      localStorage.setItem('triply-custom-colors', JSON.stringify(customColors));
    }
  }, [customColors, selectedPalette]);

  const theme = useMemo(() => {
    const currentPalette = selectedPalette === 'custom' ? customColors : colorPalettes[selectedPalette];
    const gradients = currentPalette.gradients || generateGradient(currentPalette);
    
    return createTheme({
      palette: {
        primary: {
          main: currentPalette.primary.main,
          light: currentPalette.primary.light,
          dark: currentPalette.primary.dark,
          contrastText: '#fff',
        },
        secondary: {
          main: currentPalette.secondary.main,
          light: currentPalette.secondary.light,
          dark: currentPalette.secondary.dark,
          contrastText: '#fff',
        },
        success: {
          main: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
        },
        info: {
          main: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        },
        warning: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        error: {
          main: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
        text: {
          primary: '#1a202c',
          secondary: '#718096',
        },
        grey: {
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        },
        gradients: gradients,
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          lineHeight: 1.3,
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
          lineHeight: 1.3,
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
          lineHeight: 1.4,
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          lineHeight: 1.4,
        },
        h6: {
          fontWeight: 600,
          fontSize: '1.125rem',
          lineHeight: 1.4,
        },
        body1: {
          fontSize: '1rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
        },
      },
      shape: {
        borderRadius: 12,
      },
      shadows: [
        'none',
        '0px 2px 8px rgba(0, 0, 0, 0.06)',
        '0px 4px 16px rgba(0, 0, 0, 0.08)',
        '0px 8px 24px rgba(0, 0, 0, 0.10)',
        '0px 12px 32px rgba(0, 0, 0, 0.12)',
        '0px 16px 40px rgba(0, 0, 0, 0.14)',
        ...Array(19).fill('0px 24px 48px rgba(0, 0, 0, 0.16)'),
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f7fafc',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e0',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a0aec0',
                },
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#ffffff',
              backgroundImage: gradients.card,
              '&:hover': {
                boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-4px)',
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 10,
              fontWeight: 600,
              padding: '10px 24px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
            },
            contained: {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.25)',
              },
            },
            containedPrimary: {
              background: gradients.primary,
              '&:hover': {
                background: gradients.primary,
                filter: 'brightness(0.9)',
              },
            },
            containedSecondary: {
              background: gradients.secondary,
              '&:hover': {
                background: gradients.secondary,
                filter: 'brightness(0.9)',
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentPalette.primary.light,
                  },
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                  },
                },
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500,
            },
            colorPrimary: {
              background: `${currentPalette.primary.main}15`,
              color: currentPalette.primary.main,
              '&:hover': {
                background: `${currentPalette.primary.main}25`,
              },
            },
            colorSecondary: {
              background: `${currentPalette.secondary.main}15`,
              color: currentPalette.secondary.main,
              '&:hover': {
                background: `${currentPalette.secondary.main}25`,
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              backgroundImage: 'none',
            },
            elevation1: {
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
            },
            elevation4: {
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
              boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.15)',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
              background: gradients.primary,
            },
          },
        },
        MuiFab: {
          styleOverrides: {
            primary: {
              background: gradients.primary,
              '&:hover': {
                background: gradients.primary,
                filter: 'brightness(0.9)',
              },
            },
            secondary: {
              background: gradients.secondary,
              '&:hover': {
                background: gradients.secondary,
                filter: 'brightness(0.9)',
              },
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 4,
              height: 6,
            },
            colorPrimary: {
              backgroundColor: `${currentPalette.primary.main}20`,
            },
            barColorPrimary: {
              background: gradients.primary,
            },
          },
        },
      },
    });
  }, [selectedPalette, customColors]);

  const updatePalette = (paletteKey) => {
    setSelectedPalette(paletteKey);
  };

  const updateCustomColors = (colors) => {
    // Generate gradients for custom colors
    const updatedCustom = {
      ...colors,
      gradients: generateGradient(colors),
    };
    setCustomColors(updatedCustom);
    if (selectedPalette === 'custom') {
      // Force theme update
      setSelectedPalette('custom');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        selectedPalette,
        colorPalettes,
        customColors,
        updatePalette,
        updateCustomColors,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};