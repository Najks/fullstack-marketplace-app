import React from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/products/ProductCard.jsx";
import {productApi} from "../api/productApi.js";

export default function CategoryProductsPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [pagination, setPagination] = React.useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
    });

    React.useEffect(() => {
        setLoading(true);
        setError("");

        (async () => {
            try {
                const res = await productApi.byCategory(categoryId, { page, limit });
                const data = res?.data ?? res;
                const list = data?.products ?? data?.items ?? [];

                setItems(list);
                setPagination({
                    page: data?.pagination?.page ?? page,
                    pages: data?.pagination?.pages ?? 1,
                    total: data?.pagination?.total ?? list.length,
                    limit: data?.pagination?.limit ?? limit,
                });
            } catch (e) {
                console.error("Failed to load category products", e);
                setError(e?.message || "Failed to load products");
            } finally {
                setLoading(false);
            }
        })();
    }, [categoryId, page, limit]);

    const canPrev = pagination.page > 1;
    const canNext = pagination.page < pagination.pages;

    return (
        <div className="container py-5">
            <h1 className="h2 fw-bold mb-5">Category Products</h1>

            {loading && <div className="alert alert-info mb-3">Loading...</div>}
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            {!loading && !error && items.length === 0 && (
                <div className="alert alert-secondary">No products found.</div>
            )}

            <div className="row g-3">
                {items.map((p) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id ?? p._id}>
                        <ProductCard
                            product={p}
                            onView={(pid) => {
                                if (pid != null) navigate(`/products/${encodeURIComponent(pid)}`);
                            }}
                        />
                    </div>
                ))}
            </div>

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
        </div>
    );
}