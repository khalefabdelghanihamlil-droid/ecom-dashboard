import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const styles = {
    base: {
      background: 'linear-gradient(90deg, var(--bg-surface-elevated) 25%, var(--border-subtle) 50%, var(--bg-surface-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
    },
    card: {
      height: '120px',
      width: '100%',
    },
    row: {
      height: '40px',
      width: '100%',
      marginBottom: '12px',
    },
    chart: {
      height: '300px',
      width: '100%',
    }
  };

  // Ajout de l'animation globale si elle n'existe pas
  if (typeof document !== 'undefined' && !document.getElementById('skeleton-keyframes')) {
    const style = document.createElement('style');
    style.id = 'skeleton-keyframes';
    style.innerHTML = `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const elements = Array.from({ length: count }, (_, i) => (
    <div key={i} style={{ ...styles.base, ...styles[type] }}></div>
  ));

  return <>{elements}</>;
};

export default LoadingSkeleton;
