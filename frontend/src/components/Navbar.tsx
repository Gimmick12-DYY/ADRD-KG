import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    <AppBar 
      position="fixed" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 70 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 'auto', 
              cursor: 'pointer',
              color: 'primary.main'
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                mr: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)',
              }}
            >
              <Psychology sx={{ fontSize: '1.5rem', color: 'white' }} />
            </Box>
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.5px',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              ADRD INFO ATLAS
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              ADRD
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  startIcon={!isMobile ? item.icon : null}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'rgba(21, 101, 192, 0.08)' : 'transparent',
                    px: 2,
                    py: 1,
                    minWidth: isMobile ? 48 : 64,
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(21, 101, 192, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                      color: 'primary.main',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isMobile ? item.icon : item.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
