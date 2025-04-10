import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Paper, Grid, Chip, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PetsIcon from '@mui/icons-material/Pets';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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

// Add new styled components for pet information
const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(1),
  alignItems: 'center',
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  width: '150px',
  color: theme.palette.text.secondary,
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  flex: 1,
}));

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
      
      {/* Pet Information Section - Only show for pet category */}
      {advert.category === 'pet' && (
        <StyledPaper elevation={3}>
          <Typography variant="h5" gutterBottom>
            Pet Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <DetailRow>
            <DetailLabel variant="body1">Species/Breed:</DetailLabel>
            <DetailValue variant="body1">{advert.breed || 'Not specified'}</DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel variant="body1">Age:</DetailLabel>
            <DetailValue variant="body1">
              {advert.age ? `${advert.age} ${advert.ageUnit || 'weeks'}` : 'Not specified'}
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel variant="body1">Sex:</DetailLabel>
            <DetailValue variant="body1">
              {advert.gender ? advert.gender.charAt(0).toUpperCase() + advert.gender.slice(1) : 'Not specified'}
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel variant="body1">Health Status:</DetailLabel>
            <DetailValue variant="body1">{advert.healthStatus || 'Not specified'}</DetailValue>
          </DetailRow>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Vaccination Details
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vaccination Type</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>First Vaccination</TableCell>
                  <TableCell align="center">
                    {advert.vaccinationDetails?.firstVaccination ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deworming</TableCell>
                  <TableCell align="center">
                    {advert.vaccinationDetails?.deworming ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Boosters</TableCell>
                  <TableCell align="center">
                    {advert.vaccinationDetails?.boosters ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CancelIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          {advert.microchipId && (
            <DetailRow>
              <DetailLabel variant="body1">Microchip/Tag ID:</DetailLabel>
              <DetailValue variant="body1">{advert.microchipId}</DetailValue>
            </DetailRow>
          )}
          
          {advert.vaccinationCertificates && advert.vaccinationCertificates.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Certificates
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {advert.vaccinationCertificates.map((cert, index) => (
                  <Button 
                    key={index}
                    variant="outlined" 
                    color="primary"
                    href={cert}
                    target="_blank"
                  >
                    Certificate {index + 1}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </StyledPaper>
      )}
      
      {loading && <Loader/>}
    </Box>
  );
}

export default AdvertDetails;