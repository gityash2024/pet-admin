import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  IconButton, DialogTitle, DialogContent, Divider, Typography,
  FormControlLabel, Checkbox, Grid, FormGroup, Dialog, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { uploadFile } from '../../utils/fileUpload';

function AdvertForm({ open, onClose, advert = null, onSubmit, users, categories }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    owner: '',
    category: '',
    location: '',
    // Pet-specific fields
    breed: '',
    age: '',
    ageUnit: 'weeks',
    gender: '',
    healthStatus: '',
    vaccinationDetails: {
      firstVaccination: false,
      deworming: false,
      boosters: false
    },
    microchipId: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [showPetFields, setShowPetFields] = useState(false);
  const [vaccCertificateUrl, setVaccCertificateUrl] = useState('');
  const [vetCertificateUrl, setVetCertificateUrl] = useState('');

  // Add loading state
  const [loading, setLoading] = useState(false);
  const [loadingVaccCert, setLoadingVaccCert] = useState(false);
  const [loadingVetCert, setLoadingVetCert] = useState(false);

  useEffect(() => {
    if (advert) {
      setFormData({
        title: advert.title || '',
        description: advert.description || '',
        price: advert.price || '',
        owner: advert.owner?._id || '',
        category: advert.category || '',
        location: advert.location || '',
        breed: advert.breed || '',
        age: advert.age || '',
        ageUnit: advert.ageUnit || 'weeks',
        gender: advert.gender || '',
        healthStatus: advert.healthStatus || '',
        vaccinationDetails: advert.vaccinationDetails || {
          firstVaccination: false,
          deworming: false,
          boosters: false
        },
        microchipId: advert.microchipId || '',
      });
      setImageUrl(advert.image || '');
      setVetCertificateUrl(advert.vetHealthCertificate || '');
      
      if (advert.vaccinationCertificates && advert.vaccinationCertificates.length > 0) {
        setVaccCertificateUrl(advert.vaccinationCertificates[0]);
      }
      
      setShowPetFields(advert.category === 'pet' || advert.category === 'dog' || advert.category === 'cat');
    } else {
      resetForm();
    }
  }, [advert]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      owner: '',
      category: '',
      location: '',
      breed: '',
      age: '',
      ageUnit: 'weeks',
      gender: '',
      healthStatus: '',
      vaccinationDetails: {
        firstVaccination: false,
        deworming: false,
        boosters: false
      },
      microchipId: '',
    });
    setImageUrl('');
    setVaccCertificateUrl('');
    setVetCertificateUrl('');
    setShowPetFields(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setShowPetFields(value === 'pet' || value === 'dog' || value === 'cat');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      vaccinationDetails: {
        ...prev.vaccinationDetails,
        [name]: checked
      }
    }));
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // Set appropriate loading state
      switch (type) {
        case 'image':
          setLoading(true);
          break;
        case 'vaccCert':
          setLoadingVaccCert(true);
          break;
        case 'vetCert':
          setLoadingVetCert(true);
          break;
        default:
          break;
      }
      
      const result = await uploadFile(file, localStorage.getItem('token'));
      const uploadedUrl = result.fileUrl;
      
      switch (type) {
        case 'image':
          setImageUrl(uploadedUrl);
          break;
        case 'vaccCert':
          setVaccCertificateUrl(uploadedUrl);
          break;
        case 'vetCert':
          setVetCertificateUrl(uploadedUrl);
          break;
        default:
          break;
      }
    } catch (error) {
      // Error is already handled in the uploadFile function
    } finally {
      // Reset loading state
      switch (type) {
        case 'image':
          setLoading(false);
          break;
        case 'vaccCert':
          setLoadingVaccCert(false);
          break;
        case 'vetCert':
          setLoadingVetCert(false);
          break;
        default:
          break;
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate pet-specific fields if the category is pet
    if (showPetFields) {
      if (!formData.breed || !formData.age || !formData.gender || !formData.healthStatus) {
        toast.error('Please fill in all pet information fields');
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
    }
    
    const submitData = {
      ...formData,
      image: imageUrl,
    };
    
    // Add pet-specific data if relevant
    if (showPetFields) {
      submitData.vaccinationCertificates = vaccCertificateUrl ? [vaccCertificateUrl] : [];
      submitData.vetHealthCertificate = vetCertificateUrl || '';
    }
    
    onSubmit(submitData);
  };

  return (
    <>
      <DialogTitle>
        {advert ? 'Edit Advert' : 'Add New Advert'}
        <IconButton
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
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Basic Information</Typography>
          
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Owner (optional)</InputLabel>
            <Select
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              label="Owner (optional)"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
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
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
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
            <Box sx={{ mt: 2, mb: 2 }}>
              <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
          
          {/* Pet Information Fields */}
          {showPetFields && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>Pet Information</Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Species/Breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                required={showPetFields}
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
                    onChange={handleInputChange}
                    required={showPetFields}
                    helperText={formData.category === 'dog' ? "Minimum age for dogs is 8 weeks" : ""}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="ageUnit"
                      value={formData.ageUnit}
                      onChange={handleInputChange}
                      label="Unit"
                    >
                      <MenuItem value="weeks">Weeks</MenuItem>
                      <MenuItem value="months">Months</MenuItem>
                      <MenuItem value="years">Years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <FormControl fullWidth margin="normal" required={showPetFields}>
                <InputLabel>Sex</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  label="Sex"
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
                onChange={handleInputChange}
                multiline
                rows={3}
                required={showPetFields}
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
                onChange={(e) => handleFileUpload(e, 'vaccCert')}
                style={{ display: 'none' }}
                id="vacc-cert-upload"
              />
              <label htmlFor="vacc-cert-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  disabled={loadingVaccCert}
                  startIcon={loadingVaccCert ? <CircularProgress size={20} /> : null}
                >
                  {loadingVaccCert ? 'Uploading...' : 'Upload Vaccination Certificate'}
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
                onChange={(e) => handleFileUpload(e, 'vetCert')}
                style={{ display: 'none' }}
                id="vet-cert-upload"
              />
              <label htmlFor="vet-cert-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  disabled={loadingVetCert}
                  startIcon={loadingVetCert ? <CircularProgress size={20} /> : null}
                >
                  {loadingVetCert ? 'Uploading...' : 'Upload Veterinary Certificate'}
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
                onChange={handleInputChange}
              />
            </>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Saving...' : (advert ? 'Update' : 'Add')} Advert
          </Button>
        </Box>
      </DialogContent>
    </>
  );
}

export default AdvertForm; 