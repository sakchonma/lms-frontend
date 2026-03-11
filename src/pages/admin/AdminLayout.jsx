import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>LMS ADMIN</h2>
        <nav>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/users">User Management</Link>
          <Link to="/admin/enrollments">Enrollment Requests</Link>
          <Link to="/admin/courses">Course Management</Link>
          <Link to="/admin/classes">Class Management</Link>
          <Link to="/admin/pathways">Learning Pathways</Link>
          <button onClick={handleLogout} className="btn" style={{ color: '#f87171', marginTop: '20px', textAlign: 'left', padding: '12px', width: '100%', background: 'none' }}>
            Logout
          </button>
        </nav>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
