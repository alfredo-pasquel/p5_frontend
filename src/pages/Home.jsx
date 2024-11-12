// src/pages/Home.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  TextField,
  Button,
  Pagination,
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(18, 18, 18, 0.5)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  position: 'relative',
  transition: 'transform 0.2s, box-shadow 0.2s', // Smooth transition
  '&:hover': {
    transform: 'scale(1.05)', // Slightly enlarge the card
    boxShadow: theme.shadows[6], // Increase the shadow depth on hover
  },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)({
  '&:-webkit-autofill': {
    backgroundColor: 'rgba(18, 18, 18, 0.5) !important', // Match your background
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
    WebkitTextFillColor: '#ffffff !important', // White text color
  },
  '&:hover:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
  },
  '&:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
  },
});

const HomePage = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState({
    artist: '',
    genre: '',
    year: '',
    album: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 12;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/records');
        setRecords(response.data);
        setFilteredRecords(response.data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, []);

  // Handle search query change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prev) => ({ ...prev, [name]: value }));
  };

  // Filter records based on search query
  const handleSearch = () => {
    let filtered = records;

    if (searchQuery.artist) {
      filtered = filtered.filter((record) => {
        const artists = Array.isArray(record.artist)
          ? record.artist.flat().join(', ')
          : record.artist;
        return artists?.toLowerCase().includes(searchQuery.artist.toLowerCase());
      });
    }

    if (searchQuery.genre) {
      filtered = filtered.filter((record) => {
        const genres = Array.isArray(record.genres)
          ? record.genres.flat().join(', ')
          : record.genres;
        return genres?.toLowerCase().includes(searchQuery.genre.toLowerCase());
      });
    }

    if (searchQuery.year) {
      filtered = filtered.filter(
        (record) =>
          record.releaseDate &&
          new Date(record.releaseDate).getFullYear().toString() === searchQuery.year
      );
    }

    if (searchQuery.album) {
      filtered = filtered.filter((record) =>
        record.title?.toLowerCase().includes(searchQuery.album.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to the first page after search
  };

  const handleClearSearch = () => {
    setSearchQuery({
      artist: '',
      genre: '',
      year: '',
      album: '',
    });
    setFilteredRecords(records); // Reset to show all records
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination logic
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage);

  return (
    <StyledBox sx={{ maxWidth: '1200px', margin: 'auto', mt: 2, p: 2 }}>
      {/* Header */}
      <StyledBox
        sx={{
          backgroundColor: 'rgba(18, 18, 18, 0.5)',
          textAlign: 'center',
          py: 1,
          px: 2,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Latest Listings
        </Typography>
      </StyledBox>

      {/* Search Filters */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)', p: 2, borderRadius: 1 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <StyledTextField
            label="Search by Album"
            name="album"
            value={searchQuery.album}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '', borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledTextField
            label="Search by Artist"
            name="artist"
            value={searchQuery.artist}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '', borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledTextField
            label="Search by Genre"
            name="genre"
            value={searchQuery.genre}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '', borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledTextField
            label="Search by Year"
            name="year"
            type="number"
            value={searchQuery.year}
            onChange={handleInputChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '', borderRadius: 1 }}
          />
        </Grid>
        <Grid item xs={12} sx={{ mb: 0, textAlign: 'center' }}>
          <StyledBox sx={{ display: 'flex', gap: 2, mt: 0, justifyContent: 'center' }}>
            <Button onClick={handleSearch} variant="contained" color="primary">
              Search
            </Button>
            <Button onClick={handleClearSearch} variant="outlined" color="secondary">
              Clear Search
            </Button>
          </StyledBox>
        </Grid>
      </Grid>

      {/* Listings */}
      <Grid container spacing={3}>
        {paginatedRecords.map((record) => {
          // Determine the image to display
          const displayImage = record.coverUrl || (record.images && record.images[0]);
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={record._id}>
              <Link to={`/listing/${record._id}`} style={{ textDecoration: 'none' }}>
                <StyledCard
                  sx={{
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(18, 18, 18, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    boxShadow: 3,
                    position: 'relative',
                  }}
                >
                  {/* Display 'Traded' badge */}
                  {record.isTraded && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,0,0,0.8)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        zIndex: 1,
                      }}
                    >
                      Traded
                    </Box>
                  )}
                  {displayImage && (
                    <CardMedia
                      component="img"
                      image={displayImage}
                      alt={`${record.title} cover`}
                      sx={{
                        height: 200,
                        objectFit: 'contain',
                        objectPosition: 'center',
                        aspectRatio: '1 / 1',
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {record.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {Array.isArray(record.artist) ? record.artist.join(', ') : record.artist}
                    </Typography>
                    {record.genres && (
                      <Typography variant="body2" color="textSecondary">
                        Genre:{' '}
                        {Array.isArray(record.genres)
                          ? record.genres.join(', ')
                          : record.genres}
                      </Typography>
                    )}
                    {record.releaseDate && (
                      <Typography variant="body2" color="textSecondary">
                        Year: {new Date(record.releaseDate).getFullYear()}
                      </Typography>
                    )}
                  </CardContent>
                </StyledCard>
              </Link>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination */}
      <StyledBox sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={Math.ceil(filteredRecords.length / recordsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </StyledBox>
    </StyledBox>
  );
};

export default HomePage;
