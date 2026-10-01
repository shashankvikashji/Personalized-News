import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { Providers, applyTheme } from './ctx.jsx';
import './styles.css';

applyTheme(localStorage.getItem('theme') || 'system');
createRoot(document.getElementById('root')).render(
  <BrowserRouter><Providers><App /></Providers></BrowserRouter>
);
