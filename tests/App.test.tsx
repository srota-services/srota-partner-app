import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import {
  setAuthenticated,
  setAuthInitialized,
} from '../src/store/slices/authSlice';
import App from '../src/App';

function renderApp() {
  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

describe('App', () => {
  const originalPathname = window.location.pathname;

  afterEach(() => {
    window.history.pushState({}, '', originalPathname);
    store.dispatch(setAuthenticated(false));
    store.dispatch(setAuthInitialized(true));
  });

  it('renders the landing page hero at /', async () => {
    store.dispatch(setAuthInitialized(true));
    window.history.pushState({}, '', '/');
    renderApp();
    expect(
      await screen.findByRole('heading', {
        name: /publish and grow your audiobook catalog/i,
      })
    ).toBeInTheDocument();
  });

  it('renders Become a Partner button on landing page', async () => {
    store.dispatch(setAuthInitialized(true));
    window.history.pushState({}, '', '/');
    renderApp();
    expect(
      await screen.findByRole('button', { name: /become a partner/i })
    ).toBeInTheDocument();
  });

  it('renders login page at /login', async () => {
    store.dispatch(setAuthInitialized(true));
    window.history.pushState({}, '', '/login');
    renderApp();
    expect(
      await screen.findByRole('heading', { name: /welcome back/i })
    ).toBeInTheDocument();
  });

  it('redirects authenticated users away from landing page', async () => {
    store.dispatch(setAuthInitialized(true));
    store.dispatch(setAuthenticated(true));
    window.history.pushState({}, '', '/');
    renderApp();

    expect(
      await screen.findByRole(
        'heading',
        { name: /^dashboard$/i },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
  });

  it('redirects authenticated users away from login page', async () => {
    store.dispatch(setAuthInitialized(true));
    store.dispatch(setAuthenticated(true));
    window.history.pushState({}, '', '/login');
    renderApp();

    expect(
      await screen.findByRole(
        'heading',
        { name: /^dashboard$/i },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
  });
});
