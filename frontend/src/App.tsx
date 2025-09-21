import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DatasetsPage from './pages/DatasetsPage';
import PublicationsPage from './pages/PublicationsPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import DocumentationPage from './pages/DocumentationPage';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, pt: { xs: 8, sm: 9 } }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
