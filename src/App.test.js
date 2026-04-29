import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NKFILMS app', () => {
  render(<App />);
  const logoElement = screen.getByText(/NKFILMS/i);
  expect(logoElement).toBeInTheDocument();
});