import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../pages/About';
import Mission from '../pages/Mission';

describe('Public Information Pages', () => {
  it('renders the About page title', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /About Aarogya Seva/i })).toBeInTheDocument();
  });

  it('renders the Mission page title', () => {
    render(
      <BrowserRouter>
        <Mission />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /Our Mission/i })).toBeInTheDocument();
  });
});

