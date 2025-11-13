import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import Login from './Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(authService.isAuthenticated());
    setIsChecking(false);

    // Listen for storage changes (when login happens in another tab/window)
    const handleStorageChange = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isChecking) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

