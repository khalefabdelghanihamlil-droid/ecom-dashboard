import React from 'react';
import './StatusBadge.css';

const STATUS_CONFIG = {
  // Vert (Succès)
  'confirmee': { label: 'Confirmée', color: 'success' },
  'livree': { label: 'Livrée', color: 'success' },
  
  // Jaune/Orange (Attente/Alerte)
  'en_attente_otp': { label: 'Attente OTP', color: 'warning' },
  'nouvelle': { label: 'Nouvelle', color: 'warning' },
  
  // Bleu (En cours)
  'expediee': { label: 'Expédiée', color: 'info' },
  'en_preparation': { label: 'Préparation', color: 'info' },
  'en_transit': { label: 'En Transit', color: 'info' },
  
  // Rouge (Erreur/Rejet)
  'rejetee_blacklist': { label: 'Blacklist', color: 'error' },
  'rejetee_otp_echec': { label: 'Échec OTP', color: 'error' },
  'rejetee_auto': { label: 'Rejet Auto', color: 'error' },
  'annulee': { label: 'Annulée', color: 'error' },
  
  // Gris/Neutre
  'retournee': { label: 'Retournée', color: 'neutral' },

  // Statuts Produit
  'actif': { label: 'Actif', color: 'success' },
  'inactif': { label: 'Inactif', color: 'neutral' },
  'en_test': { label: 'En test', color: 'warning' },

  'default': { label: 'Inconnu', color: 'neutral' }
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['default'];
  
  return (
    <span className={`status-badge badge-${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
