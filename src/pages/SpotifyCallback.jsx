// src/pages/SpotifyCallback.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      // Handle the code (you would exchange it for an access token in a secure backend)
      console.log('Authorization code:', code);

      // Redirect to another page after handling (e.g., home or profile)
      navigate('/profile');
    } else {
      // Handle error or missing code
      console.error('Authorization code missing');
      navigate('/error');
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
}

export default SpotifyCallback;
