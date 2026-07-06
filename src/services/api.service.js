import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// === AUTHENTIFICATION (Single Admin) ===
// Stockage du jeton JWT. localStorage : simple et adapté à un dashboard interne
// mono-administrateur. Le backend applique la sécurité réelle (single session).
export const TOKEN_KEY = 'ecom_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Intercepteur REQUÊTE : attache automatiquement le Bearer token à chaque appel.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur RÉPONSE : sur 401 (token absent/expiré/session remplacée),
// on purge le jeton et on renvoie l'utilisateur vers la page de connexion.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Helper pour formater l'URL avec le storeId
const withStore = (url, storeId) => {
  if (!storeId) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}storeId=${storeId}`;
};

// === FINANCE ===
export async function getFinanceResume(storeId = null) {
  const res = await api.get(withStore('/finance/resume', storeId));
  return res.data;
}

export async function getProfitParProduit(storeId = null) {
  const res = await api.get(withStore('/finance/par-produit', storeId));
  return res.data;
}

export async function getProfitEvolution(jours = 30, storeId = null) {
  const res = await api.get(withStore(`/finance/evolution?jours=${jours}`, storeId));
  return res.data;
}

// === COMMANDES ===
export async function getCommandes(page = 1, limit = 50, storeId = null) {
  const res = await api.get(withStore(`/commandes?page=${page}&limit=${limit}`, storeId));
  return res.data;
}

export async function getCommandeStats(storeId = null) {
  const res = await api.get(withStore('/commandes/stats', storeId));
  return res.data;
}

export async function getCommandeById(id, storeId = null) {
  const res = await api.get(withStore(`/commandes/${id}`, storeId));
  return res.data;
}

export async function createCommande(data, storeId = null) {
  const res = await api.post(withStore('/commandes', storeId), data);
  return res.data;
}

export async function updateCommandeStatut(id, statut, storeId = null) {
  const res = await api.patch(withStore(`/commandes/${id}/statut`, storeId), { statut });
  return res.data;
}

// === CLIENTS ===
export async function getClients(storeId = null) {
  const res = await api.get(withStore('/clients', storeId));
  return res.data;
}

export async function getClientById(id, storeId = null) {
  const res = await api.get(withStore(`/clients/${id}`, storeId));
  return res.data;
}

export async function createClient(data, storeId = null) {
  const res = await api.post(withStore('/clients', storeId), data);
  return res.data;
}

export async function updateClient(id, data, storeId = null) {
  const res = await api.put(withStore(`/clients/${id}`, storeId), data);
  return res.data;
}

export async function deleteClient(id, storeId = null) {
  const res = await api.delete(withStore(`/clients/${id}`, storeId));
  return res.data;
}

export async function toggleBlacklist(id, storeId = null) {
  const res = await api.patch(withStore(`/clients/${id}/blacklist`, storeId));
  return res.data;
}

// === FRAUDE ===
export async function getFraudStats(storeId = null) {
  const res = await api.get(withStore('/fraud/stats', storeId));
  return res.data;
}

export async function getTopRisks(storeId = null) {
  const res = await api.get(withStore('/fraud/top-risks', storeId));
  return res.data;
}

export async function getFraudTendances(jours = 30, storeId = null) {
  const res = await api.get(withStore(`/fraud/tendances?jours=${jours}`, storeId));
  return res.data;
}

// === PRODUITS ===
export async function getProducts(storeId = null) {
  const res = await api.get(withStore('/products', storeId));
  return res.data;
}

export async function createProduct(data, storeId = null) {
  const res = await api.post(withStore('/products', storeId), data);
  return Array.isArray(res.data) ? res.data[0] : res.data;
}

export async function updateProduct(id, data, storeId = null) {
  const res = await api.put(withStore(`/products/${id}`, storeId), data);
  return res.data;
}

export async function deleteProduct(id, storeId = null) {
  const res = await api.delete(withStore(`/products/${id}`, storeId));
  return res.data;
}

// === LIVRAISONS ===
export async function getLivraisons(transporteur = '', statut = '', storeId = null) {
  let url = '/livraison?';
  if (transporteur) url += `transporteur=${transporteur}&`;
  if (statut) url += `statut=${statut}&`;
  // Supprime le dernier '&' ou '?' si la query string est vide
  url = url.replace(/[&?]$/, '');
  const res = await api.get(withStore(url, storeId));
  return res.data;
}

export async function getLivraisonStats(storeId = null) {
  const res = await api.get(withStore('/livraison/stats', storeId));
  return res.data;
}

export async function syncLivraisons(storeId = null) {
  const res = await api.post(withStore('/livraison/sync', storeId));
  return res.data;
}

// Expédie une commande confirmée : crée le colis chez le transporteur.
export async function expedierCommande(payload, storeId = null) {
  const res = await api.post(withStore('/livraison/expedier', storeId), payload);
  return res.data;
}

// Commandes filtrées par statut (utilisé pour lister les commandes expédiables).
export async function getCommandesByStatut(statut, storeId = null) {
  const res = await api.get(withStore(`/commandes/statut/${statut}`, storeId));
  return res.data;
}

// === PARAMÈTRES / CONFIGURATION ===
export async function getSettings(storeId = null) {
  const res = await api.get(withStore('/settings', storeId));
  return res.data;
}

// === OTP / CONFIRMATION ===
export async function envoyerOTP(commande_id, storeId = null) {
  const res = await api.post(withStore('/otp/envoyer', storeId), { commande_id });
  return res.data;
}

export async function verifierOTP(commande_id, code_saisi, storeId = null) {
  const res = await api.post(withStore('/otp/verifier', storeId), { commande_id, code_saisi });
  return res.data;
}

export async function statutOTP(commande_id, storeId = null) {
  const res = await api.get(withStore(`/otp/statut/${commande_id}`, storeId));
  return res.data;
}

export default api;
