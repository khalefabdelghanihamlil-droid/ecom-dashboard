import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import {
  getProductFormValues,
  validateProductForm,
  saveProductForm,
  getProductMargin,
  formatCurrency
} from '../../services/product.service';

const ProductFormModal = ({ open, mode, product, storeId, onClose, onSaved }) => {
  const [values, setValues] = useState(getProductFormValues(product));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(getProductFormValues(mode === 'edit' ? product : null));
      setErrors({});
      setSubmitError('');
    }
  }, [open, mode, product]);

  const handleChange = (field) => (e) => {
    const value = field === 'actif' ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const validationErrors = validateProductForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      setSubmitError('');
      await saveProductForm({ mode, values, product, storeId });
      onSaved();
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const previewMargin = getProductMargin({
    prix_achat: values.prix_achat,
    prix_vente: values.prix_vente
  });

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Modifier le produit' : 'Nouveau produit'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="button" className="erp-btn erp-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement...' : mode === 'edit' ? 'Enregistrer' : 'Créer le produit'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="product-nom">Nom du produit</label>
          <input
            id="product-nom"
            className={`form-input ${errors.nom ? 'has-error' : ''}`}
            type="text"
            value={values.nom}
            onChange={handleChange('nom')}
            placeholder="Ex: Montre connectée X1"
            autoFocus
          />
          {errors.nom && <span className="form-error">{errors.nom}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="product-prix-achat">Prix d'achat (DZD)</label>
            <input
              id="product-prix-achat"
              className={`form-input ${errors.prix_achat ? 'has-error' : ''}`}
              type="number"
              min="0"
              step="1"
              value={values.prix_achat}
              onChange={handleChange('prix_achat')}
              placeholder="0"
            />
            {errors.prix_achat && <span className="form-error">{errors.prix_achat}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="product-prix-vente">Prix de vente (DZD)</label>
            <input
              id="product-prix-vente"
              className={`form-input ${errors.prix_vente ? 'has-error' : ''}`}
              type="number"
              min="0"
              step="1"
              value={values.prix_vente}
              onChange={handleChange('prix_vente')}
              placeholder="0"
            />
            {errors.prix_vente && <span className="form-error">{errors.prix_vente}</span>}
          </div>
        </div>

        <div className="form-group">
          <span className="form-label">Marge estimée</span>
          <span style={{ color: previewMargin >= 0 ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600, fontSize: '14px' }}>
            {formatCurrency(previewMargin)}
          </span>
        </div>

        <div className="form-group">
          <div className="form-checkbox-group">
            <input
              id="product-actif"
              type="checkbox"
              checked={values.actif}
              onChange={handleChange('actif')}
            />
            <label className="form-label" htmlFor="product-actif">Produit actif</label>
          </div>
        </div>

        {submitError && <p className="form-error">{submitError}</p>}
      </form>
    </Modal>
  );
};

export default ProductFormModal;
