import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoryApi } from "../api/categoryApi.js";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await categoryApi.list();
                setCategories(res?.data ?? res ?? []);
            } catch (e) {
                console.error('Failed to fetch categories', e);
                setError(e?.message || 'Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <CategoriesContext.Provider value={{ categories, loading, error }}>
            {children}
        </CategoriesContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error('useCategories must be used within CategoriesProvider');
    }
    return context;
}
