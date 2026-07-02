import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { hydratePartnerRegistration } from './store/slices/partnerRegistrationSlice';
import { loadPartnerRegistrationDraft } from './utils/partnerRegistrationStorage';
import App from './App';
import AuthInitializer from './components/common/AuthInitializer';
import './index.css';

const savedPartnerRegistration = loadPartnerRegistrationDraft();
if (savedPartnerRegistration) {
  store.dispatch(hydratePartnerRegistration(savedPartnerRegistration));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <AuthInitializer />
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--toast-default-bg)',
          color: 'var(--toast-default-text)',
          border: '1px solid var(--toast-default-border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: 'var(--shadow-md)',
        },
        error: {
          style: {
            background: 'var(--toast-error-bg)',
            color: 'var(--toast-error-text)',
            border: '1px solid var(--toast-error-border)',
            boxShadow: 'var(--shadow-md)',
          },
        },
        success: {
          style: {
            background: 'var(--toast-success-bg)',
            color: 'var(--toast-success-text)',
            border: '1px solid var(--toast-success-border)',
            boxShadow: 'var(--shadow-md)',
          },
        },
      }}
    />
  </Provider>
  // </React.StrictMode>
);
