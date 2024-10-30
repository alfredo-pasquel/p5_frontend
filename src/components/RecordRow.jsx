import React from 'react';
import { Typography, Box, Grid2 } from '@mui/material';

const RecordRow = ({ title, items }) => (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>{title}</Typography>
    <Grid2 container spacing={2}>
      {items.map((item, index) => (
        <Grid2 item xs={6} sm={4} md={3} lg={2} key={index}>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
            <Typography variant="subtitle1">{item.title || item}</Typography>
            <Typography variant="body2">{item.artist || ''}</Typography>
          </Box>
        </Grid2>
      ))}
    </Grid2>
  </Box>
);

export default RecordRow;
