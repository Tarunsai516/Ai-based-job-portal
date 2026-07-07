import React from 'react';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">AI Job Portal</span>
        </div>
        <nav className="nav">
          <a href="#jobs" className="nav-link">Jobs</a>
          <a href="#recruiter" className="nav-link">Recruiters</a>
          <a href="#candidate" className="nav-link">Candidates</a>
          <a href="#profile" className="nav-link">Profile</a>
        </nav>
      </header>

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">
            Find Your Next <span className="highlight">Dream Job</span> Powered by AI
          </h1>
          <p className="hero-subtitle">
            Restructured Project Workspace Initialized Successfully. All frontend and backend directories are created and ready for development.
          </p>
          <div className="cta-container">
            <a href="#get-started" className="cta-btn primary-btn">Get Started</a>
            <a href="#learn-more" className="cta-btn secondary-btn">Learn More</a>
          </div>
        </section>

        <section className="structure-section">
          <h2>Project Architecture</h2>
          <div className="grid-container">
            <div className="grid-card">
              <h3>Frontend (`/frontend`)</h3>
              <p>Vite + React (JavaScript) application containing standard structure: assets, components, context, data, hooks, layouts, pages, routes, services, and utils.</p>
            </div>
            <div className="grid-card">
              <h3>Backend (`/backend`)</h3>
              <p>Spring Boot application targeting Java 17, pre-configured with Spring Web and Lombok dependencies for building powerful API endpoints.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 AI Job Portal. Built with Vite, React, and Spring Boot.</p>
      </footer>
    </div>
  );
}

export default App;
