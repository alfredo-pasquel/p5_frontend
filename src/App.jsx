import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SignUpPage from './pages/SignUpPage';
import ListRecordPage from './pages/ListRecordPage';
import RecordDetailsPage from './pages/RecordDetailsPage';
import NavBar from './components/NavBar';
import ListingPage from './pages/ListingPage';
import { RecordContext } from './RecordContext';

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
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h4" color="secondary.main">
            Needle Drop Vinyl Exchange
          </Typography>
        </Link>
      </Box>
      <NavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/list-record" element={isLoggedIn ? <ListRecordPage /> : <Navigate to="/login" />} />
        <Route path="/edit-record/:albumId" element={<RecordDetailsPage />} />
        <Route path="/listing/:id" element={<ListingPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
