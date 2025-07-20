import React, { useContext } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, ListItemButton } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from '@mui/icons-material/People';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import { Avatar, Typography, Box } from "@mui/material";

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Workshops", icon: <EventNoteIcon />, path: "/workshops" },
  { text: "Time Slots", icon: <AccessTimeIcon />, path: "/timeslots" },
  { text: "Bookings", icon: <BookOnlineIcon />, path: "/bookings" },
  { text: "Users", icon: <PeopleIcon />, path: "/users" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 220, sm: 240, md: 260 },
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: { xs: 220, sm: 240, md: 260 },
          boxSizing: "border-box",
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <div>
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </div>
      {/* User Info Card at the bottom */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, mb: 2, boxShadow: 1, borderRadius: 2, background: '#fff' }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'grey.300', fontWeight: 700 }}>
          {user?.name ? user.name[0].toUpperCase() : 'A'}
        </Avatar>
        <Box>
          <Typography fontWeight={700} fontSize={16}>
            {user?.name || 'Admin User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'admin@workshopbookings.com'}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 