import React from "react";
import {useParams} from "react-router-dom";
import ProductDetail from "../components/products/ProductDetail.jsx";

export default function ProductDetailPage() {
    const { id } = useParams();
    return <ProductDetail id={id} />;
}