import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = 'primary', trend = null, isCurrency = false, suffix = '' }) => {
  const isPositive = trend > 0;
  
  // Fonction utilitaire pour formater les valeurs
  const formatValue = (val) => {
    if (val === undefined || val === null || val === '...') return '...';
    if (isCurrency) {
      return new Intl.NumberFormat('fr-DZ', { 
        style: 'currency', 
        currency: 'DZD',
        maximumFractionDigits: 0
      }).format(val).replace('DZD', '').trim() + ' DZD';
    }
    return val + suffix;
  };

  return (
    <div className={`erp-card stat-card color-${color}`}>
      <div className="stat-card-header">
        <h3 className="stat-card-title">{title}</h3>
        <div className={`stat-card-icon icon-${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="stat-card-body">
        <div className="stat-card-value">
          {formatValue(value)}
        </div>
        
        {trend !== null && trend !== undefined && (
          <div className={`stat-card-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend)}%</span>
            <span className="trend-label">vs mois dernier</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
