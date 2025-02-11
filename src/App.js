import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import UserList from './components/Users/UserList';
import AdvertList from './components/Adverts/AdvertList';
import AdvertDetails from './components/Adverts/AdvertDetails';
import AccessoryList from './components/Accessories/AccessoryList';
import BreedList from './components/Breeds/BreedList';
import Messages from './components/Messages/Messages';
import ManageRoles from './components/Roles/manageRole';
import AuthGuard from './components/Auth/AuthGuard';
import theme from './theme';
import ToastContainer from './components/Toast/ToastContainer';
import ArticleList from 'components/Articles/ListArticles';
import CategoryList from 'components/Categories/CategoryList';

const PermissionGuard = ({ children, requiredPermission }) => {
  const permissions = JSON.parse(localStorage.getItem('permission') || '[]');
  const userRole = JSON.parse(localStorage.getItem('userData') || '{}').role;

  if (userRole === 'admin' || permissions.includes(requiredPermission)) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
};

const AdminGuard = ({ children }) => {
  const userRole = JSON.parse(localStorage.getItem('userData') || '{}').role;
  
  if (userRole === 'admin') {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  const getInitialRoute = () => {
    const permissions = JSON.parse(localStorage.getItem('permission') || '[]');
    const userRole = JSON.parse(localStorage.getItem('userData') || '{}').role;

    if (userRole === 'admin') {
      return '/';
    } else if (permissions.length > 0) {
      const firstPermission = permissions[0];
      switch (firstPermission) {
        case 'dashboard': return '/';
        case 'users': return '/users';
        case 'adverts': return '/adverts';
        case 'accessories': return '/accessories';
        case 'pets': return '/pets';
        case 'messages': return '/messages';
        case 'roles': return '/roles';
        default: return '/';
      }
    } else {
      return '/login';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
              <Route index element={
                <PermissionGuard requiredPermission="dashboard">
                  <Dashboard />
                </PermissionGuard>
              } />
              <Route path="users" element={
                <PermissionGuard requiredPermission="users">
                  <UserList />
                </PermissionGuard>
              } />
              <Route path="adverts" element={
                <PermissionGuard requiredPermission="adverts">
                  <AdvertList />
                </PermissionGuard>
              } />
              <Route path="adverts/:id" element={
                <PermissionGuard requiredPermission="adverts">
                  <AdvertDetails />
                </PermissionGuard>
              } />
              <Route path="accessories" element={
                <PermissionGuard requiredPermission="accessories">
                  <AccessoryList />
                </PermissionGuard>
              } />
              <Route path="messages" element={
                <PermissionGuard requiredPermission="messages">
                  <Messages />
                </PermissionGuard>
              } />
              <Route path="pets" element={
                <PermissionGuard requiredPermission="pets">
                  <BreedList />
                </PermissionGuard>
              } />
              <Route path="roles" element={
                <AdminGuard>
                  <ManageRoles />
                </AdminGuard>
              } />
              <Route path="knowledge-hub" element={
                <AdminGuard>
                  <ArticleList />
                </AdminGuard>
              } />
               <Route path="categories" element={
                <AdminGuard>
                  <CategoryList />
                </AdminGuard>
              } />
              <Route path="*" element={<Navigate to={getInitialRoute()} replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;