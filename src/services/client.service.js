import { createClient, updateClient } from './api.service';

/**
 * Service Clients (frontend) — centralise la logique de formulaire, la
 * validation et le formatage. Aucune logique métier ne doit vivre dans les
 * composants React (cf. contrainte Clean Architecture du projet).
 */

// Format téléphone algérien, aligné sur le backend (validerTelephone).
const PHONE_REGEX = /^(05|06|07)[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CLIENT_FORM_DEFAULTS = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  wilaya: '',
  adresse: ''
};

export function getClientFormValues(client = null) {
  if (!client) return { ...CLIENT_FORM_DEFAULTS };
  return {
    nom: client.nom || '',
    prenom: client.prenom || '',
    telephone: client.telephone || '',
    email: client.email || '',
    wilaya: client.wilaya || '',
    adresse: client.adresse || ''
  };
}

export function validateClientForm(values, { mode = 'create' } = {}) {
  const errors = {};

  // Le téléphone n'est modifiable/obligatoire qu'à la création (identifiant client).
  if (mode === 'create') {
    if (!values.telephone.trim()) {
      errors.telephone = 'Le téléphone est obligatoire.';
    } else if (!PHONE_REGEX.test(values.telephone.trim())) {
      errors.telephone = 'Format invalide (ex: 07XXXXXXXX, 10 chiffres).';
    }
  } else if (values.telephone && !PHONE_REGEX.test(values.telephone.trim())) {
    errors.telephone = 'Format invalide (ex: 07XXXXXXXX, 10 chiffres).';
  }

  if (values.email && !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "L'email n'est pas valide.";
  }

  return errors;
}

function buildClientPayload(values, { mode }) {
  const payload = {
    nom: values.nom.trim() || null,
    prenom: values.prenom.trim() || null,
    email: values.email.trim() || null,
    wilaya: values.wilaya.trim() || null,
    adresse: values.adresse.trim() || null
  };
  // Le téléphone n'est envoyé qu'à la création (le backend ne l'attend pas en update).
  if (mode === 'create') {
    payload.telephone = values.telephone.trim();
  }
  return payload;
}

export async function saveClientForm({ mode, values, client = null, storeId = null }) {
  const payload = buildClientPayload(values, { mode });
  if (mode === 'edit' && client?.id) {
    return updateClient(client.id, payload, storeId);
  }
  return createClient(payload, storeId);
}

export function getClientFullName(client) {
  const full = `${client.nom || ''} ${client.prenom || ''}`.trim();
  return full || client.telephone || client.email || 'Non renseigné';
}

/**
 * Statistiques d'en-tête pour la page Clients.
 */
export function computeClientStats(clients = []) {
  const total = clients.length;
  const blacklistes = clients.filter((c) => c.blackliste).length;
  const aRisque = clients.filter((c) => Number(c.score_risque || 0) >= 50).length;
  return { total, blacklistes, aRisque };
}
