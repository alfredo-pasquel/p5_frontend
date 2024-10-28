// src/utils/spotifyAuth.js

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

function initiateSpotifyAuth() {
  const scopes = [
    'user-read-private',
    'user-read-email', // Add additional scopes as needed
  ];
  
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scopes.join('%20')}`;
  
  window.location.href = authUrl;
}

export { initiateSpotifyAuth };
