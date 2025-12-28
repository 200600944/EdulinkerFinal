import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from '../components/Home'; // Correto: sobe um nível para sair de 'main'
import '../index.css'; // Ajustado: adicionado '../' para encontrar o CSS na pasta src

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);