import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { getCommandeById, envoyerOTP, verifierOTP } from '../../services/api.service';
import { STATUT_OPTIONS, formatCurrency, formatOrderDate, changeOrderStatut } from '../../services/commande.service';

const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500 }}>{value}</span>
  </div>
);

const OrderDetailModal = ({ open, orderId, storeId, onClose, onStatutChanged }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Gestion OTP (pour les commandes en attente de confirmation)
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const loadOrder = useCallback(() => {
    if (!open || !orderId) return;
    setLoading(true);
    setLoadError('');
    setSaveError('');
    getCommandeById(orderId, storeId)
      .then((data) => {
        setOrder(data);
        setSelectedStatut(data.statut);
      })
      .catch((error) => {
        setLoadError(error.response?.data?.message || error.message || 'Erreur lors du chargement');
      })
      .finally(() => setLoading(false));
  }, [open, orderId, storeId]);

  useEffect(() => {
    setOtpCode('');
    setOtpMessage('');
    setOtpError('');
    loadOrder();
  }, [loadOrder]);

  const handleChangeStatut = async () => {
    if (!order || selectedStatut === order.statut) return;

    try {
      setSaving(true);
      setSaveError('');
      await changeOrderStatut(order.id, selectedStatut, storeId);
      onStatutChanged();
    } catch (error) {
      setSaveError(error.response?.data?.message || error.message || 'Erreur lors du changement de statut');
    } finally {
      setSaving(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpBusy(true);
    setOtpError('');
    setOtpMessage('');
    try {
      await envoyerOTP(order.id, storeId);
      setOtpMessage('Code OTP renvoyé au client.');
      loadOrder();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Échec de l'envoi du code OTP.");
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setOtpError('Saisissez le code reçu par le client.');
      return;
    }
    setOtpBusy(true);
    setOtpError('');
    setOtpMessage('');
    try {
      await verifierOTP(order.id, otpCode.trim(), storeId);
      setOtpCode('');
      onStatutChanged(); // commande confirmée -> rafraîchit la liste et ferme
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Code OTP invalide.');
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <Modal open={open} title={`Commande ${orderId ? `#${String(orderId).slice(0, 8)}` : ''}`} onClose={onClose} width="560px">
      {loading && <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>}
      {loadError && <p className="form-error">{loadError}</p>}

      {!loading && order && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <DetailRow label="Client" value={order.client ? `${order.client.nom || ''} ${order.client.prenom || ''}`.trim() || order.client.telephone : (order.email || '-')} />
            <DetailRow label="Téléphone" value={order.client?.telephone || '-'} />
            <DetailRow label="Email" value={order.email || '-'} />
            <DetailRow label="Montant" value={formatCurrency(order.montant)} />
            <DetailRow label="Score de risque" value={order.score_risque_calcule ?? 0} />
            <DetailRow label="Commande suspecte" value={order.is_fake ? 'Oui' : 'Non'} />
            <DetailRow label="Date" value={formatOrderDate(order.date_commande)} />
            {order.livraison && (
              <DetailRow label="Livraison" value={`${order.livraison.transporteur} — ${order.livraison.statut_livraison}`} />
            )}
            {order.otp && (
              <DetailRow label="OTP" value={order.otp.valide ? 'Validé' : `${order.otp.tentatives || 0} tentative(s)`} />
            )}
          </div>

          {(order.statut === 'en_attente_otp' || order.otp) && (
            <div style={{ marginBottom: '20px', padding: '16px', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} /> Confirmation OTP
              </h4>
              {order.otp && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
                  Statut : {order.otp.valide ? 'Validé ✅' : `En attente — ${order.otp.tentatives || 0} tentative(s)`}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Code reçu (6 chiffres)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  disabled={otpBusy || order.otp?.valide}
                />
                <button type="button" className="erp-btn erp-btn-primary" onClick={handleVerifyOtp} disabled={otpBusy || order.otp?.valide}>
                  Vérifier
                </button>
                <button type="button" className="erp-btn erp-btn-secondary" onClick={handleResendOtp} disabled={otpBusy}>
                  Renvoyer
                </button>
              </div>
              {otpMessage && <p style={{ color: 'var(--status-success)', fontSize: '13px', margin: '10px 0 0' }}>{otpMessage}</p>}
              {otpError && <p className="form-error" style={{ margin: '10px 0 0' }}>{otpError}</p>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="order-statut">Statut actuel : <StatusBadge status={order.statut} /></label>
            <select
              id="order-statut"
              className="form-input"
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
            >
              {STATUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {saveError && <p className="form-error">{saveError}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="erp-btn erp-btn-primary"
              onClick={handleChangeStatut}
              disabled={saving || selectedStatut === order.statut}
            >
              {saving ? 'Mise à jour...' : 'Mettre à jour le statut'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default OrderDetailModal;
