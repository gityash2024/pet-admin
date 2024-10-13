import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Box, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AdvertIcon from '@mui/icons-material/Campaign';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pets as PetsIcon, ShoppingBag as AccessoryIcon } from '@mui/icons-material';
import { getAllUsers, getAllAccessories, getAllAdverts, getAllPets } from 'utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [dashboardData, setDashboardData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
const navigate=useNavigate();
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersResponse, advertsResponse, accessoriesResponse, petsResponse] = await Promise.all([
        getAllUsers(),
        getAllAdverts(),
        getAllAccessories(),
        getAllPets()
      ]);

      const usersCount = usersResponse?.data?.users?.length || 0;
      const advertsCount = advertsResponse?.data?.adverts?.length || 0;
      const accessoriesCount = accessoriesResponse?.data?.accessories?.length || 0;
      const petsCount = petsResponse?.data?.pets?.length || 0;

      const data = [
        { title: 'Total Users',redirectLink: '/users',value: usersCount, icon: <PeopleIcon /> },
        { title: 'Total Adverts',redirectLink:'/adverts' ,value: advertsCount, icon: <AdvertIcon /> },
        { title: 'Total Accessories',redirectLink:'/accessories' ,value: accessoriesCount, icon: <AccessoryIcon /> },
        { title: 'Total Pets', redirectLink:'/pets',value: petsCount, icon: <PetsIcon /> },
      ];

      setDashboardData(data);

      setChartData({
        labels: ['Users', 'Adverts', 'Accessories', 'Pets'],
        datasets: [
          {
            label: 'Total Count',
            data: [usersCount, advertsCount, accessoriesCount, petsCount],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)'
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
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Dashboard
      </Typography>
      <Grid container spacing={isMobile ? 1 : 2} sx={{ mb: 2 }}>
        {dashboardData.map((item, index) => (
          <Grid onclick={()=>{redirectAdminOn(item?.redirectLink)}} item xs={12} sm={3} key={index}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                color: 'white',
              }}
            >
              <Box sx={{ mb: 1 }}>{item.icon}</Box>
              <Typography variant="subtitle1">{item.title}</Typography>
              <Typography variant="h5">{item.value.toLocaleString()}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {chartData && (
        <Paper sx={{ p: 2, height: 400 }}>
          <Bar data={chartData} options={chartOptions} />
        </Paper>
      )}
    </Box>
  );
}

export default Dashboard;