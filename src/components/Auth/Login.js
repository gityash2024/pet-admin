import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import dogIcon from '../../assets/dog-icon.svg';
import Carousel from 'react-material-ui-carousel';
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import { adminLogin } from '../../utils/api';
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
    transform: 'rotate(30deg)',
    pointerEvents: 'none',
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
  position: 'relative',
  zIndex: 1,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  color: theme.palette.common.white,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
  },
}));

const CarouselImage = styled('img')({
  width: '100%',
  height: '100vh',
  objectFit: 'cover',
});

const GradientOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
  pointerEvents: 'none',
});

const images = [
  'https://cdn.pixabay.com/photo/2023/12/04/17/24/evening-8429871_1280.jpg',
  'https://cdn.pixabay.com/photo/2023/08/05/02/25/dog-8170199_640.jpg',
  'https://cdn.pixabay.com/photo/2024/03/08/09/47/ai-generated-8620359_1280.png',
  'https://media.istockphoto.com/id/1344021882/photo/portrait-of-happy-multiracial-couple-scratching-their-pet-dog-sitting-on-floor-at-home.jpg?s=2048x2048&w=is&k=20&c=t0_lFDIke3ulAofbCBqxS6jUm0U4Z31KAovRJLSpaJs=',
  'https://cdn.pixabay.com/photo/2023/11/02/16/49/cat-8361048_1280.jpg'
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEmailError('');

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin({ email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if(response.data.admin.role === 'admin') {
          localStorage.setItem('userData', JSON.stringify(response.data.admin));
        localStorage.setItem('permission', JSON.stringify(['dashboard', 'users', 'adverts', 'accessories', 'knowledge', 'pets', 'messages', 'roles', 'categories']));
        }else{
          localStorage.setItem('permission', JSON.stringify(response.data?.admin.permissions));
        }
        toast.success('Login successful');
        navigate('/');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <Grid container component="main" sx={{ height: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            overflow: 'hidden',
          }}
        >
          <Carousel
            autoPlay
            animation="slide"
            indicators={false}
            navButtonsAlwaysInvisible
            interval={5000}
            duration={500}
          >
            {images.map((image, index) => (
              <CarouselImage key={index} src={image} alt={`carousel-${index}`} />
            ))}
          </Carousel>
        </Grid>
        <Grid 
          item 
          xs={12} 
          sm={8} 
          md={5} 
          component={motion.div} 
          initial={{ opacity: 0, x: 100 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(0,255,0,0.2) 0%, rgba(0,255,0,0.5) 100%)',
          }}
        >
          <GradientOverlay />
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <StyledPaper elevation={6}>
              <img src={dogIcon} alt="Pet4Home Logo" style={{ width: '64px', height: '64px', marginBottom: '16px' }} />
              <Typography component="h1" variant="h5">
                Sign in to Pets4Home Admin
              </Typography>
              <FormContainer component="form" onSubmit={handleSubmit}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  helperText={emailError}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <SubmitButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Sign In
                </SubmitButton>
              </FormContainer>
            </StyledPaper>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default Login;
