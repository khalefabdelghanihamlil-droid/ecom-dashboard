import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getSettings } from '../api';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  ShoppingBag,
  MessageSquare,
  ShieldAlert,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

/**
 * Page Paramètres — Tableau de bord de préparation au déploiement.
 * Consomme GET /settings (ecom-core/src/services/settings.service.js), qui
 * n'expose QUE des booléens de configuration (jamais de secret).
 */

// Indicateur binaire réutilisable (configuré / non configuré).
const Indicator = ({ ok, okLabel = 'Configuré', koLabel = 'Non configuré' }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '13px',
      fontWeight: 600,
      color: ok ? 'var(--status-success)' : 'var(--status-error)'
    }}
  >
    {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
    {ok ? okLabel : koLabel}
  </span>
);

// Ligne clé/valeur d'une carte de configuration.
const ConfigRow = ({ label, children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border-subtle)'
    }}
  >
    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
      {children}
    </span>
  </div>
);

// Carte de section (même style que les autres pages : .erp-card).
const ConfigCard = ({ title, icon, children }) => (
  <div className="erp-card" style={{ padding: '24px' }}>
    <h3
      style={{
        margin: '0 0 8px 0',
        fontSize: '16px',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {icon}
      {title}
    </h3>
    <div>{children}</div>
  </div>
);

const SettingsPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getSettings();
      setConfig(data);
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const warnings = config?.warnings || [];
  const carriers = config?.carriers || {};

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres &amp; Configuration</h1>
          <p className="page-subtitle">État de préparation du système au déploiement</p>
        </div>
        <button
          className="erp-btn erp-btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Actualiser</span>
        </button>
      </div>

      {loading && !config ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}
        >
          <LoadingSkeleton type="card" count={3} />
        </div>
      ) : error ? (
        <div className="erp-card" style={{ padding: '24px' }}>
          <EmptyState
            icon={<AlertTriangle size={48} strokeWidth={1.5} />}
            title="Impossible de charger la configuration"
            description="Le backend (/settings) est injoignable. Vérifiez que le serveur ecom-core est démarré."
          />
        </div>
      ) : (
        <>
          {/* KPIs de préparation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}
          >
            <StatCard
              title="Prêt pour la Production"
              value={config?.ready_for_production ? 'Oui' : 'Non'}
              icon={<SettingsIcon size={20} />}
              color={config?.ready_for_production ? 'emerald' : 'rose'}
            />
            <StatCard
              title="Transporteurs Actifs"
              value={carriers.active_count ?? 0}
              icon={<Truck size={20} />}
              color="indigo"
            />
            <StatCard
              title="Base de Données"
              value={config?.database?.connected ? 'Connectée' : 'Hors ligne'}
              icon={<Database size={20} />}
              color={config?.database?.connected ? 'emerald' : 'rose'}
            />
          </div>

          {/* Avertissements avant production */}
          {warnings.length > 0 && (
            <div
              className="erp-card"
              style={{
                padding: '24px',
                marginBottom: '32px',
                borderColor: 'var(--status-warning)'
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  color: 'var(--status-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={20} />
                Avertissements ({warnings.length})
              </h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                {warnings.map((w, i) => (
                  <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grille des sections de configuration */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            <ConfigCard title="Environnement" icon={<Server size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Mode">{config?.environment?.node_env || '-'}</ConfigRow>
              <ConfigRow label="Port">{config?.environment?.port ?? '-'}</ConfigRow>
            </ConfigCard>

            <ConfigCard title="Base de Données" icon={<Database size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Fournisseur">{config?.database?.provider || '-'}</ConfigRow>
              <ConfigRow label="Configurée">
                <Indicator ok={config?.database?.configured} />
              </ConfigRow>
              <ConfigRow label="Connexion">
                <Indicator ok={config?.database?.connected} okLabel="Connectée" koLabel="Injoignable" />
              </ConfigRow>
            </ConfigCard>

            <ConfigCard title="Shopify" icon={<ShoppingBag size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Webhook sécurisé">
                <Indicator ok={config?.shopify?.webhook_configured} />
              </ConfigRow>
            </ConfigCard>

            <ConfigCard title="SMS / OTP" icon={<MessageSquare size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Fournisseur SMS">
                <Indicator ok={config?.sms?.provider_configured} />
              </ConfigRow>
              <ConfigRow label="Expiration OTP">
                {config?.sms?.otp_expiration_minutes ?? '-'} min
              </ConfigRow>
              <ConfigRow label="Tentatives max">
                {config?.sms?.otp_max_attempts ?? '-'}
              </ConfigRow>
            </ConfigCard>

            <ConfigCard title="Anti-Fraude" icon={<ShieldAlert size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Seuil de blocage">{config?.fraud?.score_block ?? '-'}</ConfigRow>
              <ConfigRow label="Seuil OTP">{config?.fraud?.score_otp ?? '-'}</ConfigRow>
            </ConfigCard>

            <ConfigCard title="Transporteurs" icon={<Truck size={20} color="var(--accent-primary)" />}>
              <ConfigRow label="Yalidine">
                <Indicator ok={carriers.yalidine} okLabel="Actif" koLabel="Inactif" />
              </ConfigRow>
              <ConfigRow label="ZR Express">
                <Indicator ok={carriers.zr_express} okLabel="Actif" koLabel="Inactif" />
              </ConfigRow>
              <ConfigRow label="DHD Express">
                <Indicator ok={carriers.dhd_express} okLabel="Actif" koLabel="Inactif" />
              </ConfigRow>
            </ConfigCard>
          </div>
        </>
      )}
    </Layout>
  );
};

export default SettingsPage;
