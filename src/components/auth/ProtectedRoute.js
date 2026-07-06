import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth.service';

// Garde de route : laisse passer si un jeton est présent, sinon redirige vers
// /login. Le backend reste l'autorité (un token invalide -> 401 -> redirection
// via l'intercepteur axios).
const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
