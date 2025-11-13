import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Home,
  Storage,
  Article,
  CloudUpload,
  Analytics,
  Psychology,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  const menuItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Datasets', path: '/datasets', icon: <Storage /> },
    { label: 'Publications', path: '/publications', icon: <Article /> },
    { label: 'Contribute', path: '/contribute', icon: <CloudUpload /> },
    { label: 'Analytics', path: '/analytics', icon: <Analytics /> },
  ];

  if (isAuthenticated) {
    menuItems.push({ label: 'Management', path: '/management', icon: <AdminPanelSettings /> });
  }

  return (
    <AppBar position="fixed" elevation={2} sx={{ width: '100%', top: 0, left: 0, right: 0 }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 'auto' }}>
          <Psychology sx={{ mr: 1, fontSize: '1.5rem' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold' }}
          >
            ADRD INFO ATLAS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
