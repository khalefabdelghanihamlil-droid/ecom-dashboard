import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({
  open,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger = false,
  loading = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width="400px"
      footer={
        <>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`erp-btn ${danger ? 'erp-btn-danger' : 'erp-btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Veuillez patienter...' : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
