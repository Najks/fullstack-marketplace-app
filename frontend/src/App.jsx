import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Layout from './components/layout/Layout.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import AddProductPage from './pages/AddProductPage.jsx';
import MyProductsPage from "./pages/MyProductsPage.jsx";
import EditProductPage from "./pages/EditProductPage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryProductsPage from "./pages/CategoryProductsPage.jsx";
import MyFavoritesPage from "./pages/MyFavoritesPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function NotFound() {
    return (
        <div className="container py-5">
            <h1 className="h4">Page not found</h1>
            <p className="text-muted">The page you requested does not exist.</p>
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/my-products" element={<PrivateRoute><MyProductsPage /></PrivateRoute>} />
                <Route path="/create-product" element={<PrivateRoute><AddProductPage /></PrivateRoute>} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/products/:productId/edit" element={<PrivateRoute><EditProductPage /></PrivateRoute>} />
                <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>}/>
                <Route path="/categories" element={<CategoriesPage />}></Route>
                <Route path="/categories/:categoryId/products" element={ <CategoryProductsPage/>}></Route>
                <Route path="/my-favorites" element={<PrivateRoute><MyFavoritesPage/></PrivateRoute>}></Route>
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

export default App;
