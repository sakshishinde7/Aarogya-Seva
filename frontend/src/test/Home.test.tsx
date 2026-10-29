import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

describe('Home Page', () => {
  it('renders the hero heading and tagline', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Connected Healthcare\./i)).toBeInTheDocument();
    expect(screen.getByText(/Healthier Communities\./i)).toBeInTheDocument();
  });

  it('renders call to action links', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /Explore Our Mission/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Healthcare Staff Login/i })).toBeInTheDocument();
  });

  it('renders prototype and disclaimer notice', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/Privacy & Prototype Disclaimer/i)).toBeInTheDocument();
    expect(screen.getByText(/demonstration prototype/i)).toBeInTheDocument();
  });
});
