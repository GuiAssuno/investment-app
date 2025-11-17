import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from '@/store/store';

// Renderizar aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// Log de inicialização
if (process.env.NODE_ENV === 'development') {
  console.log('Investment App Frontend iniciado');
  console.log('Electron:', window.appInfo?.isElectron);
  console.log('Platform:', window.appInfo?.platform);
}
