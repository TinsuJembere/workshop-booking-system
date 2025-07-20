import React from "react";
import { Box, Toolbar as MuiToolbar, AppBar, IconButton, Typography, Badge, Menu, MenuItem, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import moment from "moment";

const Layout = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const unreadCount = notifications.filter(n => !n.read).length;

  const API_BASE = 'https://workshop-booking-system-1.onrender.com';

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`https://workshop-booking-system-1.onrender.com/api/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem("admin-token");
      await fetch(`https://workshop-booking-system-1.onrender.com/api/users/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {}
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Custom Header */}
        <AppBar position="static" elevation={0} color="inherit" sx={{ mb: 3, boxShadow: 'none', background: 'transparent' }}>
          <MuiToolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#3b3bff' }}>
              Workshop Bookings
            </Typography>
            <Badge badgeContent={unreadCount} color="error">
              <IconButton color="default" sx={{ mx: 1 }} onClick={handleOpen}>
                {unreadCount > 0 ? <NotificationsActiveIcon fontSize="medium" /> : <NotificationsNoneIcon fontSize="medium" />}
              </IconButton>
            </Badge>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <MenuItem disabled>Notifications</MenuItem>
              <List dense sx={{ minWidth: 320, maxHeight: 400, overflow: 'auto' }}>
                {loading ? (
                  <ListItem><ListItemText primary="Loading..." /></ListItem>
                ) : error ? (
                  <ListItem><ListItemText primary={error} /></ListItem>
                ) : notifications.length === 0 ? (
                  <ListItem><ListItemText primary="No notifications" /></ListItem>
                ) : notifications.map(n => (
                  <ListItem key={n.id} button onClick={() => { handleMarkRead(n.id); handleClose(); }} selected={!n.read}>
                    <ListItemIcon>{n.read ? <NotificationsNoneIcon fontSize="small" /> : <NotificationsActiveIcon color="error" fontSize="small" />}</ListItemIcon>
                    <ListItemText
                      primary={n.message}
                      secondary={moment(n.createdAt).fromNow()}
                    />
                  </ListItem>
                ))}
              </List>
            </Menu>
          </MuiToolbar>
        </AppBar>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 