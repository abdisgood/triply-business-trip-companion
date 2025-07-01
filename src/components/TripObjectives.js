import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import {
  Target as TargetIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Psychology as AIIcon
} from '@mui/icons-material';
import { useTrip } from '../contexts/TripContext';
import { useAI } from '../contexts/AIContext';
import aiService from '../services/aiService';

const TripObjectives = ({ trip, onUpdate }) => {
  const { updateTrip } = useTrip();
  const { credits } = useAI();
  const [objectives, setObjectives] = useState(trip.objectives || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleAddObjective = () => {
    setEditingIndex(null);
    setObjectiveInput('');
    setDialogOpen(true);
  };

  const handleEditObjective = (index) => {
    setEditingIndex(index);
    setObjectiveInput(objectives[index]);
    setDialogOpen(true);
  };

  const handleSaveObjective = async () => {
    if (!objectiveInput.trim()) return;

    let newObjectives;
    if (editingIndex !== null) {
      newObjectives = [...objectives];
      newObjectives[editingIndex] = objectiveInput.trim();
    } else {
      newObjectives = [...objectives, objectiveInput.trim()];
    }

    setObjectives(newObjectives);
    await updateTrip(trip.id, { objectives: newObjectives });
    await onUpdate();
    
    setDialogOpen(false);
    setObjectiveInput('');
    setEditingIndex(null);
  };

  const handleDeleteObjective = async (index) => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      const newObjectives = objectives.filter((_, i) => i !== index);
      setObjectives(newObjectives);
      await updateTrip(trip.id, { objectives: newObjectives });
      await onUpdate();
    }
  };

  const handleGenerateObjectives = async () => {
    if (credits.available < 5) {
      alert('Insufficient AI credits. Need 5 credits to generate objectives.');
      return;
    }

    setGeneratingAI(true);
    try {
      const aiObjectives = await aiService.generateTripObjectives(trip);
      setObjectives([...objectives, ...aiObjectives]);
      await updateTrip(trip.id, { objectives: [...objectives, ...aiObjectives] });
      await onUpdate();
    } catch (error) {
      console.error('Error generating objectives:', error);
      alert('Failed to generate objectives. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  if (!objectives || objectives.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <TargetIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No objectives set
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
          Define clear objectives to make your trip more productive
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddObjective}
          >
            Add Objective
          </Button>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={handleGenerateObjectives}
            disabled={generatingAI}
          >
            {generatingAI ? 'Generating...' : 'Generate with AI (5 credits)'}
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Trip Objectives
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={handleGenerateObjectives}
            disabled={generatingAI}
            size="small"
          >
            Add AI Suggestions
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddObjective}
            size="small"
          >
            Add Objective
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Clear objectives help AI generate better company suggestions and optimize your itinerary.
            </Typography>
          </Alert>

          <List>
            {objectives.map((objective, index) => (
              <ListItem key={index} divider={index < objectives.length - 1}>
                <ListItemIcon>
                  <TargetIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={objective}
                  primaryTypographyProps={{
                    variant: 'body1'
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleEditObjective(index)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteObjective(index)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Progress Summary
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${objectives.length} objectives`}
                color="primary"
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Track your progress during and after the trip
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Objective Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Objective' : 'Add Objective'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            placeholder="e.g., Identify 5 potential manufacturing partners in Shanghai"
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveObjective}
            variant="contained"
            disabled={!objectiveInput.trim()}
          >
            {editingIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripObjectives;