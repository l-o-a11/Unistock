import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductForm from "../components/ProductForm";

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useProducts();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const found = products.find((p) => p.id === id);
    setProduct(found);
  }, [id, products]);

  const handleSubmit = async (productData) => {
    try {
      await updateProduct(id, productData);
      navigate("/productos");
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          {/* Spinner */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E91E8C"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              animation: "spin 0.9s linear infinite",
            }}
          >
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>
            Cargando producto...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/productos")}
      />
    </div>
  );
};

export default EditProductPage;