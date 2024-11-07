// src/pages/ListingPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardMedia, CardContent, Modal, IconButton, Button
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
        setRecord(response.data);
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

  if (error) return <Typography>{error}</Typography>;
  if (!record) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4, p: 2 }}>
      <Card>
        {/* Record Details */}
        <CardMedia
          component="img"
          image={record.coverUrl}
          alt={`${record.title} cover`}
          sx={{ 
            height: 400, 
            objectFit: 'contain',
            aspectRatio: '1 / 1' // Keep square aspect ratio for album covers
          }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" gutterBottom>{record.title}</Typography>
            <IconButton onClick={handleSave}>
              {isSaved ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Box>
          <Typography variant="h6" color="textSecondary">{record.artist.join(', ')}</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Genre: {record.genres.join(', ')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Released: {record.releaseDate}
          </Typography>

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

          <Typography variant="h6" sx={{ mt: 3 }}>Listing Details</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Condition: {record.condition}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Description: {record.description}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Shipping: {record.shipping}
          </Typography>
        </CardContent>

        {/* In the Seller Information section */}
        {record.userId && (
        <CardContent>
            <Typography variant="h6" sx={{ mt: 3 }}>Seller Information</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Username: {record.userId.username}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Trade Count: {record.userId.tradeCount}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Feedback Count: {record.userId.feedback.length}
            </Typography>
            <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleMessageSeller}
            >
            Message Seller
            </Button>
        </CardContent>
        )}

        {/* User Photos */}
        <CardContent>
          <Typography variant="h6" gutterBottom>User Photos</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {record.images.map((url, index) => (
              <CardMedia
                key={index}
                component="img"
                image={url}
                alt={`User-uploaded ${index + 1}`}
                sx={{ width: 100, height: 100, borderRadius: 2, objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => handleImageClick(url)}
              />
            ))}
          </Box>
        </CardContent>
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
