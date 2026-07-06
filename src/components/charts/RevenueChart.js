import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from '../common/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-strong)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: index === 0 ? '0 0 4px 0' : 0, fontWeight: '600', color: entry.color, fontSize: '14px' }}>
            {entry.name}: {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', maximumFractionDigits: 0 }).format(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <EmptyState title="Pas de données" description="Aucune donnée financière pour cette période." />;
  }

  return (
    <div style={{ height: '320px', width: '100%', marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `${val/1000}k`} 
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="ca" name="CA" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCa)" />
          <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--status-success)" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
