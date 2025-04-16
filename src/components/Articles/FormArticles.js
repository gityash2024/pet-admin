import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, DialogTitle, DialogContent, DialogActions, CircularProgress
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { uploadFile } from '../../utils/fileUpload';

function FormArticle({ article, onSave, onClose, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    images: []
  });
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        content: article.content || '',
        category: article.category || '',
        author: article.author || ''
      });
      setImageUrl(article.images?.[0] || '');
    }
  }, [article]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prevData => ({
      ...prevData,
      content
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
    if (!formData.title || !formData.content || !formData.category || !formData.author) {
      toast.error('All fields are required');
      return;
    }
    onSave({ ...formData, images: [imageUrl], _id: article?._id });
  };

  return (
    <>
      <DialogTitle>{article ? 'Edit Article' : 'Add New Blog'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            name="title"
            value={formData.title}
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
          <ReactQuill
            value={formData.content}
            onChange={handleContentChange}
            style={{ height: '200px', marginBottom: '50px' }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Author"
            name="author"
            value={formData.author}
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
          {article ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </>
  );
}

export default FormArticle;