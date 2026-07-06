import api, { setToken, clearToken, getToken } from './api.service';

// Service d'authentification (frontend) — Single Admin Login.
// La logique de session vit côté backend ; ici on gère le jeton et les appels.

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  if (res.data && res.data.token) {
    setToken(res.data.token);
  }
  return res.data.user;
}

export async function logout() {
  // On tente d'invalider la session côté serveur, mais on purge le jeton local
  // quoi qu'il arrive (déconnexion garantie côté client).
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // ignore : la déconnexion locale prime
  } finally {
    clearToken();
  }
}

export async function fetchMe() {
  const res = await api.get('/auth/me');
  return res.data.user;
}
