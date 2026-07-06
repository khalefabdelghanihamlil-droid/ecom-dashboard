import { createCommande, updateCommandeStatut } from './api.service';

// Statuts valides côté backend (cf. ecom-core/src/services/commande.service.js)
export const STATUT_OPTIONS = [
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_attente_otp', label: 'Attente OTP' },
  { value: 'expediee', label: 'Expédiée' },
  { value: 'en_transit', label: 'En Transit' },
  { value: 'livree', label: 'Livrée' },
  { value: 'retournee', label: 'Retournée' },
  { value: 'annulee', label: 'Annulée' },
  { value: 'rejetee_blacklist', label: 'Rejetée (Blacklist)' },
  { value: 'rejetee_otp_echec', label: 'Rejetée (Échec OTP)' },
  { value: 'rejetee_auto', label: 'Rejetée (Auto)' }
];

const currencyFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('fr-DZ', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

export function formatCurrency(value) {
  const number = Number(value);
  return currencyFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatOrderDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
}

export function getClientLabel(order) {
  const client = order.client;
  if (!client) return order.email || 'Client inconnu';

  const nomComplet = `${client.nom || ''} ${client.prenom || ''}`.trim();
  return nomComplet || client.telephone || client.email || 'Client inconnu';
}

export function toOrderTableRows(orders = []) {
  return orders.map((order) => ({
    id: order.id,
    client: getClientLabel(order),
    email: order.email || '-',
    montant: formatCurrency(order.montant),
    statut: order.statut,
    scoreRisque: order.score_risque_calcule ?? 0,
    isFake: !!order.is_fake,
    date: formatOrderDate(order.date_commande),
    raw: order
  }));
}

export const MANUAL_ORDER_FORM_DEFAULTS = {
  client_id: '',
  product_id: '',
  montant: '',
  email: ''
};

export function validateManualOrderForm(values) {
  const errors = {};
  const montant = Number(values.montant);

  if (!values.client_id) {
    errors.client_id = 'Le client est obligatoire.';
  }

  if (!Number.isFinite(montant) || montant <= 0) {
    errors.montant = 'Le montant doit être supérieur à 0.';
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "L'email n'est pas valide.";
  }

  return errors;
}

export async function saveManualOrder({ values, storeId = null }) {
  const payload = {
    client_id: values.client_id,
    montant: Number(values.montant),
    email: values.email?.trim() || null,
    product_id: values.product_id || null
  };

  return createCommande(payload, storeId);
}

export async function changeOrderStatut(id, statut, storeId = null) {
  return updateCommandeStatut(id, statut, storeId);
}
