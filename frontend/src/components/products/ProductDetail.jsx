import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ReactImageGallery from "react-image-gallery";
import { productApi } from "../../api/productApi.js";
import FavoriteButton from "../favourite/FavouriteButton.jsx";
import "react-image-gallery/styles/css/image-gallery.css";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

const toAbsoluteUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    try {
        return new URL(url, API_BASE).toString();
    } catch {
        return url;
    }
};

const toImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === "string") {
        return toAbsoluteUrl(
            img.startsWith("/uploads") ? img : `/uploads/${encodeURIComponent(img)}`
        );
    }
    return toAbsoluteUrl(
        img.url || img.path || `/uploads/${encodeURIComponent(img.filename || img.id)}`
    );
};

const normalizeProductPayload = (raw) => {
    if (!raw || typeof raw !== "object") return null;
    const base = raw.product ?? raw;
    return {
        ...base,
        images: base.images ?? raw.images ?? [],
        categories: base.categories ?? raw.categories ?? [],
        status: base.status ?? raw.status ?? null,
        location: base.location ?? raw.location ?? null,
        user: base.user ?? raw.user ?? null,
        created_at: base.created_at ?? raw.created_at ?? null,
        updated_at: base.updated_at ?? raw.updated_at ?? null,
    };
};

const fmtDate = (s) => (s ? new Date(s).toLocaleString() : "");

export default function ProductDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await productApi.getById(id);
                const raw = res?.data ?? res;
                const normalized = normalizeProductPayload(raw);
                if (!cancelled) setItem(normalized);
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load product");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProduct();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const galleryItems = useMemo(() => {
        const images = Array.isArray(item?.images) ? item.images : [];
        return images
            .map(toImageUrl)
            .filter(Boolean)
            .map((url, i) => ({
                original: url,
                thumbnail: url,
                originalAlt: `${item?.title || "Product"} ${i + 1}`,
                thumbnailAlt: `${item?.title || "Product"} ${i + 1}`,
                loading: "lazy",
            }));
    }, [item]);

    const categoryNames = useMemo(() => {
        return (item?.categories ?? [])
            .map((c) => c?.category?.name ?? c?.name)
            .filter(Boolean);
    }, [item]);

    if (loading)
        return (
            <div className="container py-4 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="mt-2 text-secondary">Loading product...</div>
            </div>
        );

    if (error)
        return <div className="alert alert-danger text-center">{error}</div>;

    if (!item)
        return <div className="alert alert-secondary text-center">Product not found.</div>;

    const price =
        item.price != null
            ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: item.currency || "EUR",
            }).format(item.price)
            : "";

    return (
        <div className="container py-4">
            {/* --- FIXED HEIGHT GALLERY STYLES --- */}
            <style>
                {`
        .image-gallery-content .image-gallery-slide img {
          object-fit: contain;
          height: 500px;      /* fixed height */
          width: 100%;
          background: #f8f9fa;
        }
        .image-gallery-slide {
          background: #f8f9fa;
        }
        @media (max-width: 768px) {
          .image-gallery-content .image-gallery-slide img {
            height: 350px;
          }
        }
      `}
            </style>

            <div className="row g-4">
                {/* Left: Image Gallery */}
                <div className="col-md-7">
                    {galleryItems.length > 0 ? (
                        <ReactImageGallery
                            items={galleryItems}
                            showPlayButton={false}
                            showFullscreenButton={false}
                            showThumbnails={true}
                            showNav={galleryItems.length > 1}
                            lazyLoad={true}
                            slideInterval={3000}
                            additionalClass="product-gallery"
                        />
                    ) : (
                        <div className="alert alert-light text-center py-5">
                            No images available.
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="col-md-5">
                    <h1 className="h4 mb-2">{item.title || "Untitled Product"}</h1>

                    <div className="d-flex align-items-center mb-3 gap-2">
                        {price && <div className="fs-5 fw-bold text-primary">{price}</div>}
                        {item?.status?.name && (
                            <span className="badge bg-secondary">{item.status.name}</span>
                        )}
                        <FavoriteButton
                            productId={item.id ?? item._id}
                            className="ms-auto"
                        />
                    </div>

                    {categoryNames.length > 0 && (
                        <div className="mb-3">
                            {categoryNames.map((n) => (
                                <span key={n} className="badge bg-light text-dark me-1">
                                    {n}
                                </span>
                            ))}
                        </div>
                    )}

                    <hr />

                    <div className="mb-2">
                        <strong>Location:</strong>{" "}
                        {item?.location
                            ? [item.location.city, item.location.country].filter(Boolean).join(", ")
                            : "—"}
                    </div>

                    <div className="mb-2">
                        <strong>Seller:</strong>{" "}
                        {item?.user?.username ?? "—"}{" "}
                        {item?.user?.email && (
                            <a href={`mailto:${item.user.email}`} className="text-decoration-none">
                                ({item.user.email})
                            </a>
                        )}
                    </div>

                    <div className="mb-3">
                        <strong>Created at:</strong> {fmtDate(item.created_at)}
                    </div>

                    <hr />

                    <h6>Description</h6>
                    <p>{item.description ?? "No description."}</p>
                </div>
            </div>
        </div>
    );
}