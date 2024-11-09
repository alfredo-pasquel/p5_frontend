import React, { useState, useContext } from 'react';
import { TextField, Button, Typography, Box, List, ListItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RecordContext } from '../RecordContext'; // Import RecordContext for context management
import { searchSpotifyAlbums } from '../utils/spotifyApi';

const ListRecordPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { setSelectedRecordId } = useContext(RecordContext); // Use context to set record ID
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null); // Clear any previous errors before searching
    try {
      const albums = await searchSpotifyAlbums(query);
      if (albums.length === 0) {
        setError('No albums found for this search.');
      } else {
        setResults(albums);
      }
    } catch (err) {
      console.error('Error during Spotify album search:', err);
      setError('Failed to fetch albums. Please try again later.');
    }
  };

  const handleSelect = (record) => {
    setSelectedRecordId(record.id); // Set the record ID in context
    navigate(`/edit-record/${record.id}`); // Navigate with albumId in URL
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'rgba(18, 18, 18, 0.4)', 
          borderRadius: 2, 
          backdropFilter: 'blur(10px)', 
          mb: 2, 
          textAlign: 'center' 
        }}
      >
        <Typography variant="h4" gutterBottom color="secondary">
          List a Record for Sale
        </Typography>
      </Box>

      <Box 
        sx={{ 
          p: 3, 
          bgcolor: 'rgba(18, 18, 18, 0.4)', 
          borderRadius: 2, 
          backdropFilter: 'blur(10px)' 
        }}
      >
        <TextField
          label="Search for a Record"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button onClick={handleSearch} variant="contained" fullWidth>
          Search
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      <List sx={{ mt: 2 }}>
        {results.map((album) => (
          <ListItem 
            key={album.id} 
            onClick={() => handleSelect(album)} 
            sx={{ 
              cursor: 'pointer', 
              my: 2, 
              borderBottom: '1px solid #ddd', 
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <Box>
              <img src={album.images[0]?.url} alt={`${album.name} cover`} width="150" style={{ borderRadius: '8px' }} />
              <Typography variant="h6">{album.name}</Typography>
              <Typography variant="subtitle1">{album.artists.map((artist) => artist.name).join(', ')}</Typography>
              <Typography variant="body2">Release Year: {album.release_date?.split('-')[0] || 'N/A'}</Typography>
              <Typography variant="body2">Genre: {album.genres?.join(', ') || 'No genre available'}</Typography>
              <iframe
                src={`https://open.spotify.com/embed/album/${album.id}`}
                width="300"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                style={{ borderRadius: '8px', marginTop: '10px' }}
              ></iframe>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ListRecordPage;
