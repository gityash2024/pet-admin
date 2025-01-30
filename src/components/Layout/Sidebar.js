import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdvertIcon from '@mui/icons-material/Campaign';

import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  ShoppingBag as AccessoryIcon,
  Mail as MessagesIcon,
  RollerShades,
  AppBlocking,
  Article
} from '@mui/icons-material';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', permission: 'dashboard' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users', permission: 'users' },
  { text: 'Adverts', icon: <AdvertIcon />, path: '/adverts', permission: 'adverts' },
  { text: 'Accessories', icon: <AccessoryIcon />, path: '/accessories', permission: 'accessories' },
  { text: 'Pets', icon: <PetsIcon />, path: '/pets', permission: 'pets' },
  { text: 'Knowledge Hub', icon: <Article />, path: '/knowledge-hub', permission: 'knowledge' },
  { text: 'Messages', icon: <MessagesIcon />, path: '/messages', permission: 'messages' },
  { text: 'Manage Roles', icon: <RollerShades />, path: '/roles', permission: 'roles' },
];

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const permissions = JSON.parse(localStorage.getItem('permission') || '[]');
    setUserPermissions(permissions);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const filteredMenuItems = menuItems.filter(item => userPermissions.includes(item.permission));

  const drawer = (
    <div>
      <List>
        {filteredMenuItems.map((item) => (
          <StyledListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ mr: 2, display: { sm: 'none' } }}
      >
        <MenuIcon />
      </IconButton>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <StyledDrawer variant="permanent" open>
          {drawer}
        </StyledDrawer>
      )}
    </>
  );
};

export default Sidebar;