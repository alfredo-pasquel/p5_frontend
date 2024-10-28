import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Vinyl Exchange Platform
      </Typography>
      <Typography variant="body1" sx={{ marginY: 3 }}>
        Welcome to the Vinyl Exchange Platform, a place for vinyl record enthusiasts to buy, sell, and trade records
        from all around the world. Explore our extensive database powered by Spotify to discover albums by your
        favorite artists, complete with album details, track listings, and an option to listen on Spotify.
      </Typography>
      <Typography variant="body1" sx={{ marginY: 3 }}>
        Start by exploring our Record Search page to find albums and add them to your collection or wishlist. Connect
        with other users, negotiate trades, and build your ultimate vinyl collection.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to="/record-search"
        sx={{ marginTop: 4 }}
      >
        Go to Record Search
      </Button>
    </Box>
  );
}

export default Home;
