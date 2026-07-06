import React from 'react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import './DashboardHeader.css';

const DashboardHeader = ({ title, subtitle, onRefresh, loading }) => {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      
      <div className="dashboard-header-actions">
        {/* Placeholder UI pour filtres (TODO Backend: connecter plus tard) */}
        <button className="erp-btn erp-btn-secondary">
          <Calendar size={16} />
          <span>Derniers 30 jours</span>
        </button>
        
        <button className="erp-btn erp-btn-secondary" disabled>
          <Download size={16} />
          <span>Exporter</span>
        </button>

        <button 
          className="erp-btn erp-btn-primary" 
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
