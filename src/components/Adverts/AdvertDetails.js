import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Grid, Chip, Button, CircularProgress 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify'; // Update this import based on your toaster library
import { getAdvertById } from '../../utils/api'; // Update this path as needed
import Loader from 'components/Loader/Loader';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ImageContainer = styled(Box)({
  width: '100%',
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  marginBottom: '1rem',
});

const Image = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

function AdvertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advert, setAdvert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdvertDetails();
  }, [id]);

  const fetchAdvertDetails = async () => {
    setLoading(true);

    try {
      const response = await getAdvertById(id);
      setAdvert(response.data?.advert);
    } catch (error) {
      toast.error('Failed to fetch advert details');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'pet': return <PetsIcon />;
      case 'accessory': return <ShoppingBasketIcon />;
      case 'service': return <BuildIcon />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!advert) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Advert not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/adverts')}>
          Back to Adverts
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/adverts')} sx={{ mb: 2 }}>
        Back to Adverts
      </Button>
      <Typography variant="h4" gutterBottom>
        Advert Details
      </Typography>
      <StyledPaper elevation={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ImageContainer>
              <Image src={advert.image || `https://source.unsplash.com/random/800x600?${advert.category}`} alt={advert.title} />
            </ImageContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                icon={getCategoryIcon(advert.category)} 
                label={advert.category.charAt(0).toUpperCase() + advert.category.slice(1)} 
                color="primary" 
                sx={{ mr: 1 }}
              />
              {/* <Chip 
                icon={<VisibilityIcon />} 
                label={`${advert.views} views`} 
                variant="outlined" 
              /> */}
            </Box>
            <Typography variant="h5" gutterBottom>
              {advert.title}
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              ${advert.price}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {advert.location}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {advert.description}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Owner Information
              </Typography>
              <Typography variant="body1">Name: {advert.owner?.name||'N/A'}</Typography>
              {/* <Typography variant="body1">Email: {advert.owner.email}</Typography>
              <Typography variant="body1">Phone: {advert.owner.phone}</Typography> */}
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(advert.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {new Date(advert.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>
      {loading && <Loader/>}
    </Box>
  );
}

export default AdvertDetails;