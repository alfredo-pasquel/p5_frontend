import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Grid, Box } from '@mui/material';
import RecordRow from '../components/RecordRow';

const HomePage = ({ isLoggedIn, userData }) => {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get(`/api/records?page=${page}`);
        setRecords(response.data.records || []);  // Fallback to empty array
      } catch (error) {
        console.error('Error fetching records:', error);
        setRecords([]);  // Set to empty array on error
      }
    };
    fetchRecords();
  }, [page]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        Needle Drop Vinyl Exchange
      </Typography>
      <Grid container spacing={2}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={record.id}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
              <Typography variant="h6">{record.title}</Typography>
              <Typography variant="body2">by {record.artist}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {isLoggedIn && userData && (
        <>
          <RecordRow title="Recently Viewed Items" items={userData.recentlyViewed || []} />
          <RecordRow title="Relevant Genre Suggestions" items={userData.favoriteGenres || []} />
          <RecordRow title="Relevant Artist Suggestions" items={userData.favoriteArtists || []} />
          <RecordRow title="Relevant Year Suggestions" items={userData.savedItems || []} />
        </>
      )}
    </Box>
  );
};

export default HomePage;
