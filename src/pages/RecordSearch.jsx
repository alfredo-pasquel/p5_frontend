import React, { useState } from 'react';
import { searchSpotifyAlbums } from '../utils/spotifyApi';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';

function RecordSearch() {
  const [query, setQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSpotifyResults([]);

    try {
      const albumsWithGenres = await searchSpotifyAlbums(query);
      setSpotifyResults(albumsWithGenres);
    } catch (error) {
      console.error('Error during search:', error);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Record Search
      </Typography>
      <TextField
        label="Search for an album"
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, width: '100%' }}
      />
      <Button variant="contained" onClick={handleSearch} sx={{ mb: 4 }}>
        Search
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        spotifyResults.map((album) => (
          <Card key={album.id} sx={{ maxWidth: 345, mb: 4 }}>
            <CardMedia
              component="img"
              height="300"
              image={album.images[0]?.url}
              alt={`${album.name} cover`}
            />
            <CardContent>
              <Typography variant="h6">{album.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Artist: {album.artists.map((artist) => artist.name).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Release Date: {album.release_date}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tracks: {album.total_tracks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Genre: {album.genres.length > 0 ? album.genres.join(', ') : 'Unknown'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="primary"
                href={album.external_urls.spotify}
                target="_blank"
              >
                View on Spotify
              </Button>
            </CardActions>
            <Box sx={{ p: 2 }}>
              <iframe
                title="Spotify Album Player"
                src={`https://open.spotify.com/embed/album/${album.id}`}
                width="100%"
                height="80"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
              ></iframe>
            </Box>
          </Card>
        ))
      )}
    </Box>
  );
}

export default RecordSearch;
