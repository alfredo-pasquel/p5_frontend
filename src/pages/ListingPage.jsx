// src/pages/ListingPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Rating,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Modal,
  IconButton,
  Button,
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; 

const ListingPage = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/records/${id}`);
        const sellerId = response.data.userId._id;

        // Fetch seller's public data including feedback
        const sellerResponse = await axios.get(`http://localhost:5001/api/users/${sellerId}/public`);
        const sellerData = sellerResponse.data;

        setRecord({
          ...response.data,
          sellerData,
        });
      } catch (error) {
        console.error('Error fetching record data:', error);
        setError('Failed to load listing data');
      }
    };

    const checkIfSaved = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const { userId } = jwtDecode(token);
        const response = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.savedItems.includes(id)) {
          setIsSaved(true);
        }
      } catch (error) {
        console.error('Error checking saved items:', error);
      }
    };

    fetchRecord();
    checkIfSaved();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = isSaved ? 'unsave' : 'save';
      await axios.post(
        `http://localhost:5001/api/users/${endpoint}`,
        { recordId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error updating saved items:', error);
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedImage(null);
  };

  const handleMessageSeller = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const { userId: buyerId } = jwtDecode(token);
      const sellerId = record.userId._id;
      const recordId = record._id;

      if (buyerId === sellerId) {
        alert('You cannot message yourself.');
        return;
      }

      // Start or get existing conversation
      const response = await axios.post(
        'http://localhost:5001/api/messages/start',
        { recordId, sellerId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversationId = response.data._id;
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation with the seller.');
    }
  };

  const calculateAverageRating = (feedbackArray) => {
    if (feedbackArray.length === 0) return 0;
    const total = feedbackArray.reduce((sum, f) => sum + f.rating, 0);
    return total / feedbackArray.length;
  };

  if (error) return <Typography>{error}</Typography>;
  if (!record) return <Typography>Loading...</Typography>;

  // Determine the image to display
  const displayImage = record.coverUrl || (record.images && record.images[0]);

  return (
    <Box
      sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}
    >
      <Card>
        {/* Record Details */}
        {displayImage && (
          <CardMedia
            component="img"
            image={displayImage}
            alt={`${record.title} cover`}
            sx={{
              height: 400,
              objectFit: 'contain',
              aspectRatio: '1 / 1', // Keep square aspect ratio for album covers
            }}
          />
        )}
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" gutterBottom>
              {record.title}
            </Typography>
            <IconButton onClick={handleSave} disabled={record.isTraded}>
              {isSaved ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>
          <Typography variant="h6" color="textSecondary">
            {Array.isArray(record.artist) ? record.artist.join(', ') : record.artist}
          </Typography>
          {record.genres && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Genre: {Array.isArray(record.genres) ? record.genres.join(', ') : record.genres}
            </Typography>
          )}
          {record.releaseDate && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Released: {record.releaseDate}
            </Typography>
          )}

          {/* Display 'Traded' status */}
          {record.isTraded && (
            <Typography variant="h6" color="error" sx={{ mt: 2 }}>
              This record has been traded.
            </Typography>
          )}

          {/* Spotify Player */}
          {record.albumId && (
            <Box sx={{ mt: 2 }}>
              <iframe
                src={`https://open.spotify.com/embed/album/${record.albumId}`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="encrypted-media"
                title="Spotify Player"
              ></iframe>
            </Box>
          )}

          <Typography variant="h6" sx={{ mt: 3 }}>
            Listing Details
          </Typography>
          {record.condition && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Condition: {record.condition}
            </Typography>
          )}
          {record.description && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Description: {record.description}
            </Typography>
          )}
          {record.shipping && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Shipping: {record.shipping}
            </Typography>
          )}
        </CardContent>

        {/* Seller Information */}
        {record.sellerData && (
          <CardContent>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Seller Information
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Username: {record.sellerData.username}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Trade Count: {record.sellerData.tradeCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Feedback Count: {record.sellerData.feedback.length}
            </Typography>
            {/* Display average rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Rating:
              </Typography>
              <Rating
                value={calculateAverageRating(record.sellerData.feedback)}
                readOnly
                precision={0.5}
                sx={{ ml: 1 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({record.sellerData.feedback.length})
              </Typography>
            </Box>

            {/* Disable actions if the record is traded */}
            {!record.isTraded && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={handleMessageSeller}
              >
                Message Seller
              </Button>
            )}
          </CardContent>
        )}

        {/* User Photos */}
        {record.images && record.images.length > 0 && (
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Photos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {record.images.map((url, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  image={url}
                  alt={`User-uploaded ${index + 1}`}
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 2,
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleImageClick(url)}
                />
              ))}
            </Box>
          </CardContent>
        )}
      </Card>

      {/* Image Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ maxWidth: '90%', maxHeight: '90%' }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full size user-uploaded"
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ListingPage;
