import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AdvertIcon from '@mui/icons-material/Campaign';
import CategoryIcon from '@mui/icons-material/Category';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pets as PetsIcon, ShoppingBag as AccessoryIcon } from '@mui/icons-material';
import { getAllUsers, getAllAccessories, getAllAdverts, getAllPets, getAllCategories } from 'utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardData, setDashboardData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResponse, advertsResponse, accessoriesResponse, petsResponse, categoriesResponse] = await Promise.all([
        getAllUsers(),
        getAllAdverts(),
        getAllAccessories(),
        getAllPets(),
        getAllCategories()
      ]);

      const usersCount = usersResponse?.data?.users?.length || 0;
      const advertsCount = advertsResponse?.data?.adverts?.length || 0;
      const accessoriesCount = accessoriesResponse?.data?.accessories?.length || 0;
      const petsCount = petsResponse?.data?.pets?.length || 0;
      const categoriesCount = categoriesResponse?.data?.categories?.length || 0;

      const data = [
        { title: 'Total Users', redirectLink: '/users', value: usersCount, icon: <PeopleIcon />, color: 'rgb(255, 99, 132)' },
        { title: 'Total Adverts', redirectLink: '/adverts', value: advertsCount, icon: <AdvertIcon />, color: 'rgb(54, 162, 235)' },
        { title: 'Total Accessories', redirectLink: '/accessories', value: accessoriesCount, icon: <AccessoryIcon />, color: 'rgb(255, 206, 86)' },
        { title: 'Total Pets', redirectLink: '/pets', value: petsCount, icon: <PetsIcon />, color: 'rgb(75, 192, 192)' },
        { title: 'Total Categories', redirectLink: '/categories', value: categoriesCount, icon: <CategoryIcon />, color: 'rgb(153, 102, 255)' }
      ];

      setDashboardData(data);

      setChartData({
        labels: ['Users', 'Adverts', 'Accessories', 'Pets', 'Categories'],
        datasets: [
          {
            label: 'Total Count',
            data: [usersCount, advertsCount, accessoriesCount, petsCount, categoriesCount],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ],
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Dashboard Overview' },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const redirectAdminOn = (link) => {
    navigate(link);
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
          Dashboard
        </Typography>
      </motion.div>
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 2 }}>
        {dashboardData.map((item, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Paper
                onClick={() => redirectAdminOn(item?.redirectLink)}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  color: 'white',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Box sx={{ mb: 1, fontSize: '2rem', color: item.color }}>{item.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {item.title}
                </Typography>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {item.value.toLocaleString()}
                  </Typography>
                </motion.div>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      {chartData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Paper 
            sx={{ 
              p: 2, 
              height: 400,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
          >
            <Bar data={chartData} options={chartOptions} />
          </Paper>
        </motion.div>
      )}
    </Box>
  );
}

export default Dashboard;