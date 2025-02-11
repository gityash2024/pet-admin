import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox,
  FormControlLabel, FormGroup, Chip, Select, MenuItem, CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { addSubAdmin, getAllUsers, updateUser, deleteUser } from 'utils/api';
import { toast } from 'react-toastify';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const modules = [
  { name: 'Dashboard', value: 'dashboard' },
  { name: 'Users', value: 'users' },
  { name: 'Categories', value: 'categories' },
  { name: 'Adverts', value: 'adverts' },
  { name: 'Accessories', value: 'accessories' },
  { name: 'Knowledge Hub', value: 'knowledge' },
  { name: 'Pets', value: 'pets' },
  { name: 'Messages', value: 'messages' },
  { name: 'Manage Roles', value: 'roles' },
];

const roleTypes = ['subadmin'];

function ManageRoles() {
  const [roles, setRoles] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', permissions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const subadmins = response.data.users.filter(user => user.role === 'subadmin');
      setRoles(subadmins);
    } catch (error) {
      toast.error('Failed to fetch roles');
    }
    setLoading(false);
  };

  const handleOpenForm = (role = null) => {
    setSelectedRole(role);
    setFormData(role ? {
      name: role.name,
      email: role.email,
      role: role.role,
      permissions: role.permissions || []
    } : { name: '', email: '', password: '', role: 'subadmin', permissions: [] });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedRole(null);
    setFormData({ name: '', email: '', password: '', role: 'subadmin', permissions: [] });
  };

  const handlePermissionChange = (permission) => {
    setFormData(prevData => ({
      ...prevData,
      permissions: prevData.permissions.includes(permission)
        ? prevData.permissions.filter(p => p !== permission)
        : [...prevData.permissions, permission]
    }));
  };

  const handleSaveRole = async () => {
    setLoading(true);
    try {
      if (selectedRole) {
        await updateUser(selectedRole._id, formData);
        toast.success('Role updated successfully');
      } else {
        await addSubAdmin(formData);
        toast.success('New role added successfully');
      }
      fetchRoles();
      handleCloseForm();
    } catch (error) {
      toast.error(selectedRole ? 'Failed to update role' : 'Failed to add new role');
    }
    setLoading(false);
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setLoading(true);
      try {
        await deleteUser(id);
        toast.success('Role deleted successfully');
        setRoles(prevRoles => prevRoles.filter(role => role._id !== id));
      } catch (error) {
        toast.error('Failed to delete role');
      }
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Roles
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenForm()}>
          Add New Role
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : roles.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <SupervisorAccountIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No sub-roles found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
                <StyledTableCell>Role</StyledTableCell>
                <StyledTableCell>Permissions</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <StyledTableRow key={role._id}>
                  <StyledTableCell component="th" scope="row">
                    {role.name}
                  </StyledTableCell>
                  <StyledTableCell>{role.email}</StyledTableCell>
                  <StyledTableCell>{role.role}</StyledTableCell>
                  <StyledTableCell>
                    {role.permissions.map(permission => (
                      <Chip key={permission} label={permission} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <IconButton onClick={() => handleOpenForm(role)} color="secondary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRole(role._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Role Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {!selectedRole && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          )}
          <Select
            fullWidth
            margin="dense"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            displayEmpty
            sx={{ mt: 1, mb: 2 }}
          >
            {roleTypes.map((role) => (
              <MenuItem key={role} value={role}>{role.toUpperCase()}</MenuItem>
            ))}
          </Select>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Permissions:</Typography>
          <FormGroup>
            {modules.map((module) => (
              <FormControlLabel
                key={module.value}
                control={
                  <Checkbox
                    checked={formData.permissions.includes(module.value)}
                    onChange={() => handlePermissionChange(module.value)}
                  />
                }
                label={module.name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" color="primary" disabled={loading}>
            {selectedRole ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ManageRoles;