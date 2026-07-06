import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, subtitle, action, children }) => {
  return (
    <div className="erp-card chart-card">
      <div className="chart-card-header">
        <div>
          <h3 className="chart-card-title">{title}</h3>
          {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
        </div>
        {action && (
          <div className="chart-card-action">
            {action}
          </div>
        )}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
