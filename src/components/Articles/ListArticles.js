import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Grid, Card, CardContent, CardMedia, CardActions,
  IconButton, Button, Select, MenuItem, FormControl, InputLabel, Dialog, 
  CircularProgress, Tooltip, TextField, Pagination, Modal, alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FormArticle from './FormArticles';
import { toast } from 'react-toastify';
import Loader from 'components/Loader/Loader';
import { addArticle, updateArticle, deleteArticle, getAllArticles } from 'utils/api';
import DOMPurify from 'dompurify';

const GlassCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ContentModal = styled(Modal)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ContentPaper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
  maxWidth: '80%',
  maxHeight: '80%',
  overflow: 'auto',
  borderRadius: theme.shape.borderRadius,
}));

const CardTitleBox = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
});

function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [titleFilter, setTitleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [openContentModal, setOpenContentModal] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await getAllArticles();
      setArticles(response.data?.articles || []);
    } catch (error) {
      toast.error('Failed to fetch articles');
    }
    setLoading(false);
  };
  
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      setLoading(true);
      try {
        await deleteArticle(id);
        toast.success('Article deleted successfully');
        fetchArticles();
      } catch (error) {
        toast.error('Failed to delete article');
      }
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedArticle(null);
    setOpenForm(true);
  };

  const handleSaveArticle = async (articleData) => {
    setLoading(true);
    try {
      if (articleData._id) {
        await updateArticle(articleData._id, articleData);
        toast.success('Article updated successfully');
      } else {
        await addArticle(articleData);
        toast.success('Article added successfully');
      }
      fetchArticles();
      setOpenForm(false);
    } catch (error) {
      toast.error(articleData._id ? 'Failed to update article' : 'Failed to add article');
    }
    setLoading(false);
  };

  const handleViewContent = (article) => {
    setSelectedArticle(article);
    setOpenContentModal(true);
  };

  const filteredArticles = articles
    .filter(article => 
      (category === 'all' || article.category === category) &&
      article.title.toLowerCase().includes(titleFilter.toLowerCase())
    );

  const pageCount = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
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
          Knowledge Hub
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search by title"
            variant="outlined"
            size="small"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
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
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Lifestyle">Lifestyle</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddNew}>
            Add New Article
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredArticles.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <ArticleIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            No article found
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={article._id}>
                <GlassCard>
                  <CardMedia
                    component="img"
                    height="140"
                    image={article.images && article.images.length > 0 ? article.images[0] : 'https://via.placeholder.com/300x140'}
                    alt={article.title}
                  />
                  <CardContent>
                    <CardTitleBox>
                      <Typography gutterBottom variant="h6" component="div" noWrap sx={{ textTransform: 'uppercase', flex: 1 }}>
                        {article.title}
                      </Typography>
                      <CardActions disableSpacing>
                        <Tooltip title="View Content">
                          <IconButton onClick={() => handleViewContent(article)} color="primary" size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(article)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(article._id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </CardTitleBox>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {article.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      By {article.author}
                    </Typography>
                  </CardContent>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
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
        <FormArticle 
          article={selectedArticle} 
          onSave={handleSaveArticle} 
          onClose={() => setOpenForm(false)} 
        />
      </Dialog>

      <ContentModal
        open={openContentModal}
        onClose={() => setOpenContentModal(false)}
        aria-labelledby="article-content"
        aria-describedby="article-content-description"
      >
        <ContentPaper>
          {selectedArticle && (
            <>
              <Typography variant="h4" component="h2" gutterBottom sx={{ textTransform: 'uppercase' }}>
                {selectedArticle.title}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Category: {selectedArticle.category}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Author: {selectedArticle.author}
              </Typography>
              {selectedArticle.images && selectedArticle.images.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <img src={selectedArticle.images[0]} alt={selectedArticle.title} style={{ maxWidth: '100%', height: 'auto' }} />
                </Box>
              )}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Content:
              </Typography>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedArticle.content) }} />
            </>
          )}
        </ContentPaper>
      </ContentModal>

      {loading && <Loader />}
    </Box>
  );
}

export default ArticleList;