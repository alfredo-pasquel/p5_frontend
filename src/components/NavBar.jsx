import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const NavBar = ({ onNavigate, isLoggedIn }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" sx={{ mb: 2 }}>
      <Toolbar>
        <Button color="inherit" onClick={() => onNavigate('saved')}>Saved</Button>
        <Button color="inherit" onClick={() => onNavigate('browse')}>Browse</Button>
        
        {/* Show "List Records" button only if the user is logged in */}
        {isLoggedIn && (
          <Button color="inherit" onClick={() => onNavigate('list-record')}>List Records</Button>
        )}
        
        <IconButton color="inherit" onClick={handleMenuClick} sx={{ ml: 'auto' }}>
          <MenuIcon />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {isLoggedIn
            ? [
                <MenuItem key="profile" onClick={() => { handleMenuClose(); onNavigate('profile'); }}>Profile</MenuItem>,
                <MenuItem key="logout" onClick={() => { handleMenuClose(); onNavigate('logout'); }}>Log Out</MenuItem>
              ]
            : [
                <MenuItem key="login" onClick={() => { handleMenuClose(); onNavigate('login'); }}>Log In</MenuItem>
              ]
          }
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
