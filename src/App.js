import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import ClientsPage from './pages/ClientsPage';
import DeliveryPage from './pages/DeliveryPage';
import FraudPage from './pages/FraudPage';
import FinancePage from './pages/FinancePage';
import ProductsPage from './pages/ProductsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';

import './App.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Route PUBLIQUE */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes PROTÉGÉES (Single Admin Login) : accessibles uniquement
              avec un jeton valide, sinon redirection vers /login. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/fraud" element={<FraudPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Route inconnue -> redirection vers le Dashboard (puis /login si non connecté) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
