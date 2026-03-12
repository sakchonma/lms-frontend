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
      <h1 style={{ marginBottom: '32px' }}>แดชบอร์ด</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--conicle-text-muted)' }}>ผู้ใช้งานทั้งหมด</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--conicle-red)', margin: 0 }}>{stats.totalUsers}</p>
        </div>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--conicle-text-muted)' }}>คอร์สทั้งหมด</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--conicle-red)', margin: 0 }}>{stats.totalCourses}</p>
        </div>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--conicle-text-muted)' }}>คลาสเรียนทั้งหมด</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--conicle-red)', margin: 0 }}>{stats.totalClasses}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
