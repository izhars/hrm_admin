// src/component/NotificationCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  CheckCircleOutline,
  DeleteOutline,
  NotificationsActive,
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
} from '@mui/icons-material';

const typeIcon = {
  success: <CheckCircleOutline color="success" />,
  warning: <WarningAmber color="warning" />,
  error: <ErrorOutline color="error" />,
  info: <InfoOutlined color="info" />,
  system: <NotificationsActive color="primary" />,
};

export default function NotificationCard({
  notification,
  onRead,
  onDelete,
  onClick,
  highlight = false,
}) {
  const { title, message, createdAt, type, read, link } = notification;

  return (
    <Card
      sx={{
        borderRadius: 3,
        mb: 2,
        cursor: 'pointer',
        boxShadow: read ? 0 : 4,
        backgroundColor: highlight
          ? 'rgba(34,197,94,0.15)' // green glow for new
          : read
          ? 'background.paper'
          : 'rgba(59,130,246,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 6,
        },
      }}
      onClick={() => onClick?.(link)}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ mt: 0.5 }}>{typeIcon[type] || typeIcon.info}</Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {message}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {new Date(createdAt).toLocaleString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!read && (
            <Tooltip title="Mark as Read">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead();
                }}
              >
                <CheckCircleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
