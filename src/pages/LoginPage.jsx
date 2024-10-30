// LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        const { token } = response.data;

        if (token) {
            // After successful login, save token and userId in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user._id);
            console.log("Token saved:", localStorage.getItem('token'));
            console.log("User ID saved:", localStorage.getItem('userId'));

            onLogin(); // Update state in App
            navigate('/profile'); // Redirect to profile after login
        } else {
            console.error("No token received");
        }
    } catch (err) {
        setError('Invalid login credentials');
        console.error("Login error:", err);
    }
};


  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username" // Single input for both
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={() => navigate('/signup')}>Sign Up</button>
    </div>
  );
};

export default LoginPage;
