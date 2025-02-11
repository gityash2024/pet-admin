import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Button, CircularProgress, Container, Grid, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { getAllUsers, getAllAccessories, getAllAdverts, getAllPets, getAllArticles, getAllCategories } from 'utils/api';

import Sidebar from './Sidebar';
import dogIcon from '../../assets/dog-icon.svg';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  boxShadow: 'none',
}));

const StatisticTicker = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  width: '33vw',
}));

const Footer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ScrollingText = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  paddingLeft: '100%',
  animation: 'scroll 20s linear infinite',
  '@keyframes scroll': {
    '0%': {
      transform: 'translate(0, 0)',
    },
    '100%': {
      transform: 'translate(-100%, 0)',
    },
  },
}));

function Layout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [usersResponse, accessoriesResponse, advertsResponse, petsResponse, articlesResponse] = await Promise.all([
        getAllUsers(),
        getAllAccessories(),
        getAllAdverts(),
        getAllPets(),
        getAllArticles()
      ]);

      const newStatistics = [
        { label: 'Total Users', value: usersResponse?.data.users?.length || 0 },
        { label: 'Articles', value: articlesResponse?.data.articles?.length || 0 },
        { label: 'Adverts', value: advertsResponse?.data.adverts?.length || 0 },
        { label: 'Accessories', value: accessoriesResponse?.data.accessories?.length || 0 },
        { label: 'Pets', value: petsResponse?.data.pets?.length || 0 },
        {label:'Categories',value:categories.length}
      ];

      setStatistics(newStatistics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setIsLoggingOut(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <StyledAppBar position="fixed">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '280px' }}
                onClick={() => navigate('/')}
              >
                <img src={dogIcon} alt="Pet4Home Logo" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
                Pets4Home Admin
              </Typography>
            </Box>

            <StatisticTicker>
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ScrollingText variant="body2">
                  {statistics.map((stat, index) => (
                    <span key={index}>
                      {stat.label}: {stat.value}
                      {index < statistics.length - 1 ? ' | ' : ''}
                    </span>
                  ))}
                </ScrollingText>
              )}
            </StatisticTicker>

            <Box>
              {isLoggedIn ? (
                <Button 
                  color="inherit" 
                  style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', border:'1px solid #fff'}} 
                  onClick={handleLogout}
                  startIcon={isLoggingOut ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon />}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              ) : (
                <Button 
                  color="inherit" 
                  style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', border:'1px solid #fff'}} 
                  onClick={() => navigate('/login')} 
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </StyledAppBar>
        <Sidebar open={open} onClose={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${240}px)` },
            mt: ['48px', '56px', '64px'],
            mb: '36px',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer>
        <Typography variant="body2" color="inherit" align="center">
          © {new Date().getFullYear()} Pets4Home. All rights reserved.
        </Typography>
      </Footer>
    </>
  );
}

export default Layout;