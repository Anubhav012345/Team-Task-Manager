import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ IMPORTANT: import CSS
import './index.css';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);