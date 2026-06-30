import React, { useState, useEffect } from 'react';
import './App.css';
import { getFinanceResume } from './api';

function App() {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFinanceResume();
      setFinance(data);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Impossible de se connecter au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(function() {
    chargerDonnees();
    const interval = setInterval(chargerDonnees, 30000);
    return function() { clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Chargement des donnees...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      <div className="header">
        <div>
          <h1>Mon E-commerce Dashboard</h1>
          <div style={{fontSize: '13px', color: '#718096', marginTop: '4px'}}>
            Mise a jour automatique toutes les 30 secondes
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span style={{fontSize: '13px', color: '#718096'}}>
            Derniere mise a jour: {lastUpdate}
          </span>
          <button className="refresh-btn" onClick={chargerDonnees}>
            Actualiser
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {finance && (
        <div className="cards">
          <div className="card">
            <div className="icon">💰</div>
            <h3>Chiffre d Affaires</h3>
            <div className="value">{finance.total_ca}</div>
            <div className="unit">Dinars Algeriens</div>
          </div>

          <div className="card profit">
            <div className="icon">📈</div>
            <h3>Profit Net</h3>
            <div className="value">{finance.total_profit}</div>
            <div className="unit">Dinars Algeriens</div>
          </div>

          <div className="card commandes">
            <div className="icon">📦</div>
            <h3>Total Commandes</h3>
            <div className="value">{finance.total_commandes}</div>
            <div className="unit">commandes traitees</div>
          </div>

          <div className="card marge">
            <div className="icon">🎯</div>
            <h3>Marge Moyenne</h3>
            <div className="value">{finance.marge_moyenne}</div>
            <div className="unit">% de marge</div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Endpoints API disponibles</h2>
        <div className="endpoints">
          <div className="endpoint">
            <span className="method method-post">POST</span>
            <span className="path">/webhooks/shopify-order</span>
          </div>
          <div className="endpoint">
            <span className="method method-post">POST</span>
            <span className="path">/otp/envoyer</span>
          </div>
          <div className="endpoint">
            <span className="method method-post">POST</span>
            <span className="path">/otp/verifier</span>
          </div>
          <div className="endpoint">
            <span className="method method-post">POST</span>
            <span className="path">/livraison/expedier</span>
          </div>
          <div className="endpoint">
            <span className="method method-get">GET</span>
            <span className="path">/livraison/suivi/:id</span>
          </div>
          <div className="endpoint">
            <span className="method method-post">POST</span>
            <span className="path">/finance/calculer</span>
          </div>
          <div className="endpoint">
            <span className="method method-get">GET</span>
            <span className="path">/finance/resume</span>
          </div>
          <div className="endpoint">
            <span className="method method-get">GET</span>
            <span className="path">/health</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
