import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SpotifyCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      axios
        .post('https://p5-backend-xidu.onrender.com/api/spotify/callback', { code })
        .then((response) => {
          // Save the token and user data in localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.user._id);

          // Redirect to profile or home page
          navigate('/profile');
        })
        .catch((error) => {
          console.error('Error during Spotify authentication:', error);
          navigate('/error');
        });
    } else {
      console.error('Authorization code missing');
      navigate('/error');
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
}

export default SpotifyCallback;
