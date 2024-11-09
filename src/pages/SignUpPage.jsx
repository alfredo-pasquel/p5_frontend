// src/pages/SignUpPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import countries from '../utils/countries';
import genres from '../utils/genres';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(8),
  backgroundColor: 'rgba(18, 18, 18, 0.5)',
  backdropFilter: 'blur(10px)', // Adds subtle background blur
  borderRadius: theme.spacing(2), // Slightly round corners for aesthetics
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

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    favoriteGenres: [],
    favoriteArtists: '',
    about: '',
  });
  const [customGenre, setCustomGenre] = useState(''); // State for custom genre
  const [showCustomGenre, setShowCustomGenre] = useState(false); // Control display of custom genre input
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenresChange = (event) => {
    const { value } = event.target;
    const selectedGenres = typeof value === 'string' ? value.split(',') : value;

    setFormData({ ...formData, favoriteGenres: selectedGenres });

    if (selectedGenres.includes('Other')) {
      setShowCustomGenre(true);
    } else {
      setShowCustomGenre(false);
      setCustomGenre(''); // Clear custom genre if "Other" is deselected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Process favoriteArtists
      const processedFormData = {
        ...formData,
        favoriteArtists: formData.favoriteArtists.split(',').map(artist => artist.trim()),
      };

      // Replace "Other" with customGenre if provided
      if (customGenre.trim() !== '') {
        processedFormData.favoriteGenres = processedFormData.favoriteGenres.map(genre =>
          genre === 'Other' ? customGenre.trim() : genre
        );
      } else {
        // Remove "Other" if no customGenre is provided
        processedFormData.favoriteGenres = processedFormData.favoriteGenres.filter(genre => genre !== 'Other');
      }

      const response = await axios.post('http://localhost:5001/api/users/register', processedFormData);
      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        // Optionally, decode token to get userId
        // Example: const decoded = jwtDecode(token);
        // localStorage.setItem('userId', decoded.userId);
        console.log('Token saved:', localStorage.getItem('token'));
        // console.log('User ID saved:', localStorage.getItem('userId'));

        // Optionally, call onLogin() if passed as a prop
        // onLogin();
        navigate('/profile'); // Redirect to profile after successful signup
      } else {
        throw new Error('Token missing from response');
      }
    } catch (err) {
      console.error("Error signing up:", err);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  const handleSpotifySignUp = () => {
    const clientId = '9006782afa394bbeb30c6067df0474c2'; // Replace with your actual Spotify Client ID
    const redirectUri = 'http://localhost:5173/callback'; // Your app's redirect URI
    const scopes = 'user-library-read'; // Adjust scopes as needed

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledCard elevation={6}>
        <StyledBox>
          <LockOutlinedIcon color="primary" sx={{ m: 1, fontSize: 40 }} />
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
        </StyledBox>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  autoComplete="username"
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="country-label">Country</InputLabel>
                  <Select
                    labelId="country-label"
                    id="country"
                    name="country"
                    value={formData.country}
                    label="Country"
                    onChange={handleChange}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="favorite-genres-label">Favorite Genres</InputLabel>
                  <Select
                    labelId="favorite-genres-label"
                    id="favoriteGenres"
                    name="favoriteGenres"
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
              </Grid>
              {showCustomGenre && (
                <Grid item xs={12}>
                  <StyledTextField
                    label="Enter Custom Genre"
                    name="customGenre"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <StyledTextField
                  label="Favorite Artists (separate by commas)"
                  name="favoriteArtists"
                  value={formData.favoriteArtists}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label="About"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button variant="text" onClick={() => navigate('/login')} sx={{color: 'white'}}>
                  Already have an account? Sign in
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default SignUpPage;
