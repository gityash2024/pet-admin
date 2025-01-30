import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Button, Select, MenuItem, FormControl, 
  InputLabel, Dialog, CircularProgress, Tooltip, TextField, Avatar,
  Pagination,DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import UserDetails from './UserDetails';
import { toast } from 'react-toastify';
import Loader from 'components/Loader/Loader';
import { getAllUsers, deleteUser } from 'utils/api';

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

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('user');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response?.data?.users || []);
      toast.success('Users fetched successfully');
    } catch (error) {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleDelete = (userId) => {
    setSelectedUser(users.find(user => user._id === userId));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(selectedUser._id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
    setLoading(false);
    handleCloseDialog();
  };

  const handleViewDetails = (userId) => {
    setSelectedUser(users.find(user => user._id === userId));
    setOpenDetails(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
    user.email.toLowerCase().includes(emailSearch.toLowerCase()) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );

  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          User List
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <TextField
            label="Search by email"
            variant="outlined"
            size="small"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="subadmin">Sub Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : paginatedUsers.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="h6">No users found</Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Phone Number</StyledTableCell>
                  <StyledTableCell>Role</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <StyledTableRow key={user._id}>
                    <StyledTableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar>{user.name[0]||'--'}</Avatar>
                        {user.name||'--'}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>{user?.email||'--'}</StyledTableCell>
                    <StyledTableCell>{user?.phoneNumber||'--'}</StyledTableCell>
                    <StyledTableCell>{user?.role?.toUpperCase()||'--'}</StyledTableCell>
                    <StyledTableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleViewDetails(user._id)} color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton onClick={() => handleDelete(user._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={pageCount} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the user: {selectedUser?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <UserDetails 
        user={selectedUser} 
        open={openDetails} 
        onClose={() => setOpenDetails(false)} 
      />

      {loading && <Loader />}
    </Box>
  );
}

export default UserList;