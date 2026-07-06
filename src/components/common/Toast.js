import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

/**
 * Système de notifications (toasts) centralisé et réutilisable.
 *
 * - ToastProvider : à monter une seule fois à la racine de l'app.
 * - useToast() : hook exposant success() / error() / info().
 *
 * Toute la logique d'affichage/expiration vit ici ; les pages se contentent
 * d'appeler le hook (aucune logique de présentation dupliquée).
 */

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <AlertTriangle size={18} />,
  info: <Info size={18} />
};

const AUTO_DISMISS_MS = 4000;

let compteur = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    if (!message) return;
    compteur += 1;
    const id = compteur;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), AUTO_DISMISS_MS);
  }, [remove]);

  // API stable exposée aux consommateurs
  const api = {
    success: (msg) => push('success', msg),
    error: (msg) => push('error', msg),
    info: (msg) => push('info', msg)
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
            <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => remove(toast.id)} aria-label="Fermer">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook d'accès aux notifications. Fournit un repli silencieux (console) si
 * jamais un composant est utilisé hors du Provider (tests unitaires isolés).
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (m) => console.log('[toast:success]', m),
      error: (m) => console.error('[toast:error]', m),
      info: (m) => console.log('[toast:info]', m)
    };
  }
  return ctx;
}

export default ToastProvider;
