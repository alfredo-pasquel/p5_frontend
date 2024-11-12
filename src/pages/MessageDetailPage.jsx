// src/pages/MessageDetailPage.jsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Rating, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, List, ListItem, ListItemText, TextField, Button, Link
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const MessageDetailPage = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [userId, setUserId] = useState(null);
  const [tradeStatus, setTradeStatus] = useState({});
  const [unreadCountUpdated, setUnreadCountUpdated] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const intervalIdRef = useRef(null);
  const navigate = useNavigate();

  // Function to fetch the conversation data from the server
  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      setUserId(decoded.userId);

      // Fetch the conversation details
      const response = await axios.get(
        `https://p5-backend-xidu.onrender.com/api/messages/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setConversation(response.data);
      setTradeStatus(response.data.tradeStatus || {});

      // Mark messages as read
      await axios.post(
        `https://p5-backend-xidu.onrender.com/api/messages/conversation/${conversationId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  // useEffect hook to set up polling when the component mounts
  useEffect(() => {
    fetchConversation(); // Initial fetch

    // Set up polling every 5 seconds
    intervalIdRef.current = setInterval(fetchConversation, 5000);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [conversationId]); // Re-run if conversationId changes

  // Add another useEffect to check for feedback
  useEffect(() => {
    if (
      conversation &&
      conversation.tradeStatus &&
      conversation.tradeStatus.isCompleted &&
      (!conversation.tradeStatus.feedbackProvided ||
        !conversation.tradeStatus.feedbackProvided.includes(userId))
    ) {
      setFeedbackDialogOpen(true);
    }
  }, [conversation, userId]);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (messageText.trim() === '') return; // Prevent sending empty messages

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://p5-backend-xidu.onrender.com/api/messages/send',
        {
          conversationId,
          text: messageText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessageText(''); // Clear the input field

      // Fetch new messages immediately after sending
      fetchConversation();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInitiateTradeCompletion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://p5-backend-xidu.onrender.com/api/trades/initiate`,
        { conversationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert('Trade completion initiated. Waiting for confirmation from the other user.');
      // Fetch updated conversation to reflect trade status
      fetchConversation();
    } catch (error) {
      console.error('Error initiating trade completion:', error);
      alert('Failed to initiate trade completion.');
    }
  };

    // Function to confirm trade completion
    const handleConfirmTradeCompletion = async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `https://p5-backend-xidu.onrender.com/api/trades/confirm`,
            { conversationId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          alert('Trade completion confirmed.');
          // Fetch updated conversation to reflect trade status
          fetchConversation();
          setUnreadCountUpdated((prev) => !prev); // Toggle state to trigger re-fetch in NavBar
        } catch (error) {
          console.error('Error confirming trade completion:', error);
          alert('Failed to confirm trade completion.');
        }
      };

      const handleSubmitFeedback = async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `https://p5-backend-xidu.onrender.com/api/trades/feedback`,
            { conversationId, rating, comment },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setFeedbackDialogOpen(false);
          alert('Thank you for your feedback!');
        } catch (error) {
          console.error('Error submitting feedback:', error);
          alert('Failed to submit feedback.');
        }
      };
      
      
  if (!conversation) return <Typography>Loading...</Typography>;

  // Identify the other participant in the conversation
  const otherParticipant = conversation.participants.find(
    (p) => p._id !== userId
  );

  return (
    <Box sx={{ mt: 2, backgroundColor: 'rgba(18, 18, 18, 0.5)' }}>
      <Typography variant="h4" gutterBottom>
        Conversation with {otherParticipant.username}
      </Typography>
      {/* Make the record title clickable */}
      <Typography variant="h6">
        Record:{' '}
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate(`/listing/${conversation.recordId._id}`)}
          sx={{ color: 'white'}}
        >
          {conversation.recordId.title}
        </Link>
      </Typography>

      {/* Display the list of messages */}
      <List sx={{ maxHeight: '60vh', overflowY: 'auto', mt: 2 }}>
        {conversation.messages.map((msg) => (
          <ListItem
            key={msg._id}
            sx={{
              justifyContent: msg.sender._id === userId ? 'flex-end' : 'flex-start',
            }}
          >
            <ListItemText
              primary={msg.text}
              secondary={`${msg.sender.username} • ${new Date(msg.timestamp).toLocaleString()}`}
              sx={{
                textAlign: msg.sender._id === userId ? 'right' : 'left',
                maxWidth: '70%',
                backgroundColor: msg.sender._id === userId ? '#e0f7fa' : '#f1f8e9',
                borderRadius: 2,
                padding: 1,
                m: 1
              }}
              primaryTypographyProps={{ color: 'black' }} // Set primary text color to black
              secondaryTypographyProps={{ color: 'black' }} // Set secondary text color to black
            />
          </ListItem>
        ))}
      </List>

      {/* Input field and send button */}
      <Box sx={{ mt: 2, display: 'flex' }}>
        <TextField
          fullWidth
          label="Type your message"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
              e.preventDefault();
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          sx={{ ml: 2 }}
        >
          Send
        </Button>
      </Box>


    {/* Trade Completion Section */}
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Trade Completion</Typography>

      {tradeStatus?.isCompleted ? (
        <Typography variant="body1" color="success.main">
          Trade has been completed.
        </Typography>
      ) : tradeStatus?.initiatedBy?.toString() === userId ? (
        <Typography variant="body1">
          You have initiated the trade completion. Waiting for confirmation from {otherParticipant.username}.
        </Typography>
      ) : tradeStatus?.initiatedBy ? (
        <>
          <Typography variant="body1">
            {otherParticipant.username} has initiated trade completion.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            onClick={handleConfirmTradeCompletion}
          >
            Confirm Trade Completion
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 1 }}
          onClick={handleInitiateTradeCompletion}
        >
          Mark Trade as Completed
        </Button>
      )}
    </Box>

    {/* Feedback Dialog */}
    <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
      <DialogTitle>Provide Feedback</DialogTitle>
      <DialogContent>
        <Typography>Please rate your experience with {otherParticipant.username}:</Typography>
        <Rating
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
        />
        <TextField
          label="Comment (optional)"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmitFeedback} disabled={rating === 0}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  );
};

export default MessageDetailPage;
