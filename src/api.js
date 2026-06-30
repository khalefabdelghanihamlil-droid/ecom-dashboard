import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

export async function getFinanceResume() {
  const res = await api.get('/finance/resume');
  return res.data;
}

export async function getCommandes() {
  const res = await api.get('/commandes');
  return res.data;
}

export default api;
