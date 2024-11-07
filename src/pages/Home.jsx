// HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/records');
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Latest Listings
      </Typography>
      <Grid container spacing={3}>
        {records.map((record) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={record._id}>
            <Link to={`/listing/${record._id}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardMedia
                  component="img"
                  image={record.coverUrl}
                  alt={`${record.title} cover`}
                  sx={{
                    height: 200,
                    objectFit: 'contain',
                    objectPosition: 'center',
                    aspectRatio: '1 / 1', // Keep square aspect ratio for album covers
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>{record.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{record.artist}</Typography>
                  <Typography variant="body2" color="textSecondary">Genre: {record.genres.join(', ')}</Typography>
                  <Typography variant="body2" color="textSecondary">Year: {new Date(record.releaseDate).getFullYear()}</Typography>
                  {/* <Box sx={{ mt: 1 }}>
                    <iframe
                      src={`https://open.spotify.com/embed/album/${record.albumId}`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="encrypted-media"
                      title="Spotify Player"
                    ></iframe>
                  </Box> */}
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HomePage;
