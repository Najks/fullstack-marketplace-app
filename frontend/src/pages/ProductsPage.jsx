import React from "react";
import ProductGrid from "../components/products/ProductGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductsPage() {
    const { user } = useAuth();
    return <ProductGrid userId={user?.id} />;
}