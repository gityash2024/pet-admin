import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
}));

function UserDetails({ user, open, onClose }) {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <StyledDialogContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ width: 80, height: 80, mr: 2 }}>{user.name[0]}</Avatar>
          <Typography variant="h5">{user.name}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Email:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>{user.email}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Phone Number:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>{user.phoneNumber || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Role:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>{user.role}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Permissions:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {user.permissions && user.permissions.length > 0 ? user.permissions.join(', ') : 'None'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Created At:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {new Date(user.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LabelTypography variant="subtitle1">Last Updated:</LabelTypography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {new Date(user.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserDetails;