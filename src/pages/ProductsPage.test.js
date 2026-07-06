import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from './ProductsPage';
import * as api from '../services/api.service';

// ProductsPage appelle getProducts/deleteProduct via '../api', et le
// service produit (services/product.service.js) appelle createProduct/
// updateProduct via './api.service' : les deux résolvent le même module,
// donc un seul mock au niveau du service suffit à couvrir les deux chemins.
jest.mock('../services/api.service');

const sampleProducts = [
  { id: '1', nom: 'Casque Bluetooth', prix_achat: 1000, prix_vente: 2500, score_demande: 5, status: 'actif', created_at: '2026-07-01T00:00:00Z' }
];

const renderPage = () => render(<ProductsPage />, { wrapper: MemoryRouter });

describe('ProductsPage (smoke test module Produits)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.getProducts.mockResolvedValue(sampleProducts);
    api.deleteProduct.mockResolvedValue({ message: 'ok' });
    api.createProduct.mockResolvedValue({ id: '2', nom: 'Nouveau Produit Test', prix_achat: 100, prix_vente: 300, score_demande: 0, status: 'actif' });
    api.updateProduct.mockResolvedValue({ ...sampleProducts[0], prix_vente: 3000 });
  });

  test('charge et affiche le catalogue avec les vraies colonnes (pas de champs fantomes)', async () => {
    renderPage();

    expect(await screen.findByText('Casque Bluetooth')).toBeInTheDocument();
    expect(screen.getByText(/Catalogue Produits/i)).toBeInTheDocument();

    // Colonnes basees sur le vrai schema (pas de Stock/Categorie/Image inexistants)
    expect(screen.queryByText('Stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Catégorie')).not.toBeInTheDocument();
    expect(screen.queryByText('Image')).not.toBeInTheDocument();

    // Statut affiche correctement (pas "Inconnu")
    expect(screen.getByText('Actif')).toBeInTheDocument();
  });

  test('creation d\'un produit via le bouton Nouveau Produit (bouton fonctionnel)', async () => {
    renderPage();
    await screen.findByText('Casque Bluetooth');

    await userEvent.click(screen.getByRole('button', { name: /Nouveau Produit/i }));

    expect(screen.getByText('Nouveau produit')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Nom du produit/i), 'Nouveau Produit Test');
    await userEvent.type(screen.getByLabelText(/Prix d'achat/i), '100');
    await userEvent.type(screen.getByLabelText(/Prix de vente/i), '300');

    await userEvent.click(screen.getByRole('button', { name: /Créer le produit/i }));

    await waitFor(() => expect(api.createProduct).toHaveBeenCalled());
    await waitFor(() => expect(api.getProducts).toHaveBeenCalledTimes(2)); // chargement initial + refresh post-creation
  });

  test('validation bloque la soumission si le nom est vide', async () => {
    renderPage();
    await screen.findByText('Casque Bluetooth');

    await userEvent.click(screen.getByRole('button', { name: /Nouveau Produit/i }));
    await userEvent.type(screen.getByLabelText(/Prix d'achat/i), '100');
    await userEvent.type(screen.getByLabelText(/Prix de vente/i), '300');
    await userEvent.click(screen.getByRole('button', { name: /Créer le produit/i }));

    expect(await screen.findByText(/Le nom est obligatoire/i)).toBeInTheDocument();
    expect(api.createProduct).not.toHaveBeenCalled();
  });

  test('modification d\'un produit existant', async () => {
    renderPage();
    await screen.findByText('Casque Bluetooth');

    await userEvent.click(screen.getByRole('button', { name: /Modifier le produit/i }));
    expect(screen.getByText('Modifier le produit')).toBeInTheDocument();

    const prixVenteInput = screen.getByLabelText(/Prix de vente/i);
    await userEvent.clear(prixVenteInput);
    await userEvent.type(prixVenteInput, '3000');
    await userEvent.click(screen.getByRole('button', { name: /^Enregistrer$/i }));

    await waitFor(() => expect(api.updateProduct).toHaveBeenCalledWith('1', expect.objectContaining({ prix_vente: 3000 }), null));
  });

  test('suppression avec confirmation (pas de window.confirm natif)', async () => {
    renderPage();
    await screen.findByText('Casque Bluetooth');

    await userEvent.click(screen.getByRole('button', { name: /Supprimer le produit/i }));

    const dialog = await screen.findByText('Supprimer ce produit ?');
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(api.deleteProduct).toHaveBeenCalledWith('1', null));
  });
});
