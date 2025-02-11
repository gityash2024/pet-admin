import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
 Typography, Box, Button, Select, MenuItem, FormControl, InputLabel, 
 Dialog, DialogContent, DialogTitle, IconButton, TextField, 
 CircularProgress, Tooltip, Table, TableBody, TableCell, TableContainer,
 TableHead, TableRow, Paper, Avatar, Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PublishRounded } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getAllAdverts, addAdvert, updateAdvert, deleteAdvert, getAdvertById, getAllUsers, publishAdvert, getAllCategories } from '../../utils/api';
import Loader from 'components/Loader/Loader';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
 head: {
   backgroundColor: theme.palette.primary.main,
   color: theme.palette.common.white,
   fontWeight: 'bold',
 },
 body: {
   fontSize: 14,
 },
}));

const StyledTableRow = styled(motion.tr)(({ theme }) => ({
 '&:nth-of-type(odd)': {
   backgroundColor: theme.palette.action.hover,
 },
 '&:hover': {
   backgroundColor: theme.palette.action.selected,
 },
}));

function AdvertList() {
 const navigate = useNavigate();
 const [adverts, setAdverts] = useState([]);
 const [openForm, setOpenForm] = useState(false);
 const [formData, setFormData] = useState({
   title: '',
   description: '',
   price: '',
   owner: '',
   category: '',
   location: '',
 });
 const [editingId, setEditingId] = useState(null);
 const [category, setCategory] = useState('all');
 const [sortBy, setSortBy] = useState('newest');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(0);
 const [loading, setLoading] = useState(false);
 const [users, setUsers] = useState([]);
 const [imageUrl, setImageUrl] = useState('');
 const [categories, setCategories] = useState([]);

 useEffect(() => {
   fetchCategories();
   fetchAdverts();
   fetchUsers();
 }, []);

 const fetchCategories = async () => {
   try {
     const response = await getAllCategories();
     setCategories(response.data.categories || []);
   } catch (error) {
     toast.error('Failed to fetch categories');
   }
 };

 const fetchUsers = async () => {
   try {
     const response = await getAllUsers();
     const usersList = response?.data.users.filter(user => user.role === 'user');
     setUsers(usersList);
   } catch (error) {
     toast.error('Failed to fetch users');
   }
 };

 const fetchAdverts = async () => {
   setLoading(true);
   try {
     const response = await getAllAdverts();
     const advertsData = response.data?.adverts || [];
     setAdverts(advertsData);
     setTotalPages(Math.ceil(advertsData.length / 10));
   } catch (error) {
     toast.error('Failed to fetch adverts');
   }
   setLoading(false);
 };

 const handleOpenForm = () => {
   setFormData({
     title: '',
     description: '',
     price: '',
     owner: '',
     category: '',
     location: '',
   });
   setImageUrl('');
   setEditingId(null);
   setOpenForm(true);
 };

 const handleCloseForm = () => {
   setOpenForm(false);
   setEditingId(null);
   setImageUrl('');
 };

 const handleInputChange = (e) => {
   const { name, value } = e.target;
   setFormData(prevState => ({
     ...prevState,
     [name]: value
   }));
 };

 const handleFileChange = async (event) => {
   const file = event.target.files[0];
   try {
     setLoading(true);
     const formData = new FormData();
     formData.append("file", file);
     const response = await fetch(
       "https://chirag-backend.onrender.com/api/files/upload",
       {
         method: "POST",
         body: formData,
       }
     );
     if (!response.ok) {
       throw new Error(`Failed to upload file: ${response.statusText}`);
     }
     const responseData = await response.json();
     const uploadedUrl = responseData.fileUrl;
     setImageUrl(uploadedUrl);
   } catch (error) {
     toast.error(`Error uploading file: ${error.message}`);
   } finally {
     setLoading(false);
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setLoading(true);
   try {
     let advertData = {
       ...formData,
       image: imageUrl,
     };
     
     if (!formData?.owner) {
       delete advertData.owner;
     }
     
     if (editingId) {
       await updateAdvert(editingId, advertData);
       toast.success('Advert updated successfully');
     } else {
       await addAdvert(advertData);
       toast.success('Advert added successfully');
     }
     fetchAdverts();
     handleCloseForm();
   } catch (error) {
     toast.error(editingId ? 'Failed to update advert' : 'Failed to add advert');
   }
   setLoading(false);
 };

 const handleEdit = async (id) => {
  setLoading(true);
  try {
    const response = await getAdvertById(id);
    const advert = response.data?.advert;
    setFormData({
      title: advert.title || '',
      description: advert.description || '',
      price: advert.price || '',
      owner: advert.owner?._id || '',  // Change this line to use owner._id
      category: advert.category || '',
      location: advert.location || '',
    });
    setImageUrl(advert.image || '');
    setEditingId(id);
    setOpenForm(true);
  } catch (error) {
    toast.error('Failed to fetch advert details');
  }
  setLoading(false);
};

 const handlePublish = async (id) => {
   setLoading(true);
   try {
     await publishAdvert(id);
     toast.success('Advert published successfully.')
     fetchAdverts();
   } catch (error) {
     toast.error('Failed to publish advert');
   }
   setLoading(false);
 };

 const handleDelete = async (id) => {
   if (window.confirm('Are you sure you want to delete this advert?')) {
     setLoading(true);
     try {
       await deleteAdvert(id);
       toast.success('Advert deleted successfully');
       fetchAdverts();
     } catch (error) {
       toast.error('Failed to delete advert');
     }
     setLoading(false);
   }
 };

 const handleCategoryChange = (event) => {
   setCategory(event.target.value);
   setPage(1);
 };

 const handleSortChange = (event) => {
   setSortBy(event.target.value);
   setPage(1);
 };

 const handlePageChange = (event, value) => {
   setPage(value);
 };

 const filteredAdverts = adverts.filter(advert => 
   category === 'all' ? true : advert.category === category
 );

 const sortedAdverts = [...filteredAdverts].sort((a, b) => {
   if (sortBy === 'priceAsc') return a.price - b.price;
   if (sortBy === 'priceDesc') return b.price - a.price;
   if (sortBy === 'views') return b.views - a.views;
   return new Date(b.createdAt) - new Date(a.createdAt);
 });

 const paginatedAdverts = sortedAdverts.slice((page - 1) * 10, page * 10);

 return (
   <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
     <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
         <Typography variant="h4" gutterBottom>Adverts</Typography>
         <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenForm}>
           Add Advert
         </Button>
       </Box>
       <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
         <FormControl sx={{ minWidth: 120 }}>
           <InputLabel id="category-select-label">Category</InputLabel>
           <Select value={category} label="Category" onChange={handleCategoryChange}>
             <MenuItem value="all">All</MenuItem>
             {categories.map((cat) => (
               <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>
             ))}
           </Select>
         </FormControl>
         <FormControl sx={{ minWidth: 120 }}>
           <InputLabel id="sort-select-label">Sort By</InputLabel>
           <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
             <MenuItem value="newest">Newest</MenuItem>
             <MenuItem value="priceAsc">Price: Low to High</MenuItem>
             <MenuItem value="priceDesc">Price: High to Low</MenuItem>
             <MenuItem value="views">Most Viewed</MenuItem>
           </Select>
         </FormControl>
       </Box>
     </motion.div>

     {loading ? (
       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
         <CircularProgress />
       </Box>
     ) : (
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
         <TableContainer component={Paper} sx={{ mb: 4 }}>
           <Table sx={{ minWidth: 700 }}>
             <TableHead>
               <TableRow>
                 <StyledTableCell>Image</StyledTableCell>
                 <StyledTableCell>Title</StyledTableCell>
                 <StyledTableCell>Category</StyledTableCell>
                 <StyledTableCell>Price</StyledTableCell>
                 <StyledTableCell>Location</StyledTableCell>
                 <StyledTableCell>Owner</StyledTableCell>
                 <StyledTableCell>Status</StyledTableCell>
                 <StyledTableCell align="right">Actions</StyledTableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               <AnimatePresence>
                 {paginatedAdverts.map((advert, index) => (
                   <StyledTableRow
                     key={advert._id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3, delay: index * 0.05 }}
                     component={motion.tr}
                   >
                     <TableCell>
                       <Avatar
                         variant="rounded"
                         src={advert.image || 'https://via.placeholder.com/40x40'}
                         sx={{ width: 40, height: 40 }}
                       />
                     </TableCell>
                     <TableCell>{advert.title}</TableCell>
                     <TableCell>{advert.category}</TableCell>
                     <TableCell>${advert.price}</TableCell>
                     <TableCell>{advert.location}</TableCell>
                     <TableCell>{advert.owner?.name || 'N/A'}</TableCell>
                     <TableCell>
                       {advert.isPublished ? (
                         <Tooltip title="Published">
                           <PublishRounded color="success" />
                         </Tooltip>
                       ) : (
                         <Tooltip title="Draft">
                           <PublishRounded color="disabled" />
                         </Tooltip>
                       )}
                     </TableCell>
                     <TableCell align="right">
                       <Tooltip title="View Details">
                         <IconButton size="small" onClick={() => navigate(`/adverts/${advert._id}`)}>
                           <VisibilityIcon />
                         </IconButton>
                       </Tooltip>
                       <Tooltip title="Edit">
                         <IconButton size="small" onClick={() => handleEdit(advert._id)}>
                           <EditIcon />
                         </IconButton>
                       </Tooltip>
                       {!advert.isPublished && (
                         <Tooltip title="Publish">
                           <IconButton size="small" onClick={() => handlePublish(advert._id)}>
                             <PublishRounded />
                           </IconButton>
                         </Tooltip>
                       )}
                       <Tooltip title="Delete">
                         <IconButton size="small" onClick={() => handleDelete(advert._id)}>
                           <DeleteIcon />
                         </IconButton>
                       </Tooltip>
                     </TableCell>
                   </StyledTableRow>
                 ))}
               </AnimatePresence>
             </TableBody>
           </Table>
         </TableContainer>

         {paginatedAdverts.length === 0 && (
           <Box sx={{ textAlign: 'center', mt: 4 }}>
             <Typography variant="h6">No adverts found</Typography>
           </Box>
         )}

         {sortedAdverts.length > 10 && (
           <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
             <Pagination 
               count={totalPages} 
               page={page} 
               onChange={handlePageChange} 
               color="primary" 
             />
           </Box>
         )}
       </motion.div>
     )}

     <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
       <DialogTitle>
         {editingId ? 'Edit Advert' : 'Add New Advert'}
         <IconButton
           onClick={handleCloseForm}
           sx={{
             position: 'absolute',
             right: 8,
             top: 8,
             color: (theme) => theme.palette.grey[500],
           }}
         >
           <CloseIcon />
         </IconButton>
       </DialogTitle>
       <DialogContent>
         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
           <TextField
             fullWidth
             margin="normal"
             label="Title"
             name="title"
             value={formData.title}
             onChange={handleInputChange}
             required
           />
           <TextField
             fullWidth
             margin="normal"
             label="Description"
             name="description"
             value={formData.description}
             onChange={handleInputChange}
             multiline
             rows={4}
             required
           />
           <TextField
             fullWidth
             margin="normal"
             label="Price"
             name="price"
             type="number"
             value={formData.price}
             onChange={handleInputChange}
             required
           />
           <FormControl fullWidth margin="normal">
             <InputLabel>Owner (optional)</InputLabel>
             <Select
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              label="Owner (optional)"
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Image
            </Button>
          </label>
          {imageUrl && (
            <Box sx={{ mt: 2 }}>
              <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            {editingId ? 'Update' : 'Add'} Advert
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    {loading && <Loader />}
  </Box>
);
}

export default AdvertList;
