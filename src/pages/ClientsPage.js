import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { getClients, toggleBlacklist } from '../api';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data || []);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleBlacklist = async (id) => {
    try {
      await toggleBlacklist(id);
      fetchClients(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur toggle blacklist:", error);
      alert("Erreur lors de la modification de la blacklist");
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', width: '80px' },
    { header: 'Nom Prénom', cell: (row) => `${row.nom || ''} ${row.prenom || ''}`.trim() || 'Non renseigné' },
    { header: 'Téléphone', accessor: 'telephone' },
    { header: 'Email', cell: (row) => row.email || '-' },
    { header: 'Wilaya', cell: (row) => row.wilaya || '-' },
    { header: 'Score Risque', accessor: 'score_risque' },
    { header: 'Statut Blacklist', cell: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <StatusBadge status={row.blackliste ? 'rejetee_blacklist' : 'confirmee'} />
        <button 
          onClick={(e) => { e.stopPropagation(); handleToggleBlacklist(row.id); }}
          style={{
            background: row.blackliste ? '#10b981' : '#ef4444',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          {row.blackliste ? 'Dé-blacklister' : 'Blacklister'}
        </button>
      </div>
    )}
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients & Blacklist</h1>
          <p className="page-subtitle">Gérez vos clients et bloquez les fraudeurs</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={clients} 
        loading={loading} 
        emptyMessage="Aucun client trouvé."
      />
    </Layout>
  );
};

export default ClientsPage;
