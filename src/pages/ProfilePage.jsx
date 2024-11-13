// src/pages/ProfilePage.jsx

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  List,
  ListItem,
  Autocomplete,
  Paper,
  Rating,
} from '@mui/material';
import { Edit, Save, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { searchSpotifyAlbums, getAlbumDetails } from '../utils/spotifyApi';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [listedRecords, setListedRecords] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [albumOptions, setAlbumOptions] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lookingForAlbums, setLookingForAlbums] = useState([]);
  const [recommendedRecords, setRecommendedRecords] = useState([]);
  const navigate = useNavigate();

  // Helper function to process and flatten user data
  const processUserData = (data) => ({
    ...data,
    favoriteArtists: data.favoriteArtists.flat(),
    favoriteGenres: data.favoriteGenres.flat(),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found in localStorage.');

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        if (!userId) throw new Error('Invalid token: userId not found.');

        const userResponse = await axios.get(`https://p5-backend-xidu.onrender.com/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Use the helper function to process user data
        const processedData = processUserData(userResponse.data);

        setUserData(processedData);
        setUpdatedUserData(processedData);

        // Fetch listed records
        const recordDetails = await Promise.all(
          userResponse.data.recordsListedForTrade.map(async (record) => {
            const recordId = typeof record === 'object' ? record._id.toString() : record;
            try {
              const recordResponse = await axios.get(
                `https://p5-backend-xidu.onrender.com/api/records/${recordId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return recordResponse.data;
            } catch (error) {
              console.warn(`Record with ID ${recordId} not found.`);
              return null;
            }
          })
        );

        // Exclude traded records
        const availableRecords = recordDetails.filter(
          (record) => record && !record.isTraded
        );

        setListedRecords(availableRecords);

        // Fetch saved items
        const savedItemDetails = await Promise.all(
          userResponse.data.savedItems.map(async (recordId) => {
            try {
              const recordResponse = await axios.get(
                `https://p5-backend-xidu.onrender.com/api/records/${recordId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return recordResponse.data;
            } catch (error) {
              console.warn(`Saved record with ID ${recordId} not found.`);
              return null;
            }
          })
        );

        // Filter out any null responses
        const validSavedRecords = savedItemDetails.filter((record) => record !== null);
        setSavedRecords(validSavedRecords);

        // Fetch notifications
        const notificationsResponse = await axios.get(
          `https://p5-backend-xidu.onrender.com/api/users/${userId}/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(notificationsResponse.data.notifications);

        // Fetch "Looking For" album details
        if (userResponse.data.lookingFor && userResponse.data.lookingFor.length > 0) {
          try {
            const albums = await Promise.all(
              userResponse.data.lookingFor.map(async (albumId) => {
                const albumData = await getAlbumDetails(albumId);
                return albumData;
              })
            );
            setLookingForAlbums(albums);
          } catch (error) {
            console.error('Error fetching "Looking For" albums:', error);
          }
        }

        // Fetch recommendations
        const recommendationsResponse = await axios.get(
          `https://p5-backend-xidu.onrender.com/api/users/recommendations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRecommendedRecords(recommendationsResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleDeleteClick = (event, recordId) => {
    event.stopPropagation();
    setRecordToDelete(recordId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://p5-backend-xidu.onrender.com/api/records/delete/${recordToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListedRecords(listedRecords.filter((record) => record._id !== recordToDelete));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete the record.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setUpdatedUserData(userData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData({ ...updatedUserData, [name]: value });
  };

  const saveProfileChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      if (!userId) throw new Error('Invalid token: userId not found.');

      const response = await axios.put(
        `https://p5-backend-xidu.onrender.com/api/users/${userId}`,
        updatedUserData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Process the updated user data
      const processedData = processUserData(response.data);

      setUserData(processedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSearchChange = async (event, value) => {
    setSearchQuery(value);
    if (value.length > 2) {
      try {
        const results = await searchSpotifyAlbums(value);
        setAlbumOptions(results);
      } catch (error) {
        console.error('Error searching albums:', error);
      }
    } else {
      setAlbumOptions([]);
    }
  };

  const handleAddToLookingFor = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://p5-backend-xidu.onrender.com/api/users/add-looking-for`,
        { albumId: selectedAlbum.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state
      setLookingForAlbums((prevAlbums) => [...prevAlbums, selectedAlbum]);
      setUserData((prevData) => ({
        ...prevData,
        lookingFor: [...prevData.lookingFor, selectedAlbum.id],
      }));
      setSelectedAlbum(null);
      setSearchQuery('');
      setAlbumOptions([]);
    } catch (error) {
      console.error('Error adding to Looking For:', error);
      alert('Failed to add album to Looking For list.');
    }
  };

  const handleRemoveFromLookingFor = async (albumId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://p5-backend-xidu.onrender.com/api/users/remove-looking-for`,
        { albumId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state
      setLookingForAlbums((prevAlbums) =>
        prevAlbums.filter((album) => album.id !== albumId)
      );
      setUserData((prevData) => ({
        ...prevData,
        lookingFor: prevData.lookingFor.filter((id) => id !== albumId),
      }));
    } catch (error) {
      console.error('Error removing from Looking For:', error);
      alert('Failed to remove album from Looking For list.');
    }
  };

  const calculateAverageRating = (feedbackArray) => {
    if (feedbackArray.length === 0) return 0;
    const total = feedbackArray.reduce((sum, f) => sum + f.rating, 0);
    return total / feedbackArray.length;
  };

  if (error) return <Typography>{error}</Typography>;
  if (!userData) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
      <Grid container spacing={4}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h4">{userData.username}'s Profile</Typography>
              <IconButton onClick={isEditing ? saveProfileChanges : toggleEditMode} color="primary">
                {isEditing ? <Save /> : <Edit />}
              </IconButton>
            </Box>

            {/* User Info */}
            <Box sx={{ mt: 2 }}>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Country"
                      name="country"
                      value={updatedUserData.country}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Trade Count"
                      name="tradeCount"
                      value={userData.tradeCount}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      type="number"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  {/* Remove Rating from editing mode */}
                  {/* ... other editable fields ... */}
                  <Grid item xs={12}>
                    <TextField
                      label="About"
                      name="about"
                      value={updatedUserData.about}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Favorite Artists"
                      name="favoriteArtists"
                      value={updatedUserData.favoriteArtists.join(', ')}
                      onChange={(e) =>
                        setUpdatedUserData({
                          ...updatedUserData,
                          favoriteArtists: e.target.value
                            .split(',')
                            .map((artist) => artist.trim()),
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Favorite Genres"
                      name="favoriteGenres"
                      value={updatedUserData.favoriteGenres.join(', ')}
                      onChange={(e) =>
                        setUpdatedUserData({
                          ...updatedUserData,
                          favoriteGenres: e.target.value
                            .split(',')
                            .map((genre) => genre.trim()),
                        })
                      }
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Country:</strong> {userData.country}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>About:</strong> {userData.about}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Trade Count:</strong> {userData.tradeCount}
                  </Typography>
                  {/* Display average rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1">
                      <strong>Rating:</strong>
                    </Typography>
                    <Rating
                      value={calculateAverageRating(userData.feedback)}
                      readOnly
                      precision={0.5}
                      sx={{ ml: 1 }}
                    />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      ({userData.feedback.length})
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mt: 3 }}>
                    Favorite Artists
                  </Typography>
                  <Typography variant="body2">{userData.favoriteArtists.join(', ')}</Typography>
                  <Typography variant="h6" sx={{ mt: 3 }}>
                    Favorite Genres
                  </Typography>
                  <Typography variant="body2">{userData.favoriteGenres.join(', ')}</Typography>

                  {/* Notifications Section */}
                  <Typography variant="h6" sx={{ mt: 3 }}>
                    Notifications
                  </Typography>
                  {notifications.length > 0 ? (
                    <List>
                      {notifications.map((notification, index) => (
                        <ListItem
                          key={index}
                          onClick={() => navigate(`/listing/${notification.recordId}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <Typography>{notification.message}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No notifications.</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Looking For Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
            <Typography variant="h5" gutterBottom>
              Looking For
            </Typography>
            <Autocomplete
              options={albumOptions}
              getOptionLabel={(option) => `${option.name} by ${option.artists[0].name}`}
              onInputChange={handleSearchChange}
              onChange={(event, newValue) => setSelectedAlbum(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Add to Looking For" variant="outlined" />
              )}
              sx={{ mt: 2, mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAddToLookingFor}
              disabled={!selectedAlbum}
              fullWidth
              sx={{ mb: 3 }}
            >
              Add to Looking For
            </Button>

            {lookingForAlbums.length > 0 ? (
              <Grid container spacing={2}>
                {lookingForAlbums.map((album, index) => {
                  // Enhanced Fallback Logic for album images
                  const displayImage =
                    album.coverUrl ||
                    (album.images && album.images.length > 0
                      ? typeof album.images[0] === 'object'
                        ? album.images[0].url
                        : album.images[0]
                      : '/images/placeholder.jpg'); // Ensure placeholder exists

                  return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%', // 1:1 Aspect Ratio
                          }}
                        >
                          {displayImage && (
                            <CardMedia
                              component="img"
                              image={displayImage}
                              alt={`${album.name} cover`}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{album.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {album.artists[0].name}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleRemoveFromLookingFor(album.id)}
                          >
                            <Delete />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography>No items in 'Looking For' list.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Saved Items Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
            <Typography variant="h5" gutterBottom>
              Saved Items
            </Typography>
            {savedRecords.length > 0 ? (
              <Grid container spacing={2}>
                {savedRecords.map((record, index) => {
                  // Enhanced Fallback Logic for saved records images
                  const displayImage =
                    record.coverUrl ||
                    (record.images && record.images.length > 0
                      ? typeof record.images[0] === 'object'
                        ? record.images[0].url
                        : record.images[0]
                      : '/images/placeholder.jpg'); // Ensure placeholder exists

                  return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card onClick={() => navigate(`/listing/${record._id}`)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6,
                          },
                        }}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%', // 1:1 Aspect Ratio
                          }}
                        >
                          {displayImage && (
                            <CardMedia
                              component="img"
                              image={displayImage}
                              alt={`${record.title} cover`}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{record.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {Array.isArray(record.artist) ? record.artist.join(', ') : record.artist}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography>No saved items.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Records Listed for Trade Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
            <Typography variant="h5" gutterBottom>
              Records Listed for Trade
            </Typography>
            {listedRecords.length > 0 ? (
              <Grid container spacing={2}>
                {listedRecords.map((record, index) => {
                  // Enhanced Fallback Logic for listed records images
                  const displayImage =
                    record.coverUrl ||
                    (record.images && record.images.length > 0
                      ? typeof record.images[0] === 'object'
                        ? record.images[0].url
                        : record.images[0]
                      : '/images/placeholder.jpg'); // Ensure placeholder exists

                  return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card
                        sx={{ position: 'relative' }}
                        onClick={() => navigate(`/listing/${record._id}`)}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%', // 1:1 Aspect Ratio
                          }}
                        >
                          {displayImage && (
                            <CardMedia
                              component="img"
                              image={displayImage}
                              alt={`${record.title} cover`}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{record.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {Array.isArray(record.artist) ? record.artist.join(', ') : record.artist}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteClick(event, record._id);
                            }}
                          >
                            Delete Listing
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography>No records listed for trade.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recommended Records Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
            <Typography variant="h5" gutterBottom>
              Recommended Records
            </Typography>
            {recommendedRecords.length > 0 ? (
              <Grid container spacing={2}>
                {recommendedRecords.map((record, index) => {
                  // Enhanced Fallback Logic for recommended records images
                  const displayImage =
                    record.coverUrl ||
                    (record.images && record.images.length > 0
                      ? typeof record.images[0] === 'object'
                        ? record.images[0].url
                        : record.images[0]
                      : '/images/placeholder.jpg'); // Ensure placeholder exists

                  return (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card
                        onClick={() => navigate(`/listing/${record._id}`)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 6,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%', // 1:1 Aspect Ratio
                          }}
                        >
                          {displayImage && (
                            <CardMedia
                              component="img"
                              image={displayImage}
                              alt={`${record.title} cover`}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Typography variant="h6">{record.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {Array.isArray(record.artist) ? record.artist.join(', ') : record.artist}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography>No recommendations available.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
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
    </Box>
  );
};

export default ProfilePage;
