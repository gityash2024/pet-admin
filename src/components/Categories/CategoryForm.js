// src/components/Categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';

function CategoryForm({ category, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      toast.error('All fields are required');
      return;
    }
    onSave({ ...formData, _id: category?._id });
  };

  return (
    <>
      <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {category ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </>
  );
}

export default CategoryForm;