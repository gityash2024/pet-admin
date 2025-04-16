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
import PetsIcon from '@mui/icons-material/Pets';
import BreedForm from './BreedForm';
import { getAllPets, addPets, updatePets, deletePets, getAllCategories } from 'utils/api';
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

function BreedList() {
  const [pets, setPets] = useState([]);
  const [category, setCategory] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories|| []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await getAllPets();
      setPets(response.data?.pets || []);
    } catch (error) {
      toast.error('Failed to fetch pets');
    }
    setLoading(false);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleEdit = (pet) => {
    setSelectedPet(pet);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      setLoading(true);
      try {
        await deletePets(id);
        toast.success('Pet deleted successfully');
        fetchPets();
      } catch (error) {
        toast.error('Failed to delete pet');
      }
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPet(null);
    setOpenForm(true);
  };

  const handleSavePet = async (petData) => {
    setLoading(true);
    try {
      if (petData._id) {
        await updatePets(petData._id, petData);
        toast.success('Pet updated successfully');
      } else {
        await addPets(petData);
        toast.success('Pet added successfully');
      }
      fetchPets();
      setOpenForm(false);
    } catch (error) {
      toast.error(petData._id ? 'Failed to update pet' : 'Failed to add pet');
    }
    setLoading(false);
  };

  const filteredPets = pets
    .filter(pet => 
      (category === 'all' || pet.category === category) &&
      pet.name.toLowerCase().includes(nameFilter.toLowerCase())
    );

  const pageCount = Math.ceil(filteredPets.length / itemsPerPage);
  const paginatedPets = filteredPets.slice(
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
          Pets
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
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
  labelId="category-select-label"
  value={category}
  label="Category"
  onChange={handleCategoryChange}
>
  <MenuItem value="all">All</MenuItem>
  {categories.map((cat) => (
    <MenuItem key={cat._id} value={cat.name}>
      {cat.name}
    </MenuItem>
  ))}
</Select>
          </FormControl>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
            Add New Pet
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredPets.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <PetsIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No pets found
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
                  <StyledTableCell>Category</StyledTableCell>
                  <StyledTableCell>Breed</StyledTableCell>
                  <StyledTableCell>Age</StyledTableCell>
                  <StyledTableCell>Sex</StyledTableCell>
                  <StyledTableCell>Health Status</StyledTableCell>
                  <StyledTableCell>Vaccinations</StyledTableCell>
                  <StyledTableCell align="right">Price</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPets.map((pet, index) => (
                  <StyledTableRow key={pet._id}>
                    <StyledTableCell>{(page - 1) * itemsPerPage + index + 1}</StyledTableCell>
                    <StyledTableCell>
                      <Avatar 
                        alt={pet.name} 
                        src={pet.images && pet.images.length > 0 ? pet.images[0] : ''} 
                        variant="square"
                        sx={{ width: 40, height: 40 }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Tooltip title={pet.name}>
                        <TruncatedText>{pet.name}</TruncatedText>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell>{pet.category}</StyledTableCell>
                    <StyledTableCell>{pet.breed}</StyledTableCell>
                    <StyledTableCell>{pet.age} {pet.ageUnit || 'weeks'}</StyledTableCell>
                    <StyledTableCell>{pet.gender ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1) : 'Not specified'}</StyledTableCell>
                    <StyledTableCell>
                      <Tooltip title={pet.healthStatus || 'Not specified'}>
                        <TruncatedText>{pet.healthStatus || 'Not specified'}</TruncatedText>
                      </Tooltip>
                    </StyledTableCell>
                    <StyledTableCell>
                      {pet.vaccinationDetails ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {pet.vaccinationDetails.firstVaccination && <Typography variant="caption">First vac.</Typography>}
                          {pet.vaccinationDetails.deworming && <Typography variant="caption">Deworming</Typography>}
                          {pet.vaccinationDetails.boosters && <Typography variant="caption">Boosters</Typography>}
                        </div>
                      ) : 'None'}
                    </StyledTableCell>
                    <StyledTableCell align="right">${pet.price?.toFixed(2)}</StyledTableCell>
                   
                    <StyledTableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(pet)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(pet._id)} color="error">
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
      <BreedForm 
  pet={selectedPet} 
  onSave={handleSavePet} 
  onClose={() => setOpenForm(false)}
  categories={categories}
/>
      </Dialog>
      {loading && <Loader />}
    </Box>
  );
}

export default BreedList;