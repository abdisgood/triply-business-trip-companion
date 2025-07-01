import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CommentForm = ({ open, onClose, onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim() });
      setContent('');
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add Comment</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            placeholder="Add your notes, observations, or comments about this company..."
            required
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!content.trim()}
          >
            Add Comment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CommentForm; 