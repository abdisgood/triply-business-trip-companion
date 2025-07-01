import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Preset color palettes
const colorPalettes = {
  default: {
    name: 'Business Red',
    primary: { main: '#d32f2f', light: '#ff6659', dark: '#9a0007' },
    secondary: { main: '#ffc107', light: '#fffd61', dark: '#c68400' },
  },
  ocean: {
    name: 'Ocean Blue',
    primary: { main: '#0288d1', light: '#5eb8ff', dark: '#005b9f' },
    secondary: { main: '#00acc1', light: '#5ddef4', dark: '#007c91' },
  },
  forest: {
    name: 'Forest Green',
    primary: { main: '#2e7d32', light: '#60ad5e', dark: '#005005' },
    secondary: { main: '#81c784', light: '#b2fab4', dark: '#519657' },
  },
  sunset: {
    name: 'Sunset Orange',
    primary: { main: '#f57c00', light: '#ffad42', dark: '#bb4d00' },
    secondary: { main: '#ff6f00', light: '#ffa040', dark: '#c43e00' },
  },
  lavender: {
    name: 'Lavender Purple',
    primary: { main: '#7b1fa2', light: '#ae52d4', dark: '#4a0072' },
    secondary: { main: '#ba68c8', light: '#ee98fb', dark: '#883997' },
  },
  midnight: {
    name: 'Midnight Dark',
    primary: { main: '#263238', light: '#4f5b62', dark: '#000a12' },
    secondary: { main: '#37474f', light: '#62727b', dark: '#102027' },
  },
  coral: {
    name: 'Coral Pink',
    primary: { main: '#e91e63', light: '#ff6090', dark: '#b0003a' },
    secondary: { main: '#f06292', light: '#ff94c2', dark: '#ba2d65' },
  },
  custom: {
    name: 'Custom',
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0' },
    secondary: { main: '#dc004e', light: '#ff5b7c', dark: '#a00026' },
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
        '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
        '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
        '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
        '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
        ...Array(19).fill('0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)'),
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
                    borderColor: '#cbd5e0',
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
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
            elevation1: {
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            },
            elevation4: {
              boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
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
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
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
    setCustomColors(colors);
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