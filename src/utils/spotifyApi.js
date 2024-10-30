// src/utils/spotifyApi.js
import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const getSpotifyAccessToken = async () => {
  try {
    const client_id = CLIENT_ID;
    const client_secret = CLIENT_SECRET;
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'client_credentials',
      },
      headers: {
        Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching Spotify access token:', error);
    throw error;
  }
};

export const searchSpotifyAlbums = async (query) => {
  try {
    const token = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: query,
        type: 'album',
        limit: 5,
      },
    });

    // Check if albums and items exist
    const albums = response.data?.albums?.items;
    if (!albums || albums.length === 0) {
      console.error('No albums found in Spotify response');
      return []; // Return an empty array if no albums were found
    }

    const albumsWithGenres = await Promise.all(
      albums.map(async (album) => {
        const artistId = album.artists[0].id;
        try {
          const artistResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const genres = artistResponse.data.genres;
          return { ...album, genres };
        } catch (err) {
          console.error('Error fetching artist genres:', err);
          return { ...album, genres: [] };
        }
      })
    );

    return albumsWithGenres;
  } catch (error) {
    console.error('Error searching Spotify albums:', error);
    throw error;
  }
};

