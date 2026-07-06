import React, { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Package, Activity, Users, RotateCcw, Truck, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import DashboardHeader from '../components/layout/DashboardHeader';
import StatCard from '../components/common/StatCard';
import ChartCard from '../components/common/ChartCard';
import RevenueChart from '../components/charts/RevenueChart';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import kpiService from '../services/kpi.service';
import { getCommandes, getProfitEvolution } from '../services/api.service';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // Future architecture support
  const currentStoreId = null;

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardKpis, ordersData, evoData] = await Promise.all([
        kpiService.getDashboardKpis(currentStoreId),
        getCommandes(1, 8, currentStoreId), // Les 8 dernières commandes
        getProfitEvolution(7, currentStoreId) // 7 derniers jours
      ]);
      
      setKpis(dashboardKpis);
      setRecentOrders(ordersData?.commandes || []);
      setChartData(evoData || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh auto 1 min
    return () => clearInterval(interval);
  }, []);

  // Colonnes alignées sur les champs réellement renvoyés par GET /commandes
  // (jointure client uniquement ; pas de livraison/produit dans cette payload).
  const orderColumns = [
    { header: 'ID', cell: (row) => `#${String(row.id).slice(0, 8)}`, width: '90px' },
    { header: 'Client', cell: (row) => `${row.client?.nom || ''} ${row.client?.prenom || ''}`.trim() || row.client?.telephone || row.email || 'Client inconnu' },
    { header: 'Montant', cell: (row) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(row.montant || 0) },
    { header: 'Score', cell: (row) => row.score_risque_calcule ?? 0 },
    { header: 'Statut', cell: (row) => <StatusBadge status={row.statut} /> },
    { header: 'Date', align: 'right', cell: (row) => row.date_commande ? new Date(row.date_commande).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short' }) : '-' }
  ];

  return (
    <Layout>
      <DashboardHeader 
        title="Vue d'ensemble" 
        subtitle="Pilotez votre activité e-commerce en temps réel"
        onRefresh={loadData}
        loading={loading}
      />

      {loading && !kpis ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <LoadingSkeleton type="card" count={8} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <StatCard 
            title={kpis?.revenue.label} 
            value={kpis?.revenue.value} 
            icon={<DollarSign size={20} />}
            color="primary"
            trend={kpis?.revenue.trend}
            isCurrency={kpis?.revenue.isCurrency}
          />
          <StatCard 
            title={kpis?.profit.label} 
            value={kpis?.profit.value} 
            icon={<Activity size={20} />}
            color="emerald"
            trend={kpis?.profit.trend}
            isCurrency={kpis?.profit.isCurrency}
          />
          <StatCard 
            title={kpis?.orders.label} 
            value={kpis?.orders.value} 
            icon={<ShoppingCart size={20} />}
            color="indigo"
            trend={kpis?.orders.trend}
          />
          <StatCard 
            title={kpis?.roas.label} 
            value={kpis?.roas.value} 
            icon={<Package size={20} />}
            color="cyan"
            trend={kpis?.roas.trend}
          />
          <StatCard 
            title={kpis?.pending.label} 
            value={kpis?.pending.value} 
            icon={<Clock size={20} />}
            color="amber"
            trend={kpis?.pending.trend}
          />
          <StatCard 
            title={kpis?.delivered.label} 
            value={kpis?.delivered.value} 
            icon={<Truck size={20} />}
            color="emerald"
            trend={kpis?.delivered.trend}
          />
          <StatCard 
            title={kpis?.returnRate.label} 
            value={kpis?.returnRate.value} 
            icon={<RotateCcw size={20} />}
            color="rose"
            trend={kpis?.returnRate.trend}
            suffix={kpis?.returnRate.suffix}
          />
          <StatCard 
            title={kpis?.clients.label} 
            value={kpis?.clients.value} 
            icon={<Users size={20} />}
            color="violet"
            trend={kpis?.clients.trend}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Graphique Pleine Largeur */}
        <ChartCard 
          title="Évolution Financière" 
          subtitle="Chiffre d'affaires et Profit net sur les 7 derniers jours"
        >
          {loading && chartData.length === 0 ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <RevenueChart data={chartData} />
          )}
        </ChartCard>
        
        {/* Tableau des commandes récentes */}
        <div className="erp-card" style={{ padding: '24px' }}>
           <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
             Dernières Commandes
           </h3>
           <DataTable 
             columns={orderColumns} 
             data={recentOrders} 
             loading={loading && recentOrders.length === 0}
             emptyMessage="Aucune commande récente trouvée pour cette boutique."
           />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
