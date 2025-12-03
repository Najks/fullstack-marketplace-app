import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Initialize from localStorage if available
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const loggedIn = !!user;

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const data = await authApi.me();
                const userData = data?.user ?? data ?? null;
                if (alive) {
                    setUser(userData);
                    // Persist to localStorage
                    if (userData) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        localStorage.removeItem('user');
                    }
                }
            } catch {
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const loginWithGoogleCredential = async (credential) => {
        const data = await authApi.googleCallback(credential);
        setUser(data?.user ?? data ?? null);
        localStorage.setItem('user', JSON.stringify(data?.user ?? data));
        return data;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateProfile = async (profileData) => {
        const data = await authApi.updateProfile(user.id, profileData);
        setUser(data?.user ?? data ?? null);
        localStorage.setItem('user', JSON.stringify(data?.user ?? data));
        return data;
    };

    return (
        <AuthContext.Provider
            value={{ user, loggedIn, loading, setUser, loginWithGoogleCredential, logout, updateProfile }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
