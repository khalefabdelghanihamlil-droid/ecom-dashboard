import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatCard from '../components/common/StatCard';
import { getFinanceResume, getProfitParProduit } from '../api';
import { DollarSign, Activity, TrendingUp, RefreshCcw } from 'lucide-react';

const FinancePage = () => {
  const [stats, setStats] = useState(null);
  const [produitsProfit, setProduitsProfit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [resume, produits] = await Promise.all([
          getFinanceResume(),
          getProfitParProduit()
        ]);
        setStats(resume);
        setProduitsProfit(produits || []);
      } catch (error) {
        console.error("Erreur chargement finance:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const productColumns = [
    { header: 'ID Produit', accessor: 'id', width: '80px' },
    { header: 'Nom Produit', accessor: 'nom' },
    { header: 'Commandes', accessor: 'commandes', align: 'center' },
    { header: 'CA Généré', cell: (row) => `${row.ca} DZD` },
    { header: 'Profit Net', cell: (row) => <span style={{ color: '#10b981', fontWeight: 'bold' }}>{row.profit} DZD</span> },
    { header: 'Marge', cell: (row) => <span style={{ color: '#818cf8', fontWeight: 'bold' }}>{row.marge}</span> }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyse Financière</h1>
          <p className="page-subtitle">Détail des marges, coûts et ROAS</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          title="Profit Net Total" 
          value={stats ? `${stats.total_profit} DZD` : '...'} 
          icon={<DollarSign size={24} />}
          color="emerald"
        />
        <StatCard 
          title="Marge Moyenne" 
          value={stats ? `${stats.marge_moyenne}%` : '...'} 
          icon={<TrendingUp size={24} />}
          color="indigo"
        />
        <StatCard 
          title="ROAS Global" 
          value={stats ? stats.roas_global : '...'} 
          icon={<Activity size={24} />}
          color="rose"
        />
        <StatCard 
          title="Coûts Livraison" 
          value={stats ? `${stats.couts?.livraison || 0} DZD` : '...'} 
          icon={<RefreshCcw size={24} />}
          color="amber"
        />
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc' }}>Rentabilité par Produit</h3>
        <DataTable 
          columns={productColumns} 
          data={produitsProfit} 
          loading={loading} 
          emptyMessage="Aucune donnée produit disponible."
        />
      </div>
    </Layout>
  );
};

export default FinancePage;
