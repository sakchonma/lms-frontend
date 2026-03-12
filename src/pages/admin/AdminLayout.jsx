import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'แดชบอร์ด' },
    { path: '/admin/users', label: 'จัดการผู้ใช้งาน' },
    { path: '/admin/enrollments', label: 'คำขอลงทะเบียน' },
    { path: '/admin/courses', label: 'ระบบจัดการคอร์ส' },
    { path: '/admin/classes', label: 'ระบบจัดการโปรแกรมคลาสเรียน' },
    { path: '/admin/pathways', label: 'ระบบจัดการเส้นทางการเรียนรู้' },
  ];

  return (
    <div className="app-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          Conicle<span style={{ color: 'var(--conicle-text)', fontWeight: '400', fontSize: '0.9rem', marginLeft: '5px' }}>Admin</span>
        </div>
        
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={{ 
              width: '100%', 
              borderColor: 'rgba(248, 113, 113, 0.2)', 
              color: '#f87171',
              fontSize: '0.8rem'
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
