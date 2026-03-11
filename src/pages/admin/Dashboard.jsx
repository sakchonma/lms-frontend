import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import API from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalClasses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalUsers}</p>
        </div>
        <div className="card">
          <h3>Total Courses</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalCourses}</p>
        </div>
        <div className="card">
          <h3>Total Classes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalClasses}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
