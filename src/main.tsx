import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import App from './App';
import AuthInitializer from './components/common/AuthInitializer';
import './index.css';

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
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        error: {
          style: {
            background: 'var(--color-danger-light)',
            color: '#991b1b',
            border: '1px solid var(--color-danger)',
            boxShadow: 'var(--shadow-md)',
          },
        },
        success: {
          style: {
            background: 'var(--color-success-light)',
            color: '#166534',
            border: '1px solid var(--color-success)',
            boxShadow: 'var(--shadow-md)',
          },
        },
      }}
    />
  </Provider>
  // </React.StrictMode>
);
