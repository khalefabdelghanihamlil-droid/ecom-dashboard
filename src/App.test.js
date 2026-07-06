import { render, screen } from '@testing-library/react';
import App from './App';

// Smoke test : l'application se monte sans crash et affiche la coquille
// (sidebar). Remplace l'ancien test boilerplate CRA « learn react » qui ne
// correspondait plus au vrai dashboard.
test('renders the application shell with the sidebar brand', () => {
  render(<App />);
  expect(screen.getByText('ECOM-CORE')).toBeInTheDocument();
});
