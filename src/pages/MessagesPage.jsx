// src/pages/MessagesPage.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, Badge } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);

        const response = await axios.get('http://localhost:5001/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const calculateUnreadMessages = (conversation) => {
    let unreadCount = 0;
    conversation.messages.forEach((msg) => {
      if (!msg.readBy.includes(userId) && msg.sender._id !== userId) {
        unreadCount += 1;
      }
    });
    return unreadCount;
  };

  const hasPendingTradeConfirmation = (conversation) => {
    const tradeStatus = conversation.tradeStatus;
    return (
      tradeStatus &&
      !tradeStatus.isCompleted &&
      tradeStatus.initiatedBy &&
      tradeStatus.initiatedBy._id !== userId
    );
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>Your Conversations</Typography>
      <List>
        {conversations.map((conv) => {
          const otherParticipant = conv.participants.find(
            (p) => p._id !== userId
          );
          const unreadCount = calculateUnreadMessages(conv);
          const hasPendingTrade = hasPendingTradeConfirmation(conv);

          const totalNotifications = unreadCount + (hasPendingTrade ? 1 : 0);

          return (
            <ListItem
              key={conv._id}
              button
              onClick={() => navigate(`/messages/${conv._id}`)}
            >
              <Badge color="error" badgeContent={totalNotifications} sx={{ mr: 2 }}>
                <Avatar
                  src={conv.recordId.coverUrl}
                  alt={conv.recordId.title}
                />
              </Badge>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: totalNotifications > 0 ? 'bold' : 'normal' }}
                  >
                    {otherParticipant.username}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: totalNotifications > 0 ? 'bold' : 'normal' }}
                  >
                    {conv.recordId.title}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default MessagesPage;
