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
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import countries from '../utils/countries';
import genres from '../utils/genres';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: 'auto',
  marginTop: theme.spacing(8),
  backgroundColor: 'rgba(18, 18, 18, 0.5)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTextField = styled(TextField)({
  '&:-webkit-autofill': {
    backgroundColor: 'rgba(18, 18, 18, 0.5) !important',
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
    WebkitTextFillColor: '#ffffff !important',
  },
  '&:hover:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
  },
  '&:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0px 1000px rgba(18, 18, 18, 0.5) inset !important',
  },
});

const PasswordStrengthBar = styled(LinearProgress)(({ theme, strength }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.palette.grey[300],
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
    backgroundColor:
      strength <= 2
        ? theme.palette.error.main
        : strength === 3
        ? theme.palette.warning.main
        : theme.palette.success.main,
  },
}));

const SignUpPage = ({ onLogin }) => {
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
  const [customGenre, setCustomGenre] = useState('');
  const [showCustomGenre, setShowCustomGenre] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});

  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleGenresChange = (event) => {
    const { value } = event.target;
    const selectedGenres = typeof value === 'string' ? value.split(',') : value;

    setFormData({ ...formData, favoriteGenres: selectedGenres });

    if (selectedGenres.includes('Other')) {
      setShowCustomGenre(true);
    } else {
      setShowCustomGenre(false);
      setCustomGenre('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const errors = {};

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length > 30) {
      errors.username = 'Username must be less than 30 characters';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (formData.email.length > 50) {
      errors.email = 'Email must be less than 50 characters';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email is not valid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Include at least one uppercase letter';
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Include at least one lowercase letter';
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Include at least one number';
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = 'Include at least one special character';
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Prepare form data
      const processedFormData = {
        ...formData,
        favoriteArtists: formData.favoriteArtists.split(',').map((artist) => artist.trim()),
      };

      // Handle custom genres
      if (customGenre.trim() !== '') {
        processedFormData.favoriteGenres = processedFormData.favoriteGenres.map((genre) =>
          genre === 'Other' ? customGenre.trim() : genre
        );
      } else {
        processedFormData.favoriteGenres = processedFormData.favoriteGenres.filter((genre) => genre !== 'Other');
      }

      // Send data to backend
      const response = await axios.post('https://p5-backend-xidu.onrender.com/api/users/register', processedFormData);
      const { token } = response.data;

      if (token) {
        // Save token to localStorage
        localStorage.setItem('token', token);

        // Call onLogin to update app state
        if (onLogin) {
          onLogin();
        }

        // Redirect to profile page
        navigate('/profile');
      } else {
        throw new Error('Token missing from response');
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
    }
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
              {/* Username and Country Fields */}
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
                  error={!!validationErrors.username}
                  helperText={validationErrors.username}
                  inputProps={{ maxLength: 30 }}
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

              {/* Email Field */}
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
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  inputProps={{ maxLength: 50 }}
                />
              </Grid>

              {/* Password Field */}
              <Grid item xs={12}>
                <StyledTextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!validationErrors.password}
                  helperText={
                    validationErrors.password ||
                    'At least 8 chars, include uppercase, lowercase, number, special char.'
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Password Strength Meter */}
              {formData.password && (
                <Grid item xs={12}>
                  <Typography variant="body2">Password Strength:</Typography>
                  <PasswordStrengthBar
                    variant="determinate"
                    value={(passwordStrength / 5) * 100}
                    strength={passwordStrength}
                  />
                  <Typography variant="caption">
                    {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1]}
                  </Typography>
                </Grid>
              )}

              {/* Confirm Password Field */}
              <Grid item xs={12}>
                <StyledTextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Favorite Genres Field */}
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

              {/* Custom Genre Field */}
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

              {/* Favorite Artists Field */}
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

              {/* About Field */}
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

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, mb: 2 }}>
              Sign Up
            </Button>

            {/* Redirect to Login */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button variant="text" onClick={() => navigate('/login')} sx={{ color: 'white' }}>
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
