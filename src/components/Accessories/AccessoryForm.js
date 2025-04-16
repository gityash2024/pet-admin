// AccessoryForm.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { uploadFile } from '../../utils/fileUpload';

function AccessoryForm({ accessory, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessory) {
      setFormData({
        name: accessory.name || '',
        description: accessory.description || '',
        price: accessory.price || '',
      });
      setImageUrl(accessory.images?.[0] || '');
    }
  }, [accessory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
      setLoading(true);
      const result = await uploadFile(file, localStorage.getItem('token'));
      setImageUrl(result.fileUrl);
    } catch (error) {
      // Error is already handled in the uploadFile function
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.price ) {
      toast.error('All fields are required');
      return;
    }
    onSave({ ...formData, images: [imageUrl], _id: accessory?._id });
  };

  return (
    <>
      <DialogTitle>{accessory ? 'Edit Accessory' : 'Add New Accessory'}</DialogTitle>
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
          <TextField
            fullWidth
            margin="normal"
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
         
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </label>
          {imageUrl && (
            <Box sx={{ mt: 2 }}>
              <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {accessory ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </>
  );
}

export default AccessoryForm;