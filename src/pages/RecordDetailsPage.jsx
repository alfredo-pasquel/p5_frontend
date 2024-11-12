// src/pages/RecordDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import axios from 'axios';

const RecordDetailsPage = () => {
  const { albumId } = useParams();
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genres: '',
    releaseDate: '',
    condition: 'Used',
    description: '',
    shipping: 'No Shipping',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Fetch album details from backend
        const albumResponse = await axios.get(`http://localhost:5001/api/spotify/album/${albumId}`);
        const album = albumResponse.data;

        const artistId = album.artists[0]?.id;
        const artistResponse = await axios.get(`http://localhost:5001/api/spotify/artist/${artistId}`);
        const genres = artistResponse.data.genres;

        setRecord({
          title: album.name,
          artist: album.artists.map((artist) => artist.name).join(', '),
          albumId: album.id,
          genres,
          coverUrl: album.images[0]?.url,
          releaseDate: album.release_date,
        });

        // Set initial values for editable form fields
        setFormData((prevData) => ({
          ...prevData,
          title: album.name,
          artist: album.artists.map((artist) => artist.name).join(', '),
          genres: genres.join(', '),
          releaseDate: album.release_date,
        }));
      } catch (error) {
        console.error('Error fetching album details:', error);
      }
    };

    if (albumId) {
      fetchRecord();
    } else {
      // Initialize empty record and formData if albumId is not present
      setRecord({
        title: '',
        artist: '',
        albumId: '',
        genres: [],
        coverUrl: '',
        releaseDate: '',
      });

      setFormData({
        title: '',
        artist: '',
        genres: '',
        releaseDate: '',
        condition: 'Used',
        description: '',
        shipping: 'No Shipping',
      });
    }
  }, [albumId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const response = await axios.get('http://localhost:5001/api/s3/generate-upload-url', {
        params: {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          albumId: record.albumId || 'manual-upload', // Use a default value if albumId is not available
        },
      });

      const { uploadUrl, imageUrl } = response.data;
      await axios.put(uploadUrl, selectedFile, {
        headers: { 'Content-Type': selectedFile.type },
      });

      setImageUrls((prev) => [...prev, imageUrl]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const dataToSubmit = {
        userId,
        title: formData.title,
        artist: formData.artist,
        genres: formData.genres.split(',').map((genre) => genre.trim()),
        releaseDate: formData.releaseDate,
        condition: formData.condition,
        description: formData.description || '',
        shipping: formData.shipping || 'No Shipping',
        images: imageUrls,
      };

      // Include albumId and coverUrl only if they exist
      if (record.albumId) {
        dataToSubmit.albumId = record.albumId;
      }
      if (record.coverUrl) {
        dataToSubmit.coverUrl = record.coverUrl;
      }

      const response = await axios.post(
        'http://localhost:5001/api/records/create',
        dataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newRecordId = response.data._id; // Capture the ID from the server response
      alert('Record listed successfully!');
      navigate(`/listing/${newRecordId}`); // Navigate to the new ListingPage
    } catch (error) {
      console.error('Error creating record listing:', error);
      alert('Failed to list the record. Please try again.');
    }
  };

  if (record === null) return <div>Loading...</div>;

  return (
    <Box sx={{ mt: 2, mx: 'auto', width: '60%', textAlign: 'center' }}>
      <Typography variant="h4">List Record for Sale</Typography>

      <TextField
        label="Title"
        name="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        fullWidth
        sx={{ my: 2 }}
        required
      />
      <TextField
        label="Artist"
        name="artist"
        value={formData.artist}
        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
        fullWidth
        sx={{ my: 2 }}
        required
      />
      <TextField
        label="Release Date"
        name="releaseDate"
        value={formData.releaseDate}
        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
        fullWidth
        sx={{ my: 2 }}
      />
      <TextField
        label="Genres (separate by commas)"
        name="genres"
        value={formData.genres}
        onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
        fullWidth
        sx={{ my: 2 }}
      />

      {/* Conditionally render cover image and Spotify player */}
      {record.coverUrl && (
        <Box
          component="img"
          src={record.coverUrl}
          alt={`${record.title} cover`}
          sx={{ width: '100%', maxWidth: 300, borderRadius: 2, my: 2 }}
        />
      )}
      {record.albumId && (
        <iframe
          src={`https://open.spotify.com/embed/album/${record.albumId}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
          title="Spotify Player"
        ></iframe>
      )}

      <Box sx={{ mt: 4 }}>
        <input type="file" onChange={handleFileChange} />
        <Button onClick={handleUpload} variant="contained" sx={{ mt: 2 }}>
          Upload Image
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Uploaded Images</Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            mt: 2,
          }}
        >
          {imageUrls.map((url, index) => (
            <Box
              component="img"
              key={index}
              src={url}
              alt={`Record image ${index + 1}`}
              sx={{ width: 100, height: 100, borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Select
          label="Condition"
          name="condition"
          value={formData.condition}
          onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          sx={{ my: 2 }}
        />

        <Select
          label="Shipping"
          name="shipping"
          value={formData.shipping}
          onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
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
