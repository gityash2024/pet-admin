// src/components/Categories/CategoryList.js
import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Button, Dialog, CircularProgress, 
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import CategoryForm from './CategoryForm';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from 'utils/api';
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

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getAllCategories();
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
    setLoading(false);
  };

  const handleOpenForm = () => {
    setSelectedCategory(null);
    setOpenForm(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        await deleteCategory(id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
      setLoading(false);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    setLoading(true);
    try {
      if (categoryData._id) {
        await updateCategory(categoryData._id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await addCategory(categoryData);
        toast.success('Category added successfully');
      }
      fetchCategories();
      setOpenForm(false);
    } catch (error) {
      toast.error(categoryData._id ? 'Failed to update category' : 'Failed to add category');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Categories
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Add New Category
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CategoryIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No categories found
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Description</StyledTableCell>
                <StyledTableCell align="right">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <StyledTableRow key={category._id}>
                  <StyledTableCell component="th" scope="row">
                    {category.name}
                  </StyledTableCell>
                  <StyledTableCell>{category.description}</StyledTableCell>
                  <StyledTableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(category)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(category._id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <CategoryForm 
          category={selectedCategory} 
          onSave={handleSaveCategory} 
          onClose={() => setOpenForm(false)} 
        />
      </Dialog>
      {loading && <Loader />}
    </Box>
  );
}

export default CategoryList;