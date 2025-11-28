import React, { useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../api/config';
import NotificationApi from '../api/NotificationApi'; // ✅ your API class using ApiBase

const NotificationCount = ({ navbarTheme, isDarkMode }) => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        console.log('[NotificationCount] Fetching notifications...');

        const res = await NotificationApi.getMyNotifications({
          page: 1,
          limit: 50,
        });

        const array = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data?.data)
          ? res.data.data.data
          : [];

        const unreadCount = array.filter((n) => !n.read).length;
        setCount(unreadCount);
        console.log(`[NotificationCount] Unread count: ${unreadCount}`);
      } catch (err) {
        console.error('[NotificationCount] Fetch error:', err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <IconButton
      color="inherit"
      onClick={() => {
        console.log('[NotificationCount] Navigating to /admin/notifications');
        navigate('/admin/notifications');
      }}
      size="small"
      sx={{
        color: navbarTheme.secondaryColor,
        '&:hover': { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' },
        minWidth: '40px',
        width: '40px',
        height: '40px'
      }}
    >
      <Badge badgeContent={count} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '10px' } }}>
        <NotificationsOutlined fontSize="small" />
      </Badge>
    </IconButton>
  );
};

export default NotificationCount;
