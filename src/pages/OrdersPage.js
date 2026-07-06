import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ShoppingCart, DollarSign, AlertTriangle, Eye } from 'lucide-react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import StatCard from '../components/common/StatCard';
import OrderFormModal from '../components/orders/OrderFormModal';
import OrderDetailModal from '../components/orders/OrderDetailModal';
import { getCommandes, getCommandeStats } from '../api';
import { toOrderTableRows, STATUT_OPTIONS } from '../services/commande.service';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState(null);

  // Future architecture support (multi-boutiques)
  const currentStoreId = null;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [ordersData, statsData] = await Promise.all([
        getCommandes(1, 100, currentStoreId),
        getCommandeStats(currentStoreId)
      ]);
      setOrders(ordersData?.commandes || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setLoadError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!statutFilter) return orders;
    return orders.filter((order) => order.statut === statutFilter);
  }, [orders, statutFilter]);

  const rows = useMemo(() => toOrderTableRows(filteredOrders), [filteredOrders]);

  const handleOrderSaved = () => {
    setCreateOpen(false);
    fetchOrders();
  };

  const handleStatutChanged = () => {
    setDetailOrderId(null);
    fetchOrders();
  };

  const columns = [
    { header: 'Client', accessor: 'client' },
    { header: 'Email', accessor: 'email' },
    { header: 'Montant', accessor: 'montant' },
    { header: 'Statut', cell: (row) => <StatusBadge status={row.statut} /> },
    { header: 'Score Risque', cell: (row) => (
      <span style={{ color: row.scoreRisque >= 30 ? 'var(--status-error)' : 'var(--text-primary)', fontWeight: row.scoreRisque >= 30 ? 600 : 400 }}>
        {row.scoreRisque}
      </span>
    ) },
    { header: 'Date', accessor: 'date' },
    { header: 'Actions', align: 'right', cell: (row) => (
      <button
        className="erp-btn erp-btn-secondary"
        onClick={(e) => { e.stopPropagation(); setDetailOrderId(row.id); }}
      >
        <Eye size={14} />
        Voir
      </button>
    ) }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Commandes</h1>
          <p className="page-subtitle">Gestion de toutes les commandes et statuts</p>
        </div>
        <button className="erp-btn erp-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Nouvelle Commande
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard
          title="Total Commandes"
          value={loading ? '...' : stats?.total ?? 0}
          icon={<ShoppingCart size={20} />}
          color="indigo"
        />
        <StatCard
          title="CA Total"
          value={loading ? '...' : formatStatCurrency(stats?.ca_total)}
          icon={<DollarSign size={20} />}
          color="emerald"
        />
        <StatCard
          title="Commandes Aujourd'hui"
          value={loading ? '...' : stats?.commandes_aujourd_hui ?? 0}
          icon={<ShoppingCart size={20} />}
          color="cyan"
        />
        <StatCard
          title="Commandes Suspectes"
          value={loading ? '...' : stats?.commandes_fake ?? 0}
          icon={<AlertTriangle size={20} />}
          color="rose"
        />
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label className="form-label" htmlFor="statut-filter">Filtrer par statut :</label>
        <select
          id="statut-filter"
          className="form-input"
          style={{ maxWidth: '240px' }}
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loadError && (
        <div className="erp-card" style={{ padding: '16px 20px', marginBottom: '24px', color: 'var(--status-error)' }}>
          {loadError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="Aucune commande trouvée."
      />

      <OrderFormModal
        open={createOpen}
        storeId={currentStoreId}
        onClose={() => setCreateOpen(false)}
        onSaved={handleOrderSaved}
      />

      <OrderDetailModal
        open={!!detailOrderId}
        orderId={detailOrderId}
        storeId={currentStoreId}
        onClose={() => setDetailOrderId(null)}
        onStatutChanged={handleStatutChanged}
      />
    </Layout>
  );
};

function formatStatCurrency(value) {
  const number = Number(value);
  return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(Number.isFinite(number) ? number : 0) + ' DZD';
}

export default OrdersPage;
