import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LearnerLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>LMS LEARNER</div>
        <div className="nav-links">
          <Link to="/learner/home">Home</Link>
          <Link to="/learner/catalog">Course Catalog</Link>
          <Link to="/learner/my-courses">My Learning</Link>
          <Link to="/learner/pathways">My Pathways</Link>
          <button onClick={handleLogout} style={{ marginLeft: '20px', border: 'none', background: 'none', cursor: 'pointer', color: 'red' }}>Logout</button>
        </div>
      </nav>
      <div className="main-content" style={{ padding: '50px' }}>
        {children}
      </div>
    </div>
  );
};

export default LearnerLayout;
