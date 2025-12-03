import React from "react";
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CategoriesProvider } from './context/CategoriesContext.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
        <AuthProvider>
            <CategoriesProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
            </CategoriesProvider>
        </AuthProvider>
);
