import React, { useEffect, useState } from 'react';
import { Typography, List, ListItem, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [listedRecords, setListedRecords] = useState([]);
  const [recommendedRecords, setRecommendedRecords] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found in localStorage.');

        const { userId } = jwtDecode(token);
        const userResponse = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User Data:", userResponse.data);
        setUserData(userResponse.data);

        const recordDetails = await Promise.all(
          userResponse.data.recordsListedForTrade.map(async (record) => {
            const recordId = typeof record === 'object' ? record._id.toString() : record;
            console.log("Fetching record with ID:", recordId);
            try {
              const recordResponse = await axios.get(`http://localhost:5001/api/records/${recordId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log("Fetched Record Data:", recordResponse.data);
              return recordResponse.data;
            } catch (error) {
              console.warn(`Record with ID ${recordId} not found.`);
              return null;
            }
          })
        );

        setListedRecords(recordDetails.filter((record) => record !== null));

        const recommendationsResponse = await axios.get(`http://localhost:5001/api/users/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Recommended Records (Frontend):", recommendationsResponse.data);
        setRecommendedRecords(recommendationsResponse.data);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load profile data');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDeleteClick = (event, recordId) => {
    event.stopPropagation(); // Prevent the parent click event from firing
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/records/delete/${recordToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListedRecords(listedRecords.filter((record) => record._id !== recordToDelete));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete the record.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  if (error) return <Typography>{error}</Typography>;
  if (!userData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>{userData.username}'s Profile</Typography>
      <Typography variant="body1"><strong>Country:</strong> {userData.country}</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}><strong>About:</strong> {userData.about}</Typography>
      
      <Typography variant="h5" sx={{ mt: 3 }}>Favorite Artists</Typography>
      <Typography>{userData.favoriteArtists.flat().join(', ')}</Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>Favorite Genres</Typography>
      <Typography>{userData.favoriteGenres.flat().join(', ')}</Typography>

      <Typography variant="h5" sx={{ mt: 3 }}>Looking For</Typography>
      {userData.lookingFor.length > 0 ? (
        <List>{userData.lookingFor.map((record, index) => <ListItem key={index}>{record}</ListItem>)}</List>
      ) : (
        <Typography>No items in 'Looking For' list.</Typography>
      )}

      <Typography variant="h5" sx={{ mt: 3 }}>Records Listed for Trade</Typography>
      <List>
        {listedRecords.map((record, index) => (
          <ListItem
            key={index}
            sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, cursor: 'pointer' }}
            onClick={() => navigate(`/listing/${record._id}`)}
          >
            <Typography variant="h6">{record.title}</Typography>
            <Typography><strong>Artist:</strong> {record.artist.join(', ')}</Typography>
            <Typography><strong>Genres:</strong> {record.genres.join(', ')}</Typography>
            <Box component="img" src={record.coverUrl} alt={`${record.title} cover`} sx={{ width: 150, borderRadius: 2, mt: 1 }} />
            <Box sx={{ mt: 1 }}>
              {record.albumId ? (
                <iframe
                  src={`https://open.spotify.com/embed/album/${record.albumId}`}
                  width="300"
                  height="80"
                  style={{ border: "none" }}
                  allow="encrypted-media"
                  title="Spotify Player"
                ></iframe>
              ) : (
                <Typography color="error">Spotify link not available</Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              color="error"
              onClick={(event) => handleDeleteClick(event, record._id)} // Use event to stop propagation
              sx={{ mt: 2 }}
            >
              Delete Listing
            </Button>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h5" sx={{ mt: 3 }}>Recommended Records</Typography>
      <List>
        {recommendedRecords.map((record, index) => (
          <ListItem
            key={index}
            sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, cursor: 'pointer' }}
            onClick={() => navigate(`/listing/${record._id}`)}
          >
            <Typography variant="h6">{record.title}</Typography>
            <Typography><strong>Artist:</strong> {record.artist.join(', ')}</Typography>
            <Typography><strong>Genres:</strong> {record.genres.join(', ')}</Typography>
            <Box component="img" src={record.coverUrl} alt={`${record.title} cover`} sx={{ width: 150, borderRadius: 2, mt: 1 }} />
            <Box sx={{ mt: 1 }}>
              {record.albumId ? (
                <iframe
                  src={`https://open.spotify.com/embed/album/${record.albumId}`}
                  width="300"
                  height="80"
                  style={{ border: "none" }}
                  allow="encrypted-media"
                  title="Spotify Player"
                ></iframe>
              ) : (
                <Typography color="error">Spotify link not available</Typography>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Typography variant="body1" sx={{ mt: 3 }}><strong>Trade Count:</strong> {userData.tradeCount}</Typography>
    </Box>
  );
};

export default ProfilePage;
