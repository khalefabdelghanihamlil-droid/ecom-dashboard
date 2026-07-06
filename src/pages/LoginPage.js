import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, ShieldCheck } from 'lucide-react';
import { login } from '../services/auth.service';

// Page de connexion — Single Admin Login.
const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Identifiants invalides.');
      } else if (status === 429) {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else {
        setError(err.response?.data?.message || 'Connexion impossible. Vérifiez que le serveur est démarré.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: '24px'
    }}>
      <div className="erp-card" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'var(--accent-primary-alpha)', color: 'var(--accent-primary)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>ECOM-CORE</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
            Console d'administration
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              <User size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Nom d'utilisateur
            </label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Mot de passe
            </label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

          <button
            type="submit"
            className="erp-btn erp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
