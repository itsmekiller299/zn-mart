import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './app/store';
import axios from 'axios';

// Set API base URL for production (Vercel)
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
}

// Auto-handle "User no longer exists" / 401 – clear stale token after in-memory DB restart
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '';
    const status = error.response?.status;
    if (status === 401 && (message.includes('User no longer exists') || message.includes('Not authorized') || message.includes('no longer exists'))) {
      console.warn('Session invalid, clearing localStorage automatically');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Avoid redirect loop if already on login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
