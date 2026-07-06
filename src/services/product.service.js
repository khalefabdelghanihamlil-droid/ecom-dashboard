import { createProduct, updateProduct } from './api.service';

// NOTE: la table `product` (Supabase) ne contient aujourd'hui que :
// nom, prix_achat, prix_vente, status, score_demande, created_at.
// Ce catalogue interne sert au suivi de marge/coût par produit ; les fiches
// produit "client final" (photos, description, stock) vivent dans Shopify.
// TODO Backend: si un vrai catalogue interne devient nécessaire (stock,
// image, catégorie...), étendre la table `product` et ce service en conséquence.

const currencyFormatter = new Intl.NumberFormat('fr-DZ', {
  style: 'currency',
  currency: 'DZD',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('fr-DZ', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

export const PRODUCT_FORM_DEFAULTS = {
  nom: '',
  prix_achat: '',
  prix_vente: '',
  actif: true
};

export function getProductFormValues(product = null) {
  if (!product) {
    return { ...PRODUCT_FORM_DEFAULTS };
  }

  return {
    nom: product.nom || '',
    prix_achat: product.prix_achat ?? '',
    prix_vente: product.prix_vente ?? '',
    actif: product.status !== 'inactif'
  };
}

export function validateProductForm(values) {
  const errors = {};
  const prixAchat = Number(values.prix_achat);
  const prixVente = Number(values.prix_vente);

  if (!values.nom.trim()) {
    errors.nom = 'Le nom est obligatoire.';
  }

  if (!Number.isFinite(prixAchat) || prixAchat <= 0) {
    errors.prix_achat = "Le prix d'achat doit être supérieur à 0.";
  }

  if (!Number.isFinite(prixVente) || prixVente <= 0) {
    errors.prix_vente = 'Le prix de vente doit être supérieur à 0.';
  }

  if (
    Number.isFinite(prixAchat) &&
    Number.isFinite(prixVente) &&
    prixVente < prixAchat
  ) {
    errors.prix_vente = "Le prix de vente doit être supérieur ou égal au prix d'achat.";
  }

  return errors;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function buildProductPayload(values) {
  return {
    nom: values.nom.trim(),
    prix_achat: toNumber(values.prix_achat),
    prix_vente: toNumber(values.prix_vente),
    status: values.actif ? 'actif' : 'inactif'
  };
}

export async function saveProductForm({ mode, values, product = null, storeId = null }) {
  const payload = buildProductPayload(values);

  if (mode === 'edit' && product?.id) {
    return updateProduct(product.id, payload, storeId);
  }

  return createProduct(payload, storeId);
}

export function getProductMargin(product) {
  return toNumber(product.prix_vente) - toNumber(product.prix_achat);
}

export function getProductMarginPercent(product) {
  const prixAchat = toNumber(product.prix_achat);
  const margin = getProductMargin(product);
  return prixAchat > 0 ? ((margin / prixAchat) * 100).toFixed(1) : '0';
}

export function formatCurrency(value) {
  return currencyFormatter.format(toNumber(value));
}

export function formatProductDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
}

export function toProductTableRows(products = []) {
  return products.map((product) => {
    const margin = getProductMargin(product);

    return {
      id: product.id,
      nom: product.nom || '-',
      prixAchat: formatCurrency(product.prix_achat),
      prixVente: formatCurrency(product.prix_vente),
      marge: formatCurrency(margin),
      margePercent: getProductMarginPercent(product),
      margePositive: margin >= 0,
      scoreDemande: product.score_demande ?? 0,
      status: product.status || 'actif',
      date: formatProductDate(product.created_at),
      raw: product
    };
  });
}
