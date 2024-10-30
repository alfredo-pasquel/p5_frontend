// RecordDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSpotifyAccessToken } from '../utils/spotifyApi';
import { TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import axios from 'axios';

const RecordDetailsPage = () => {
  const { albumId } = useParams();  // Retrieve albumId from URL params
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    condition: 'Used',
    description: '',
    shipping: 'No Shipping',
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = await getSpotifyAccessToken();
        
        // Fetch album details from Spotify
        const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const album = albumResponse.data;
        
        // Fetch genres from the artist
        const artistId = album.artists[0]?.id;
        const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const genres = artistResponse.data.genres;

        // Set record data based on Spotify info
        setRecord({
          title: album.name,
          artist: album.artists.map((artist) => artist.name).join(', '),
          albumId: album.id,
          genres,
          coverUrl: album.images[0]?.url,
          releaseDate: album.release_date,
        });
      } catch (error) {
        console.error("Error fetching Spotify record details:", error);
      }
    };

    if (albumId) {
      fetchRecord();
    }
  }, [albumId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRecordChange = (e) => {
    const { name, value } = e.target;
    setRecord((prevRecord) => ({ ...prevRecord, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
  
      if (!token || !userId) {
        alert("You need to be logged in to list a record.");
        return;
      }
  
      await axios.post(
        'http://localhost:5001/api/records/create',
        {
          ...record,
          ...formData,
          userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Record listed successfully!');
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Unauthorized. Please log in again.");
      } else {
        console.error('Error listing record:', error);
        alert("Failed to list the record. Please try again.");
      }
    }
  };
  
  if (!record) return <div>Loading...</div>;

  return (
    <Box sx={{ mt: 2, mx: 'auto', width: '60%', textAlign: 'center' }}>
      <Typography variant="h4">List Record for Sale</Typography>
      
      {/* Editable fields pre-filled with Spotify data */}
      <TextField
        label="Title"
        name="title"
        value={record.title}
        onChange={handleRecordChange}
        fullWidth
        sx={{ my: 2 }}
      />
      <TextField
        label="Artist"
        name="artist"
        value={record.artist}
        onChange={handleRecordChange}
        fullWidth
        sx={{ my: 2 }}
      />
      <TextField
        label="Release Date"
        name="releaseDate"
        value={record.releaseDate}
        onChange={handleRecordChange}
        fullWidth
        sx={{ my: 2 }}
      />
      <TextField
        label="Genres"
        name="genres"
        value={record.genres.join(', ')}
        onChange={(e) => handleRecordChange({ target: { name: 'genres', value: e.target.value.split(', ') } })}
        fullWidth
        sx={{ my: 2 }}
      />
      <Box component="img" src={record.coverUrl} alt={`${record.title} cover`} sx={{ width: '100%', maxWidth: 300, borderRadius: 2, my: 2 }} />
      <iframe
        src={`https://open.spotify.com/embed/album/${record.albumId}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="encrypted-media"
      ></iframe>
      
      {/* User-provided details */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Select
          label="Condition"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          fullWidth
          required
          sx={{ my: 2 }}
        >
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="Used">Used</MenuItem>
        </Select>

        <TextField
          label="Description"
          name="description"
          multiline
          rows={4}
          fullWidth
          value={formData.description}
          onChange={handleChange}
          required
          sx={{ my: 2 }}
        />

        <Select
          label="Shipping"
          name="shipping"
          value={formData.shipping}
          onChange={handleChange}
          fullWidth
          required
          sx={{ my: 2 }}
        >
          <MenuItem value="No Shipping">No Shipping</MenuItem>
          <MenuItem value="Local Pickup">Local Pickup</MenuItem>
          <MenuItem value="US Shipping">US Shipping</MenuItem>
          <MenuItem value="International Shipping">International Shipping</MenuItem>
        </Select>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          List Record
        </Button>
      </Box>
    </Box>
  );
};

export default RecordDetailsPage;
