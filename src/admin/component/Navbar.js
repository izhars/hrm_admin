import React, { useContext, useState } from 'react';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { AppBar, Toolbar, Typography, Avatar, Box, IconButton, Menu, MenuItem, Badge, Tooltip, Chip } from '@mui/material';
import { NotificationsOutlined, SettingsOutlined, MenuOutlined, LogoutOutlined, PersonOutlined, DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { useTheme as useMuiTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from "react-router-dom"; // ⬅️ add this at top
import NotificationCount from '../component/NotificationCount';

const Navbar = ({ onMenuClick, isCollapsed, admin: propAdmin }) => {
  const { admin } = useContext(AdminContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const actualAdmin = propAdmin || admin;
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  // inside your component:
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Debug log to check theme state
  console.log('Navbar - Current dark mode:', isDarkMode);

  if (!actualAdmin) return null;

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/';
  };

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked, current state:', isDarkMode);
    toggleTheme();
  };

  const getUserInitials = () => {
    const name = actualAdmin.fullName || actualAdmin.firstName || actualAdmin.email || 'User';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    const roleColors = {
      superadmin: '#e74c3c',
      admin: '#3498db',
      hr: '#2ecc71'
    };
    return roleColors[role] || '#95a5a6';
  };

  const navbarTheme = {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#1e293b',
    borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
    secondaryColor: isDarkMode ? '#94a3b8' : '#64748b'
  };

  const availableWidth = isCollapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 280px)';

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: isMobile ? 0 : (isCollapsed ? '80px' : '280px'),
          width: isMobile ? '100%' : availableWidth,
          right: 0,
          backgroundColor: navbarTheme.backgroundColor,
          color: navbarTheme.color,
          borderBottom: navbarTheme.borderBottom,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200
        }}
      >
        <Toolbar sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px',
          px: { xs: 2, sm: 3 },
          width: '100%'
        }}>
          {/* Left Section */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            minWidth: isMobile ? 'auto' : '200px',
            flexShrink: 0
          }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={onMenuClick}>
                <MenuOutlined />
              </IconButton>
            )}
            <Box sx={{ flexShrink: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: navbarTheme.color,
                  display: { xs: 'none', sm: 'block' },
                  whiteSpace: 'nowrap'
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: navbarTheme.secondaryColor,
                  display: { xs: 'none', md: 'block' },
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Welcome, {actualAdmin.fullName || actualAdmin.firstName || 'User'}
              </Typography>
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
            pr: 2,
            minWidth: '200px'
          }}>
            {/* Theme Toggle */}
            <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                color="inherit"
                onClick={handleThemeToggle}
                size="small"
                sx={{
                  color: navbarTheme.secondaryColor,
                  '&:hover': {
                    backgroundColor: isDarkMode ? '#334155' : '#f1f5f9'
                  },
                  minWidth: '40px',
                  width: '40px',
                  height: '40px'
                }}
              >
                {isDarkMode ? <LightModeOutlined /> : <DarkModeOutlined />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationCount navbarTheme={navbarTheme} isDarkMode={isDarkMode} />
            </Box>

            {/* Settings - Hide on very small screens */}
            {!isMobile && (
              <Tooltip title="Settings">
                <IconButton
                  color="inherit"
                  size="small"
                  sx={{
                    color: navbarTheme.secondaryColor,
                    '&:hover': { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' },
                    minWidth: '40px',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <SettingsOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* User Profile Section */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderLeft: `1px solid ${navbarTheme.borderBottom}`,
              pl: 1.5,
              pr: 1
            }}>
              {/* User Info - Show only when there's enough space */}
              <Box sx={{
                display: isMobile ? 'none' : (isCollapsed ? 'none' : 'flex'),
                flexDirection: 'column',
                alignItems: 'flex-end',
                mr: 1,
                minWidth: 0
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: navbarTheme.color,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px'
                  }}
                >
                  {actualAdmin.fullName || actualAdmin.firstName || 'Admin User'}
                </Typography>
                <Chip
                  label={actualAdmin.role?.toUpperCase() || 'USER'}
                  size="small"
                  sx={{
                    height: '20px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: getRoleColor(actualAdmin.role),
                    color: 'white',
                    '& .MuiChip-label': { px: 0.5, py: 0 },
                    mt: 0.5
                  }}
                />
              </Box>

              {/* Avatar - Always visible */}
              <Tooltip title={isCollapsed ? `${actualAdmin.fullName || actualAdmin.firstName || 'User'} • ${actualAdmin.role}` : "Account settings"}>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  sx={{
                    p: 0.5,
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s ease',
                    minWidth: '40px',
                    width: '40px',
                    height: '40px'
                  }}
                >
                  <Avatar
                    src={actualAdmin.profilePicture || ''}
                    sx={{
                      bgcolor: getRoleColor(actualAdmin.role),
                      width: 32,
                      height: 32,
                      fontSize: '12px',
                      border: `2px solid ${navbarTheme.borderBottom}`
                    }}
                  >
                    {!actualAdmin.profilePicture && getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            border: `1px solid ${navbarTheme.borderBottom}`,
            backgroundColor: navbarTheme.backgroundColor,
            '& .MuiMenuItem-root': {
              px: 2, py: 1.5, borderRadius: 1, mx: 1, my: 0.5,
              '&:hover': { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' },
              color: navbarTheme.color
            },
            '& .MuiTypography-root': {
              color: navbarTheme.color
            },
            '& .MuiTypography-caption': {
              color: navbarTheme.secondaryColor
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${navbarTheme.borderBottom}` }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {actualAdmin.fullName || actualAdmin.firstName || 'Admin User'}
          </Typography>
          <Typography variant="caption">
            {actualAdmin.email}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfileMenuClose}>
          <PersonOutlined sx={{ mr: 2, fontSize: 20 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsOutlined sx={{ mr: 2, fontSize: 20 }} />
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProfileMenuClose();
            handleLogout();
          }}
          sx={{
            color: '#ef4444',
            '&:hover': {
              backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2'
            }
          }}
        >
          <LogoutOutlined sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;