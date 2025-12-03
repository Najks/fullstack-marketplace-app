import React from 'react';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi.js';
import { useCategories } from "../../context/CategoriesContext.jsx";
import ProductCard from './ProductCard.jsx';
import FilterOptions from './FilterOptions.jsx';

export default function ProductGrid({ products, userId }) {
    const navigate = useNavigate();
    const { categories } = useCategories();

    const isControlled = Array.isArray(products);

    const [items, setItems] = React.useState(products ?? []);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [statuses, setStatuses] = React.useState([]);

    const [q, setQ] = React.useState('');
    const [submittedQ, setSubmittedQ] = React.useState('');
    const [sort, setSort] = React.useState('');

    const [filters, setFilters] = React.useState({
        minPrice: '',
        maxPrice: '',
        statusId: '',
        categoryId: '',
        location: '',
    });

    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);

    const [pagination, setPagination] = React.useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
    });

    const reqIdRef = React.useRef(0);
    const fetchTimerRef = React.useRef(null);
    const statusesTimerRef = React.useRef(null);

    // Keep items in sync when controlled
    React.useEffect(() => {
        if (isControlled) {
            setItems(products ?? []);
            setPagination({
                page: 1,
                pages: 1,
                total: products?.length ?? 0,
                limit,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlled, products]);

    // Build effective params and a stable key
    const params = React.useMemo(() => {
        if (isControlled) return null;
        const p = { page, limit };
        if (submittedQ.trim()) p.q = submittedQ.trim();
        if (sort) p.sort = sort;
        if (filters.minPrice) p.minPrice = filters.minPrice;
        if (filters.maxPrice) p.maxPrice = filters.maxPrice;
        if (filters.statusId) p.statusId = filters.statusId;
        if (filters.categoryId) p.categoryId = filters.categoryId;
        if (filters.location) p.location = filters.location;
        if (userId !== undefined && userId !== null && String(userId).trim() !== '') {
            p.userId = userId;
        }
        return p;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isControlled, page, limit, submittedQ, sort, filters, userId]);

    const paramsKey = React.useMemo(() => {
        if (!params) return '';
        // Stable key to dedupe identical requests
        const ordered = Object.keys(params)
            .sort()
            .reduce((acc, k) => { acc[k] = params[k]; return acc; }, {});
        return JSON.stringify(ordered);
    }, [params]);

    // Fetch statuses only when filters are shown (uncontrolled), debounced to avoid StrictMode double send
    React.useEffect(() => {
        if (isControlled) return;
        if (statuses.length > 0) return;

        if (statusesTimerRef.current) clearTimeout(statusesTimerRef.current);
        statusesTimerRef.current = setTimeout(async () => {
            try {
                const res = await productApi.getStatuses?.();
                setStatuses(res?.data ?? []);
            } catch (e) {
                // silent
            }
        }, 100);

        return () => {
            if (statusesTimerRef.current) {
                clearTimeout(statusesTimerRef.current);
                statusesTimerRef.current = null;
            }
        };
    }, [isControlled, statuses.length]);

    // Data loading (skipped in controlled mode), debounced to avoid double sending
    React.useEffect(() => {
        if (isControlled) return;
        if (!params) return;

        if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

        const id = ++reqIdRef.current;
        setLoading(true);
        setError('');

        fetchTimerRef.current = setTimeout(async () => {
            try {
                const useSearch = Boolean(
                    params.q ||
                    params.sort ||
                    params.minPrice ||
                    params.maxPrice ||
                    params.statusId ||
                    params.categoryId ||
                    params.location ||
                    params.userId
                );

                const res = useSearch
                    ? await productApi.searchFilter(params)
                    : await productApi.list(params);

                if (id === reqIdRef.current) {
                    const data = res?.data ?? res;
                    const list = data?.products ?? data?.items ?? (Array.isArray(data) ? data : []);
                    setItems(list ?? []);

                    const pg = data?.pagination;
                    setPagination({
                        page: pg?.page ?? page,
                        pages: pg?.pages ?? 1,
                        total: pg?.total ?? (list?.length ?? 0),
                        limit: pg?.limit ?? limit,
                    });
                }
            } catch (e) {
                if (id === reqIdRef.current) {
                    setError(e?.message || 'Failed to load products');
                }
            } finally {
                if (id === reqIdRef.current) setLoading(false);
            }
        }, 120); // debounce

        return () => {
            if (fetchTimerRef.current) {
                clearTimeout(fetchTimerRef.current);
                fetchTimerRef.current = null;
            }
        };
    }, [isControlled, paramsKey, page, limit]);

    const handleApplySearch = React.useCallback(() => {
        setSubmittedQ(q);
        setPage(1);
    }, [q]);

    const handleFilterChange = React.useCallback((newFilters) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const canPrev = pagination.page > 1;
    const canNext = pagination.page < pagination.pages;

    return (
        <>
            {!isControlled && (
                <FilterOptions
                    searchValue={q}
                    onSearchChange={setQ}
                    onSearchApply={handleApplySearch}
                    sortValue={sort}
                    onSortChange={(v) => {
                        setSort(v);
                        setPage(1);
                    }}
                    filterValues={filters}
                    onFilterChange={handleFilterChange}
                    statuses={statuses}
                    categories={categories}
                    pageSize={limit}
                    onPageSizeChange={(e) => {
                        setLimit(Number(e.target.value) || 10);
                        setPage(1);
                    }}
                />
            )}

            <div className="container py-3">
                <h2 className="h5 mb-4">Products</h2>

                {!isControlled && loading && <div className="alert alert-info mb-3">Loading...</div>}
                {!isControlled && error && <div className="alert alert-danger mb-3">{error}</div>}
                {items.length === 0 && (
                    <div className="alert alert-secondary">No products found.</div>
                )}

                <div className="row g-3">
                    {items.map((p) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id ?? p._id}>
                            <ProductCard
                                product={p}
                                initialFavorite={p?.isFavorite ?? p?.favorite ?? p?.is_favorite}
                                onView={(pid) => {
                                    const dest = `/products/${encodeURIComponent(pid)}`;
                                    if (pid != null) navigate(dest);
                                }}
                            />
                        </div>
                    ))}
                </div>

                {!isControlled && (
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted small">
                            Page {pagination.page} of {pagination.pages} • {pagination.total} total
                        </div>
                        <div className="btn-group">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                disabled={!canPrev || loading}
                                onClick={() => canPrev && setPage((p) => p - 1)}
                            >
                                ‹ Prev
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                disabled={!canNext || loading}
                                onClick={() => canNext && setPage((p) => p + 1)}
                            >
                                Next ›
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}