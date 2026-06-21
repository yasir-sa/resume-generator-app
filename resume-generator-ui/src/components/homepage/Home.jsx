import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";
import API from "../../api.js";

const Home = () => {
  const navigate = useNavigate();

  const handleProductClick = async () => {
    try {
      const response = await API.get("/check-auth");
      if (response.data.success) {
        navigate("/product");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-title">ResumeGenerator</div>
        <div className="nav-buttons">
          <button className="nav-btn login" onClick={() => navigate("/login")}>
            Login yasir
          </button>
          <button className="nav-btn product" onClick={handleProductClick}>
            Product
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="main-content">
        <div className="hero-badge">AI-Powered Resume Builder</div>
        <h1>Create Professional Resumes <span className="hero-highlight">Easily</span></h1>
        <p>
          ResumeGenerator helps you build clean, modern, and ATS-friendly resumes in minutes.
          No design skills required — just enter your details and generate a professional resume instantly.
        </p>
        <div className="hero-actions">
          <button className="hero-btn primary" onClick={handleProductClick}>
            Get Started Free
          </button>
          <button className="hero-btn secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </main>

      {/* About Me Section */}
      <section className="about-section">
        <div className="section-container">
          <h2 className="section-title">About the Developer</h2>
          <div className="about-card">
            <div className="about-avatar">YS</div>
            <div className="about-content">
              <h3>YASIR S.A.</h3>
              <p className="about-role">Full-Stack MERN Developer</p>
              <p className="about-text">
                I am a Computer Science engineering student (graduating 2026) specializing in
                React.js, Node.js, Express.js, and PostgreSQL. I have built and deployed
                full-stack AI-powered applications and am currently upskilling in DevOps
                (Docker, AWS, Jenkins) at QSpider, Chennai.
              </p>
              <div className="about-tags">
                <span>React.js</span>
                <span>Node.js</span>
                <span>Express.js</span>
                <span>PostgreSQL</span>
                <span>Docker</span>
                <span>AWS</span>
                <span>Jenkins</span>
              </div>
              <div className="about-links">
                <a href="https://www.linkedin.com/in/yasir-sa/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a href="https://github.com/yasir-sa" target="_blank" rel="noopener noreferrer" className="social-link github">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-container">
          <h2 className="section-title light">Featured Projects</h2>
          <div className="projects-grid">
            {/* Project 1 */}
            <div className="project-card">
              <div className="project-icon">🤖</div>
              <h3>AI Career Analyser</h3>
              <p>
                An AI-powered career platform with resume generation, mock interview
                simulations using AI APIs (Gemini, OpenRouter, GROQ), and job application tracking.
              </p>
              <div className="project-tags">
                <span>React.js</span>
                <span>Node.js</span>
                <span>Gemini AI</span>
                <span>PostgreSQL</span>
              </div>
              <a
                href="https://resume-generator-app-2.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="project-btn"
              >
                View Project →
              </a>
            </div>

            {/* Project 2 */}
            <div className="project-card">
              <div className="project-icon">🐳</div>
              <h3>Dockerized Task Manager</h3>
              <p>
                A full-stack CRUD task management application showcasing DevOps skills with
                a complete CI/CD pipeline using Docker, Jenkins, WSL, Ubuntu, and GitHub
                Webhooks to automate deployment.
              </p>
              <div className="project-tags">
                <span>Docker</span>
                <span>Jenkins</span>
                <span>GitHub Webhooks</span>
                <span>CI/CD</span>
              </div>
              <a
                href="https://todo-frontend-docker-hj3d.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="project-btn"
              >
                View Project →
              </a>
            </div>
            {/* Project 3 */}
            <div className="project-card">
              <div className="project-icon">✅</div>
              <h3>Task Manager</h3>
              <p>
                A clean and responsive full-stack task management application with
                create, update, delete, and complete task features. Built with a
                modern UI and deployed on Render.
              </p>
              <div className="project-tags">
                <span>React.js</span>
                <span>Node.js</span>
                <span>Express.js</span>
                <span>PostgreSQL</span>
              </div>
              <a
                href="https://todolist-project-3-2054.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="project-btn"
              >
                View Project →
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Developer Details + Branding */}
      <section className="dev-details">
        <div className="dev-info">
          <span><strong>YASIR S.A.</strong></span>
          <span>yasirsa05@gmail.com</span>
          <span>Full-Stack MERN Developer</span>
          <div className="dev-social">
            <a href="https://www.linkedin.com/in/yasir-sa/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/yasir-sa" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="digital-heroes-btn"
        >
          Built for Digital Heroes
        </a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 ResumeGenerator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
