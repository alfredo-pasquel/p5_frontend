import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/Home';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SignUpPage from './pages/SignUpPage';
import ListRecordPage from './pages/ListRecordPage';
import RecordDetailsPage from './pages/RecordDetailsPage';
import NavBar from './components/NavBar';
import { RecordContext } from './RecordContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const { selectedRecordId } = useContext(RecordContext);

  // useEffect to update isLoggedIn state based on token presence in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);  // Update based on token presence
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
    <>
      <NavBar onNavigate={onNavigate} isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />
        <Route path="/profile" element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/list-record" element={isLoggedIn ? <ListRecordPage /> : <Navigate to="/login" />} />
        <Route path="/edit-record/:albumId" element={<RecordDetailsPage />} />
      </Routes>
    </>
  );
}

export default App;
