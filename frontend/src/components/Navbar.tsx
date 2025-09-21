import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ArrowDropDown,
  Dataset,
  Article,
  AccountTree,
  Description
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [datasetMenuAnchor, setDatasetMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDatasetMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDatasetMenuAnchor(event.currentTarget);
  };

  const handleDatasetMenuClose = () => {
    setDatasetMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleDatasetMenuClose();
    setMobileDrawerOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { label: 'Home', path: '/', icon: null },
    { 
      label: 'Datasets', 
      path: '/datasets', 
      icon: <Dataset />,
      submenu: [
        { label: 'Browse All', path: '/datasets' },
        { label: 'By Disease Type', path: '/datasets?filter=disease' },
        { label: 'By Modality', path: '/datasets?filter=modality' }
      ]
    },
    { label: 'Publications', path: '/publications', icon: <Article /> },
    { label: 'Knowledge Graph', path: '/knowledge-graph', icon: <AccountTree /> },
    { label: 'Documentation', path: '/documentation', icon: <Description /> },
  ];

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          bgcolor: 'primary.main',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          ADRD Knowledge Graph
        </Typography>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.icon && <Box sx={{ mr: 2 }}>{item.icon}</Box>}
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: isMobile ? 1 : 0,
              mr: isMobile ? 0 : 4,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => handleNavigation('/')}
          >
            ADRD Knowledge Graph
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => handleNavigation('/')}
                sx={{
                  fontWeight: isActive('/') ? 700 : 400,
                  borderBottom: isActive('/') ? '2px solid white' : 'none',
                }}
              >
                Home
              </Button>

              <Button
                color="inherit"
                onClick={handleDatasetMenuOpen}
                endIcon={<ArrowDropDown />}
                sx={{
                  fontWeight: location.pathname.startsWith('/datasets') ? 700 : 400,
                  borderBottom: location.pathname.startsWith('/datasets') ? '2px solid white' : 'none',
                }}
              >
                Datasets
              </Button>

              <Button
                color="inherit"
                onClick={() => handleNavigation('/publications')}
                sx={{
                  fontWeight: isActive('/publications') ? 700 : 400,
                  borderBottom: isActive('/publications') ? '2px solid white' : 'none',
                }}
              >
                Publications
              </Button>

              <Button
                color="inherit"
                onClick={() => handleNavigation('/knowledge-graph')}
                sx={{
                  fontWeight: isActive('/knowledge-graph') ? 700 : 400,
                  borderBottom: isActive('/knowledge-graph') ? '2px solid white' : 'none',
                }}
              >
                Knowledge Graph
              </Button>

              <Button
                color="inherit"
                onClick={() => handleNavigation('/documentation')}
                sx={{
                  fontWeight: isActive('/documentation') ? 700 : 400,
                  borderBottom: isActive('/documentation') ? '2px solid white' : 'none',
                }}
              >
                Documentation
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Dataset Dropdown Menu */}
      <Menu
        anchorEl={datasetMenuAnchor}
        open={Boolean(datasetMenuAnchor)}
        onClose={handleDatasetMenuClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleNavigation('/datasets')}>
          Browse All Datasets
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/datasets?filter=disease')}>
          Filter by Disease Type
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/datasets?filter=modality')}>
          Filter by Modality
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <MobileDrawer />
    </>
  );
};

export default Navbar;
