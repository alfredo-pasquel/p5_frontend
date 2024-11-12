// src/utils/spotifyApi.js

import axios from 'axios';

export const searchSpotifyAlbums = async (query) => {
  try {
    const response = await axios.get(`https://p5-backend-xidu.onrender.com/api/spotify/search`, {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Spotify albums:', error);
    throw error;
  }
};

export const getAlbumDetails = async (albumId) => {
  try {
    const response = await axios.get(`https://p5-backend-xidu.onrender.com/api/spotify/album/${albumId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching album details:', error);
    throw error;
  }
};
