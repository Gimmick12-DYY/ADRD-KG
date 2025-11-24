import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DatasetsPage from './pages/DatasetsPage';
import PublicationsPage from './pages/PublicationsPage';
import ContributionPage from './pages/ContributionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ManagementPage from './pages/ManagementPage';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0', // Scientific Blue
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00897b', // Teal
      light: '#4ebaaa',
      dark: '#005b4f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2027',
      secondary: '#5f7181',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

function App() {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, pt: 10 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/datasets" element={<DatasetsPage />} />
                <Route path="/publications" element={<PublicationsPage />} />
                <Route path="/contribute" element={<ContributionPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route
                  path="/management"
                  element={
                    <ProtectedRoute>
                      <ManagementPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
