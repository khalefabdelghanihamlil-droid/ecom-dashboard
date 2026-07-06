import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, ShieldAlert, DollarSign, Tag, Settings, LogOut } from 'lucide-react';
import { logout } from '../../services/auth.service';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/orders', name: 'Commandes', icon: <ShoppingCart size={20} /> },
    { path: '/clients', name: 'Clients', icon: <Users size={20} /> },
    { path: '/delivery', name: 'Livraisons', icon: <Package size={20} /> },
    { path: '/fraud', name: 'Anti-Fraude', icon: <ShieldAlert size={20} /> },
    { path: '/finance', name: 'Finance', icon: <DollarSign size={20} /> },
    { path: '/products', name: 'Produits', icon: <Tag size={20} /> },
    { path: '/settings', name: 'Paramètres', icon: <Settings size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">ECOM-CORE</div>
        <div className="version">v1.0.0</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="dot"></span>
          Système En Ligne
        </div>
        <button type="button" className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
