import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './learner.css';

const LearnerLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { path: '/learner/home', label: 'Home' },
    { path: '/learner/my-classes', label: 'My Classroom' },
    { path: '/learner/my-courses', label: 'My Course' },
    { path: '/learner/pathways', label: 'My Pathway' },
  ];

  return (
    <div className="learner-layout-root" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'white' }}>
      <nav className="navbar">
        <div style={{ 
          fontWeight: '900', 
          fontSize: '1.5rem', 
          color: 'var(--primary)', 
          letterSpacing: '-0.05em',
          textShadow: '0 0 15px var(--primary-glow)'
        }}>
          NEXUS<span style={{ color: 'white' }}>OS</span>
        </div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
          <button 
            onClick={handleLogout} 
            className="btn btn-outline"
            style={{ 
              marginLeft: '20px',
              padding: '8px 16px', 
              fontSize: '0.75rem',
              borderColor: 'var(--danger)',
              color: 'var(--danger)'
            }}
          >
            DISCONNECT
          </button>
        </div>
      </nav>
      <div className="main-content" style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
};

export default LearnerLayout;
