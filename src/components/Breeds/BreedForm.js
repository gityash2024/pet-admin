import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, FormGroup, Grid, Divider, CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { uploadFile } from '../../utils/fileUpload';

function BreedForm({ pet, onSave, onClose, categories }) {
  console.log(categories,'----------------______-___---___---__---___--')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    breed: '',
    age: '',
    ageUnit: 'weeks',
    gender: '',
    healthStatus: '',
    price: '',
    description: '',
    images: [],
    vaccinationDetails: {
      firstVaccination: false,
      deworming: false,
      boosters: false
    },
    vaccinationCertificates: [],
    vetHealthCertificate: '',
    microchipId: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [vaccCertificateUrl, setVaccCertificateUrl] = useState('');
  const [vetCertificateUrl, setVetCertificateUrl] = useState('');

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        category: pet.category || '',
        location: pet.location || '',
        breed: pet.breed || '',
        age: pet.age || '',
        ageUnit: pet.ageUnit || 'weeks',
        gender: pet.gender || '',
        healthStatus: pet.healthStatus || '',
        price: pet.price || '',
        description: pet.description || '',
        vaccinationDetails: pet.vaccinationDetails || {
          firstVaccination: false,
          deworming: false,
          boosters: false
        },
        vaccinationCertificates: pet.vaccinationCertificates || [],
        vetHealthCertificate: pet.vetHealthCertificate || '',
        microchipId: pet.microchipId || '',
      });
      setImageUrl(pet.images?.[0] || '');
      setVetCertificateUrl(pet.vetHealthCertificate || '');
      if (pet.vaccinationCertificates && pet.vaccinationCertificates.length > 0) {
        setVaccCertificateUrl(pet.vaccinationCertificates[0]);
      }
    }
  }, [pet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      vaccinationDetails: {
        ...prevData.vaccinationDetails,
        [name]: checked
      }
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

  const handleVaccCertificateUpload = async (event) => {
    const file = event.target.files[0];
    try {
      setLoading(true);
      const result = await uploadFile(file, localStorage.getItem('token'));
      setVaccCertificateUrl(result.fileUrl);
      setFormData(prevData => ({
        ...prevData,
        vaccinationCertificates: [result.fileUrl]
      }));
    } catch (error) {
      // Error is already handled in the uploadFile function
    } finally {
      setLoading(false);
    }
  };

  const handleVetCertificateUpload = async (event) => {
    const file = event.target.files[0];
    try {
      setLoading(true);
      const result = await uploadFile(file, localStorage.getItem('token'));
      setVetCertificateUrl(result.fileUrl);
      setFormData(prevData => ({
        ...prevData,
        vetHealthCertificate: result.fileUrl
      }));
    } catch (error) {
      // Error is already handled in the uploadFile function
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.location || !formData.breed || !formData.age || !formData.price || !formData.description || !formData.gender || !formData.healthStatus) {
      toast.error('All required fields must be filled');
      return;
    }
    
    // Validate minimum age for dogs
    if (formData.category.toLowerCase() === 'dog' && formData.age) {
      const ageValue = parseInt(formData.age);
      const ageUnit = formData.ageUnit || 'weeks';
      
      if (ageUnit === 'weeks' && ageValue < 8) {
        toast.error('Dogs must be at least 8 weeks old');
        return;
      } else if (ageUnit === 'months' && ageValue < 2) {
        toast.error('Dogs must be at least 2 months old');
        return;
      }
    }
    
    onSave({ 
      ...formData, 
      images: [imageUrl], 
      _id: pet?._id 
    });
  };

  return (
    <>
      <DialogTitle>{pet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
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
          
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom>Pet Information</Typography>
          
          <TextField
            fullWidth
            margin="normal"
            label="Species/Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            required
          />
          
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                fullWidth
                margin="normal"
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                helperText={formData.category.toLowerCase() === 'dog' ? "Minimum age for dogs is 8 weeks" : ""}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="age-unit-label">Unit</InputLabel>
                <Select
                  labelId="age-unit-label"
                  name="ageUnit"
                  value={formData.ageUnit}
                  onChange={handleChange}
                >
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                  <MenuItem value="years">Years</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="gender-label">Sex</InputLabel>
            <Select
              labelId="gender-label"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="mixed">Mixed (for multiple pets)</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="normal"
            label="Health Status"
            name="healthStatus"
            value={formData.healthStatus}
            onChange={handleChange}
            multiline
            rows={3}
            required
          />
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Vaccination Details</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.vaccinationDetails.firstVaccination} 
                  onChange={handleCheckboxChange}
                  name="firstVaccination"
                />
              }
              label="First vaccination"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.vaccinationDetails.deworming} 
                  onChange={handleCheckboxChange}
                  name="deworming"
                />
              }
              label="Deworming"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.vaccinationDetails.boosters} 
                  onChange={handleCheckboxChange}
                  name="boosters"
                />
              }
              label="Boosters"
            />
          </FormGroup>
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Vaccination Certificates</Typography>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleVaccCertificateUpload}
            style={{ display: 'none' }}
            id="vacc-cert-upload"
          />
          <label htmlFor="vacc-cert-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Uploading...' : 'Upload Vaccination Certificate'}
            </Button>
          </label>
          {vaccCertificateUrl && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Certificate uploaded</Typography>
              <Button
                size="small"
                onClick={() => window.open(vaccCertificateUrl, '_blank')}
              >
                View Certificate
              </Button>
            </Box>
          )}
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Veterinary Health Certificate</Typography>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleVetCertificateUpload}
            style={{ display: 'none' }}
            id="vet-cert-upload"
          />
          <label htmlFor="vet-cert-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Uploading...' : 'Upload Veterinary Certificate'}
            </Button>
          </label>
          {vetCertificateUrl && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Certificate uploaded</Typography>
              <Button
                size="small"
                onClick={() => window.open(vetCertificateUrl, '_blank')}
              >
                View Certificate
              </Button>
            </Box>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            label="Microchip/Tag ID"
            name="microchipId"
            value={formData.microchipId}
            onChange={handleChange}
          />
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