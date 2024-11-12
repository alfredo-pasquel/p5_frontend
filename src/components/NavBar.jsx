// src/components/NavBar.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar, Toolbar, IconButton, Button, Menu, MenuItem, Badge, Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';

const NavBar = ({ onNavigate, isLoggedIn }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalIdRef = useRef(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (isLoggedIn) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('https://p5-backend-xidu.onrender.com/api/messages/unread-count', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUnreadCount(response.data.unreadCount);
          console.log('Fetched unreadCount:', response.data.unreadCount);
        } catch (error) {
          console.error('Error fetching unread messages:', error);
        }
      }
    };

    fetchUnreadMessages();

    // Set up polling every 30 seconds
    if (isLoggedIn) {
      intervalIdRef.current = setInterval(fetchUnreadMessages, 15000); // Fetch every 15 seconds
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [isLoggedIn]);

  return (
    <AppBar position="static" sx={{ mb: 1 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 3 }}>
          {isLoggedIn && (
            <>
              <Button color="inherit" onClick={() => onNavigate('list-record')}>List Record</Button>
              <Badge color="error" badgeContent={unreadCount}>
                <Button color="inherit" onClick={() => onNavigate('messages')}>
                  Messages
                </Button>
              </Badge>
              <Button color="inherit" onClick={() => onNavigate('profile')}>Profile</Button>
            </>
          )}
        </Box>

        <Box sx={{ position: 'absolute', right: 16 }}>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {isLoggedIn
            ? [
                <MenuItem key="logout" onClick={() => { handleMenuClose(); onNavigate('logout'); }}>Log Out</MenuItem>,
              ]
            : [
                <MenuItem key="login" onClick={() => { handleMenuClose(); onNavigate('login'); }}>Log In</MenuItem>,
              ]
          }
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
