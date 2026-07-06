import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { getClients, getProducts } from '../../api';
import {
  MANUAL_ORDER_FORM_DEFAULTS,
  validateManualOrderForm,
  saveManualOrder
} from '../../services/commande.service';

const OrderFormModal = ({ open, storeId, onClose, onSaved }) => {
  const [values, setValues] = useState(MANUAL_ORDER_FORM_DEFAULTS);
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) return;

    setValues(MANUAL_ORDER_FORM_DEFAULTS);
    setErrors({});
    setSubmitError('');

    Promise.all([getClients(storeId), getProducts(storeId)])
      .then(([clientsData, productsData]) => {
        setClients(clientsData || []);
        setProducts(productsData || []);
      })
      .catch(() => {
        setClients([]);
        setProducts([]);
      });
  }, [open, storeId]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateManualOrderForm(values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      setSubmitError('');
      await saveManualOrder({ values, storeId });
      onSaved();
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Nouvelle commande manuelle"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="erp-btn erp-btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button type="button" className="erp-btn erp-btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Création...' : 'Créer la commande'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label" htmlFor="order-client">Client</label>
        <select
          id="order-client"
          className={`form-input ${errors.client_id ? 'has-error' : ''}`}
          value={values.client_id}
          onChange={handleChange('client_id')}
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {`${client.nom || ''} ${client.prenom || ''}`.trim() || client.telephone}
            </option>
          ))}
        </select>
        {errors.client_id && <span className="form-error">{errors.client_id}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-product">Produit (optionnel)</label>
        <select
          id="order-product"
          className="form-input"
          value={values.product_id}
          onChange={handleChange('product_id')}
        >
          <option value="">Aucun produit associé</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>{product.nom}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-montant">Montant (DZD)</label>
        <input
          id="order-montant"
          className={`form-input ${errors.montant ? 'has-error' : ''}`}
          type="number"
          min="0"
          step="1"
          value={values.montant}
          onChange={handleChange('montant')}
          placeholder="0"
        />
        {errors.montant && <span className="form-error">{errors.montant}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-email">Email (optionnel)</label>
        <input
          id="order-email"
          className={`form-input ${errors.email ? 'has-error' : ''}`}
          type="email"
          value={values.email}
          onChange={handleChange('email')}
          placeholder="client@example.com"
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      {submitError && <p className="form-error">{submitError}</p>}
    </Modal>
  );
};

export default OrderFormModal;
