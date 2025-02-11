import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { toast } from 'react-toastify';

function BreedForm({ pet, onSave, onClose, categories }) {
  console.log(categories,'----------------______-___---___---__---___--')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    breed: '',
    age: '',
    price: '',
    description: '',
    images: [],
  });
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        category: pet.category || '',
        location: pet.location || '',
        breed: pet.breed || '',
        age: pet.age || '',
        price: pet.price || '',
        description: pet.description || '',
      });
      setImageUrl(pet.images?.[0] || '');
    }
  }, [pet]);

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
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        "https://chirag-backend.onrender.com/api/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      const responseData = await response.json();
      const uploadedUrl = responseData.fileUrl;
      setImageUrl(uploadedUrl);
    } catch (error) {
      toast.error(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category ||!formData.location|| !formData.breed || !formData.age || !formData.price || !formData.description ) {
      toast.error('All fields are required');
      return;
    }
    onSave({ ...formData, images: [imageUrl], _id: pet?._id });
  };

  return (
    <>
      <DialogTitle>{pet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
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
        <FormControl fullWidth margin="normal" required>
    <InputLabel id="category-label">Category</InputLabel>
    <Select
      labelId="category-label"
      name="category"
      value={formData.category}
      onChange={handleChange}
    >
      {categories.map((cat) => (
        <MenuItem key={cat._id} value={cat.name}>
          {cat.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
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
          <TextField
            fullWidth
            margin="normal"
            label="Location"
            name="location"
            type="text"
            value={formData.location}
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
            >
              Upload Image
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
          {pet ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </>
  );
}

export default BreedForm;