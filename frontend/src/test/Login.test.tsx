import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../hooks/useAuth';
import axios from 'axios';

vi.mock('axios');

describe('Login Page', () => {
  it('renders login form elements and demo accounts', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Unauthenticated'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Staff Email/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Demo Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@aarogyaseva\.org/i)).toBeInTheDocument();
  });
});
