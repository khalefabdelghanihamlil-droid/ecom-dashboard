import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { getLivraisons, syncLivraisons, getLivraisonStats } from '../api';
import StatCard from '../components/common/StatCard';
import ShipOrderModal from '../components/delivery/ShipOrderModal';
import { Package, Truck, CheckCircle, RefreshCw, Send } from 'lucide-react';

const DeliveryPage = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [livraisonsData, statsData] = await Promise.all([
        getLivraisons(),
        getLivraisonStats()
      ]);
      setLivraisons(livraisonsData || []);
      setStats(statsData);
    } catch (error) {
      console.error("Erreur chargement livraisons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await syncLivraisons();
      alert(`Synchronisation terminée : ${res.mis_a_jour} colis mis à jour sur ${res.colis_verifies} vérifiés.`);
      loadData();
    } catch (error) {
      console.error("Erreur sync:", error);
      alert("Erreur lors de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  const columns = [
    { header: 'Tracking ID', accessor: 'tracking_id' },
    { header: 'Transporteur', accessor: 'transporteur' },
    { header: 'Client', cell: (row) => row.commande?.client ? `${row.commande.client.nom || ''} ${row.commande.client.prenom || ''}` : '-' },
    { header: 'Montant (CRBT)', cell: (row) => `${row.commande?.montant || 0} DZD` },
    { header: 'Frais Livraison', cell: (row) => `${row.frais_livraison || 0} DZD` },
    { header: 'Statut', cell: (row) => <StatusBadge status={row.statut_livraison} /> },
    { header: 'Date', cell: (row) => new Date(row.created_at).toLocaleString('fr-DZ') }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Livraisons & Logistique</h1>
          <p className="page-subtitle">Suivi des colis via DHD Express et Yalidine</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="erp-btn erp-btn-primary" onClick={() => setShipOpen(true)}>
            <Send size={16} />
            Expédier une commande
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#6366f1', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
              opacity: syncing ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={syncing ? 'spinner' : ''} style={syncing ? {animation: 'spin 1s linear infinite'} : {}} />
            {syncing ? 'Synchronisation...' : 'Synchroniser Statuts'}
          </button>
        </div>
      </div>

      <ShipOrderModal
        open={shipOpen}
        storeId={null}
        onClose={() => setShipOpen(false)}
        onShipped={loadData}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          title="Total Expédiés" 
          value={stats ? stats.total : '...'} 
          icon={<Package size={24} />}
          color="indigo"
        />
        <StatCard 
          title="Taux Livraison" 
          value={stats ? stats.taux_livraison : '...'} 
          icon={<CheckCircle size={24} />}
          color="emerald"
        />
        <StatCard 
          title="En Transit" 
          value={stats ? (stats.par_statut['en_transit'] || 0) : '...'} 
          icon={<Truck size={24} />}
          color="amber"
        />
      </div>

      <DataTable 
        columns={columns} 
        data={livraisons} 
        loading={loading} 
        emptyMessage="Aucune livraison trouvée."
      />
    </Layout>
  );
};

export default DeliveryPage;
