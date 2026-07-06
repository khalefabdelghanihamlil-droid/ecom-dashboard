import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { Truck, CheckCircle2 } from 'lucide-react';
import { getCommandesByStatut, expedierCommande } from '../../services/api.service';
import { formatCurrency, getClientLabel } from '../../services/commande.service';

// Modal d'expédition : liste les commandes CONFIRMÉES (seules expédiables côté
// backend) et crée un colis via le transporteur choisi automatiquement
// (transportManager). Réutilise expedierCommande / getCommandesByStatut.
const ShipOrderModal = ({ open, storeId, onClose, onShipped }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [commandeId, setCommandeId] = useState('');
  const [wilayaId, setWilayaId] = useState('');
  const [adresse, setAdresse] = useState('');
  const [fraisLivraison, setFraisLivraison] = useState('');
  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    setCommandeId(''); setWilayaId(''); setAdresse(''); setFraisLivraison('');
    setErrors({}); setSaveError(''); setResult(null);
    setLoading(true); setLoadError('');

    getCommandesByStatut('confirmee', storeId)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setLoadError(err.response?.data?.message || 'Impossible de charger les commandes confirmées.'))
      .finally(() => setLoading(false));
  }, [open, storeId]);

  const validate = () => {
    const e = {};
    if (!commandeId) e.commandeId = 'Sélectionnez une commande confirmée.';
    const w = Number(wilayaId);
    if (!Number.isInteger(w) || w < 1 || w > 58) e.wilayaId = 'Wilaya invalide (1 à 58).';
    if (fraisLivraison !== '' && (!Number.isFinite(Number(fraisLivraison)) || Number(fraisLivraison) < 0)) {
      e.fraisLivraison = 'Frais de livraison invalides.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSaveError('');
    if (!validate()) return;
    try {
      setSaving(true);
      const res = await expedierCommande({
        commande_id: commandeId,
        wilaya_id: Number(wilayaId),
        adresse: adresse.trim() || null,
        frais_livraison: fraisLivraison === '' ? 0 : Number(fraisLivraison)
      }, storeId);
      setResult(res);
      if (onShipped) onShipped();
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Échec de l'expédition.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Expédier une commande" onClose={onClose} width="520px">
      {result ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <CheckCircle2 size={40} color="var(--status-success)" />
          <h4 style={{ margin: '12px 0 4px', color: 'var(--text-primary)' }}>Colis créé avec succès</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
            Transporteur : <strong>{result.transporteur || '-'}</strong><br />
            Suivi : <strong>{result.tracking_id || '-'}</strong>
          </p>
          <button className="erp-btn erp-btn-primary" style={{ marginTop: '20px' }} onClick={onClose}>Fermer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {loadError && <p className="form-error">{loadError}</p>}

          <div className="form-group">
            <label className="form-label" htmlFor="ship-commande">Commande confirmée</label>
            <select
              id="ship-commande"
              className={`form-input ${errors.commandeId ? 'has-error' : ''}`}
              value={commandeId}
              onChange={(e) => setCommandeId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'Chargement...' : 'Sélectionner une commande'}</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{String(o.id).slice(0, 8)} — {getClientLabel(o)} — {formatCurrency(o.montant)}
                </option>
              ))}
            </select>
            {!loading && orders.length === 0 && !loadError && (
              <p className="form-error" style={{ color: 'var(--text-muted)' }}>Aucune commande confirmée à expédier.</p>
            )}
            {errors.commandeId && <p className="form-error">{errors.commandeId}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ship-wilaya">Wilaya (code 1–58)</label>
            <input
              id="ship-wilaya"
              type="number"
              min="1" max="58"
              className={`form-input ${errors.wilayaId ? 'has-error' : ''}`}
              value={wilayaId}
              onChange={(e) => setWilayaId(e.target.value)}
              placeholder="16"
            />
            {errors.wilayaId && <p className="form-error">{errors.wilayaId}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ship-adresse">Adresse (optionnel)</label>
            <input
              id="ship-adresse"
              type="text"
              className="form-input"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Rue, ville..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ship-frais">Frais de livraison (DZD)</label>
            <input
              id="ship-frais"
              type="number"
              min="0"
              className={`form-input ${errors.fraisLivraison ? 'has-error' : ''}`}
              value={fraisLivraison}
              onChange={(e) => setFraisLivraison(e.target.value)}
              placeholder="0"
            />
            {errors.fraisLivraison && <p className="form-error">{errors.fraisLivraison}</p>}
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="erp-btn erp-btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="erp-btn erp-btn-primary" disabled={saving || loading}>
              <Truck size={16} />
              <span>{saving ? 'Expédition...' : 'Expédier'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ShipOrderModal;
