import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Button, Select, MenuItem, FormControl, 
  InputLabel, Dialog, CircularProgress, Tooltip, TextField, Avatar,
  Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccessoryForm from './AccessoryForm';
import { getAllAccessories, addAccessory, updateAccessory, deleteAccessory } from 'utils/api';
import { toast } from 'react-toastify';
import Loader from 'components/Loader/Loader';

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

const TruncatedText = styled(Typography)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '200px',
});

function AccessoryList() {
  const [accessories, setAccessories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [openForm, setOpenForm] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    setLoading(true);
    try {
      const response = await getAllAccessories();
      setAccessories(response.data?.accessories || []);
    } catch (error) {
      toast.error('Failed to fetch accessories');
    }
    setLoading(false);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleEdit = (accessory) => {
    setSelectedAccessory(accessory);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      setLoading(true);
      try {
        await deleteAccessory(id);
        toast.success('Accessory deleted successfully');
        fetchAccessories();
      } catch (error) {
        toast.error('Failed to delete accessory');
      }
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedAccessory(null);
    setOpenForm(true);
  };

  const handleSaveAccessory = async (accessoryData) => {
    setLoading(true);
    try {
      if (accessoryData._id) {
        await updateAccessory(accessoryData._id, accessoryData);
        toast.success('Accessory updated successfully');
      } else {
        await addAccessory(accessoryData);
        toast.success('Accessory added successfully');
      }
      fetchAccessories();
      setOpenForm(false);
    } catch (error) {
      toast.error(accessoryData._id ? 'Failed to update accessory' : 'Failed to add accessory');
    }
    setLoading(false);
  };

  const filteredAndSortedAccessories = accessories
    .filter(accessory => accessory.name.toLowerCase().includes(nameFilter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });

  const pageCount = Math.ceil(filteredAndSortedAccessories.length / itemsPerPage);
  const paginatedAccessories = filteredAndSortedAccessories.slice(
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
          Accessories
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search by name"
            variant="outlined"
            size="small"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
            Add New Accessory
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredAndSortedAccessories.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <InventoryIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No accessories found
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Sr. No.</StyledTableCell>
                  <StyledTableCell>Image</StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Description</StyledTableCell>
                  <StyledTableCell align="right">Price</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAccessories.map((accessory, index) => (
                  <StyledTableRow key={accessory._id}>
                    <StyledTableCell>{(page - 1) * itemsPerPage + index + 1}</StyledTableCell>
                    <StyledTableCell>
                      <Tooltip title={accessory.name}>
                        <Avatar 
                          alt={accessory.name} 
                          src={accessory.images && accessory.images.length > 0 ? accessory.images[0] : ''} 
                          sx={{ width: 40, height: 40 }}
                        />
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Tooltip title={accessory.name}>
                        <TruncatedText>{accessory.name}</TruncatedText>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Tooltip title={accessory.description}>
                        <TruncatedText>{accessory.description}</TruncatedText>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell align="right">${accessory.price?.toFixed(2)}</StyledTableCell>
                  
                    <StyledTableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(accessory)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(accessory._id)} color="error">
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

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <AccessoryForm 
          accessory={selectedAccessory} 
          onSave={handleSaveAccessory} 
          onClose={() => setOpenForm(false)} 
        />
      </Dialog>
      {loading && <Loader />}
    </Box>
  );
}

export default AccessoryList;