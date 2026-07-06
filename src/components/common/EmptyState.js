import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon = <PackageOpen size={48} strokeWidth={1.5} />, 
  title = "Aucune donnée", 
  description = "Il n'y a actuellement aucune donnée à afficher ici." 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        marginBottom: '16px',
        color: 'var(--border-strong)'
      }}>
        {icon}
      </div>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '500',
        color: 'var(--text-primary)',
        margin: '0 0 8px 0'
      }}>
        {title}
      </h4>
      <p style={{
        fontSize: '14px',
        maxWidth: '300px',
        margin: '0'
      }}>
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
