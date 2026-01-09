import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate =useNavigate()

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-title">ResumeGenerator</div>

        <div className="nav-buttons">
          <button
            className="nav-btn login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="nav-btn product"
            onClick={() => navigate("/product")}
          >
            Product
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1>Create Professional Resumes Easily</h1>
        <p>
          ResumeGenerator helps you build clean, modern, and
          ATS-friendly resumes in minutes.  
          No design skills required — just enter your details
          and generate a professional resume instantly.
        </p>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 ResumeGenerator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
