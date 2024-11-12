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
    const clientId = '9006782afa394bbeb30c6067df0474c2'; 
    const redirectUri = 'http://localhost:5173/callback';
    const scopes = 'user-library-read'; 

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
            <StyledTextField
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
            <StyledTextField
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
                <Button variant="text" onClick={() => navigate('/signup')} sx={{color:'white'}}>
                  {"Don't have an account? Sign Up"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default LoginPage;
