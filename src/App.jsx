import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, GlobalStyles } from '@mui/material';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SignUpPage from './pages/SignUpPage';
import ListRecordPage from './pages/ListRecordPage';
import RecordDetailsPage from './pages/RecordDetailsPage';
import NavBar from './components/NavBar';
import ListingPage from './pages/ListingPage';
import { RecordContext } from './RecordContext';
import SpotifyCallback from './pages/SpotifyCallback';
import MessagesPage from './pages/MessagesPage';
import MessageDetailPage from './pages/MessageDetailPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#121212', // Dark neutral color for the header
    },
    secondary: {
      main: '#ffffff', // White for high-contrast text
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    // fontFamily: '"Cinzel Decorative", serif',
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const { selectedRecordId } = useContext(RecordContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const onNavigate = (page) => {
    if (page === 'logout') {
      handleLogout();
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundImage: 'url(https://ap-p5-vinyl-bucket.s3.us-east-2.amazonaws.com/NeedleDropBackground2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh', // Ensures the background covers the whole viewport
            margin: 0,          // Removes default margin
            padding: 0,
          },
          'input:-webkit-autofill': {
            backgroundColor: 'rgba(18, 18, 18, 0.5) !important', // Match your background
            WebkitBoxShadow: '0 0 0 1000px rgba(18, 18, 18, 0.5) inset !important',
            WebkitTextFillColor: '#ffffff !important', // White text
            borderRadius: '4px', // Match your input border-radius
          },
        }}
      />
      <Box
        sx={{
          p: 6, // Adjust padding for taller header
          textAlign: 'center',
          bgcolor: 'primary.main',
          backgroundImage: 'url(https://ap-p5-vinyl-bucket.s3.us-east-2.amazonaws.com/NeedleDropBackground.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better contrast
            zIndex: 1,
          },
          zIndex: 0,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 3,
              py: 1,
              bgcolor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background for the title
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h3" // Make title larger
              sx={{
                fontFamily: '"Cinzel Decorative", serif', // Replace with an artsy Google Font
                color: 'primary.main', // Text color to contrast with the semi-transparent background
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', // Adds subtle text shadow for more pop
              }}
            >
              Needle Drop
            </Typography>
          </Box>
        </Link>
      </Box>
      <NavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/list-record" element={isLoggedIn ? <ListRecordPage /> : <Navigate to="/login" />} />
        <Route path="/edit-record/:albumId?" element={<RecordDetailsPage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
        <Route path="/callback" element={<SpotifyCallback />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessageDetailPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
