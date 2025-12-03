import React, { useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import FavoriteButton from '../favourite/FavouriteButton.jsx';

export default function ProductCard({
                                        product,
                                        onView,
                                        onEdit,
                                        onDelete,
                                        onMarkAsSold,
                                        onMarkAsUnsold,
                                        initialFavorite, // passed from parent to avoid extra GETs
                                    }) {
    const { user } = useAuth();
    const title = product.title;
    const price = product.price;
    const currency = product?.currency ?? '€';
    const isSold = product?.statusId === 2;

    const owner =
        product?.user?.username ??
        product?.owner?.username ??
        product?.sellerName ?? '';

    const categoryNames = React.useMemo(() => {
        const fromRelation = Array.isArray(product?.categories)
            ? product.categories
                .map((c) => (typeof c === 'string' ? c : c?.category?.name ?? c?.name ?? null))
                .filter(Boolean)
            : [];
        const fallback = product?.category?.name ?? product?.categoryName ?? null;
        const all = [...fromRelation, ...(fallback ? [fallback] : [])];
        return Array.from(new Set(all));
    }, [product]);

    const images = product?.images ?? product?.photos ?? [];
    const primary =
        (Array.isArray(images) && images.find((i) => i?.isPrimary)) ||
        (Array.isArray(images) && images[0]) ||
        product?.thumbnail ||
        product?.image ||
        null;
    const url = typeof primary === 'string' ? primary : primary?.url ?? null;
    const imageUrl = url ? "http://localhost:5000" + url : null;
    const [imgOk, setImgOk] = React.useState(Boolean(imageUrl));
    const [showMenu, setShowMenu] = React.useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    return (
        <div className="card h-100 d-flex flex-column shadow-sm" style={{ borderRadius: '8px', overflow: 'visible', border: '1px solid #e0e0e0' }}>
            <div style={{ position: 'relative' }}>
                {imgOk && imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="card-img-top"
                        style={{ objectFit: 'cover', height: 180 }}
                        onError={() => setImgOk(false)}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: 180 }} aria-label="No image">
                        <span className="text-muted small">No image</span>
                    </div>
                )}

                {user?.id && !isSold && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                        <FavoriteButton
                            productId={product?.id ?? product?._id}
                            size={28}
                            className="shadow-sm"
                            initialFavorite={initialFavorite ?? product?.isFavorite ?? product?.favorite ?? product?.is_favorite}
                        />
                    </div>
                )}
            </div>

            <div className="card-body d-flex flex-column flex-grow-1 p-3">
                <h6 className="card-title mb-2 text-truncate fw-600" title={title}>{title}</h6>
                <div className="text-muted small mb-3">
                    {categoryNames.length > 0 && (
                        <span className="me-2 d-inline-flex flex-wrap gap-1 align-items-center mb-2">
                            {categoryNames.slice(0, 3).map((name) => (
                                <span key={name} className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                                    {name}
                                </span>
                            ))}
                            {categoryNames.length > 3 && (
                                <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>
                                    +{categoryNames.length - 3}
                                </span>
                            )}
                        </span>
                    )}
                    {owner && <span className="text-secondary">• {owner}</span>}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center gap-2" style={{ paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                    <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                        {price != null ? `${currency}${price}` : ''}
                    </span>
                    {isSold && <span className="badge bg-danger">Sold</span>}
                    <div className="ms-auto d-flex gap-2 align-items-center">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
                            onClick={() => onView?.(product?.id ?? product?._id)}
                        >
                            View
                        </button>

                        {(onDelete || (onMarkAsSold && !isSold) || (onMarkAsUnsold && isSold) || (onEdit && !isSold)) && (
                            <div style={{ position: 'relative', overflow: 'visible' }} ref={menuRef}>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '1', minWidth: '36px', minHeight: '36px' }}
                                    onClick={() => setShowMenu(!showMenu)}
                                    title="Options"
                                >
                                    ⋮
                                </button>

                                {showMenu && (
                                    <div className="dropdown-menu show" style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: '100%', right: 0, left: 'auto', zIndex: 1000, marginTop: '4px', minWidth: '160px', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', border: '1px solid #e0e0e0' }}>
                                        {onMarkAsSold && !isSold && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="dropdown-item d-flex align-items-center"
                                                    style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#333', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                                    onClick={() => { onMarkAsSold?.(); setShowMenu(false); }}
                                                >
                                                    <i className="bi bi-check-circle me-2"></i>Mark as Sold
                                                </button>
                                                <div className="dropdown-divider m-0"></div>
                                            </>
                                        )}

                                        {onMarkAsUnsold && isSold && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="dropdown-item d-flex align-items-center"
                                                    style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#333', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                                                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                                                    onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                                    onClick={() => { onMarkAsUnsold?.(); setShowMenu(false); }}
                                                >
                                                    <i className="bi bi-arrow-counterclockwise me-2"></i>Mark as Not Sold
                                                </button>
                                                <div className="dropdown-divider m-0"></div>
                                            </>
                                        )}

                                        {onEdit && !isSold && (
                                            <button
                                                type="button"
                                                className="dropdown-item d-flex align-items-center"
                                                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', color: '#333', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                                                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                                                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                                onClick={() => { onEdit?.(); setShowMenu(false); }}
                                            >
                                                <i className="bi bi-pencil me-2"></i>Edit
                                            </button>
                                        )}

                                        {onDelete && (
                                            <button
                                                type="button"
                                                className="dropdown-item d-flex align-items-center text-danger"
                                                style={{ padding: '0.625rem 1rem', fontSize: '0.875rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}
                                                onMouseEnter={(e) => (e.target.style.backgroundColor = '#fff5f5')}
                                                onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                                onClick={() => { onDelete?.(); setShowMenu(false); }}
                                            >
                                                <i className="bi bi-trash me-2"></i>Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
