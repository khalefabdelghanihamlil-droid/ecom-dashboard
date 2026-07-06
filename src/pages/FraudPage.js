import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { getFraudStats, getTopRisks, getFraudTendances } from '../api';
import StatCard from '../components/common/StatCard';
import { ShieldAlert, Users, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FraudPage = () => {
  const [stats, setStats] = useState(null);
  const [topRisks, setTopRisks] = useState([]);
  const [tendances, setTendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, risksData, tendancesData] = await Promise.all([
          getFraudStats(),
          getTopRisks(),
          getFraudTendances(14) // Tendances sur 14 jours
        ]);
        setStats(statsData);
        setTopRisks(risksData || []);
        setTendances(tendancesData || []);
      } catch (error) {
        console.error("Erreur chargement fraude:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const columns = [
    { header: 'ID', accessor: 'id', width: '80px' },
    { header: 'Client', cell: (row) => `${row.nom || ''} ${row.prenom || ''}`.trim() || 'Inconnu' },
    { header: 'Téléphone', accessor: 'telephone' },
    { header: 'Score Risque', cell: (row) => <span style={{ color: row.score_risque >= 60 ? '#ef4444' : row.score_risque >= 30 ? '#fbbf24' : '#10b981', fontWeight: 'bold' }}>{row.score_risque}</span> },
    { header: 'Total Commandes', accessor: 'total_commandes', align: 'center' },
    { header: 'Taux Retour', accessor: 'taux_retour', align: 'center' },
    { header: 'Blacklist', cell: (row) => <StatusBadge status={row.blackliste ? 'rejetee_blacklist' : 'confirmee'} /> }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Moteur Anti-Fraude</h1>
          <p className="page-subtitle">Surveillance des scores de risque et blocage des fraudeurs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          title="Taux de Fraude" 
          value={stats ? stats.taux_fraude : '...'} 
          icon={<ShieldAlert size={24} />}
          color="rose"
        />
        <StatCard 
          title="Commandes Bloquées" 
          value={stats ? stats.commandes_rejetees : '...'} 
          icon={<AlertTriangle size={24} />}
          color="amber"
        />
        <StatCard 
          title="Score Risque Moyen" 
          value={stats ? stats.score_risque_moyen : '...'} 
          icon={<Activity size={24} />}
          color="indigo"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', height: '350px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: '#f8fafc' }}>Évolution de la Fraude (14 jours)</h3>
          {tendances.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendances} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFakes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 46, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="commandes_fake" name="Fake Orders" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFakes)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>Chargement du graphique...</div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#818cf8" />
          Top 10 Clients à Risque
        </h3>
        <DataTable 
          columns={columns} 
          data={topRisks} 
          loading={loading} 
          emptyMessage="Aucun client à risque détecté."
        />
      </div>
    </Layout>
  );
};

export default FraudPage;
