// SignUpPage.jsx
import React, { useState } from 'react';
import { TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import countries from '../utils/countries';
import genres from '../utils/genres';

const SignUpPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    country: '',
    favoriteGenres: [],
    favoriteArtists: '',
    about: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenresChange = (event) => {
    const { value } = event.target;
    setFormData({ ...formData, favoriteGenres: typeof value === 'string' ? value.split(',') : value });
  };

// Inside handleSubmit function of SignUpPage.jsx
const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedFormData = {
        ...formData,
        favoriteArtists: formData.favoriteArtists.split(',').map(artist => artist.trim()) // Convert string to array
      };
  
      const response = await axios.post('http://localhost:5001/api/users/register', processedFormData);
      const { token } = response.data;
  
      if (token) {
        localStorage.setItem('token', token);
        onLogin();  // Call the onLogin function to update state
        navigate('/profile'); // Redirect to profile after successful signup
      } else {
        throw new Error('Token missing from response');
      }
    } catch (err) {
      console.error("Error signing up:", err);
      setError('Signup failed. Please try again.');
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Sign Up</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>

        <TextField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Country</InputLabel>
          <Select
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>{country}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Favorite Genres</InputLabel>
          <Select
            multiple
            value={formData.favoriteGenres}
            onChange={handleGenresChange}
            renderValue={(selected) => selected.join(', ')}
          >
            {genres.map((genre) => (
              <MenuItem key={genre} value={genre}>
                <Checkbox checked={formData.favoriteGenres.indexOf(genre) > -1} />
                <ListItemText primary={genre} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Favorite Artists (separate by commas)"
          name="favoriteArtists"
          value={formData.favoriteArtists}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <TextField
          label="About"
          name="about"
          value={formData.about}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </form>
    </div>
  );
};

export default SignUpPage;
