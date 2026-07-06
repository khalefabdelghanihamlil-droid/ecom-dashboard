import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import * as authService from '../services/auth.service';

jest.mock('../services/auth.service');

// On surveille la navigation sans casser MemoryRouter (le reste du module réel).
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderPage = () => render(<LoginPage />, { wrapper: MemoryRouter });

describe('LoginPage (Single Admin Login)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('affiche la marque et le formulaire de connexion', () => {
    renderPage();
    expect(screen.getByText('ECOM-CORE')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  test('connexion réussie : appelle login puis navigue vers le dashboard', async () => {
    authService.login.mockResolvedValue({ username: 'admin', role: 'admin' });
    renderPage();

    await userEvent.type(screen.getByLabelText(/Nom d'utilisateur/i), 'admin');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith('admin', 'secret'));
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  test('identifiants invalides (401) : affiche un message d\'erreur, pas de navigation', async () => {
    authService.login.mockRejectedValue({ response: { status: 401 } });
    renderPage();

    await userEvent.type(screen.getByLabelText(/Nom d'utilisateur/i), 'admin');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(await screen.findByText(/Identifiants invalides/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
