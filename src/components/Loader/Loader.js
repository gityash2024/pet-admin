import React from 'react';
import { Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const run = keyframes`
  0% { transform: translateX(-50%) rotate(0deg); }
  50% { transform: translateX(50%) rotate(180deg); }
  100% { transform: translateX(-50%) rotate(360deg); }
`;

const DogIcon = styled('div')`
  width: 50px;
  height: 50px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 224c-79.41 0-192 122.76-192 200.25 0 34.9 26.81 55.75 71.74 55.75 48.84 0 81.09-25.08 120.26-25.08 39.51 0 71.85 25.08 120.26 25.08 44.93 0 71.74-20.85 71.74-55.75C448 346.76 335.41 224 256 224zm-147.28-12.61c-10.4-34.65-42.44-57.09-71.56-50.13-29.12 6.96-44.29 40.69-33.89 75.34 10.4 34.65 42.44 57.09 71.56 50.13 29.12-6.96 44.29-40.69 33.89-75.34zm294.56 0c-10.4 34.65 4.77 68.38 33.89 75.34 29.12 6.96 61.16-15.48 71.56-50.13 10.4-34.65-4.77-68.38-33.89-75.34-29.12-6.96-61.16 15.48-71.56 50.13z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  animation: ${run} 2s linear infinite;
`;

const Loader = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 9999,
    }}
  >
    <DogIcon />
  </Box>
);

export default Loader;