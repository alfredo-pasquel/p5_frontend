// ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [listedRecords, setListedRecords] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
   
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found in localStorage.');

        const { userId } = jwtDecode(token);
        const response = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);

        // Fetch listed records, handle missing records with try/catch
        const recordDetails = await Promise.all(
          response.data.recordsListedForTrade.map(async (recordId) => {
            try {
              const recordResponse = await axios.get(`http://localhost:5001/api/records/${recordId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return recordResponse.data;
            } catch (error) {
              console.warn(`Record with ID ${recordId} not found.`);
              return null; // Return null for missing records
            }
          })
        );

        setListedRecords(recordDetails.filter(record => record !== null));
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load profile data');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login'); // Redirect to login if the token is invalid
      }
    };


    fetchUserData();
}, [navigate]);

  
  if (error) return <Typography>{error}</Typography>;
  if (!userData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>{userData.username}'s Profile</Typography>
      <Typography variant="body1"><strong>Country:</strong> {userData.country}</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}><strong>About:</strong> {userData.about}</Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>Favorite Artists</Typography>
      <List>{userData.favoriteArtists.map((artist, index) => <ListItem key={index}>{artist}</ListItem>)}</List>

      <Typography variant="h5" sx={{ mt: 3 }}>Favorite Genres</Typography>
      <List>{userData.favoriteGenres.map((genre, index) => <ListItem key={index}>{genre}</ListItem>)}</List>

      <Typography variant="h5" sx={{ mt: 3 }}>Looking For</Typography>
      <List>{userData.lookingFor.map((record, index) => <ListItem key={index}>{record}</ListItem>)}</List>

      <Typography variant="h5" sx={{ mt: 3 }}>Records Listed for Trade</Typography>
      <List>
        {listedRecords.map((record, index) => (
          <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6">{record.title}</Typography>
            <Typography><strong>Artist:</strong> {record.artist}</Typography>
            <Typography><strong>Condition:</strong> {record.condition}</Typography>
            <Typography><strong>Genres:</strong> {record.genres.join(', ')}</Typography>
            <Typography><strong>Description:</strong> {record.description}</Typography>
            <Typography><strong>Shipping:</strong> {record.shipping}</Typography>
            <Box component="img" src={record.coverUrl} alt={`${record.title} cover`} sx={{ width: 150, borderRadius: 2, mt: 1 }} />
          </ListItem>
        ))}
      </List>

      <Typography variant="body1" sx={{ mt: 3 }}><strong>Trade Count:</strong> {userData.tradeCount}</Typography>
    </Box>
  );
};

export default ProfilePage;
