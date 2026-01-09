import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";

const Product = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // later: localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="product-page">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Product;
