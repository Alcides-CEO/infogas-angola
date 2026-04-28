import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { debugEnv } from './utils/debug';

// 🔍 Diagnóstico — imprime as env vars no console ao arrancar
debugEnv();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
