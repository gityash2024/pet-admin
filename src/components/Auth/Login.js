import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import dogIcon from '../../assets/dog-icon.svg';
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import { adminLogin } from '../../utils/api';

const LoginContainer = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0a6638 0%, #4CAF50 100%)',
  padding: '20px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});

const GlassCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const FormContainer = styled(Box)({
  width: '100%',
  marginTop: '20px',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#fff',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: '#fff',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.2)',
  color: '#fff',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '10px',
  padding: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
}));

const Logo = styled(motion.img)({
  width: '80px',
  height: '80px',
  marginBottom: '20px',
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
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
        } else {
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
    <LoginContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard>
          <Logo
            src={dogIcon}
            alt="Pet4Home Logo"
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Typography variant="h4" component="h1" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
            Admin Login
          </Typography>
          <FormContainer component="form" onSubmit={handleSubmit}>
            <StyledTextField
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
            />
            <StyledTextField
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
            <LoginButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Sign In
            </LoginButton>
          </FormContainer>
        </GlassCard>
      </motion.div>
      {loading && <Loader />}
    </LoginContainer>
  );
}

export default Login;