import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Grid, Card, CardContent, CardMedia, Button, Select, MenuItem, 
  InputLabel, FormControl, Dialog, DialogContent, DialogTitle, IconButton, 
  TextField, Pagination, CircularProgress, CardActions, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { PublishRounded, Pets, ShoppingBag, Build } from '@mui/icons-material';
import { 
  getAllAdverts, addAdvert, updateAdvert, deleteAdvert, getAdvertById,getAllUsers,publishAdvert
} from '../../utils/api';
import Loader from 'components/Loader/Loader';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%', 
  width: '100%',
  margin: 'auto',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '56.25%',
});

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

const TruncateTypography = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',
});

function AdvertList() {
  const navigate = useNavigate();
  const [adverts, setAdverts] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    owner: '',
    category: '',
    location: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchAdverts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const usersList = response?.data.users.filter(user => user.role === 'user');
      setUsers(usersList);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };
  
  useEffect(() => {
    fetchAdverts();
    fetchUsers();
  }, []);

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const response = await getAllAdverts();
      const advertsData = response.data?.adverts || [];
      setAdverts(advertsData);
      setTotalPages(Math.ceil(advertsData.length / 6));
    } catch (error) {
      toast.error('Failed to fetch adverts');
    }
    setLoading(false);
  };

  const handleOpenForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      owner: '',
      category: '',
      location: '',
    });
    setImageUrl('');
    setEditingId(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditingId(null);
    setImageUrl('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
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
      const uploadedUrl = responseData.url;
      setImageUrl(uploadedUrl);
    } catch (error) {
      toast.error(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let advertData = {
        ...formData,
        image: imageUrl,
      };
      
      if (!formData?.owner) {
        delete advertData.owner;
      }
      
      if (editingId) {
        await updateAdvert(editingId, advertData);
        toast.success('Advert updated successfully');
      } else {
        await addAdvert(advertData);
        toast.success('Advert added successfully');
      }
      fetchAdverts();
      handleCloseForm();
    } catch (error) {
      toast.error(editingId ? 'Failed to update advert' : 'Failed to add advert');
    }
    setLoading(false);
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const response = await getAdvertById(id);
      setFormData(response.data?.advert);
      setImageUrl(response.data?.advert.image || '');
      setEditingId(id);
      setOpenForm(true);
    } catch (error) {
      toast.error('Failed to fetch advert details');
    }
    setLoading(false);
  };

  const handlePublish = async (id) => {
    setLoading(true);
    try {
      await publishAdvert(id);
      toast.success('Advert published successfully.')
      fetchAdverts();
    } catch (error) {
      toast.error('Failed to publish advert');
    }
    setLoading(false);
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advert?')) {
      setLoading(true);
      try {
        await deleteAdvert(id);
        toast.success('Advert deleted successfully');
        fetchAdverts();
      } catch (error) {
        toast.error('Failed to delete advert');
      }
      setLoading(false);
    }
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredAdverts = adverts.filter(advert => 
    category === 'all' ? true : advert.category === category
  );

  const sortedAdverts = [...filteredAdverts].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    if (sortBy === 'views') return b.views - a.views;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });



  const getCategoryIcon = (category) => {
    switch(category) {
      case 'pet': return <Pets />;
      case 'accessory': return <ShoppingBag />;
      case 'service': return <Build />;
      default: return null;
    }
  };

  const paginatedAdverts = sortedAdverts.slice((page - 1) * 6, page * 6);
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Adverts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Add Advert
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            value={category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pet">Pets</MenuItem>
            <MenuItem value="accessory">Accessories</MenuItem>
            <MenuItem value="service">Services</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="priceAsc">Price: Low to High</MenuItem>
            <MenuItem value="priceDesc">Price: High to Low</MenuItem>
            <MenuItem value="views">Most Viewed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedAdverts.map((advert) => (
              <Grid item xs={12} sm={6} md={4} key={advert._id}>
                <StyledCard>
                  <StyledCardMedia
                    image={advert.image || 'https://via.placeholder.com/300x200'}
                    title={advert.title}
                  />
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(advert._id)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(advert._id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    {!advert?.isPublished && (
                      <Tooltip title="Publish">
                        <IconButton onClick={() => handlePublish(advert._id)} size="small">
                          <PublishRounded />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                  <StyledCardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Tooltip title={advert.title}>
                        <TruncateTypography variant="h6" component="h2">
                          {advert.title}
                        </TruncateTypography>
                      </Tooltip>
                      <Tooltip title={advert.category}>
                        {getCategoryIcon(advert.category)}
                      </Tooltip>
                    </Box>
                    <Tooltip title={advert.description}>
                      <TruncateTypography variant="body2" color="textSecondary" component="p">
                        {advert.description}
                      </TruncateTypography>
                    </Tooltip>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h6" component="p">
                        ${advert.price}
                      </Typography>
                      <Tooltip title={advert.location}>
                        <Typography variant="body2" color="textSecondary">
                          Location: {advert.location}
                        </Typography>
                      </Tooltip>
                      <Tooltip title={advert.owner?.name||'N/A'}>
  <Typography variant="body2" color="textSecondary">
    Owner: {advert.owner?.name||'N/A'}
  </Typography>
</Tooltip>
                    </Box>
                  </StyledCardContent>
                  <Box sx={{ p: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      onClick={() => navigate(`/adverts/${advert._id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
          {!paginatedAdverts.length && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                width: '100%'
              }}
            >
              <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No adverts found
              </Typography>
            </Box>
          )}
         {sortedAdverts.length > 6 && (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <Pagination 
      count={totalPages} 
      page={page} 
      onChange={handlePageChange} 
      color="primary" 
    />
  </Box>
)}
        </>
      )}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Advert' : 'Add New Advert'}
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
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
          <FormControl fullWidth margin="normal" >
  <InputLabel id="owner-label">Owner (optional)</InputLabel>
  <Select
    labelId="owner-label"
    name="owner"
    value={formData.owner}
    onChange={handleInputChange}
  >
    {users.map((user) => (
      <MenuItem key={user._id} value={user._id}>
        {user.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <MenuItem value="pet">Pet</MenuItem>
                <MenuItem value="accessory">Accessory</MenuItem>
                <MenuItem value="service">Service</MenuItem>
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
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {editingId ? 'Update' : 'Add'} Advert
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      {loading && <Loader />}
    </Box>
  );
}

export default AdvertList;