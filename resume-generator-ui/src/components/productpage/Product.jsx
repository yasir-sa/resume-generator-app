import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js"
const Product = () => {
  const navigate = useNavigate();

  const handleLogout = async() => {
    // later: localStorage.removeItem("token");
   try {
      await API.post("/logout");
      navigate("/");
    } catch (error) {
      console.log("Logout error", error);
    }
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
