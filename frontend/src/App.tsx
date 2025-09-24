import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DatasetsPage from './pages/DatasetsPage';
import PublicationsPage from './pages/PublicationsPage';
import ContributionPage from './pages/ContributionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9b07ebff',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </StrictMode>
  );
}

export default App;
