import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { productApi } from '../../api/productApi.js';

export default function FavoriteButton({
                                           productId,
                                           className = '',
                                           size = 28,
                                           initialFavorite
                                       }) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(Boolean(initialFavorite));
    const [loading, setLoading] = useState(false);

    // Sync when parent provides/changes initial favorite state
    useEffect(() => {
        if (initialFavorite !== undefined) {
            setIsFavorite(Boolean(initialFavorite));
        }
    }, [initialFavorite]);

    // Check favorite only when not provided by parent
    useEffect(() => {
        if (!user?.id || !productId) return;
        if (initialFavorite !== undefined) return;

        let cancelled = false;
        (async () => {
            try {
                const favorites = await productApi.getFavorites(user.id);
                if (!cancelled) {
                    setIsFavorite(Array.isArray(favorites) && favorites.some(fav => fav.productId === productId));
                }
            } catch (e) {
                // silent fail
                // console.error('Failed to check favorite:', e);
            }
        })();

        return () => { cancelled = true; };
    }, [user?.id, productId, initialFavorite]);

    const handleToggle = async (e) => {
        e?.stopPropagation?.();
        if (!user?.id || !productId) return;

        setLoading(true);
        try {
            if (isFavorite) {
                await productApi.removeFavorite(user.id, productId);
            } else {
                await productApi.addFavorite(user.id, productId);
            }
            setIsFavorite(prev => !prev);
        } catch (e) {
            // silent fail
            // console.error('Failed to toggle favorite:', e);
        } finally {
            setLoading(false);
        }
    };

    const title = isFavorite ? 'Remove from favorites' : 'Add to favorites';

    return (
        <button
            type="button"
            className={`btn btn-sm ${isFavorite ? 'btn-danger' : 'btn-outline-danger'} rounded-circle d-inline-flex align-items-center justify-content-center p-0 ${className}`}
            style={{ width: size, height: size, minWidth: size, minHeight: size, lineHeight: 1 }}
            onClick={handleToggle}
            disabled={loading || !user?.id}
            aria-label={title}
            title={title}
            aria-pressed={isFavorite}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
                <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            )}
        </button>
    );
}