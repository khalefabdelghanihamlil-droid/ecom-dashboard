import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrdersPage from './OrdersPage';
import * as api from '../services/api.service';

// OrdersPage appelle getCommandes/getCommandeStats/getCommandeById via '../api',
// OrderFormModal appelle getClients/getProducts via '../api', et
// commande.service.js appelle createCommande/updateCommandeStatut via
// './api.service' : tout resout vers le meme module, un seul mock suffit.
jest.mock('../services/api.service');

const sampleOrder = {
  id: 'order-1',
  client: { id: 'client-1', nom: 'Ben Ali', prenom: 'Karim', telephone: '0551234567', blackliste: false },
  email: 'karim@example.com',
  montant: 5000,
  statut: 'confirmee',
  score_risque_calcule: 10,
  is_fake: false,
  date_commande: '2026-07-01T10:00:00Z'
};

const renderPage = () => render(<OrdersPage />, { wrapper: MemoryRouter });

describe('OrdersPage (smoke test module Commandes)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getCommandes.mockResolvedValue({ commandes: [sampleOrder], total: 1, page: 1, pages: 1 });
    api.getCommandeStats.mockResolvedValue({
      total: 1, par_statut: { confirmee: 1 }, ca_total: '5000.00',
      commandes_fake: 0, commandes_aujourd_hui: 1, montant_moyen: '5000.00'
    });
    api.getCommandeById.mockResolvedValue({ ...sampleOrder, livraison: null, otp: null });
    api.getClients.mockResolvedValue([{ id: 'client-1', nom: 'Ben Ali', prenom: 'Karim', telephone: '0551234567' }]);
    api.getProducts.mockResolvedValue([{ id: 'prod-1', nom: 'Casque Bluetooth' }]);
    api.createCommande.mockResolvedValue({ id: 'order-2', ...sampleOrder });
    api.updateCommandeStatut.mockResolvedValue({ ...sampleOrder, statut: 'expediee' });
  });

  test('charge et affiche la liste des commandes avec les stats', async () => {
    renderPage();

    expect(await screen.findByText('Ben Ali Karim')).toBeInTheDocument();
    expect(screen.getByText(/Commandes/i, { selector: 'h1' })).toBeInTheDocument();
    expect(screen.getByText('Confirmée', { selector: 'span' })).toBeInTheDocument();
  });

  test('ouverture du detail et changement de statut', async () => {
    renderPage();
    await screen.findByText('Ben Ali Karim');

    await userEvent.click(screen.getByRole('button', { name: /Voir/i }));

    expect(await screen.findByText(/Statut actuel/i)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText(/Statut actuel/i), 'expediee');
    await userEvent.click(screen.getByRole('button', { name: /Mettre à jour le statut/i }));

    await waitFor(() => expect(api.updateCommandeStatut).toHaveBeenCalledWith('order-1', 'expediee', null));
  });

  test('creation manuelle d\'une commande (bouton fonctionnel)', async () => {
    renderPage();
    await screen.findByText('Ben Ali Karim');

    await userEvent.click(screen.getByRole('button', { name: /Nouvelle Commande/i }));

    expect(await screen.findByText('Nouvelle commande manuelle')).toBeInTheDocument();
    await screen.findByRole('option', { name: /Ben Ali Karim/i });

    await userEvent.selectOptions(screen.getByLabelText(/^Client$/i), 'client-1');
    await userEvent.type(screen.getByLabelText(/Montant/i), '3000');

    await userEvent.click(screen.getByRole('button', { name: /Créer la commande/i }));

    await waitFor(() => expect(api.createCommande).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: 'client-1', montant: 3000 }),
      null
    ));
  });

  test('validation bloque la creation sans client selectionne', async () => {
    renderPage();
    await screen.findByText('Ben Ali Karim');

    await userEvent.click(screen.getByRole('button', { name: /Nouvelle Commande/i }));
    await userEvent.type(await screen.findByLabelText(/Montant/i), '3000');
    await userEvent.click(screen.getByRole('button', { name: /Créer la commande/i }));

    expect(await screen.findByText(/Le client est obligatoire/i)).toBeInTheDocument();
    expect(api.createCommande).not.toHaveBeenCalled();
  });

  test('filtre par statut', async () => {
    renderPage();
    await screen.findByText('Ben Ali Karim');

    await userEvent.selectOptions(screen.getByLabelText(/Filtrer par statut/i), 'livree');

    expect(screen.queryByText('Ben Ali Karim')).not.toBeInTheDocument();
    expect(screen.getByText(/Aucune commande trouvée/i)).toBeInTheDocument();
  });
});
