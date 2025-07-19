import React from "react";
import { Box, Toolbar as MuiToolbar, AppBar, IconButton } from "@mui/material";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const Layout = () => (
  <Box sx={{ display: "flex" }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <AppBar position="static" elevation={0} color="inherit" sx={{ mb: 3, boxShadow: 'none', background: 'transparent' }}>
        <MuiToolbar sx={{ justifyContent: 'flex-end', minHeight: 56 }}>
          <IconButton color="default" sx={{ mx: 1 }}>
            <NotificationsNoneIcon fontSize="medium" />
          </IconButton>
          <IconButton color="default" sx={{ mx: 1 }}>
            <SettingsOutlinedIcon fontSize="medium" />
          </IconButton>
          <IconButton color="default" sx={{ mx: 1 }}>
            <AccountCircleOutlinedIcon fontSize="medium" />
          </IconButton>
        </MuiToolbar>
      </AppBar>
      <Outlet />
    </Box>
  </Box>
);

export default Layout; 