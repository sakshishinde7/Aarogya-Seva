import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Services from '../pages/Services';
import HowItWorks from '../pages/HowItWorks';
import Layout from '../components/Layout';
import { AuthProvider } from '../hooks/useAuth';

describe('Additional UI Pages and Components', () => {
  it('renders Healthcare Services page', () => {
    render(
      <BrowserRouter>
        <Services />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /Healthcare Services/i })).toBeInTheDocument();
  });

  it('renders How It Works page workflow steps', () => {
    render(
      <BrowserRouter>
        <HowItWorks />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /How It Works/i })).toBeInTheDocument();
  });

  it('renders Layout navigation header', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <div>Test Child Content</div>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });
});

