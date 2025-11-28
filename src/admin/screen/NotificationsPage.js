// src/pages/AdminNotifications.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Pagination,
  Stack,
  Skeleton,
  Fade,
  Divider,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import NotificationCard from '../component/NotificationCard';
import NotificationApi from '../api/NotificationApi';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { BASE_URL } from '../api/config';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({ type: '', read: '' });
  const [loading, setLoading] = useState(true);
  const [newHighlightId, setNewHighlightId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await NotificationApi.getMyNotifications({
        page,
        limit,
        type: filter.type,
        read: filter.read,
      });

      const array = Array.isArray(res.data?.data) 
        ? res.data.data 
        : Array.isArray(res.data) 
        ? res.data 
        : [];
      
      setNotifications(array);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Socket.IO connection with best practices
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Create socket connection once
    socketRef.current = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.emit('register', userId);

    socketRef.current.on('notification:new', (newNotification) => {
      setNotifications((prev) => {
        // Prevent duplicates
        if (prev.some(n => n._id === newNotification._id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
      
      setNewHighlightId(newNotification._id);
      
      // Clear previous timeout
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      
      highlightTimeoutRef.current = setTimeout(() => {
        setNewHighlightId(null);
      }, 4000);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await NotificationApi.markAsRead(id);
      
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      
      setSuccessMessage('Notification marked as read');
    } catch (err) {
      console.error('Mark as read error:', err);
      setError('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      
      setSuccessMessage('All notifications marked as read');
    } catch (err) {
      console.error('Mark all as read error:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await NotificationApi.deleteNotification(id);
      
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      
      setSuccessMessage('Notification deleted');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete notification');
    }
  };

  const handleClick = (link, id, read) => {
    // Mark as read when clicked if not already read
    if (!read) {
      handleMarkAsRead(id);
    }
    
    if (link) {
      navigate(link);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        mb={3}
        gap={2}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Typography variant="h5" fontWeight={700}>
            🔔 Notifications
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} Unread`}
              color="primary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} width={{ xs: '100%', sm: 'auto' }}>
          <Select
            value={filter.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="system">System</MenuItem>
          </Select>

          <Select
            value={filter.read}
            onChange={(e) => handleFilterChange('read', e.target.value)}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="false">Unread</MenuItem>
            <MenuItem value="true">Read</MenuItem>
          </Select>

          <Button
            variant="outlined"
            size="small"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Mark All Read
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ mt: 3 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton 
              key={i} 
              variant="rounded" 
              height={100} 
              sx={{ mb: 2, borderRadius: 3 }} 
            />
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'background.default',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            📭 No notifications found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {filter.type || filter.read 
              ? 'Try adjusting your filters' 
              : 'You\'re all caught up!'}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={2}>
            {notifications.map((n) => (
              <Fade key={n._id} in timeout={400}>
                <Box>
                  <NotificationCard
                    notification={n}
                    onRead={() => handleMarkAsRead(n._id)}
                    onDelete={() => handleDelete(n._id)}
                    onClick={handleClick}
                    highlight={newHighlightId === n._id}
                  />
                </Box>
              </Fade>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
