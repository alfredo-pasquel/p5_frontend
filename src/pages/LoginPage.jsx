// src/pages/LoginPage.jsx

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
  CardActions,
  Grid,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { styled } from '@mui/system';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: 'auto',
  marginTop: theme.spacing(8),
}));

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const LoginPage = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState(''); // Supports email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
        identifier,
        password,
      });
      const { token, user } = response.data;

      if (token) {
        // Save token and userId in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user._id);
        console.log('Token saved:', localStorage.getItem('token'));
        console.log('User ID saved:', localStorage.getItem('userId'));

        onLogin(); // Update state in App
        navigate('/profile'); // Redirect to profile after login
      } else {
        console.error('No token received');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('Invalid login credentials');
      console.error('Login error:', err);
    }
  };

  const handleSpotifyLogin = () => {
    const clientId = '9006782afa394bbeb30c6067df0474c2'; // Replace with your actual Spotify Client ID
    const redirectUri = 'http://localhost:5173/callback'; // Your app's redirect URI
    const scopes = 'user-library-read'; // Adjust scopes as needed

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scopes
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledCard elevation={6}>
        <StyledBox>
          <LockOutlinedIcon color="primary" sx={{ m: 1, fontSize: 40 }} />
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
        </StyledBox>
        <CardContent>
          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="identifier"
              label="Email Address or Username"
              name="identifier"
              autoComplete="identifier"
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container spacing={2}>
              <Grid item xs>
                {/* Placeholder for "Forgot password" link */}
              </Grid>
              <Grid item>
                <Button variant="text" onClick={() => navigate('/signup')}>
                  {"Don't have an account? Sign Up"}
                </Button>
              </Grid>
            </Grid>
            {/* <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleSpotifyLogin}
              sx={{ mt: 2 }}
            >
              Sign in with Spotify
            </Button> */}
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default LoginPage;
