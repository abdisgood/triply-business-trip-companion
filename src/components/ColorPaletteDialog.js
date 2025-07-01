import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Palette as PaletteIcon, Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const ColorPaletteDialog = ({ open, onClose }) => {
  const { selectedPalette, colorPalettes, customColors, updatePalette, updateCustomColors } = useTheme();
  const [tempSelection, setTempSelection] = useState(selectedPalette);
  const [tempCustomColors, setTempCustomColors] = useState(customColors);

  const handleApply = () => {
    if (tempSelection === 'custom') {
      updateCustomColors(tempCustomColors);
    }
    updatePalette(tempSelection);
    onClose();
  };

  const handleColorChange = (colorType, shade, value) => {
    setTempCustomColors({
      ...tempCustomColors,
      [colorType]: {
        ...tempCustomColors[colorType],
        [shade]: value,
      },
    });
  };

  const renderColorPreview = (palette, key) => {
    const isSelected = tempSelection === key;
    const colors = key === 'custom' ? tempCustomColors : palette;

    return (
      <Paper
        elevation={isSelected ? 8 : 2}
        sx={{
          p: 2,
          cursor: 'pointer',
          border: isSelected ? '2px solid' : '2px solid transparent',
          borderColor: isSelected ? 'primary.main' : 'transparent',
          transition: 'all 0.3s',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-2px)',
          },
        }}
        onClick={() => setTempSelection(key)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Radio
            checked={isSelected}
            value={key}
            size="small"
            sx={{ p: 0, mr: 1 }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {palette.name || colors.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Primary">
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: colors.primary.main,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </Tooltip>
          <Tooltip title="Primary Light">
            <Box
              sx={{
                width: 30,
                height: 40,
                bgcolor: colors.primary.light,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </Tooltip>
          <Tooltip title="Secondary">
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: colors.secondary.main,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </Tooltip>
          <Tooltip title="Secondary Light">
            <Box
              sx={{
                width: 30,
                height: 40,
                bgcolor: colors.secondary.light,
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
          </Tooltip>
        </Box>
      </Paper>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <PaletteIcon sx={{ mr: 1 }} />
        Choose Color Palette
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select from our preset color palettes or create your own custom theme
        </Typography>

        <Grid container spacing={2}>
          {Object.entries(colorPalettes).map(([key, palette]) => (
            <Grid item xs={6} sm={4} key={key}>
              {renderColorPreview(palette, key)}
            </Grid>
          ))}
        </Grid>

        {tempSelection === 'custom' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Customize Your Colors
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Colors
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Main"
                    type="color"
                    value={tempCustomColors.primary.main}
                    onChange={(e) => handleColorChange('primary', 'main', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                  <TextField
                    label="Light"
                    type="color"
                    value={tempCustomColors.primary.light}
                    onChange={(e) => handleColorChange('primary', 'light', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                  <TextField
                    label="Dark"
                    type="color"
                    value={tempCustomColors.primary.dark}
                    onChange={(e) => handleColorChange('primary', 'dark', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Secondary Colors
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    label="Main"
                    type="color"
                    value={tempCustomColors.secondary.main}
                    onChange={(e) => handleColorChange('secondary', 'main', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                  <TextField
                    label="Light"
                    type="color"
                    value={tempCustomColors.secondary.light}
                    onChange={(e) => handleColorChange('secondary', 'light', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                  <TextField
                    label="Dark"
                    type="color"
                    value={tempCustomColors.secondary.dark}
                    onChange={(e) => handleColorChange('secondary', 'dark', e.target.value)}
                    size="small"
                    sx={{ width: 120 }}
                    InputProps={{
                      sx: { cursor: 'pointer' }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Apply Theme
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorPaletteDialog;