import React from 'react';
import ReactDOM from 'react-dom/client';
import Raiz from './Raiz';
import './index.css';

// Tema salvo aplicado antes de tudo: a Entrada aparece fora do App, que depois cuida da troca.
let temaSalvo: string | null = null;
try {
  temaSalvo = localStorage.getItem('datahub-theme');
} catch {
  // Sem localStorage: fica o padrão (escuro), como no App.
}
document.documentElement.setAttribute(
  'data-theme',
  temaSalvo === 'light' ? 'light' : 'dark'
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Raiz />
  </React.StrictMode>
);
